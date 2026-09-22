const crypto = require('crypto');

function cookie(req, name) {
  const match = (req.headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}
function signature(value) {
  return crypto.createHmac('sha256', process.env.DISCORD_CLIENT_SECRET).update(value).digest('base64url');
}
function session(userId) {
  const value = Buffer.from(JSON.stringify({ userId, expires: Date.now() + 1000 * 60 * 60 * 8 })).toString('base64url');
  return `${value}.${signature(value)}`;
}
function verify(req) {
  const value = cookie(req, 'starwake_admin');
  if (!value) return null;
  const [payload, sig] = value.split('.');
  if (!payload || !sig || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(signature(payload)))) return null;
  try { const data = JSON.parse(Buffer.from(payload, 'base64url').toString()); return data.expires > Date.now() ? data : null; } catch { return null; }
}
function allowed(userId) { return (process.env.ADMIN_DISCORD_ID || '').split(',').map(v => v.trim()).includes(userId); }
function setCookie(res, name, value, maxAge = 0) { res.setHeader('Set-Cookie', `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`); }
module.exports = { cookie, session, verify, allowed, setCookie };

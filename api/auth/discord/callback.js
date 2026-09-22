const { cookie, session, allowed, setCookie } = require('../../_admin');
const redirectUri = 'https://starwakevr.site/api/auth/discord/callback';

module.exports = async (req, res) => {
  if (!req.query.state || req.query.state !== cookie(req, 'starwake_oauth_state')) { res.statusCode = 400; return res.end('Invalid sign-in request.'); }
  const tokenResponse = await fetch('https://discord.com/api/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID, client_secret: process.env.DISCORD_CLIENT_SECRET, grant_type: 'authorization_code', code: req.query.code, redirect_uri: redirectUri }) });
  if (!tokenResponse.ok) { res.statusCode = 401; return res.end('Discord sign-in failed.'); }
  const token = await tokenResponse.json();
  const userResponse = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${token.access_token}` } });
  const user = await userResponse.json();
  if (!allowed(user.id)) { res.statusCode = 403; return res.end('This Discord account is not an admin.'); }
  setCookie(res, 'starwake_admin', session(user.id), 28800);
  res.writeHead(302, { Location: '/admin/' }); res.end();
};

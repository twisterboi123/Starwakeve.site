const { verify, allowed } = require('../_admin');
const owner = 'twisterboi123', repo = 'Starwakeve.site', branch = 'main';
const safePath = path => typeof path === 'string' && /^(index\.html|about\/index\.html|contact\/index\.html|creators\/index\.html|games\/(index\.html|scary-baboon-legacy\/index\.html|scary-baboon-legacy-v2\/index\.html)|privacy\/(index\.html|scary-baboon-legacy\/index\.html|scary-baboon-legacy-v2\/index\.html)|styles\.css)$/.test(path);
module.exports = async (req, res) => {
  const user = verify(req); if (!user || !allowed(user.userId)) { res.statusCode = 401; return res.json({ error: 'Unauthorized' }); }
  if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
  let body = ''; for await (const part of req) body += part; const { path, content } = JSON.parse(body || '{}');
  if (!safePath(path) || typeof content !== 'string' || content.length > 250000) { res.statusCode = 400; return res.json({ error: 'Invalid file or content.' }); }
  const headers = { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
  const existing = await fetch(`${endpoint}?ref=${branch}`, { headers });
  if (!existing.ok) { res.statusCode = 502; return res.json({ error: 'Could not read the repository file.' }); }
  const current = await existing.json();
  const update = await fetch(endpoint, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: `Admin update: ${path}`, content: Buffer.from(content).toString('base64'), sha: current.sha, branch }) });
  if (!update.ok) { res.statusCode = 502; return res.json({ error: 'Could not save to GitHub.' }); }
  res.json({ ok: true });
};

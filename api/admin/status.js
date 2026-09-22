const { verify, allowed } = require('../_admin');
module.exports = (req, res) => { const user = verify(req); if (!user || !allowed(user.userId)) { res.statusCode = 401; return res.json({ authenticated: false }); } res.json({ authenticated: true, userId: user.userId }); };

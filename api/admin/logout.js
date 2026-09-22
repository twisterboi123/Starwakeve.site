const { setCookie } = require('../_admin');
module.exports = (req, res) => { setCookie(res, 'starwake_admin', '', 0); res.writeHead(302, { Location: '/admin/' }); res.end(); };

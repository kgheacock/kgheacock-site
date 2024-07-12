import csrf from 'csurf';
import cookie from 'cookie';

const csrfProtection = csrf({ cookie: true });

export default function handler(req, res) {
  csrfProtection(req, res, () => {
    res.setHeader('Set-Cookie', cookie.serialize('XSRF-TOKEN', req.csrfToken()));
    res.status(200).json({ csrfToken: req.csrfToken() });
  });
}
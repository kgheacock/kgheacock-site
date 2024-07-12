import { run, get } from '../../lib/database';
import csrf from 'csurf';

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }
});

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  try {
    // Apply CSRF protection to all requests
    await runMiddleware(req, res, csrfProtection);

    switch (req.method) {
      case 'POST':
        const { title, content } = req.body;
        const resp = await run('INSERT INTO pages (title, content) VALUES (?, ?)', [title, content]);
        const newPageId = resp.lastID;
        res.redirect(303, `/${newPageId}`);
        break;

      case 'PUT':
        const { id, title: updateTitle, content: updateContent } = req.body;
        await run('UPDATE pages SET title = ?, content = ? WHERE id = ?', [updateTitle, updateContent, id]);
        res.redirect(303, `/${id}`);
        break;

      case 'GET':
        const { id: getId } = req.query;
        const page = await get('SELECT * FROM pages WHERE id = ?', [getId]);
        if (page) {
          res.status(200).json(page);
        } else {
          res.status(404).json({ error: 'Page not found' });
        }
        break;

      case 'DELETE':
        const { id: deleteId } = req.query;
        await run('DELETE FROM pages WHERE id = ?', [deleteId]);
        res.status(200).json({ message: 'Page deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['POST', 'PUT', 'GET', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
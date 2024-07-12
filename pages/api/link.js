import { db } from '../../lib/database';
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

export default function handler(req, res) {
  if (req.method === 'POST') {
    csrfProtection(req, res, () => {
      const { id } = req.query;
      const { text, destination, destination_title } = req.body;

      db.serialize(() => {
        if (!destination) {
          const title = destination_title || 'Untitled';
          db.run('INSERT INTO pages (title, content) VALUES (?, ?)', [title, ''], function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            const newDestinationId = this.lastID;
            db.run('INSERT INTO links (source, text, destination) VALUES (?, ?, ?)', [id, text, newDestinationId], function (err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              res.status(201).json({ id: this.lastID, source: id, text, destination: newDestinationId });
            });
          });
        } else {
          db.run('INSERT INTO links (source, text, destination) VALUES (?, ?, ?)', [id, text, destination], function (err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, source: id, text, destination });
          });
        }
      });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
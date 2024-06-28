// Core
import express from 'express';
// Middleware
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import bodyParser from 'body-parser';

// Linking
import path from 'path';
import { fileURLToPath } from 'url';

// Local
import { db } from './database.js';
import renderPage from './routes/page.js';

const port = 3000;
const app = express();

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const csrfProtection = csrf({ cookie: true });


app.use(bodyParser.json());
app.use(helmet());
app.use(cookieParser());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "https://localhost:3000"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:"],
      "connect-src": ["'self'", "ws://localhost:3000"],
      "frame-src": ["'self'"],
    },
  })
);

app.use(express.static(path.join(__dirname, '../public')));

app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post('/page', csrfProtection, (req, res) => {
  const { title, content } = req.body;
  db.run('INSERT INTO pages (title, content) VALUES (?, ?)', [title, content], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, title, content });
  });
});


app.post('/blog/:id/link', csrfProtection, (req, res) => {
  const { id } = req.params;
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


renderPage(app);


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

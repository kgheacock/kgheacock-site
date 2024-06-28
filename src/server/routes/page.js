import React from "react";
import ReactDOMServer from "react-dom/server";
import ejs from "ejs";
import path from "path";

import { fileURLToPath } from 'url';

import { dbGet, dbAll } from "../database.js";
import BlogPost from "../../components/BlogPost.js";


const renderPage = (app) =>
app.get('/blog/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const row = await dbGet('SELECT * FROM pages WHERE id = ?', [id]);
  
      if (!row) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
  
      const links = await dbAll('SELECT text, destination FROM links WHERE source = ?', [id]);
      const blogPostData = { ...row, links };
      const appHtml = ReactDOMServer.renderToString(<BlogPost {...blogPostData} />);
  
      ejs.renderFile(path.join(__dirname, '../../views', 'template.ejs'), { appHtml, initialData: blogPostData }, (err, str) => {
        if (err) {
          console.error('Error rendering template:', err);
          return res.status(500).send('An error occurred');
        }
        res.send(str);
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  export default renderPage;
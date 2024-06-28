import sqlite3 from 'sqlite3';
import { promisify } from 'util';


export const db = new sqlite3.Database('blog.db', async (err) => {
    if (err) {
      console.error(err.message);
    } else {
      try {
        const sentinelPageId = await bootstrapBlog(db);
        console.log('Bootstrap complete with Sentinel Page ID:', sentinelPageId);
      } catch (error) {
        console.error('Error bootstrapping the blog:', error);
      }
    }
  });
  
  const bootstrapBlog = (db) => {
    return new Promise((resolve, reject) => {
      let sentinelPageId = 0;
      db.serialize(() => {
        // Create the blog_pages table
        db.run(`CREATE TABLE IF NOT EXISTS pages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL
        )`);
  
        db.run(`CREATE TABLE IF NOT EXISTS links (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source INTEGER NOT NULL,
          destination INTEGER NOT NULL,
          text TEXT NOT NULL,
          FOREIGN KEY(source) REFERENCES pages(id),
          FOREIGN KEY(destination) REFERENCES pages(id)
        )`);
  
        // Insert the sentinel page if it doesn't already exist
        db.get(`SELECT COUNT(*) AS count FROM pages WHERE id = 1`, (err, row) => {
          if (err) {
            return reject(err.message);
          } else if (row.count === 0) {
            db.run(`INSERT INTO pages (title, content) VALUES (?, ?)`, ['Sentinel Page', 'This is the sentinel page.'], function (err) {
              if (err) {
                return reject(err.message);
              } else {
                sentinelPageId = this.lastID;
                resolve(sentinelPageId);
              }
            });
          } else {
            sentinelPageId = 1;
            resolve(sentinelPageId);
          }
        });
      });
    });
  };

  
export const dbGet = promisify(db.get.bind(db));
export const dbAll = promisify(db.all.bind(db));
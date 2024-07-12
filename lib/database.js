import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db;

async function openDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'blog.db'),
      driver: sqlite3.Database
    });
    await bootstrapBlog(db);
  }
  return db;
}

async function bootstrapBlog(db) {
  await db.exec(`CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_preprocessed TIMESTAMP
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source INTEGER NOT NULL,
    destination INTEGER NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY(source) REFERENCES pages(id),
    FOREIGN KEY(destination) REFERENCES pages(id)
  )`);

  await db.exec(`
      -- Key concepts table
      CREATE TABLE IF NOT EXISTS key_concepts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_id INTEGER,
        concept TEXT NOT NULL,
        FOREIGN KEY (article_id) REFERENCES pages(id) ON DELETE CASCADE
      );

      -- Summaries table
      CREATE TABLE IF NOT EXISTS summaries (
        article_id INTEGER PRIMARY KEY,
        one_sentence TEXT NOT NULL,
        one_paragraph TEXT NOT NULL,
        FOREIGN KEY (article_id) REFERENCES pages(id) ON DELETE CASCADE
      );

      -- Semantic tags table
      CREATE TABLE IF NOT EXISTS semantic_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_id INTEGER,
        tag TEXT NOT NULL,
        FOREIGN KEY (article_id) REFERENCES pages(id) ON DELETE CASCADE
      );

      -- Related topics table
      CREATE TABLE IF NOT EXISTS related_topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_id INTEGER,
        topic TEXT NOT NULL,
        FOREIGN KEY (article_id) REFERENCES pages(id) ON DELETE CASCADE
      );

      -- Embeddings table
      CREATE TABLE IF NOT EXISTS embeddings (
        article_id INTEGER PRIMARY KEY,
        embedding BLOB NOT NULL,
        FOREIGN KEY (article_id) REFERENCES pages(id) ON DELETE CASCADE
      );

      -- Index for faster queries
      CREATE INDEX IF NOT EXISTS idx_key_concepts_article_id ON key_concepts(article_id);
      CREATE INDEX IF NOT EXISTS idx_semantic_tags_article_id ON semantic_tags(article_id);
      CREATE INDEX IF NOT EXISTS idx_related_topics_article_id ON related_topics(article_id);
    `);

  const sentinelPage = await db.get('SELECT * FROM pages WHERE id = 1');
  if (!sentinelPage) {
    const result = await db.run(
      'INSERT INTO pages (title, content) VALUES (?, ?)',
      ['Sentinel Page', 'This is the sentinel page.']
    );
    return result.lastID;
  }
  return 1;
}

export async function query(sql, params = []) {
  const db = await openDb();
  return db.all(sql, params);
}

export async function get(sql, params = []) {
  const db = await openDb();
  return db.get(sql, params);
}

export async function run(sql, params = []) {
  const db = await openDb();
  return db.run(sql, params);
}

export async function getAll(sql, params = []) {
  const db = await openDb();
  return db.all(sql, params);
}

export { openDb };
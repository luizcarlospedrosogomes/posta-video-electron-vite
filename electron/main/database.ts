import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

const dbPath = path.join(app.getPath("userData"), "app.db");
const db = new Database(dbPath);

// Cria tabela se não existir
db.prepare(`
  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    slug TEXT UNIQUE,
    tiktok BOOLEAN DEFAULT 0,
    instagram BOOLEAN DEFAULT 0,
    youtube BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

export default db;

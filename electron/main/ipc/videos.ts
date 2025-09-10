import { ipcMain } from "electron";
import db from "../database";

ipcMain.handle("addVideo", (_event, { filename, slug }) => {
  const stmt = db.prepare("INSERT INTO videos (filename, slug) VALUES (?, ?)");
  try {
    const info = stmt.run(filename, slug);
    return info.lastInsertRowid;
  } catch (e: any) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") throw new Error("Slug já existe!");
    throw e;
  }
});

ipcMain.handle("updateFlags", (_event, { slug, tiktok, instagram, youtube }) => {
  const stmt = db.prepare(`
    UPDATE videos 
       SET tiktok = COALESCE(?, tiktok),
           instagram = COALESCE(?, instagram),
           youtube = COALESCE(?, youtube)
     WHERE slug = ?
  `);
  stmt.run(tiktok ? 1 : 0, instagram ? 1 : 0, youtube ? 1 : 0, slug);
  return true;
});

ipcMain.handle("getVideos", () => {
  return db.prepare("SELECT * FROM videos ORDER BY created_at DESC").all();
});

import { ipcMain, app } from "electron";
import fs from "fs";
import path from "path";
import os from "os";

ipcMain.handle("get-downloads", async () => {
  const downloadsPath = app.getPath("downloads");
  const files = await fs.promises.readdir(downloadsPath);
  return files.filter(f => f.endsWith(".mp4") || f.endsWith(".mov"));
});

ipcMain.handle("getVideoPath", async (_event, filename: string) => {
  const downloadsPath = app.getPath("downloads");
  return path.join(downloadsPath, filename);
});

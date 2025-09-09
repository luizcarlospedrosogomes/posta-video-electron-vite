import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { update } from './update'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import db from "./database";
// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
       webSecurity: false
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Auto update
  update(win)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

import fs from 'fs';
ipcMain.handle('get-downloads', async () => {
  const downloadsPath = path.join(os.homedir(), 'Downloads');
  const files = await fs.promises.readdir(downloadsPath);
  return files.map(f => path.join(downloadsPath, f));
});



// Inserir vídeo
ipcMain.handle("addVideo", (_event, { filename, slug }: { filename: string, slug: string }) => {
  const stmt = db.prepare(`
    INSERT INTO videos (filename, slug) VALUES (?, ?)
  `);
  try {
    const info = stmt.run(filename, slug);
    return info.lastInsertRowid;
  } catch (e: any) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new Error("Slug já existe!");
    }
    throw e;
  }
});

// Atualizar flags
ipcMain.handle(
  "updateFlags",
  (_event, { slug, tiktok, instagram, youtube }: { slug: string; tiktok?: boolean; instagram?: boolean; youtube?: boolean }) => {
    const stmt = db.prepare(`
      UPDATE videos SET tiktok = COALESCE(?, tiktok),
                        instagram = COALESCE(?, instagram),
                        youtube = COALESCE(?, youtube)
      WHERE slug = ?
    `);
    stmt.run(tiktok ? 1 : 0, instagram ? 1 : 0, youtube ? 1 : 0, slug);
    return true;
  }
);

// Listar vídeos
ipcMain.handle("getVideos", () => {
  const rows = db.prepare("SELECT * FROM videos ORDER BY created_at DESC").all();
  return rows;
});


// Lista arquivos de vídeo na pasta Downloads
ipcMain.handle("getDownloads", async () => {
  const downloadsPath = app.getPath("downloads");
  const files = await fs.promises.readdir(downloadsPath);
  return files.filter(f => f.endsWith(".mp4") || f.endsWith(".mov"));
});

// Retorna caminho completo do arquivo
ipcMain.handle("getVideoPath", async (_event, filename: string) => {
  const downloadsPath = app.getPath("downloads");
  return path.join(downloadsPath, filename);
});

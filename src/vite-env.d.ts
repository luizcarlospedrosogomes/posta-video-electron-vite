/// <reference types="vite/client" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer,
  electronAPI: {
    getDownloads: () => Promise<string[]>;
    addVideo: (data: { filename: string; slug: string }) => Promise<number>;
    getVideos: () => Promise<{
      id: number;
      filename: string;
      slug: string;
      tiktok: boolean;
      instagram: boolean;
      youtube: boolean;
      created_at: string;
    }[]>;
    updateFlags: (data: { slug: string; tiktok?: boolean; instagram?: boolean; youtube?: boolean }) => Promise<boolean>;

  };
}

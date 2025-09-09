import { useEffect, useState } from "react";
import { generateSlug } from "./utils";

interface Video {
  id: number;
  filename: string;
  slug: string;
  tiktok: boolean;
  instagram: boolean;
  youtube: boolean;
  created_at: string;
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const loadVideos = async () => {
      // 1️⃣ listar vídeos na pasta Downloads
      const files: string[] = await window.electronAPI.getDownloads();

      // 2️⃣ salvar cada vídeo no banco (se ainda não existir)
      for (const f of files) {
        const slug = generateSlug(f);
        try {
          await window.electronAPI.addVideo({ filename: f, slug });
        } catch (e) {
          // slug já existe → ignora
        }
      }

      // 3️⃣ buscar vídeos do banco
      const dbVideos = await window.electronAPI.getVideos();
      setVideos(dbVideos);
    };

    loadVideos();
  }, []);

  const toggleFlag = async (slug: string, field: "tiktok" | "instagram" | "youtube") => {
    const video = videos.find(v => v.slug === slug);
    if (!video) return;

    const updatedValue = !video[field];
    await window.electronAPI.updateFlags({ slug, [field]: updatedValue });

    setVideos(prev =>
      prev.map(v => (v.slug === slug ? { ...v, [field]: updatedValue } : v))
    );
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {videos.map(video => (
        <div key={video.id} style={{ width: "300px", border: "1px solid #ccc", padding: "8px" }}>
          <video
            controls
            style={{ width: "100%", marginBottom: "8px" }}
            src={video.filename}
          />
          <div>
            <strong>{video.filename}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            <label>
              <input
                type="checkbox"
                checked={video.tiktok}
                onChange={() => toggleFlag(video.slug, "tiktok")}
              />{" "}
              TikTok
            </label>
            <label>
              <input
                type="checkbox"
                checked={video.instagram}
                onChange={() => toggleFlag(video.slug, "instagram")}
              />{" "}
              Instagram
            </label>
            <label>
              <input
                type="checkbox"
                checked={video.youtube}
                onChange={() => toggleFlag(video.slug, "youtube")}
              />{" "}
              YouTube
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

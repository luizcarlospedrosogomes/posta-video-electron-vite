import { useParams, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

interface Video {
    id: number;
    filename: string;
    slug: string;
    tiktok: boolean;
    instagram: boolean;
    youtube: boolean;
    created_at: string;
}

export default function VideoDetail() {
    const { slug } = useParams<{ slug: string }>();
    const [video, setVideo] = useState<Video | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            const dbVideos: Video[] = await window.electronAPI.getVideos();
            const found = dbVideos.find((v) => v.slug === slug);
            setVideo(found || null);
        };
        load();
    }, [slug]);

    if (!video) return <div>Vídeo não encontrado.</div>;

    return (
        <div style={{ padding: "16px" }}>
            <button onClick={() => navigate(-1)}>⬅ Voltar</button>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "16px" }}>
                <video
                    controls
                    style={{ width: "100%", maxHeight: "70vh", marginBottom: "16px" }}
                    src={video.filename}
                />
                <h2>{video.slug}</h2>
                <button
                    style={{
                        marginTop: "16px",
                        padding: "12px 24px",
                        fontSize: "18px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                    onClick={async () => {
                        try {
                            const tokenData = await window.electronAPI.loginTikTok();
                            console.log("TikTok Token:", tokenData);
                            const result = await window.electronAPI.publishTikTok({
                                filename: video.filename,
                                accessToken: "SEU_ACCESS_TOKEN_AQUI" // precisa vir do OAuth
                            });
                            alert("Publicado no TikTok ✅: " + JSON.stringify(result));
                        } catch (e) {
                            alert("Erro ao publicar: " + e);
                        }
                    }}
                >
                    📤 Publicar
                </button>
            </div>
        </div>
    );
}

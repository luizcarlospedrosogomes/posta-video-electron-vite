import { ipcMain, shell, session, BrowserWindow } from "electron";
import fs from "fs";
import crypto from "crypto";
import qs from "querystring";
import 'dotenv/config'
import pkceChallenge from "pkce-challenge";
const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!;
const REDIRECT_URI = "http://localhost:5173/callback"; // precisa estar cadastrado no app TikT



ipcMain.handle("publishTikTok", async (_event, { filename, accessToken }) => {
    try {
        // 1️⃣ Criar sessão de upload
        const createRes = await fetch("https://open-api.tiktokglobalshop.com/video/upload/", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ source_info: { source: "FILE_UPLOAD" } }),
        });
        const createData = await createRes.json();
        const uploadUrl = createData.data.upload_url;
        const videoId = createData.data.video_id;

        // 2️⃣ Upload do vídeo
        const videoBuffer = fs.readFileSync(filename);
        const uploadRes = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": "video/mp4" },
            body: videoBuffer,
        });
        if (!uploadRes.ok) throw new Error("Erro ao enviar vídeo");

        // 3️⃣ Publicação
        const publishRes = await fetch("https://open-api.tiktokglobalshop.com/video/publish/", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                video_id: videoId,
                post_info: { title: "Postado pelo Posta Vídeo 🚀", privacy_level: "PUBLIC" },
            }),
        });

        return await publishRes.json();
    } catch (err) {
        console.error("Erro publicando no TikTok:", err);
        throw err;
    }
});

export async function registerTikTokIPC(mainWindow: BrowserWindow) {

    ipcMain.handle("tiktok:login", async () => {

        return new Promise(async (resolve, reject) => {
            const { code_verifier: codeVerifier, code_challenge: codeChallenge } = await pkceChallenge();
            console.log("codeVerifier", codeVerifier, "codeChallenge ", codeChallenge)
            const authWindow = new BrowserWindow({
                width: 500,
                height: 700,
                webPreferences: { nodeIntegration: false }
            });

            const authUrl =
                `https://www.tiktok.com/v2/auth/authorize?` +
                `client_key=${CLIENT_KEY}&response_type=code&scope=video.upload` +
                `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
                `&code_challenge==${encodeURIComponent(codeChallenge)}&code_challenge_method=S256`;

            authWindow.loadURL(authUrl);
            console.log(authUrl)
            // Captura o redirect
            const filter = { urls: [`${REDIRECT_URI}*`] };
            session.defaultSession.webRequest.onBeforeRequest(filter, async ({ url }) => {
                if (!url.startsWith(REDIRECT_URI)) return;
                const urlObj = new URL(url);
                const code = urlObj.searchParams.get("code");
                console.log("code ", code)
                if (!code) {
                    reject(new Error("Nenhum code recebido"));
                    authWindow.close();
                    return;
                }

                const body = qs.stringify({
                    client_key: CLIENT_KEY,
                    client_secret: CLIENT_SECRET,
                    code,
                    grant_type: "authorization_code",
                    redirect_uri: REDIRECT_URI,
                    code_verifier: codeVerifier
                });
                try {
                    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body
                    });

                    if (!tokenRes.ok) {
                        const text = await tokenRes.text();
                        console.error("Erro token:", text);
                        throw new Error("Falha ao trocar code por token");
                    }
                    const tokenData = await tokenRes.json();
                    console.log("tokenData", tokenData, body)
                    authWindow.close();
                    resolve(tokenData);
                } catch (err) {
                    console.log(err)
                    reject(err);
                }
            });
        });
    });
}

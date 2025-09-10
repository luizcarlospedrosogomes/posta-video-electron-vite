import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AgendaCalendar from "@/components/agenda/AgendaCalendar";
import VideoGallery from "@/components/files/VideoGallery";
import VideoDetail from "@/components/video/VideoDetail"; // nova página de detalhe
import "./App.css";

function App() {
  const agenda = [
    {
      id: 1,
      title: "Vídeo TikTok - Receita",
      start: new Date(2025, 8, 9, 10, 0),
      end: new Date(2025, 8, 9, 11, 0),
      status: "pending",
    },
    {
      id: 2,
      title: "Vídeo Instagram - Promoção",
      start: new Date(2025, 8, 9, 18, 0),
      end: new Date(2025, 8, 9, 19, 0),
      status: "published",
    },
    {
      id: 3,
      title: "Vídeo Shorts - Review",
      start: new Date(2025, 8, 10, 12, 0),
      end: new Date(2025, 8, 10, 13, 0),
      status: "failed",
    },
  ];

  return (
    <BrowserRouter>
      <div className="app-container">
        <aside className="sidebar">
          <h2>📽 Posta Vídeo</h2>
          <Link to="/" className="menu-btn">Agenda</Link>
          <Link to="/files" className="menu-btn">Arquivos</Link>
          <button className="menu-btn">Redes Sociais</button>
          <button className="menu-btn">Configurações</button>
        </aside>

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <h1>📅 Agenda de Publicação</h1>
                  <AgendaCalendar events={agenda} />
                </>
              }
            />
            <Route
              path="/files"
              element={
                <>
                  <h1>📂 Arquivos de Vídeo</h1>
                  <VideoGallery />
                </>
              }
            />
            <Route path="/video/:slug" element={<VideoDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

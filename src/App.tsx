import { useState } from 'react';
import UpdateElectron from '@/components/update';
import './App.css';
import AgendaCalendar from '@/components/agenda/AgendaCalendar';
import VideoGallery from '@/components/files/VideoGallery';

function App() {
  const [page, setPage] = useState<'agenda' | 'files'>('agenda');
  const [agenda] = useState([
    {
      id: 1,
      title: 'Vídeo TikTok - Receita',
      start: new Date(2025, 8, 9, 10, 0),
      end: new Date(2025, 8, 9, 11, 0),
      status: 'pending'
    },
    {
      id: 2,
      title: 'Vídeo Instagram - Promoção',
      start: new Date(2025, 8, 9, 18, 0),
      end: new Date(2025, 8, 9, 19, 0),
      status: 'published'
    },
    {
      id: 3,
      title: 'Vídeo Shorts - Review',
      start: new Date(2025, 8, 10, 12, 0),
      end: new Date(2025, 8, 10, 13, 0),
      status: 'failed'
    },
  ]);
 
  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>📽 Posta Vídeo</h2>
         <button className="menu-btn" onClick={() => setPage('agenda')}>Agenda</button>
        <button className="menu-btn" onClick={() => setPage('files')}>Arquivos</button>
        <button className="menu-btn">Redes Sociais</button>
        <button className="menu-btn">Configurações</button>
      </aside>

      <main className="main-content">
        <h1>📅 Agenda de Publicação</h1>
        {page === 'agenda' && <AgendaCalendar events={agenda} />}
        {page === 'files' && <VideoGallery />}
        
      </main>
    </div>
  );
}

export default App;

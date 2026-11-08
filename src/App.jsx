import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Reportar from './pages/Reportar';
import Confirmacion from './pages/Confirmacion';
import Colonia from './pages/Colonia';
import Informe from './pages/Informe';
import Autoridades from './pages/Autoridades';
import Ayuda from './pages/Ayuda';
import MensajesPage from './pages/MensajesPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/reportar" element={<Reportar />} />
              <Route path="/confirmacion" element={<Confirmacion />} />
              <Route path="/colonia/:id" element={<Colonia />} />
              <Route path="/colonia" element={<Navigate to="/colonia/oblatos" replace />} />
              <Route path="/informe" element={<Informe />} />
              <Route path="/autoridades" element={<Autoridades />} />
              <Route path="/ayuda" element={<Ayuda />} />
              <Route path="/mensajes" element={<MensajesPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {/* Footer discreto */}
          <footer className="w-full bg-surface-container-low border-t border-surface-container-high py-4 px-4 text-center text-xs text-on-surface-variant no-print">
            <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>AguaClara Jalisco · Monitoreo vecinal independiente</span>
              <span>Guadalajara, Jalisco · 2026</span>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

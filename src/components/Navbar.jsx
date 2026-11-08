import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { modoDemo, setModoDemo } = useApp();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();

  const esActivo = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] no-print">
      {/* 4. Banner superior: Barra delgada unificada */}
      <div id="demo-banner" className="bg-surface-container-high border-b border-surface-container-highest px-3 sm:px-margin-desktop py-1 text-on-surface-variant">
        <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] sm:text-xs">
          <div className="flex items-center gap-1.5 text-tertiary-container font-semibold shrink-0">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Prototipo con datos de demostración</span>
          </div>

          <button
            type="button"
            onClick={() => setModoDemo(!modoDemo)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold transition-all border ${
              modoDemo
                ? 'bg-secondary-container/60 text-on-secondary-container border-secondary/30 hover:bg-secondary-container/80'
                : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-highest'
            }`}
            title="Haz clic para activar o desactivar el modo demostración"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${modoDemo ? 'bg-secondary animate-pulse' : 'bg-outline'}`}></span>
            <span className="truncate">
              {modoDemo
                ? 'MODO DEMOSTRACIÓN: la ubicación y el límite de 48 h no se validan'
                : 'Modo regular: validaciones activas (clic para activar demo)'}
            </span>
          </button>
        </div>
      </div>

      {/* Barra principal de navegación */}
      <div className="h-16 max-w-[1120px] mx-auto px-4 sm:px-margin-desktop flex items-center justify-between gap-space-md">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-secondary rounded-lg pr-1"
          onClick={() => setMenuAbierto(false)}
        >
          <svg aria-label="Logotipo AguaClara" className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4C20 4 8 18.5 8 26.5C8 33.1274 13.3726 38.5 20 38.5C26.6274 38.5 32 33.1274 32 26.5C32 18.5 20 4 20 4Z" fill="#0B5FA5"></path>
            <path d="M15 25C15 22.2386 17.2386 20 20 20" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2.5"></path>
          </svg>
          <div className="flex flex-col text-left">
            <span className="font-bold text-lg sm:text-xl leading-none text-primary tracking-tight">AguaClara</span>
            <span className="text-[10px] sm:text-xs leading-tight text-on-surface-variant font-medium">Jalisco · Reportes ciudadanos</span>
          </div>
        </Link>

        {/* Enlaces de escritorio */}
        <div className="hidden md:flex items-center gap-space-lg">
          <nav className="flex items-center gap-1 font-medium">
            <Link
              to="/"
              className={`min-h-[42px] px-3 py-1 flex items-center justify-center rounded-lg text-sm transition-colors ${
                esActivo('/') ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Mapa
            </Link>
            <Link
              to="/informe"
              className={`min-h-[42px] px-3 py-1 flex items-center justify-center rounded-lg text-sm transition-colors ${
                esActivo('/informe') ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Informe
            </Link>
            <Link
              to="/autoridades"
              className={`min-h-[42px] px-3 py-1 flex items-center justify-center rounded-lg text-sm transition-colors ${
                esActivo('/autoridades') ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Autoridades
            </Link>
            <Link
              to="/ayuda"
              className={`min-h-[42px] px-3 py-1 flex items-center justify-center rounded-lg text-sm transition-colors ${
                esActivo('/ayuda') ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Ayuda
            </Link>
          </nav>

          <Link
            to="/reportar"
            className="min-h-[46px] px-5 py-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-container text-on-primary text-sm font-semibold shadow-sm hover:bg-primary active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_alert</span>
            <span>Reportar problema</span>
          </Link>
        </div>

        {/* Botón de Menú Móvil */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/reportar"
            className="min-h-[40px] px-3 py-1.5 inline-flex items-center gap-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add_alert</span>
            <span>Reportar</span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Abrir menú de navegación"
          >
            <span className="material-symbols-outlined text-[24px]">
              {menuAbierto ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Menú desplegable móvil */}
      {menuAbierto && (
        <div className="md:hidden border-t border-surface-container-high bg-surface-container-lowest px-4 py-3 shadow-lg flex flex-col gap-2">
          <Link
            to="/"
            onClick={() => setMenuAbierto(false)}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 ${
              esActivo('/') ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            <span>Mapa y Colonias</span>
          </Link>
          <Link
            to="/informe"
            onClick={() => setMenuAbierto(false)}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 ${
              esActivo('/informe') ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            <span>Informe ciudadano</span>
          </Link>
          <Link
            to="/autoridades"
            onClick={() => setMenuAbierto(false)}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 ${
              esActivo('/autoridades') ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">policy</span>
            <span>Panel de autoridades (solo lectura)</span>
          </Link>
          <Link
            to="/ayuda"
            onClick={() => setMenuAbierto(false)}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 ${
              esActivo('/ayuda') ? 'bg-surface-container-high text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">help</span>
            <span>Centro de ayuda y dudas</span>
          </Link>
        </div>
      )}
    </header>
  );
}

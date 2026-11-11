import React from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const PESTAÑAS = [
  { to: '/panel', etiqueta: 'Panel de control', icono: 'dashboard', exacto: true },
  { to: '/panel/nueva', etiqueta: 'Registrar actualización', icono: 'edit_note' },
  { to: '/panel/bitacora', etiqueta: 'Bitácora', icono: 'history' },
];

/**
 * Envoltura del portal de autoridades: exige sesión de una cuenta autorizada
 * y muestra la navegación interna del portal.
 */
export default function PanelLayout({ children }) {
  const { autoridad, cargandoAuth, cerrarSesionAutoridad } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  if (cargandoAuth) {
    return (
      <div className="w-full pt-40 flex justify-center flex-1">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!autoridad) {
    return <Navigate to="/panel/acceso" replace state={{ desde: location.pathname }} />;
  }

  const salir = async () => {
    await cerrarSesionAutoridad();
    navigate('/panel/acceso');
  };

  const activa = (p) => (p.exacto ? location.pathname === p.to : location.pathname.startsWith(p.to));

  return (
    <div className="w-full pt-28 sm:pt-32 bg-background flex-1 text-left">
      {/* Barra del portal */}
      <section className="w-full bg-surface-container-lowest border-b border-surface-container-high">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-margin-desktop py-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <nav className="flex flex-wrap items-center gap-1" aria-label="Navegación del portal de autoridades">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mr-1 rounded-full bg-secondary-container/60 text-on-secondary-container text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Portal de autoridades
            </span>
            {PESTAÑAS.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className={`min-h-[40px] px-3 py-1 inline-flex items-center gap-1.5 rounded-lg text-sm transition-colors ${
                  activa(p)
                    ? 'bg-primary text-on-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface font-medium'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{p.icono}</span>
                <span>{p.etiqueta}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[22px] text-primary">account_circle</span>
              <div className="leading-tight min-w-0">
                <span className="font-semibold text-on-surface block truncate">{autoridad.nombre}</span>
                {autoridad.cargo && (
                  <span className="text-[11px] text-on-surface-variant block truncate">{autoridad.cargo}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={salir}
              className="min-h-[40px] px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-margin-desktop py-4 sm:py-space-xl flex flex-col gap-6">
        {children}

        <p className="text-[11px] text-on-surface-variant text-center pt-2">
          Portal de demostración del prototipo AguaClara Jalisco. Las cuentas y actualizaciones de este entorno
          son de prueba y no representan comunicados oficiales de ninguna dependencia.
        </p>
      </div>
    </div>
  );
}

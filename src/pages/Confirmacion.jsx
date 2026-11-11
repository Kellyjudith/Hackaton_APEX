import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';

export default function Confirmacion() {
  const location = useLocation();
  const state = location.state;

  if (!state || !state.reporte) {
    return <Navigate to="/" replace />;
  }

  const { reporte, coloniaNombre } = state;

  const tipoTexto = {
    turbia: 'Agua turbia / sucia',
    olor: 'Agua con mal olor',
    color: 'Agua con color extraño',
    falta_agua: 'Falta de agua o baja presión',
  }[reporte.tipo] || reporte.tipo;

  return (
    <div className="w-full pt-28 sm:pt-32 bg-background flex-1 text-left">
      <div className="w-full max-w-[768px] mx-auto px-4 sm:px-margin py-4 sm:py-space-xl flex flex-col items-center">
        {/* Icono de confirmación animado */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-secondary-container/40 flex items-center justify-center animate-pulse"></div>
          <div className="absolute inset-0 m-auto w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-secondary-container flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[36px] sm:text-[44px] text-on-secondary-container fill-1">
              check_circle
            </span>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface text-center mb-1 tracking-tight">
          ¡Gracias! Tu reporte ya cuenta en el mapa.
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant text-center max-w-xl mb-6 leading-relaxed">
          Tu participación fortalece el monitoreo ciudadano y la transparencia vecinal en el Área Metropolitana de Guadalajara.
        </p>

        {/* Tarjeta Resumen */}
        <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-5 sm:p-6 mb-6 text-left">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-container-high">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">assignment_turned_in</span>
              <span className="font-bold text-sm sm:text-base text-on-surface">Resumen de tu reporte</span>
            </div>
            <span className="text-xs font-semibold bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>Ingresado</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider block">Colonia</span>
              <p className="text-base sm:text-lg font-bold text-on-surface mt-0.5">{coloniaNombre}, Guadalajara</p>
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider block">Problema indicado</span>
              <p className="text-base sm:text-lg font-bold text-primary mt-0.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px]">water_drop</span>
                <span>{tipoTexto}</span>
              </p>
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider block">Fecha del registro</span>
              <p className="text-sm font-medium text-on-surface mt-0.5">{reporte.fecha}</p>
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider block">Vigencia en el semáforo</span>
              <p className="text-sm font-medium text-on-surface mt-0.5">Ventana activa de 30 días</p>
            </div>
          </div>

          <div className="mt-4 pt-3 bg-surface-container-low rounded-xl p-3 flex items-start gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">verified_user</span>
            <p>
              Registro ciudadano anónimo. No se guardaron coordenadas exactas ni datos personales para proteger tu privacidad.
            </p>
          </div>
        </div>

        {/* Recuadro de Atención SIAPA Oficial */}
        <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex flex-col gap-3 text-left">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <span className="material-symbols-outlined text-[22px]">notification_important</span>
            <h2 className="text-base sm:text-lg">Aviso importante de atención domiciliaria</h2>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
            Tu reporte <strong>NO se envía al SIAPA</strong>. Para solicitar atención en tu casa o desazolve de tubería, comunícate directamente por los canales oficiales del SIAPA:
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="https://wa.me/523351644440"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white text-on-surface hover:bg-slate-50 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm border border-amber-300 transition-colors"
            >
              <span className="material-symbols-outlined text-green-600 text-[20px]">chat</span>
              <span>WhatsApp SIAPA Bot: 33 5164 4440</span>
            </a>
            <a
              href="tel:073"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white text-on-surface hover:bg-slate-50 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm border border-amber-300 transition-colors"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">call</span>
              <span>Llamar al 073</span>
            </a>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed pt-1">
            Si la autoridad registra una atención en tu colonia, la verás en la ficha de la colonia, junto a los reportes.
            En este prototipo esas actualizaciones se publican desde un portal de demostración.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/"
            className="w-full sm:w-auto min-h-[50px] px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">map</span>
            <span>Volver al mapa</span>
          </Link>

          <Link
            to={`/colonia/${reporte.colonia}`}
            className="w-full sm:w-auto min-h-[50px] px-6 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span>Ver ficha de mi colonia</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

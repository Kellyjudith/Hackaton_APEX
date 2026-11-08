import React from 'react';
import Mensajes from '../components/Mensajes';

export default function MensajesPage() {
  return (
    <div className="w-full pt-20 sm:pt-24 bg-surface min-h-[calc(100vh-80px)] flex-1 text-left">
      <div className="w-full max-w-[760px] mx-auto px-4 sm:px-margin md:px-margin-tablet py-6 sm:py-space-xl flex flex-col gap-6">
        <header className="flex flex-col gap-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 self-center md:self-start px-3 py-1 bg-surface-container rounded-full text-on-surface-variant text-xs font-bold shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
            <span>Guía de estados del sistema</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Mensajes del reporte
          </h1>
          <p className="text-sm text-on-surface-variant max-w-xl">
            Casos informativos y validaciones del proceso de reporte ciudadano en la zona piloto de Guadalajara.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <Mensajes tipo="fuera_de_zona" />
          <Mensajes tipo="limite_48h" horasRestantes={36} />
          <Mensajes tipo="ubicacion_no_permitida" />
        </div>
      </div>
    </div>
  );
}

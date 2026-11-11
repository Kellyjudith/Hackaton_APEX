import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PanelLayout from '../components/PanelLayout';
import {
  ACCIONES,
  ESTADOS_ACTUALIZACION,
  actualizacionesVigentes,
  hace,
  ultimaDeColonia,
} from '../utils/actualizaciones';

const DIA_MS = 24 * 3600 * 1000;

export default function Panel() {
  const { resumenTodasColonias, actualizaciones } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const vigentes = useMemo(() => actualizacionesVigentes(actualizaciones), [actualizaciones]);
  const ahora = Date.now();

  const filas = useMemo(
    () =>
      (resumenTodasColonias || []).map((c) => ({
        ...c,
        ultima: ultimaDeColonia(actualizaciones, c.id),
      })),
    [resumenTodasColonias, actualizaciones]
  );

  const enRojo = filas.filter((c) => c.estado.id === 'muchos');
  const estaSemana = vigentes.filter((a) => ahora - a.timestamp <= 7 * DIA_MS).length;
  const sinActualizacion72h = filas.filter((c) => !c.ultima || ahora - c.ultima.timestamp > 3 * DIA_MS);

  const visibles = filas
    .filter((c) => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .filter((c) => filtroEstado === 'todos' || c.estado.id === filtroEstado)
    .sort((a, b) => b.reportesCalidad - a.reportesCalidad);

  return (
    <PanelLayout>
      <header className="flex flex-col gap-1 max-w-3xl">
        <span className="text-xs font-bold tracking-wider text-primary uppercase">Panel de control</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Autoridad del agua</h1>
        <p className="text-sm sm:text-base text-on-surface-variant">
          Resumen de las 8 colonias piloto: reportes ciudadanos y estado de las actualizaciones que se han
          publicado para la ciudadanía.
        </p>
      </header>

      {/* Tarjetas resumen */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 flex flex-col gap-1.5">
          <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">Prioridad</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-error">{enRojo.length}</span>
            <span className="text-on-surface">colonias en rojo</span>
          </div>
          <p className="text-xs text-on-surface-variant">
            {enRojo.length > 0 ? enRojo.map((c) => c.nombre).join(', ') : 'Ninguna colonia con "Muchos reportes".'}
          </p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 flex flex-col gap-1.5">
          <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">Actividad</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary">{estaSemana}</span>
            <span className="text-on-surface">actualizaciones esta semana</span>
          </div>
          <p className="text-xs text-on-surface-variant">Publicadas en los últimos 7 días.</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 flex flex-col gap-1.5">
          <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant">Sin seguimiento</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-tertiary-container">{sinActualizacion72h.length}</span>
            <span className="text-on-surface">colonias sin actualización</span>
          </div>
          <p className="text-xs text-on-surface-variant">Sin ninguna actualización en las últimas 72 horas.</p>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 flex-1">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar colonia"
            className="flex-1 min-h-[44px] bg-transparent outline-none text-sm"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="min-h-[44px] rounded-xl bg-surface-container px-3 text-sm font-medium"
          aria-label="Filtrar por semáforo"
        >
          <option value="todos">Todos los semáforos</option>
          <option value="muchos">Muchos reportes</option>
          <option value="moderados">Reportes moderados</option>
          <option value="pocos">Pocos reportes</option>
          <option value="sin_datos">Sin datos suficientes</option>
        </select>
      </section>

      {/* Colonias */}
      <section className="flex flex-col gap-2.5">
        {visibles.length === 0 && (
          <p className="text-sm text-on-surface-variant py-6 text-center">No hay colonias que coincidan.</p>
        )}
        {visibles.map((c) => {
          const meta = c.ultima ? ESTADOS_ACTUALIZACION[c.ultima.estado] : null;
          return (
            <article
              key={c.id}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-5"
            >
              <div className="md:w-56 shrink-0">
                <h2 className="text-lg font-bold text-on-surface leading-tight">{c.nombre}</h2>
                <span
                  className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  style={{ backgroundColor: c.estado.bg, color: c.estado.text, borderColor: c.estado.border }}
                >
                  {c.estado.nombre}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 md:w-72 shrink-0">
                <div>
                  <span className="text-[11px] text-on-surface-variant block">Reportes calidad (30 d)</span>
                  <span className="text-xl font-black text-on-surface">{c.reportesCalidad}</span>
                </div>
                <div>
                  <span className="text-[11px] text-on-surface-variant block">Falta de agua (30 d)</span>
                  <span className="text-xl font-black text-primary">{c.faltaAguaCount}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0 text-sm">
                <span className="text-[11px] text-on-surface-variant block">Última actualización</span>
                {c.ultima ? (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${meta.clases}`}>
                      <span className="material-symbols-outlined text-[14px]">{meta.icono}</span>
                      {meta.nombre}
                    </span>
                    <span className="text-on-surface font-medium">{ACCIONES[c.ultima.accion]}</span>
                    <span className="text-on-surface-variant text-xs">{hace(c.ultima.timestamp)}</span>
                  </div>
                ) : (
                  <span className="text-on-surface-variant">Sin actualizaciones registradas</span>
                )}
              </div>

              <Link
                to={`/panel/nueva?colonia=${c.id}`}
                className={`min-h-[46px] px-4 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors ${
                  c.estado.id === 'muchos'
                    ? 'bg-primary text-on-primary hover:bg-primary-container'
                    : 'bg-surface-container text-primary hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                Registrar actualización
              </Link>
            </article>
          );
        })}
      </section>

      <p className="text-xs text-on-surface-variant">
        Los datos de reportes provienen de la ciudadanía (anónimos y agregados por colonia). Las actualizaciones
        no modifican ni borran reportes: se muestran junto a ellos.
      </p>
    </PanelLayout>
  );
}

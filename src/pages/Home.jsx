import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import MapaLeaflet from '../components/MapaLeaflet';
import { ETIQUETA_TIPO, tiempoRelativo, ultimosReportes } from '../utils/tiempo';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { geojsonData, resumenTodasColonias, cargando } = useApp();

  const vistaInicial = searchParams.get('vista') || 'mapa';
  const [vista, setVista] = useState(vistaInicial);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'falta_agua'
  const [coloniaSeleccionadaId, setColoniaSeleccionadaId] = useState('oblatos');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const contenidoRef = useRef(null);

  useEffect(() => {
    const v = searchParams.get('vista');
    if (v && (v === 'mapa' || v === 'lista')) {
      setVista(v);
    }
  }, [searchParams]);

  const cambiarVista = (nuevaVista) => {
    setVista(nuevaVista);
    setSearchParams({ vista: nuevaVista });
  };

  // Filtrado de colonias
  const coloniasFiltradas = (resumenTodasColonias || []).filter(c => {
    const coincideTexto = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          c.id.toLowerCase().includes(busqueda.toLowerCase());
    if (!coincideTexto) return false;
    if (filtroTipo === 'falta_agua') {
      return c.faltaAguaCount > 0;
    }
    return true;
  });

  // Sugerencias rápidas para el buscador
  const sugerenciasBusqueda = (resumenTodasColonias || []).filter(c =>
    busqueda.trim() !== '' &&
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Baja a la sección del mapa/lista (útil en celular, donde el buscador queda arriba y el mapa abajo)
  const irAlContenido = () => {
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur(); // cierra el teclado en el celular
    }
    setTimeout(() => {
      if (contenidoRef.current) {
        contenidoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const seleccionarColoniaDesdeBuscador = (colonia) => {
    setColoniaSeleccionadaId(colonia.id);
    setBusqueda('');
    setMostrarSugerencias(false);
    irAlContenido();
  };

  const manejarTeclaBuscador = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (sugerenciasBusqueda.length > 0) {
        seleccionarColoniaDesdeBuscador(sugerenciasBusqueda[0]);
      }
    }
  };

  const coloniaSeleccionada = resumenTodasColonias?.find(c => c.id === coloniaSeleccionadaId) || resumenTodasColonias?.[0];

  return (
    <div className="w-full pt-28 sm:pt-32 bg-background flex-1">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-margin-desktop py-4 flex flex-col w-full gap-4 sm:gap-space-md">
        
        {/* Banner Hero */}
        <section className="relative w-full rounded-2xl bg-surface-container-lowest p-4 sm:p-space-lg shadow-sm flex flex-col gap-4 border border-outline-variant/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="max-w-2xl text-left">
              <span className="inline-flex items-center gap-1.5 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">
                <span className="material-symbols-outlined text-[18px]">near_me</span>
                Área Metropolitana de Guadalajara
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface leading-tight tracking-tight">
                ¿Cómo está el agua en tu colonia?
              </h1>
              <p className="text-base sm:text-lg text-on-surface-variant mt-1 leading-relaxed">
                Consulta los reportes vecinales de los últimos 30 días en las 8 colonias piloto de Guadalajara.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-center bg-secondary-container/30 px-3.5 py-2 rounded-xl border border-secondary/20">
              <span className="material-symbols-outlined text-secondary text-[26px]">verified</span>
              <div className="flex flex-col text-left">
                <span className="font-bold text-sm text-on-surface leading-none">100% Ciudadano</span>
                <span className="text-xs text-on-surface-variant leading-tight">Sin trámites ni contraseñas</span>
              </div>
            </div>
          </div>

          {/* 1. Buscador funcional y Controles de Filtros */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch pt-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[22px]">search</span>
              </div>
              <input
                type="search"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setMostrarSugerencias(true);
                }}
                onFocus={() => setMostrarSugerencias(true)}
                onKeyDown={manejarTeclaBuscador}
                enterKeyHint="search"
                placeholder="Buscar tu colonia"
                className="w-full min-h-[50px] pl-11 pr-10 rounded-xl bg-surface-container-low text-on-surface text-base placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-secondary transition-all border border-transparent focus:border-secondary"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda('');
                    setMostrarSugerencias(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">cancel</span>
                </button>
              )}

              {/* Menú flotante de autocompletado del buscador */}
              {mostrarSugerencias && sugerenciasBusqueda.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/40 z-30 overflow-hidden divide-y divide-surface-container-high">
                  {sugerenciasBusqueda.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => seleccionarColoniaDesdeBuscador(col)}
                      className="w-full p-3 text-left hover:bg-surface-container-low flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                        <span className="font-bold text-sm text-on-surface">{col.nombre}</span>
                        <span className="text-xs text-on-surface-variant font-normal">({col.municipio})</span>
                      </div>
                      <span className="text-xs font-semibold text-primary">Centrar en mapa &rarr;</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Capa del mapa: Calidad del agua | Falta de agua */}
              <div
                role="group"
                aria-label="Capa del mapa"
                className="flex items-center bg-surface-container rounded-xl p-1 gap-1"
              >
                <button
                  type="button"
                  onClick={() => setFiltroTipo('todos')}
                  aria-pressed={filtroTipo === 'todos'}
                  className={`min-h-[40px] px-3.5 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all ${
                    filtroTipo === 'todos'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">water_drop</span>
                  <span>Calidad del agua</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroTipo('falta_agua')}
                  aria-pressed={filtroTipo === 'falta_agua'}
                  className={`min-h-[40px] px-3.5 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all ${
                    filtroTipo === 'falta_agua'
                      ? 'bg-sky-700 text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">water_damage</span>
                  <span>Falta de agua</span>
                </button>
              </div>

              {/* Interruptor Accesible Mapa | Lista */}
              <div className="flex items-center bg-surface-container rounded-xl p-1 ml-auto">
                <button
                  type="button"
                  onClick={() => cambiarVista('mapa')}
                  className={`min-h-[40px] px-3.5 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all ${
                    vista === 'mapa'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  aria-label="Ver mapa"
                >
                  <span className="material-symbols-outlined text-[18px]">map</span>
                  <span>Mapa</span>
                </button>
                <button
                  type="button"
                  onClick={() => cambiarVista('lista')}
                  className={`min-h-[40px] px-3.5 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all ${
                    vista === 'lista'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  aria-label="Ver lista"
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                  <span>Lista</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* LEYENDA DINÁMICA: Semáforo Normal VS Leyenda Exclusiva de Falta de Agua */}
        {filtroTipo === 'falta_agua' ? (
          /* Leyenda y escala de azul para Falta de Agua */
          <section className="bg-sky-50 border border-sky-200 rounded-2xl p-4 sm:p-space-md shadow-sm flex flex-col gap-3 text-left">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-1 border-b border-sky-200">
              <div className="flex items-center gap-2 text-sky-950 font-bold text-base sm:text-lg">
                <span className="material-symbols-outlined text-sky-700 text-[24px]">water_damage</span>
                <span>Reportes de falta de agua, últimos 30 días</span>
              </div>
              <p className="text-xs text-sky-900 bg-sky-100 px-3 py-1.5 rounded-lg">
                <strong>Nota:</strong> Estos colores NO son los del semáforo (la falta de agua no entra al semáforo de calidad).
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-sky-100">
                <span className="w-8 h-8 rounded-lg bg-[#BAE6FD] text-[#0369A1] font-bold flex items-center justify-center shrink-0">
                  1-2
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-sky-950">Avisos moderados</span>
                  <span className="text-[11px] text-sky-700">1 a 2 reportes</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-sky-100">
                <span className="w-8 h-8 rounded-lg bg-[#38BDF8] text-white font-bold flex items-center justify-center shrink-0">
                  3-4
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-sky-950">Avisos recurrentes</span>
                  <span className="text-[11px] text-sky-700">3 a 4 reportes</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-sky-100">
                <span className="w-8 h-8 rounded-lg bg-[#0284C7] text-white font-bold flex items-center justify-center shrink-0">
                  5+
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-sky-950">Concentración alta</span>
                  <span className="text-[11px] text-sky-700">5 o más reportes</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-sky-100 opacity-60">
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 font-bold flex items-center justify-center shrink-0">
                  0
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Sin avisos (Atenuada)</span>
                  <span className="text-[11px] text-slate-500">0 reportes de corte</span>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* Leyenda normal del Semáforo de Calidad */
          <section className="bg-surface-container-lowest rounded-2xl p-4 sm:p-space-md shadow-sm border border-outline-variant/30 flex flex-col gap-3 text-left">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-2 text-on-surface font-semibold text-base sm:text-lg">
                <span className="material-symbols-outlined text-primary text-[22px]">analytics</span>
                <span>Semáforo de reportes vecinales</span>
              </div>
              <p className="text-xs sm:text-sm text-tertiary-container bg-surface-container-low px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] shrink-0">info</span>
                <span><strong>Nota importante:</strong> Indica el nivel de reportes ciudadanos, no la calidad del agua. Ventana de 30 días.</span>
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
              <div className="flex items-center gap-2 p-2.5 bg-surface-container-low rounded-xl">
                <span className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#14532D] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                </span>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-on-surface leading-tight">Pocos reportes</span>
                  <span className="text-[11px] text-on-surface-variant">&lt; 1.5 por 1k viv.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-surface-container-low rounded-xl">
                <span className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#78350F] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">warning_amber</span>
                </span>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-on-surface leading-tight">Reportes moderados</span>
                  <span className="text-[11px] text-on-surface-variant">1.5 a 3.5 por 1k viv.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-surface-container-low rounded-xl">
                <span className="w-8 h-8 rounded-lg bg-[#FEE2E2] text-[#7F1D1D] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">report</span>
                </span>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-on-surface leading-tight">Muchos reportes</span>
                  <span className="text-[11px] text-on-surface-variant">&ge; 3.5 por 1k viv.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-surface-container-low rounded-xl">
                <span className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface-variant flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">help</span>
                </span>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-on-surface leading-tight">Sin datos suficientes</span>
                  <span className="text-[11px] text-on-surface-variant">&lt; 3 reportes</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Ancla de desplazamiento: aquí llega el usuario al elegir una colonia */}
        <div ref={contenidoRef} aria-hidden="true" className="scroll-mt-28 h-0 -mb-4" />

        {/* Contenido Principal: Alternancia Mapa / Lista */}
        {cargando ? (
          <div className="h-96 flex items-center justify-center bg-surface-container-lowest rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-on-surface-variant font-medium">Cargando datos vecinales de Guadalajara...</span>
            </div>
          </div>
        ) : vista === 'mapa' ? (
          /* VISTA MAPA */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-space-lg items-start">
            {/* Mapa interactivo */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3">
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden p-2 sm:p-3 border border-outline-variant/30 flex flex-col">
                <MapaLeaflet
                  geojsonData={geojsonData}
                  resumenTodasColonias={resumenTodasColonias}
                  coloniaSeleccionadaId={coloniaSeleccionadaId}
                  onSelectColonia={(id) => setColoniaSeleccionadaId(id)}
                  filtroTipo={filtroTipo}
                />
              </div>
            </div>

            {/* Ficha lateral de colonia seleccionada */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3">
              {coloniaSeleccionada && (
                <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-4 sm:p-5 border border-outline-variant/30 flex flex-col gap-4 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider block">
                        Colonia Seleccionada
                      </span>
                      <h2 className="text-2xl font-bold text-on-surface mt-0.5">
                        {coloniaSeleccionada.nombre}
                      </h2>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {coloniaSeleccionada.municipio}, Jalisco
                      </span>
                    </div>

                    {filtroTipo === 'falta_agua' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 bg-sky-100 text-sky-900 border border-sky-300">
                        <span className="material-symbols-outlined text-[16px]">water_damage</span>
                        <span>{coloniaSeleccionada.faltaAguaCount} avisos falta</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 border"
                        style={{
                          backgroundColor: coloniaSeleccionada.estado.bg,
                          color: coloniaSeleccionada.estado.text,
                          borderColor: coloniaSeleccionada.estado.border,
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px]">{coloniaSeleccionada.estado.icon}</span>
                        <span>{coloniaSeleccionada.estado.nombre}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {filtroTipo === 'falta_agua'
                      ? coloniaSeleccionada.faltaAguaCount > 0
                        ? `Se registran ${coloniaSeleccionada.faltaAguaCount} avisos independientes de falta de agua o baja presión en los últimos 30 días.`
                        : 'No se registran avisos de corte de agua en esta colonia durante los últimos 30 días.'
                      : coloniaSeleccionada.estado.descripcion}
                  </p>

                  {/* Tarjetas de métricas rápidas */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-3 bg-surface-container-low rounded-xl">
                      <span className="text-xs text-on-surface-variant block font-medium">
                        {filtroTipo === 'falta_agua' ? 'Avisos falta de agua' : 'Reportes calidad'}
                      </span>
                      <span className="text-2xl font-black text-primary">
                        {filtroTipo === 'falta_agua' ? coloniaSeleccionada.faltaAguaCount : coloniaSeleccionada.reportesCalidad}
                      </span>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5">en 30 días</span>
                    </div>

                    <div className="p-3 bg-surface-container-low rounded-xl">
                      <span className="text-xs text-on-surface-variant block font-medium">Tasa calidad</span>
                      <span className="text-2xl font-black text-on-surface">
                        {coloniaSeleccionada.estado.tasa !== null ? coloniaSeleccionada.estado.tasa : 'Sin dato'}
                      </span>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5">por 1k viviendas</span>
                    </div>
                  </div>

                  {/* Último reporte registrado (solo tipo y tiempo) */}
                  {(() => {
                    const ultimo = ultimosReportes(coloniaSeleccionada.reportes, 1)[0];
                    return (
                      <div className="flex items-center justify-between gap-2 p-3 bg-surface-container-low rounded-xl text-sm">
                        <span className="text-xs text-on-surface-variant font-medium">Último reporte registrado:</span>
                        <span className="font-semibold text-on-surface text-right">
                          {ultimo ? `${ETIQUETA_TIPO[ultimo.tipo] || ultimo.tipo} · ${tiempoRelativo(ultimo)}` : 'Sin reportes aún'}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Acciones principales */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Link
                      to={`/colonia/${coloniaSeleccionada.id}`}
                      className="min-h-[48px] px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm"
                    >
                      <span>Ver ficha completa y gráficas</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>

                    <Link
                      to={`/informe?colonia=${coloniaSeleccionada.id}`}
                      className="min-h-[48px] px-4 py-2 bg-surface-container text-primary rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">description</span>
                      <span>Generar informe ciudadano</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Selector de colonias en tarjeta */}
              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 text-left">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  Elegir colonia en el mapa:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(resumenTodasColonias || []).map(c => {
                    const isSelected = c.id === coloniaSeleccionadaId;
                    const countFalta = c.faltaAguaCount;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setColoniaSeleccionadaId(c.id);
                          irAlContenido();
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-primary text-on-primary shadow-sm'
                            : filtroTipo === 'falta_agua' && countFalta === 0
                            ? 'bg-surface-container-low text-outline opacity-60'
                            : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        <span>{c.nombre}</span>
                        {filtroTipo === 'falta_agua' && countFalta > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-white text-primary' : 'bg-sky-200 text-sky-900'}`}>
                            {countFalta}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VISTA LISTA DE COLONIAS */
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-left px-1">
              <span className="text-sm font-bold text-on-surface-variant">
                Mostrando {coloniasFiltradas.length} colonia(s) {filtroTipo === 'falta_agua' ? 'con falta de agua' : 'piloto'}
              </span>
              <span className="text-xs text-on-surface-variant">
                Periodo activo de 30 días
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
              {[...coloniasFiltradas]
                .sort((a, b) =>
                  filtroTipo === 'falta_agua'
                    ? b.faltaAguaCount - a.faltaAguaCount
                    : b.reportesCalidad - a.reportesCalidad
                )
                .map((c) => (
                <div
                  key={c.id}
                  className={`bg-surface-container-lowest rounded-2xl p-3.5 sm:p-5 shadow-sm border flex flex-col justify-between gap-2.5 sm:gap-4 text-left hover:shadow-md transition-all ${
                    filtroTipo === 'falta_agua' ? 'border-sky-200' : 'border-outline-variant/30'
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base sm:text-xl font-bold text-on-surface">{c.nombre}</h3>
                        <span className="text-xs text-on-surface-variant">{c.municipio}, Jalisco</span>
                      </div>

                      {filtroTipo === 'falta_agua' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-900 border border-sky-300 shrink-0">
                          <span className="material-symbols-outlined text-[14px]">water_damage</span>
                          <span>{c.faltaAguaCount} avisos falta</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0"
                          style={{
                            backgroundColor: c.estado.bg,
                            color: c.estado.text,
                            borderColor: c.estado.border,
                          }}
                        >
                          <span className="material-symbols-outlined text-[14px]">{c.estado.icon}</span>
                          <span>{c.estado.nombre}</span>
                        </span>
                      )}
                    </div>

                    <p className="hidden sm:block text-xs text-on-surface-variant leading-relaxed">
                      {filtroTipo === 'falta_agua'
                        ? `${c.faltaAguaCount} reportes de falta de agua o presión insuficiente en los últimos 30 días.`
                        : c.estado.descripcion}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-1.5 sm:py-2 border-y border-surface-container-high">
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">
                        {filtroTipo === 'falta_agua' ? 'Avisos de corte' : 'Reportes calidad'}
                      </span>
                      <span className="text-lg sm:text-xl font-black text-primary">
                        {filtroTipo === 'falta_agua' ? c.faltaAguaCount : c.reportesCalidad}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-on-surface-variant block">Por 1k viviendas</span>
                      <span className="text-lg sm:text-xl font-black text-on-surface">
                        {c.estado.tasa !== null ? c.estado.tasa : 'Sin dato'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/colonia/${c.id}`}
                      className="flex-1 min-h-[44px] px-3 py-2 bg-primary text-on-primary rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary-container transition-all"
                    >
                      <span>Ver ficha</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setColoniaSeleccionadaId(c.id);
                        cambiarVista('mapa');
                      }}
                      className="px-3 min-h-[44px] bg-surface-container hover:bg-surface-container-high text-primary rounded-xl font-semibold text-xs flex items-center justify-center gap-1 transition-all"
                      title="Centrar en el mapa"
                    >
                      <span className="material-symbols-outlined text-[18px]">map</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

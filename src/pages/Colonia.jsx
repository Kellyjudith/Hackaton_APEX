import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { SERIE_SEMANAL, calcularEstadisticasSalud, marcarEvidenciaEnviada, getEstadoEvidenciaEnviada } from '../utils/reportesStore';
import { descargarCSV } from '../utils/exportarCSV';

export default function Colonia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { coloniasPiloto, getColoniaResumen } = useApp();

  const coloniaActualId = id || 'oblatos';
  const dataColonia = getColoniaResumen(coloniaActualId);

  // Estado de "Ya lo envié"
  const [estadoEnvio, setEstadoEnvio] = useState(null);

  useEffect(() => {
    setEstadoEnvio(getEstadoEvidenciaEnviada(coloniaActualId));
  }, [coloniaActualId]);

  const handleMarcarEnviado = () => {
    const res = marcarEvidenciaEnviada(coloniaActualId);
    if (res) {
      setEstadoEnvio(getEstadoEvidenciaEnviada(coloniaActualId));
    }
  };

  // Datos para gráfica de barras por tipo
  const turbiaCount = dataColonia.reportes.filter(r => r.tipo === 'turbia').length;
  const olorCount = dataColonia.reportes.filter(r => r.tipo === 'olor').length;
  const colorCount = dataColonia.reportes.filter(r => r.tipo === 'color').length;
  const faltaAguaCount = dataColonia.faltaAguaCount;

  const datosBarras = [
    { tipo: 'Turbia', reportes: turbiaCount, fill: '#0B5FA5' },
    { tipo: 'Mal Olor', reportes: olorCount, fill: '#703500' },
    { tipo: 'Con Color', reportes: colorCount, fill: '#D97706' },
    { tipo: 'Falta Agua', reportes: faltaAguaCount, fill: '#0284C7' },
  ];

  // Salud
  const statsSalud = calcularEstadisticasSalud(dataColonia.reportes);

  // Manejador de exportación CSV
  const handleExportarCSV = () => {
    const filas = dataColonia.reportes.map(r => ({
      id: r.id,
      colonia: dataColonia.nombre,
      municipio: dataColonia.municipio,
      tipo_problema: r.tipo,
      tuvo_malestar_salud: r.sintomas === null ? 'No respondio' : r.sintomas ? 'Si' : 'No',
      fecha_reporte: r.fecha,
      simulado: r.simulado ? 'Si' : 'No'
    }));
    descargarCSV(filas, `aguaclara_${coloniaActualId}_reportes.csv`);
  };

  return (
    <div className="w-full pt-28 sm:pt-32 bg-background flex-1 text-left">
      {/* 2. Barra secundaria con selector de colonias: Flujo relativo con margen despejado del header */}
      <div className="w-full bg-surface-container-low border-b border-surface-container-high py-2.5 px-4 sm:px-margin-desktop no-print">
        <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary-container text-xs sm:text-sm font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Volver al mapa</span>
          </Link>

          {/* Selector de colonia en la barra */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] sm:text-xs text-on-surface-variant font-bold uppercase shrink-0">Colonia:</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {coloniasPiloto.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`/colonia/${c.id}`)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    c.id === coloniaActualId
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border border-outline-variant/30'
                  }`}
                >
                  {c.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-margin-desktop py-4 sm:py-space-lg flex flex-col gap-6">

        {/* Encabezado de la Ficha */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span>Ficha territorial de colonia</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
              {dataColonia.nombre}
            </h1>
            <p className="text-xs sm:text-base text-on-surface-variant mt-0.5">
              {dataColonia.municipio}, Jalisco · Ventana de análisis de 30 días
            </p>
          </div>

          {/* Botones de descarga y evidencia */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportarCSV}
              className="min-h-[44px] px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Descargar CSV</span>
            </button>

            <Link
              to={`/informe?colonia=${coloniaActualId}`}
              className="min-h-[44px] px-3.5 py-1.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span>Informe PDF</span>
            </Link>
          </div>
        </div>

        {/* Banner de Estado del Semáforo */}
        <div
          className="rounded-2xl p-4 sm:p-5 shadow-sm border flex flex-col sm:flex-row sm:items-start justify-between gap-4"
          style={{
            backgroundColor: dataColonia.estado.bg,
            borderColor: dataColonia.estado.border,
          }}
        >
          <div className="flex items-start gap-3.5">
            <div
              className="w-11 sm:w-12 h-11 sm:h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: dataColonia.estado.color }}
            >
              <span className="material-symbols-outlined text-[26px] sm:text-[28px] fill-1">{dataColonia.estado.icon}</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: dataColonia.estado.color }}
                >
                  {dataColonia.estado.nombre}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">· Nivel de reportes vecinales</span>
              </div>

              <h2 className="text-base sm:text-xl font-bold pt-0.5" style={{ color: dataColonia.estado.text }}>
                En los últimos 30 días, {dataColonia.nombre} tiene {dataColonia.estado.nombre.toLowerCase()}.
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: dataColonia.estado.text }}>
                {dataColonia.estado.descripcion}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center self-start bg-white/70 px-2.5 py-1 rounded text-xs font-semibold text-on-surface-variant">
            Actualizado hoy
          </div>
        </div>

        {/* Cuadrícula de Métricas Clave y Datasets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
            <span className="text-xs text-on-surface-variant font-medium block">Reportes de Calidad</span>
            <span className="text-2xl sm:text-3xl font-black text-primary mt-1 block">{dataColonia.reportesCalidad}</span>
            <span className="text-[11px] text-on-surface-variant mt-0.5 block">en últimos 30 días</span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
            <span className="text-xs text-on-surface-variant font-medium block">Tasa normalizada</span>
            <span className="text-2xl sm:text-3xl font-black text-on-surface mt-1 block">
              {dataColonia.estado.tasa !== null ? dataColonia.estado.tasa : 'Sin dato'}
            </span>
            <span className="text-[11px] text-on-surface-variant mt-0.5 block">por 1,000 viviendas</span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium block">Viviendas (INEGI)</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Provisional</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-on-surface mt-1 block">
              {dataColonia.viviendas ? dataColonia.viviendas.toLocaleString() : 'Sin dato'}
            </span>
            <span className="text-[11px] text-on-surface-variant mt-0.5 block">Dataset 01 (Censo 2020)</span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium block">Zona de Riesgo</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Provisional</span>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-on-surface mt-1 block uppercase">
              {dataColonia.riesgo || 'Sin dato'}
            </span>
            <span className="text-[11px] text-on-surface-variant mt-0.5 block">Dataset 05 (Atlas Riesgos)</span>
          </div>
        </div>

        {/* Sección de Gráficas con Recharts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfica 1: Distribución por tipo de problema */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-on-surface">Distribución por tipo de afectación</h3>
              <p className="text-xs text-on-surface-variant">Conteo de reportes según la categoría señalada por vecinos</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosBarras} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="tipo" tick={{ fontSize: 12, fill: '#414751' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#414751' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <Bar dataKey="reportes" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-on-surface-variant pt-2 border-t border-surface-container-high flex items-center justify-between">
              <span>* Falta de agua se contabiliza aparte del semáforo.</span>
              <span className="font-semibold text-primary">Total: {dataColonia.totalReportes} reportes</span>
            </div>
          </div>

          {/* Gráfica 2: Tendencia Semanal Histórica */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-on-surface">Evolución de reportes (8 semanas)</h3>
              <p className="text-xs text-on-surface-variant">Tendencia semanal acumulada en la zona metropolitana</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SERIE_SEMANAL} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEEF0" />
                  <XAxis dataKey="semana" tick={{ fontSize: 12, fill: '#414751' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#414751' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <Line type="monotone" dataKey="reportes" stroke="#00477F" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-on-surface-variant pt-2 border-t border-surface-container-high flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-error">trending_up</span>
              <span>Serie de referencia histórica de 8 semanas.</span>
            </div>
          </div>
        </div>

        {/* Sección de Salud Comunitaria */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">health_and_safety</span>
            <h3 className="font-bold text-base sm:text-lg text-on-surface">Contexto Sanitario Vecinal</h3>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block">
                Malestar estomacal reportado en el hogar
              </span>
              <p className="text-base sm:text-lg font-bold text-on-surface mt-0.5">
                {statsSalud.disponible ? statsSalud.mensaje : 'Datos insuficientes (< 10 respuestas en esta colonia)'}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-on-surface-variant block">Respuestas recibidas</span>
              <span className="text-xl font-black text-on-surface">{statsSalud.totalRespuestas} respuestas</span>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant italic leading-relaxed">
            * {statsSalud.avisoFijo}.
          </p>
        </div>

        {/* Acción Cívica: "Ya lo envié" */}
        <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <span className="material-symbols-outlined text-[22px]">send_and_archive</span>
              <span>Seguimiento Vecinal ante Autoridades</span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              ¿Descargaste este reporte y lo presentaste formalmente ante el SIAPA, la CEDHJ o el Ayuntamiento?
            </p>
            {estadoEnvio && (
              <span className="inline-block mt-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                Registrado localmente: enviado hace {estadoEnvio.diasTranscurridos} día(s).
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleMarcarEnviado}
            className="min-h-[48px] px-5 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-primary font-bold text-xs sm:text-sm border border-primary/30 shadow-sm shrink-0 transition-all active:scale-[0.99]"
          >
            {estadoEnvio ? 'Actualizar fecha de envío' : 'Marcar como enviado'}
          </button>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { descargarCSV } from '../utils/exportarCSV';
import { construirFilaResumen } from '../utils/resumenColonia';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { SERIE_SEMANAL } from '../utils/reportesStore';

export default function Autoridades() {
  const { resumenTodasColonias } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('reportes'); // 'reportes' | 'nombre' | 'tasa'

  // Total de reportes de calidad
  const totalReportesCalidad = (resumenTodasColonias || []).reduce((acc, c) => acc + c.reportesCalidad, 0);

  // Filtrar y ordenar colonias
  const coloniasOrdenadas = [...(resumenTodasColonias || [])]
    .filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (ordenarPor === 'reportes') return b.reportesCalidad - a.reportesCalidad;
      if (ordenarPor === 'nombre') return a.nombre.localeCompare(b.nombre);
      if (ordenarPor === 'tasa') {
        const tasaA = a.estado.tasa || 0;
        const tasaB = b.estado.tasa || 0;
        return tasaB - tasaA;
      }
      return 0;
    });

  const handleExportarTodoCSV = () => {
    // Mismo formato agregado que el informe de cada colonia (sin datos individuales)
    const filas = (resumenTodasColonias || []).map(c => construirFilaResumen(c));
    descargarCSV(filas, 'aguaclara_panel_autoridades_guadalajara.csv');
  };

  return (
    <div className="w-full pt-28 sm:pt-32 bg-background flex-1 text-left">
      {/* 2. Banner de Solo Lectura: En flujo normal, despejado del menú superior */}
      <section className="w-full bg-surface-container-high border-b border-surface-container-highest no-print">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-margin-desktop py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm text-on-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary fill-1 shrink-0">visibility</span>
            <span className="font-semibold">
              Vista de solo lectura institucional. Datos agregados; sin domicilios particulares ni fotos.
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant text-xs shrink-0">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>Periodo: Últimos 30 días</span>
          </div>
        </div>
      </section>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-margin-desktop py-4 sm:py-space-xl flex flex-col gap-6">

        {/* Encabezado Principal */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1 max-w-3xl">
            <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider">
              <span>Metrópoli de Guadalajara</span>
              <span>•</span>
              <span className="text-on-surface-variant font-medium">8 Colonias piloto monitoreadas</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-primary tracking-tight">
              Panel de consulta de evidencia
            </h1>
            <p className="text-xs sm:text-base text-on-surface-variant leading-relaxed">
              Evidencia ciudadana organizada para consulta colectiva y seguimiento público. Muestra reportes acumulados durante los <strong className="font-semibold text-on-surface">últimos 30 días</strong> sin incluir domicilios particulares ni datos personales.
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleExportarTodoCSV}
              className="min-h-[46px] px-5 py-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm shadow-sm hover:bg-primary-container active:scale-[0.99] transition-all"
              title="Descargar datos agregados en formato CSV"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              <span>Exportar CSV</span>
            </button>
          </div>
        </header>

        {/* Resumen para quien decide */}
        <div className="w-full p-4 sm:p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-highest flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold text-sm sm:text-base">
              <span className="material-symbols-outlined text-[22px]">insights</span>
              <span>Resumen para quien toma decisiones</span>
            </div>
            <span className="px-3 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
              Síntesis clave
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs sm:text-sm">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">warning</span>
              <p className="text-on-surface">
                <strong>2 de 8 colonias</strong> tienen Muchos reportes: Oblatos y Santa Cecilia.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">water_drop</span>
              <p className="text-on-surface">
                El problema más frecuente señalado por los vecinos es el <strong>agua turbia</strong>.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">trending_up</span>
              <p className="text-on-surface">
                Oblatos y Santa Cecilia <strong>concentran la mayor tasa</strong> por 1,000 viviendas.
              </p>
            </div>
          </div>
        </div>

        {/* Tarjetas de Métricas y Gráfica Semanal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Métricas Izquierda */}
          <div className="lg:col-span-4 flex flex-col justify-between p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider block">
                Consolidado general
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-primary tracking-tight">
                  {totalReportesCalidad}
                </span>
                <span className="text-xs sm:text-sm text-on-surface-variant font-medium">
                  reportes de calidad del agua en 30 días
                </span>
              </div>
              <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                Registrados por vecinos en las 8 colonias prioritarias de Guadalajara durante el periodo activo.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-1">
              <div className="flex items-center justify-between text-on-surface">
                <span className="text-xs sm:text-sm font-bold">Promedio de las 8 colonias</span>
                <span className="text-lg font-black text-primary">1.8</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">Por cada 1,000 viviendas (Censo INEGI)</span>
            </div>
          </div>

          {/* Gráfica Derecha */}
          <div className="lg:col-span-8 p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-on-surface">Evolución semanal de quejas ciudadanas</h3>
                <span className="text-xs text-on-surface-variant">Tendencia histórica en las últimas 8 semanas</span>
              </div>
              <span className="text-xs font-bold text-error bg-red-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>Al alza</span>
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SERIE_SEMANAL} margin={{ top: 10, right: 12, left: 4, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECEEF0" />
                  <XAxis dataKey="semana" tick={{ fontSize: 12, fill: '#414751' }} label={{ value: 'Semana (de la más antigua a la más reciente)', position: 'insideBottom', offset: -14, fontSize: 12, fill: '#414751' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#414751' }} label={{ value: 'Reportes por semana', angle: -90, position: 'insideLeft', offset: 6, style: { textAnchor: 'middle' }, fontSize: 12, fill: '#414751' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <Line type="monotone" dataKey="reportes" name="Reportes" stroke="#00477F" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabla de Evidencia Territorial (Desktop) y Tarjetas (Mobile) */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col">
          {/* Controles de filtro y orden */}
          <div className="p-4 sm:p-5 border-b border-surface-container-high flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">search</span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Filtrar por colonia..."
                className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-bold">Ordenar por:</span>
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value)}
                className="min-h-[38px] px-3 bg-surface-container-low rounded-xl text-xs font-semibold text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="reportes">Mayor volumen de reportes</option>
                <option value="tasa">Mayor tasa por 1k viviendas</option>
                <option value="nombre">Nombre alfabético</option>
              </select>
            </div>
          </div>

          {/* Versión Tabla (Desktop >= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-xs text-on-surface-variant uppercase font-bold tracking-wider border-b border-surface-container-high">
                <tr>
                  <th className="py-3 px-4">Colonia</th>
                  <th className="py-3 px-4">Estado del semáforo</th>
                  <th className="py-3 px-4 text-center">Reportes calidad (30d)</th>
                  <th className="py-3 px-4 text-center">Por 1,000 viv.</th>
                  <th className="py-3 px-4 text-center">Riesgo (Atlas)</th>
                  <th className="py-3 px-4 text-center">Falta de agua</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {coloniasOrdenadas.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-on-surface">
                      <Link to={`/colonia/${c.id}`} className="hover:text-primary transition-colors">
                        {c.nombre}
                      </Link>
                      <span className="block text-[11px] text-on-surface-variant font-normal">
                        {c.viviendas ? `${c.viviendas.toLocaleString()} viviendas` : 'Sin dato de viv.'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                        style={{
                          backgroundColor: c.estado.bg,
                          color: c.estado.text,
                          borderColor: c.estado.border,
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px]">{c.estado.icon}</span>
                        <span>{c.estado.nombre}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-base text-primary">
                      {c.reportesCalidad}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-on-surface">
                      {c.estado.tasa !== null ? c.estado.tasa : 'Sin dato'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs uppercase font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                        {c.riesgo || 'Sin dato'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
                        c.faltaAguaCount > 0 ? 'bg-sky-100 text-sky-800' : 'text-slate-400'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">water_damage</span>
                        <span>{c.faltaAguaCount > 0 ? `${c.faltaAguaCount} avisos` : 'Sin avisos'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/colonia/${c.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container px-2.5 py-1 rounded-lg hover:bg-surface-container transition-colors"
                      >
                        <span>Detalle</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versión Tarjetas (Mobile < 768px y 360px) */}
          <div className="md:hidden divide-y divide-surface-container-high">
            {coloniasOrdenadas.map((c) => (
              <div key={c.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-base text-on-surface">{c.nombre}</h4>
                    <span className="text-xs text-on-surface-variant">
                      {c.viviendas ? `${c.viviendas.toLocaleString()} viviendas` : 'Sin dato de viv.'}
                    </span>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0"
                    style={{
                      backgroundColor: c.estado.bg,
                      color: c.estado.text,
                      borderColor: c.estado.border,
                    }}
                  >
                    <span className="material-symbols-outlined text-[14px]">{c.estado.icon}</span>
                    <span>{c.estado.nombre}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low p-2.5 rounded-xl">
                  <div>
                    <span className="text-on-surface-variant block">Reportes calidad:</span>
                    <span className="text-base font-black text-primary">{c.reportesCalidad}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">Por 1k viv:</span>
                    <span className="text-base font-bold text-on-surface">
                      {c.estado.tasa !== null ? c.estado.tasa : 'Sin dato'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={`text-xs font-bold inline-flex items-center gap-1 ${
                    c.faltaAguaCount > 0 ? 'text-sky-700' : 'text-slate-400'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">water_damage</span>
                    <span>{c.faltaAguaCount > 0 ? `${c.faltaAguaCount} falta de agua` : 'Sin falta de agua'}</span>
                  </span>
                  <Link
                    to={`/colonia/${c.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
                  >
                    <span>Ver ficha</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { descargarCSV } from '../utils/exportarCSV';
import { calcularEstadisticasSalud } from '../utils/reportesStore';
import { construirFilaResumen, calcularTendencia, problemaMasFrecuente } from '../utils/resumenColonia';

export default function Informe() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { coloniasPiloto, getColoniaResumen } = useApp();

  const coloniaUrl = searchParams.get('colonia') || 'oblatos';
  const [coloniaId, setColoniaId] = useState(coloniaUrl);

  useEffect(() => {
    const c = searchParams.get('colonia');
    if (c) setColoniaId(c);
  }, [searchParams]);

  const cambiarColonia = (id) => {
    setColoniaId(id);
    setSearchParams({ colonia: id });
  };

  const data = getColoniaResumen(coloniaId);
  const salud = calcularEstadisticasSalud(data.reportes);

  const tendencia = calcularTendencia(data.reportes);
  const simuladosCount = data.reportes.filter(r => r.simulado).length;

  // CSV agregado por colonia (una fila, sin datos individuales de reportes)
  const handleDescargarCSV = () => {
    descargarCSV([construirFilaResumen(data)], `informe_${coloniaId}_aguaclara.csv`);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="w-full pt-28 sm:pt-32 bg-background flex-1 text-left">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-margin-desktop py-6 sm:py-space-xl flex flex-col gap-6">

        {/* Encabezado y Barra de Acciones */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 no-print">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-secondary text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Herramienta de documentación cívica</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
              Informe de tu colonia
            </h1>
            <p className="text-sm sm:text-base text-on-surface-variant">
              Ficha cívica descargable para sustentar solicitudes y peticiones vecinales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleImprimir}
              className="min-h-[48px] px-4 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:bg-primary-container transition-all active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              <span>Guardar / Imprimir PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDescargarCSV}
              className="min-h-[48px] px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs sm:text-sm flex items-center gap-2 border border-outline-variant/30 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">table_view</span>
              <span>Descargar CSV</span>
            </button>
          </div>
        </div>

        {/* Selector de Colonia */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">location_on</span>
            <span className="font-bold text-sm text-on-surface">Colonia a consultar:</span>
            <select
              value={coloniaId}
              onChange={(e) => cambiarColonia(e.target.value)}
              className="min-h-[44px] px-3 bg-surface-container-low rounded-xl text-sm font-semibold text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {coloniasPiloto.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nombre} (Guadalajara)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {coloniasPiloto.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => cambiarColonia(c.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  c.id === coloniaId
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* HOJA IMPRIMIBLE DE LA FICHA CÍVICA */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200 flex flex-col gap-6 text-slate-900 page-break">
          
          {/* Membrete Oficial */}
          <div className="flex items-start justify-between border-b pb-4 border-slate-200">
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10 shrink-0" fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4C20 4 8 18.5 8 26.5C8 33.1274 13.3726 38.5 20 38.5C26.6274 38.5 32 33.1274 32 26.5C32 18.5 20 4 20 4Z" fill="#0B5FA5"></path>
                <path d="M15 25C15 22.2386 17.2386 20 20 20" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2.5"></path>
              </svg>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  AguaClara Jalisco
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Plataforma de Monitoreo Cívico y Transparencia del Agua en Guadalajara
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Fecha de corte</span>
              <span className="text-sm font-bold text-slate-700">
                {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Título de la Colonia y Estado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Reporte territorial</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{data.nombre}</h3>
              <p className="text-xs text-slate-600">Municipio de {data.municipio}, Jalisco · Ventana de análisis de 30 días</p>
            </div>

            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold self-start border"
              style={{
                backgroundColor: data.estado.bg,
                color: data.estado.text,
                borderColor: data.estado.border,
              }}
            >
              <span className="material-symbols-outlined text-[20px]">{data.estado.icon}</span>
              <span>{data.estado.nombre}</span>
            </span>
          </div>

          {/* Tabla de Indicadores */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 text-xs uppercase tracking-wider">
                  <th className="py-2.5 px-3">Indicador</th>
                  <th className="py-2.5 px-3">Valor</th>
                  <th className="py-2.5 px-3">Fuente / Dataset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Reportes de calidad acumulados (30 días)</td>
                  <td className="py-2.5 px-3 font-bold text-blue-700">{data.reportesCalidad} reportes</td>
                  <td className="py-2.5 px-3 text-xs text-slate-500">Reportes ciudadanos vecinales</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Tasa normalizada por 1,000 viviendas</td>
                  <td className="py-2.5 px-3 font-bold">
                    {data.estado.tasa !== null ? `${data.estado.tasa} por 1k viv.` : 'Sin dato suficiente'}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-500">Fórmula de ponderación comunitaria</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Tendencia (últimos 15 días vs. 15 anteriores)</td>
                  <td className="py-2.5 px-3 font-bold capitalize">{tendencia}</td>
                  <td className="py-2.5 px-3 text-xs text-slate-500">Calculada con los reportes de calidad</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Problema más frecuente</td>
                  <td className="py-2.5 px-3 font-bold">{problemaMasFrecuente(data.reportes)}</td>
                  <td className="py-2.5 px-3 text-xs text-slate-500">Reportes ciudadanos vecinales</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Total de viviendas registradas</td>
                  <td className="py-2.5 px-3 font-bold">
                    {data.viviendas ? data.viviendas.toLocaleString() : 'Sin dato'}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-500">INEGI Censo 2020 por AGEB (Dataset 01 - Provisional)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Nivel de riesgo de inundación/hundimiento</td>
                  <td className="py-2.5 px-3 font-bold uppercase">{data.riesgo || 'Sin dato'}</td>
                  <td className="py-2.5 px-3 text-xs text-slate-500">Atlas de Riesgos Jalisco (Dataset 05 - Provisional)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold">Autorreporte de malestar estomacal</td>
                  <td className="py-2.5 px-3 font-bold">
                    {salud.disponible ? `${salud.porcentaje}% (${salud.conSintomas} de ${salud.totalRespuestas})` : 'Datos insuficientes (< 10 respuestas)'}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-500">Casilla opcional en reporte ciudadano</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Desglose por tipo de problema de calidad */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs uppercase font-bold text-slate-600 tracking-wider block mb-2">
              Problemas de calidad del agua (últimos 30 días) · cuentan para el semáforo
            </span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">Agua turbia</span>
                <span className="text-lg font-black text-slate-900">
                  {data.reportes.filter(r => r.tipo === 'turbia').length}
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">Mal olor</span>
                <span className="text-lg font-black text-slate-900">
                  {data.reportes.filter(r => r.tipo === 'olor').length}
                </span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">Color extraño</span>
                <span className="text-lg font-black text-slate-900">
                  {data.reportes.filter(r => r.tipo === 'color').length}
                </span>
              </div>
            </div>
          </div>

          {/* Falta de agua: se informa aparte, no entra al semáforo de calidad */}
          <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-sky-900 tracking-wider block">
                Falta de agua (últimos 30 días)
              </span>
              <span className="text-xs text-sky-900/80">
                Corte total o presión insuficiente. Se informa aparte y no forma parte del semáforo de calidad.
              </span>
            </div>
            <span className="text-2xl font-black text-sky-900 shrink-0">{data.faltaAguaCount}</span>
          </div>

          {/* Metodología y Límites Éticos */}
          <div className="border-t border-slate-200 pt-4 flex flex-col gap-2 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong>Metodología y Límites:</strong> Este documento contiene información agregada a nivel colonia. 
              <strong> No incluye nombres, domicilios particulares ni fotografías de personas.</strong>
            </p>
            <p>
              El semáforo indica el <strong>volumen de reportes ciudadanos</strong> registrados en la plataforma y no determina 
              si el agua es potable, segura o contaminada químicamente. Los datos de viviendas y riesgo son provisionales basados en fuentes abiertas.
            </p>
            {simuladosCount > 0 && (
              <p className="font-semibold text-amber-700">
                Este informe incluye datos de demostración: {simuladosCount} de {data.reportes.length} reportes son simulados.
              </p>
            )}
            <p className="text-slate-500">
              * Para reportes y solicitudes de servicio en domicilio particular, acuda al SIAPA Bot por WhatsApp: (33) 5164 4440 o marcación 073.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

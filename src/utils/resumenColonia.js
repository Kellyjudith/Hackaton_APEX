import { CONFIG } from '../config';
import { calcularEstadisticasSalud, getEstadoEvidenciaEnviada } from './reportesStore';

// Viviendas (INEGI, Censo 2020, por manzana) y riesgo (Atlas Nacional de Riesgos, CENAPRED) ya son datos reales.
// El riesgo es un indicador MUNICIPAL: vale igual para todo Guadalajara y no distingue entre colonias.
export const DATOS_VIVIENDAS_RIESGO_PROVISIONALES = false;

const NOMBRE_PROBLEMA = {
  turbia: 'Agua turbia',
  olor: 'Mal olor',
  color: 'Color extraño',
};

function fechaISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

/**
 * Tendencia de reportes de calidad: últimos 15 días contra los 15 anteriores.
 * Devuelve 'sube' | 'baja' | 'estable' | 'sin datos suficientes'.
 */
export function calcularTendencia(reportes) {
  const calidad = (reportes || []).filter((r) => CONFIG.TIPOS_CALIDAD.includes(r.tipo) && r.fecha);
  if (calidad.length < CONFIG.MIN_REPORTES) return 'sin datos suficientes';

  const mitad = new Date();
  mitad.setDate(mitad.getDate() - Math.floor(CONFIG.VENTANA_DIAS / 2));
  const corte = fechaISO(mitad);

  const recientes = calidad.filter((r) => r.fecha >= corte).length;
  const previos = calidad.length - recientes;
  const diferencia = recientes - previos;

  if (diferencia >= 3 && recientes >= previos * 1.5) return 'sube';
  if (-diferencia >= 3 && previos >= recientes * 1.5) return 'baja';
  return 'estable';
}

export function problemaMasFrecuente(reportes) {
  let mejor = null;
  let max = 0;
  CONFIG.TIPOS_CALIDAD.forEach((t) => {
    const n = (reportes || []).filter((r) => r.tipo === t).length;
    if (n > max) {
      max = n;
      mejor = t;
    }
  });
  return mejor ? NOMBRE_PROBLEMA[mejor] : 'Sin datos';
}

/**
 * Fila de resumen por colonia (agregada, sin datos individuales) para el CSV del informe y del panel.
 * La falta de agua va en su propia columna, aparte del semáforo de calidad.
 * El malestar estomacal solo se publica con MIN_RESPUESTAS_SALUD o más respuestas.
 */
export function construirFilaResumen(c, extra = {}) {
  const rep = c.reportes || [];
  const cuenta = (tipo) => rep.filter((r) => r.tipo === tipo).length;
  const salud = calcularEstadisticasSalud(rep);
  const envio = getEstadoEvidenciaEnviada(c.id);
  const simulados = rep.filter((r) => r.simulado).length;

  let simulado = 'No';
  if (rep.length > 0 && simulados === rep.length) simulado = 'Si';
  else if (simulados > 0) simulado = `Parcial (${simulados} de ${rep.length} reportes simulados)`;

  return {
    colonia: c.nombre,
    municipio: c.municipio,
    viviendas: c.viviendas || 'Sin dato',
    viviendas_sin_agua_entubada: c.sinAguaEntubada ?? 'Sin dato',
    reportes_calidad_30d: c.reportesCalidad,
    reportes_por_1000: c.estado.tasa !== null && c.estado.tasa !== undefined ? c.estado.tasa : 'Sin dato suficiente',
    estado: c.estado.nombre,
    tendencia: calcularTendencia(rep),
    problema_mas_frecuente: problemaMasFrecuente(rep),
    turbia: cuenta('turbia'),
    olor: cuenta('olor'),
    color: cuenta('color'),
    falta_agua_30d: cuenta('falta_agua'),
    ...extra,
    zona_riesgo: c.riesgo || 'sin_dato',
    malestar_si: salud.disponible ? salud.conSintomas : 'Datos insuficientes',
    malestar_total: salud.disponible ? salud.totalRespuestas : 'Datos insuficientes',
    ultimo_envio: envio ? String(envio.fechaEnvio).slice(0, 10) : 'Sin registro',
    fecha_corte: fechaISO(new Date()),
    simulado,
    nota: DATOS_VIVIENDAS_RIESGO_PROVISIONALES
      ? 'Viviendas (Dataset 01) y zona de riesgo (Dataset 05) provisionales. El semaforo mide reportes ciudadanos, no la calidad del agua. Malestar: autorreporte, no es diagnostico ni prueba de causa.'
      : 'Viviendas: INEGI Censo 2020 (Dataset 01). Zona de riesgo: indicador municipal de peligro por inundacion del Atlas Nacional de Riesgos (Dataset 05), igual para todo el municipio. El semaforo mide reportes ciudadanos, no la calidad del agua. Malestar: autorreporte, no es diagnostico ni prueba de causa.',
  };
}

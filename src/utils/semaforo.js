import { CONFIG } from '../config';

/**
 * Calcula el estado del semáforo para una colonia basado en sus reportes y viviendas.
 * @param {Array|number} reportesOConteo - Arreglo de reportes de calidad o número n de reportes
 * @param {number|null} viviendas - Total de viviendas según Dataset 01 (INEGI)
 * @param {string} nivelRiesgo - Nivel según Dataset 05 ('alto', 'medio', 'bajo', 'sin_dato')
 * @returns {Object} Metadata de visualización del estado
 */
export function calcularEstadoSemaforo(reportesOConteo, viviendas, nivelRiesgo = 'bajo') {
  const n = typeof reportesOConteo === 'number' 
    ? reportesOConteo 
    : (reportesOConteo || []).filter(r => CONFIG.TIPOS_CALIDAD.includes(r.tipo)).length;

  // Si no hay viviendas o no se alcanza el mínimo de 3 reportes
  if (!viviendas || n < CONFIG.MIN_REPORTES) {
    return {
      id: 'sin_datos',
      nombre: 'Sin datos suficientes',
      color: '#64748B',
      bg: '#F1F5F9',
      text: '#334155',
      border: '#CBD5E1',
      icon: 'help',
      n,
      tasa: null,
      tasaAjustada: null,
      descripcion: 'No hay suficientes reportes registrados en los últimos 30 días.'
    };
  }

  const factor = CONFIG.FACTOR_RIESGO[nivelRiesgo] || 1.0;
  const tasa = (n / viviendas) * 1000;
  const tasaAjustada = tasa * factor;

  if (tasaAjustada >= CONFIG.UMBRAL_ROJO) {
    return {
      id: 'muchos',
      nombre: 'Muchos reportes',
      color: '#DC2626',
      bg: '#FEE2E2',
      text: '#7F1D1D',
      border: '#FCA5A5',
      icon: 'report',
      n,
      tasa: Number(tasa.toFixed(2)),
      tasaAjustada: Number(tasaAjustada.toFixed(2)),
      descripcion: 'En los últimos 30 días, esta colonia presenta un volumen crítico de reportes.'
    };
  }

  if (tasaAjustada >= CONFIG.UMBRAL_AMARILLO) {
    return {
      id: 'moderados',
      nombre: 'Reportes moderados',
      color: '#D97706',
      bg: '#FEF3C7',
      text: '#78350F',
      border: '#FCD34D',
      icon: 'warning_amber',
      n,
      tasa: Number(tasa.toFixed(2)),
      tasaAjustada: Number(tasaAjustada.toFixed(2)),
      descripcion: 'Se registra un volumen moderado de quejas en los últimos 30 días.'
    };
  }

  return {
    id: 'pocos',
    nombre: 'Pocos reportes',
    color: '#16A34A',
    bg: '#DCFCE7',
    text: '#14532D',
    border: '#86EFAC',
    icon: 'check_circle',
    n,
    tasa: Number(tasa.toFixed(2)),
    tasaAjustada: Number(tasaAjustada.toFixed(2)),
    descripcion: 'Pocos reportes registrados durante los últimos 30 días.'
  };
}

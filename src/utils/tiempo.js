// Utilidades de tiempo para "últimos reportes" y contador de 24 h.
// Los reportes reales (Firestore o enviados en el dispositivo) traen `timestamp` en ms.
// Los de demostración solo traen `fecha` (YYYY-MM-DD), así que se muestran por día.

export const ETIQUETA_TIPO = {
  turbia: 'Agua turbia',
  olor: 'Mal olor en el agua',
  color: 'Agua con color',
  falta_agua: 'Falta de agua',
};

function aISOLocal(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function inicioDeDia(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

function claveOrden(r) {
  if (typeof r.timestamp === 'number') return r.timestamp;
  return inicioDeDia(r.fecha) + 12 * 3600 * 1000; // mediodía para reportes solo con día
}

/** Texto relativo: "hace 5 min", "hace 3 h", "ayer", "hace 4 días". */
export function tiempoRelativo(r, ahora = Date.now()) {
  if (typeof r.timestamp === 'number') {
    const min = Math.max(0, Math.floor((ahora - r.timestamp) / 60000));
    if (min < 1) return 'hace un momento';
    if (min < 60) return `hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `hace ${h} h`;
    const dias = Math.floor(h / 24);
    return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
  }
  const dias = Math.max(0, Math.round((inicioDeDia(aISOLocal(ahora)) - inicioDeDia(r.fecha)) / 86400000));
  if (dias === 0) return 'hoy';
  if (dias === 1) return 'ayer';
  return `hace ${dias} días`;
}

/** Los N reportes más recientes (solo tipo y tiempo; nunca datos de salud). */
export function ultimosReportes(reportes, n = 3) {
  return [...(reportes || [])]
    .sort((a, b) => claveOrden(b) - claveOrden(a))
    .slice(0, n);
}

/** Reportes de las últimas 24 h (los que solo tienen día cuentan si son de hoy). */
export function contarUltimas24h(reportes, ahora = Date.now()) {
  const hoy = inicioDeDia(aISOLocal(ahora));
  return (reportes || []).filter((r) => {
    if (typeof r.timestamp === 'number') return ahora - r.timestamp <= 24 * 3600 * 1000;
    return inicioDeDia(r.fecha) >= hoy;
  }).length;
}

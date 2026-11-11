// Utilidades de las actualizaciones públicas de la autoridad (bitácora de atención).

export const ESTADOS_ACTUALIZACION = {
  en_revision: {
    id: 'en_revision',
    nombre: 'En revisión',
    icono: 'search',
    clases: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  en_atencion: {
    id: 'en_atencion',
    nombre: 'En atención',
    icono: 'engineering',
    clases: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  atendido: {
    id: 'atendido',
    nombre: 'Atendido',
    icono: 'check_circle',
    clases: 'bg-green-100 text-green-900 border-green-300',
  },
};

export const ACCIONES = {
  reparacion_fuga: 'Reparación de fuga',
  limpieza_red: 'Limpieza de red o tanque',
  restablecimiento: 'Restablecimiento de suministro',
  muestreo: 'Muestreo de calidad del agua',
  inspeccion: 'Inspección de red o rebombeo',
  otra: 'Otra acción',
};

export const TIPOS_PROBLEMA = {
  turbia: 'Agua turbia',
  olor: 'Mal olor',
  color: 'Coloración',
  falta_agua: 'Falta de agua',
};

export const MAX_NOTA = 280;
export const MIN_NOTA = 10;

const DIA_MS = 24 * 3600 * 1000;

/** Folio visible (no es un dato oficial: solo identifica el registro en la bitácora). */
export function folio(act) {
  return `ACT-${String(act.id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`;
}

/** Marca de tiempo (ms) de un reporte; los reportes solo con día se toman a mediodía. */
function tsReporte(r) {
  if (typeof r.timestamp === 'number') return r.timestamp;
  const [y, m, d] = String(r.fecha).split('-').map(Number);
  return new Date(y, m - 1, d, 12).getTime();
}

/** Texto relativo en español para una fecha en ms. */
export function hace(ms, ahora = Date.now()) {
  const min = Math.max(0, Math.floor((ahora - ms) / 60000));
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'hace 1 día' : `hace ${d} días`;
}

export function fechaCorta(ms) {
  return new Date(ms).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export function fechaHora(ms) {
  return new Date(ms).toLocaleString('es-MX', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Quita las actualizaciones que fueron corregidas por otra posterior
 * (la corrección apunta a la original con `corrigeA`). Orden: más reciente primero.
 */
export function actualizacionesVigentes(lista) {
  const corregidas = new Set((lista || []).map((a) => a.corrigeA).filter(Boolean));
  return [...(lista || [])]
    .filter((a) => !corregidas.has(a.id))
    .sort((a, b) => b.timestamp - a.timestamp);
}

/** Ids de actualizaciones que ya fueron corregidas. */
export function idsCorregidos(lista) {
  return new Set((lista || []).map((a) => a.corrigeA).filter(Boolean));
}

/** Última actualización vigente de una colonia (o null). */
export function ultimaDeColonia(lista, coloniaId) {
  return actualizacionesVigentes((lista || []).filter((a) => a.colonia === coloniaId))[0] || null;
}

/**
 * Compara reportes del mismo tipo de problema en la colonia:
 *  - 15 días ANTES de la actualización
 *  - desde la actualización hasta hoy
 * Devuelve conteos y una lectura prudente (sin afirmar causalidad).
 */
export function compararAntesDespues(reportesColonia, act, ahora = Date.now()) {
  const t = act.timestamp;
  const mismos = (reportesColonia || []).filter((r) => r.tipo === act.tipoProblema);

  const previos = mismos.filter((r) => {
    const ts = tsReporte(r);
    return ts >= t - 15 * DIA_MS && ts < t;
  }).length;
  const desde = mismos.filter((r) => tsReporte(r) >= t).length;

  const diasTranscurridos = Math.max(0, (ahora - t) / DIA_MS);
  const tasaAntes = previos / 15;
  const tasaDespues = desde / Math.max(diasTranscurridos, 1);

  let lectura;
  if (diasTranscurridos < 2) {
    lectura = 'Aún es pronto para comparar: han pasado menos de 2 días.';
  } else if (previos === 0 && desde === 0) {
    lectura = 'No hubo reportes de este problema antes ni después.';
  } else if (tasaDespues < tasaAntes * 0.8) {
    lectura = 'Desde la actualización llegan menos reportes por día que antes.';
  } else if (tasaDespues > tasaAntes * 1.2) {
    lectura = 'Desde la actualización llegan más reportes por día que antes.';
  } else {
    lectura = 'El ritmo de reportes se mantiene parecido al de antes.';
  }

  return {
    previos,
    desde,
    diasTranscurridos: Math.floor(diasTranscurridos),
    lectura,
  };
}

function aISOLocal(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Etiqueta corta de día (D/M) para ejes de gráficas. */
export function etiquetaDia(ms) {
  const d = new Date(ms);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/** Reportes por día de los últimos `dias` días (incluye hoy). */
export function serieDiaria(reportes, dias = 30, ahora = Date.now()) {
  const serie = [];
  const indice = {};
  for (let i = dias - 1; i >= 0; i--) {
    const ms = ahora - i * DIA_MS;
    const iso = aISOLocal(ms);
    indice[iso] = serie.length;
    serie.push({ fecha: iso, dia: etiquetaDia(ms), reportes: 0 });
  }
  (reportes || []).forEach((r) => {
    const iso = typeof r.timestamp === 'number' ? aISOLocal(r.timestamp) : r.fecha;
    if (indice[iso] !== undefined) serie[indice[iso]].reportes += 1;
  });
  return serie;
}

/**
 * Columnas del CSV con la última actualización vigente de la colonia
 * y la comparación de reportes del mismo problema (15 días antes / desde la actualización).
 */
export function camposActualizacionCSV(actsColonia, reportesColonia, ahora = Date.now()) {
  const ultima = actualizacionesVigentes(actsColonia)[0];
  if (!ultima) {
    return {
      actualizacion_estado: 'Sin actualizaciones',
      actualizacion_problema: '',
      actualizacion_accion: '',
      actualizacion_fecha: '',
      reportes_15d_previos_actualizacion: '',
      reportes_desde_actualizacion: '',
      dias_desde_actualizacion: '',
    };
  }
  const cmp = compararAntesDespues(reportesColonia, ultima, ahora);
  return {
    actualizacion_estado: ESTADOS_ACTUALIZACION[ultima.estado]?.nombre || ultima.estado,
    actualizacion_problema: TIPOS_PROBLEMA[ultima.tipoProblema] || ultima.tipoProblema,
    actualizacion_accion: ACCIONES[ultima.accion] || ultima.accion,
    actualizacion_fecha: aISOLocal(ultima.timestamp),
    reportes_15d_previos_actualizacion: cmp.previos,
    reportes_desde_actualizacion: cmp.desde,
    dias_desde_actualizacion: cmp.diasTranscurridos,
  };
}

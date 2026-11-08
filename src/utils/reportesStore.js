import { CONFIG, COLONIAS_PILOTO } from '../config';

const LOCAL_STORAGE_KEY = 'aguaclara_reportes_locales';
const ENVIOS_STORAGE_KEY = 'aguaclara_envios_locales';
const ULTIMO_REPORTE_KEY = 'aguaclara_ultimo_reporte';

/**
 * Obtiene los reportes combinados (demo + locales).
 */
export async function getTodosLosReportes() {
  let demo = [];
  try {
    const res = await fetch('/data/reportes_demo.json');
    if (res.ok) {
      demo = await res.json();
    }
  } catch (err) {
    console.error('Error cargando reportes_demo.json:', err);
  }

  // Convertir diasAtras en fecha YYYY-MM-DD
  const hoy = new Date();
  const reportesDemoProcesados = demo.map(r => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - (r.diasAtras || 0));
    return {
      ...r,
      fecha: d.toISOString().split('T')[0]
    };
  });

  // Cargar reportes guardados localmente en el navegador
  let locales = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) locales = JSON.parse(raw);
  } catch {
    locales = [];
  }

  return [...locales, ...reportesDemoProcesados];
}

/**
 * Agrega un nuevo reporte localmente (Fase 1+2).
 */
export function agregarReporteLocal(nuevoReporte) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const locales = raw ? JSON.parse(raw) : [];
    const id = `local-${Date.now()}`;
    const reporteCompleto = {
      id,
      ...nuevoReporte,
      // Los reportes enviados en Modo Demostración quedan marcados como simulados.
      simulado: nuevoReporte.simulado === true,
      timestamp: Date.now()
    };
    locales.unshift(reporteCompleto);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(locales));
    // El límite de 48 h solo cuenta reportes reales (no los de Modo Demostración).
    if (!reporteCompleto.simulado) {
      localStorage.setItem(ULTIMO_REPORTE_KEY, String(reporteCompleto.timestamp));
    }
    return reporteCompleto;
  } catch (err) {
    console.error('Error guardando reporte local:', err);
    return null;
  }
}

/**
 * Límite de 1 reporte real cada CONFIG.LIMITE_HORAS (versión local de Fase 1+2;
 * en la fase de Firebase lo reemplaza limites/{uid}).
 */
export function verificarLimiteReporte() {
  try {
    const raw = localStorage.getItem(ULTIMO_REPORTE_KEY);
    if (!raw) return { permitido: true, horasRestantes: 0 };
    const transcurridoHoras = (Date.now() - Number(raw)) / (1000 * 60 * 60);
    if (transcurridoHoras >= CONFIG.LIMITE_HORAS) {
      return { permitido: true, horasRestantes: 0 };
    }
    return {
      permitido: false,
      horasRestantes: Math.ceil(CONFIG.LIMITE_HORAS - transcurridoHoras),
    };
  } catch {
    return { permitido: true, horasRestantes: 0 };
  }
}

/**
 * Registra la acción "Ya lo envié" para una colonia en localStorage.
 */
export function marcarEvidenciaEnviada(coloniaId) {
  try {
    const raw = localStorage.getItem(ENVIOS_STORAGE_KEY);
    const envios = raw ? JSON.parse(raw) : {};
    envios[coloniaId] = {
      fechaEnvio: new Date().toISOString(),
      timestamp: Date.now(),
    };
    localStorage.setItem(ENVIOS_STORAGE_KEY, JSON.stringify(envios));
    return envios[coloniaId];
  } catch (err) {
    console.error('Error marcando evidencia enviada:', err);
    return null;
  }
}

/**
 * Obtiene el registro de "Ya lo envié" y los días transcurridos.
 */
export function getEstadoEvidenciaEnviada(coloniaId) {
  try {
    const raw = localStorage.getItem(ENVIOS_STORAGE_KEY);
    if (!raw) return null;
    const envios = JSON.parse(raw);
    const registro = envios[coloniaId];
    if (!registro) return null;

    const fecha = new Date(registro.fechaEnvio);
    const hoy = new Date();
    const diffTime = Math.abs(hoy - fecha);
    const diasTranscurridos = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...registro,
      diasTranscurridos,
    };
  } catch {
    return null;
  }
}

/**
 * Serie fija semanal de 8 semanas según directriz de CONTEXTO / CORRECCION.
 */
export const SERIE_SEMANAL = [
  { semana: 'Sem 1', reportes: 8 },
  { semana: 'Sem 2', reportes: 10 },
  { semana: 'Sem 3', reportes: 12 },
  { semana: 'Sem 4', reportes: 15 },
  { semana: 'Sem 5', reportes: 22 },
  { semana: 'Sem 6', reportes: 25 },
  { semana: 'Sem 7', reportes: 27 },
  { semana: 'Sem 8', reportes: 35 },
];

/**
 * Calcula estadísticas de salud para una colonia.
 */
export function calcularEstadisticasSalud(reportesColonia) {
  const respuestas = (reportesColonia || []).filter(r => r.sintomas !== null && r.sintomas !== undefined);
  const total = respuestas.length;

  if (total < CONFIG.MIN_RESPUESTAS_SALUD) {
    return {
      disponible: false,
      mensaje: 'Datos insuficientes',
      totalRespuestas: total,
      porcentaje: null,
      avisoFijo: 'Autorreporte, no es un diagnóstico ni prueba de que el agua sea la causa'
    };
  }

  const conSintomas = respuestas.filter(r => r.sintomas === true).length;
  const porcentaje = Math.round((conSintomas / total) * 100);

  return {
    disponible: true,
    totalRespuestas: total,
    conSintomas,
    porcentaje,
    mensaje: `${porcentaje}% de respuestas indican malestar estomacal en el hogar (${conSintomas} de ${total})`,
    avisoFijo: 'Autorreporte, no es un diagnóstico ni prueba de que el agua sea la causa'
  };
}

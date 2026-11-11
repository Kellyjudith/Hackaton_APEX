import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getTodosLosReportes, agregarReporteLocal } from '../utils/reportesStore';
import { calcularEstadoSemaforo } from '../utils/semaforo';
import { COLONIAS_PILOTO, CONFIG } from '../config';
import {
  firebaseConfigurado,
  suscribirReportes,
  crearReporteFirestore,
  escucharAutoridad,
  iniciarSesionAutoridad as iniciarSesionFS,
  cerrarSesionAutoridad as cerrarSesionFS,
  suscribirActualizaciones,
  crearActualizacionFirestore,
} from '../firebase/firestoreService';

const AppContext = createContext();

function fechaISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

export function AppProvider({ children }) {
  const [modoDemo, setModoDemo] = useState(true);
  const [reportesBase, setReportesBase] = useState([]); // demo + simulados locales
  const [reportesNube, setReportesNube] = useState([]); // reales desde Firestore
  const [estadoNube, setEstadoNube] = useState(firebaseConfigurado ? 'conectando' : 'sin_configurar');
  const [viviendas, setViviendas] = useState({});
  const [riesgo, setRiesgo] = useState({});
  const [geojsonData, setGeojsonData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [actualizacionesNube, setActualizacionesNube] = useState([]);
  const [actualizacionesDemo, setActualizacionesDemo] = useState([]);
  const [autoridad, setAutoridad] = useState(null); // { uid, nombre, cargo } | null
  const [cargandoAuth, setCargandoAuth] = useState(firebaseConfigurado);

  // Con Firebase activo, los reportes reales vienen de la nube; en el navegador solo quedan los simulados.
  const soloSimulados = (reps) => (firebaseConfigurado ? reps.filter((r) => r.simulado === true) : reps);

  // Carga inicial de datos
  useEffect(() => {
    async function cargarDatos() {
      try {
        const [reps, vivRes, riesRes, geoRes] = await Promise.all([
          getTodosLosReportes(),
          fetch('/data/viviendas.json').then(r => r.json()).catch(() => ({})),
          fetch('/data/riesgo.json').then(r => r.json()).catch(() => ({})),
          fetch('/data/colonias.geojson').then(r => r.json()).catch(() => null),
        ]);

        setReportesBase(soloSimulados(reps));
        setViviendas(vivRes);
        setRiesgo(riesRes);
        setGeojsonData(geoRes);

        const actDemo = await fetch('/data/actualizaciones_demo.json').then(r => r.json()).catch(() => []);
        const ahora = Date.now();
        setActualizacionesDemo(
          actDemo.map(a => ({
            ...a,
            timestamp: ahora - (a.diasAtras || 0) * 24 * 3600 * 1000,
            corrigeA: null,
            origen: 'demo',
          }))
        );
      } catch (err) {
        console.error('Error cargando datos iniciales:', err);
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  // Suscripción en vivo a los reportes reales (Firestore)
  useEffect(() => {
    if (!firebaseConfigurado) return undefined;
    const cancelar = suscribirReportes(
      (reps) => {
        setReportesNube(reps);
        setEstadoNube('conectado');
      },
      () => setEstadoNube('error')
    );
    return cancelar;
  }, []);

  // Actualizaciones públicas de la autoridad (Firestore) y sesión de la persona autorizada
  useEffect(() => {
    if (!firebaseConfigurado) return undefined;
    const cancelar = suscribirActualizaciones((acts) => setActualizacionesNube(acts));
    return cancelar;
  }, []);

  useEffect(() => {
    if (!firebaseConfigurado) return undefined;
    const cancelar = escucharAutoridad((a) => {
      setAutoridad(a);
      setCargandoAuth(false);
    });
    return cancelar;
  }, []);

  const iniciarSesionAutoridad = (correo, clave) => iniciarSesionFS(correo, clave);
  const cerrarSesionAutoridad = () => cerrarSesionFS();
  const publicarActualizacion = (datos) => crearActualizacionFirestore(datos, autoridad);

  // En Modo Demostración también se muestran las actualizaciones de ejemplo
  const actualizaciones = useMemo(
    () => (modoDemo ? [...actualizacionesNube, ...actualizacionesDemo] : actualizacionesNube),
    [modoDemo, actualizacionesNube, actualizacionesDemo]
  );

  const reportes = useMemo(() => [...reportesNube, ...reportesBase], [reportesNube, reportesBase]);

  const refreshReportes = async () => {
    const reps = await getTodosLosReportes();
    setReportesBase(soloSimulados(reps));
  };

  /**
   * Agrega un reporte.
   * - Modo Demostración (o sin Firebase): se guarda solo en este navegador, marcado como simulado.
   * - Modo normal con Firebase: se guarda en Firestore (la suscripción lo muestra en el mapa).
   */
  const agregarReporte = async (nuevoReporte) => {
    if (nuevoReporte.simulado || !firebaseConfigurado) {
      const res = agregarReporteLocal(nuevoReporte);
      if (res) {
        setReportesBase(prev => [res, ...prev]);
      }
      return res;
    }
    return crearReporteFirestore(nuevoReporte);
  };

  // Resumen calculado por colonia (ventana móvil de VENTANA_DIAS)
  const getColoniaResumen = (coloniaId) => {
    const hace = new Date();
    hace.setDate(hace.getDate() - CONFIG.VENTANA_DIAS);
    const desde = fechaISO(hace);

    const repsColonia = reportes.filter(r => r.colonia === coloniaId && (!r.fecha || r.fecha >= desde));
    const viv = viviendas[coloniaId]?.viviendas || null;
    const ries = riesgo[coloniaId]?.nivel || 'bajo';
    const estado = calcularEstadoSemaforo(repsColonia, viv, ries);
    const faltaAguaCount = repsColonia.filter(r => r.tipo === 'falta_agua').length;

    return {
      id: coloniaId,
      nombre: viviendas[coloniaId]?.nombre || coloniaId,
      municipio: viviendas[coloniaId]?.municipio || 'Guadalajara',
      viviendas: viv,
      riesgo: ries,
      reportesCalidad: estado.n,
      faltaAguaCount,
      totalReportes: repsColonia.length,
      estado,
      reportes: repsColonia,
    };
  };

  const resumenTodasColonias = COLONIAS_PILOTO.map(c => getColoniaResumen(c.id));

  return (
    <AppContext.Provider
      value={{
        modoDemo,
        setModoDemo,
        reportes,
        viviendas,
        riesgo,
        geojsonData,
        cargando,
        estadoNube,
        agregarReporte,
        refreshReportes,
        getColoniaResumen,
        resumenTodasColonias,
        coloniasPiloto: COLONIAS_PILOTO,
        actualizaciones,
        autoridad,
        cargandoAuth,
        iniciarSesionAutoridad,
        cerrarSesionAutoridad,
        publicarActualizacion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}

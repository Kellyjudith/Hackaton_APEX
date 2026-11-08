import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTodosLosReportes, agregarReporteLocal } from '../utils/reportesStore';
import { calcularEstadoSemaforo } from '../utils/semaforo';
import { COLONIAS_PILOTO } from '../config';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [modoDemo, setModoDemo] = useState(true);
  const [reportes, setReportes] = useState([]);
  const [viviendas, setViviendas] = useState({});
  const [riesgo, setRiesgo] = useState({});
  const [geojsonData, setGeojsonData] = useState(null);
  const [cargando, setCargando] = useState(true);

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

        setReportes(reps);
        setViviendas(vivRes);
        setRiesgo(riesRes);
        setGeojsonData(geoRes);
      } catch (err) {
        console.error('Error cargando datos iniciales:', err);
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  const refreshReportes = async () => {
    const reps = await getTodosLosReportes();
    setReportes(reps);
  };

  const agregarReporte = (nuevoReporte) => {
    const res = agregarReporteLocal(nuevoReporte);
    if (res) {
      setReportes(prev => [res, ...prev]);
    }
    return res;
  };

  // Resumen calculado por colonia
  const getColoniaResumen = (coloniaId) => {
    const repsColonia = reportes.filter(r => r.colonia === coloniaId);
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
        agregarReporte,
        refreshReportes,
        getColoniaResumen,
        resumenTodasColonias,
        coloniasPiloto: COLONIAS_PILOTO,
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

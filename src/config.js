/**
 * Reglas de negocio y configuración centralizada de AguaClara Jalisco.
 * Marcadas como PROVISIONALES según la directriz del proyecto.
 */
export const CONFIG = {
  VENTANA_DIAS: 30, // ventana móvil para el semáforo
  MIN_REPORTES: 3, // menos de esto => "Sin datos suficientes" (Gris)
  UMBRAL_AMARILLO: 1.5, // reportes por 1,000 viviendas (ajustado) => Reportes moderados
  UMBRAL_ROJO: 3.5, // reportes por 1,000 viviendas (ajustado) => Muchos reportes
  FACTOR_RIESGO: {
    alto: 1.5,
    medio: 1.25,
    bajo: 1.0,
    sin_dato: 1.0,
  },
  MARGEN_GEOFENCE_METROS: 75, // Tolerancia de geofencing en borde de polígono
  LIMITE_HORAS: 48, // Control cívico de frecuencia por usuario
  MIN_RESPUESTAS_SALUD: 10, // Mínimo de respuestas para mostrar porcentaje de síntomas
  TIPOS_CALIDAD: ['turbia', 'olor', 'color'], // 'falta_agua' se procesa y muestra aparte
};

export const COLONIAS_PILOTO = [
  { id: 'oblatos', nombre: 'Oblatos', municipio: 'Guadalajara' },
  { id: 'santa_cecilia', nombre: 'Santa Cecilia', municipio: 'Guadalajara' },
  { id: 'jardines_de_la_paz', nombre: 'Jardines de la Paz', municipio: 'Guadalajara' },
  { id: 'miravalle', nombre: 'Miravalle', municipio: 'Guadalajara' },
  { id: 'centro', nombre: 'Centro', municipio: 'Guadalajara' },
  { id: 'santa_teresita', nombre: 'Santa Teresita', municipio: 'Guadalajara' },
  { id: 'chapalita', nombre: 'Chapalita', municipio: 'Guadalajara' },
  { id: 'san_rafael', nombre: 'San Rafael', municipio: 'Guadalajara' },
];

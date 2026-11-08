import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import { CONFIG } from '../config';

/**
 * Distancia en metros de un punto (lng, lat) a un segmento [a, b] (cada uno [lng, lat]).
 * Usa una proyección plana local: suficiente para distancias de decenas de metros.
 */
function distanciaPuntoSegmentoMetros(lng, lat, a, b) {
  const kLat = 111320;
  const kLng = 111320 * Math.cos((lat * Math.PI) / 180);
  const ax = (a[0] - lng) * kLng;
  const ay = (a[1] - lat) * kLat;
  const bx = (b[0] - lng) * kLng;
  const by = (b[1] - lat) * kLat;
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : (-ax * dx - ay * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

/** Distancia mínima en metros del punto al borde de un Polygon o MultiPolygon. */
function distanciaAlBordeMetros(lng, lat, geometry) {
  const polys =
    geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.type === 'MultiPolygon'
        ? geometry.coordinates
        : [];
  let min = Infinity;
  for (const poly of polys) {
    for (const ring of poly) {
      for (let i = 0; i < ring.length - 1; i++) {
        const d = distanciaPuntoSegmentoMetros(lng, lat, ring[i], ring[i + 1]);
        if (d < min) min = d;
      }
    }
  }
  return min;
}

/**
 * Busca si unas coordenadas caen dentro de los polígonos de colonias piloto,
 * con una tolerancia de borde de CONFIG.MARGEN_GEOFENCE_METROS (75 m).
 * @param {number} lng - Longitud
 * @param {number} lat - Latitud
 * @param {Object} geojsonData - FeatureCollection de colonias.geojson
 * @returns {Object|null} Propiedades de la colonia o null si está fuera
 */
export function buscarColoniaPorPunto(lng, lat, geojsonData) {
  if (!geojsonData || !geojsonData.features) return null;

  const pt = point([lng, lat]);

  // 1) Dentro del polígono
  for (const feature of geojsonData.features) {
    try {
      if (booleanPointInPolygon(pt, feature)) {
        return feature.properties;
      }
    } catch {
      // Ignorar errores de polígono mal formado
    }
  }

  // 2) Dentro del margen de tolerancia del borde (la colonia más cercana)
  let mejor = null;
  let mejorDist = Infinity;
  for (const feature of geojsonData.features) {
    try {
      const d = distanciaAlBordeMetros(lng, lat, feature.geometry);
      if (d < mejorDist) {
        mejorDist = d;
        mejor = feature;
      }
    } catch {
      // Ignorar geometrías inválidas
    }
  }

  if (mejor && mejorDist <= CONFIG.MARGEN_GEOFENCE_METROS) {
    return mejor.properties;
  }

  return null;
}

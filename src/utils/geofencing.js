import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';

/**
 * Busca si unas coordenadas [lng, lat] caen dentro de los polígonos de colonias piloto.
 * @param {number} lng - Longitud
 * @param {number} lat - Latitud
 * @param {Object} geojsonData - FeatureCollection de colonias.geojson
 * @returns {Object|null} Retorna el feature de la colonia o null si está fuera
 */
export function buscarColoniaPorPunto(lng, lat, geojsonData) {
  if (!geojsonData || !geojsonData.features) return null;

  const pt = point([lng, lat]);

  for (const feature of geojsonData.features) {
    try {
      if (booleanPointInPolygon(pt, feature)) {
        return feature.properties;
      }
    } catch {
      // Ignorar errores de polígono mal formado
    }
  }

  return null;
}

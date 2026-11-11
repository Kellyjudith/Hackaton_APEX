import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

// Ajusta la vista para que se vean todas las colonias piloto
function AjustarVista({ geojsonData }) {
  const map = useMap();
  useEffect(() => {
    try {
      const bounds = L.geoJSON(geojsonData).getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 });
    } catch (e) {
      console.error('Error al ajustar el mapa:', e);
    }
  }, [geojsonData, map]);
  return null;
}

/**
 * Mapa para elegir la colonia tocando su zona (interacción a nivel colonia).
 * No se elige un punto exacto: solo se obtiene el id de la colonia piloto tocada,
 * por lo que no se maneja ni se guarda ninguna coordenada del usuario.
 */
export default function SelectorColoniaMapa({ geojsonData, coloniaId, onSelect }) {
  const estilo = (feature) => {
    const sel = feature.properties?.id === coloniaId;
    return {
      color: sel ? '#00477F' : '#0284C7',
      weight: sel ? 3.5 : 1.5,
      fillColor: sel ? '#0B5FA5' : '#BAE6FD',
      fillOpacity: sel ? 0.45 : 0.25,
    };
  };

  const alCadaColonia = (feature, layer) => {
    const nombre = feature.properties?.nombre || feature.properties?.id;
    layer.bindTooltip(nombre, { sticky: true });
    layer.on('click', () => onSelect(feature.properties.id));
  };

  const clave = useMemo(() => `sel-${coloniaId || 'ninguna'}`, [coloniaId]);

  if (!geojsonData) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-outline-variant/40 h-60 sm:h-72 w-full">
      <MapContainer
        center={[20.67, -103.35]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ minHeight: 240 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AjustarVista geojsonData={geojsonData} />
        <GeoJSON key={clave} data={geojsonData} style={estilo} onEachFeature={alCadaColonia} />
      </MapContainer>
    </div>
  );
}

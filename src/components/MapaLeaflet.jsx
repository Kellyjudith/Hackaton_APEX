import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';

// Componente para recentrar el mapa cuando se selecciona una colonia
function MapController({ selectedFeature }) {
  const map = useMap();
  useEffect(() => {
    if (selectedFeature) {
      try {
        const layer = L.geoJSON(selectedFeature);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
        }
      } catch (e) {
        console.error('Error al recentrar mapa:', e);
      }
    }
  }, [selectedFeature, map]);
  return null;
}

export default function MapaLeaflet({
  geojsonData,
  resumenTodasColonias,
  coloniaSeleccionadaId,
  onSelectColonia,
}) {
  const geoJsonRef = useRef(null);

  // Mapa de estados por id de colonia
  const estadosPorColonia = React.useMemo(() => {
    const map = {};
    (resumenTodasColonias || []).forEach(c => {
      map[c.id] = c.estado;
    });
    return map;
  }, [resumenTodasColonias]);

  const styleFeature = (feature) => {
    const id = feature.properties?.id;
    const estado = estadosPorColonia[id];
    const isSelected = id === coloniaSeleccionadaId;

    let fillColor = '#F1F5F9';
    let borderColor = '#64748B';

    if (estado) {
      fillColor = estado.bg;
      borderColor = estado.color;
    }

    return {
      fillColor: fillColor,
      weight: isSelected ? 4 : 2,
      opacity: 1,
      color: isSelected ? '#00477F' : borderColor,
      fillOpacity: isSelected ? 0.8 : 0.6,
      dashArray: isSelected ? '' : '3',
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties || {};
    const id = props.id;
    const estado = estadosPorColonia[id];
    const nombre = props.nombre || id;

    // Tooltip flotante
    layer.bindTooltip(`
      <div style="font-family: Inter, sans-serif; padding: 4px;">
        <strong style="font-size: 14px; color: #191c1e;">${nombre}</strong><br/>
        <span style="font-size: 12px; color: ${estado ? estado.color : '#64748B'}; font-weight: 600;">
          ${estado ? estado.nombre : 'Sin datos'} (${estado ? estado.n : 0} reportes)
        </span>
      </div>
    `, { sticky: true, direction: 'top' });

    layer.on({
      click: () => {
        if (onSelectColonia) {
          onSelectColonia(id);
        }
      },
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.85, weight: 3 });
      },
      mouseout: (e) => {
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target);
        }
      },
    });
  };

  const selectedFeature = geojsonData?.features?.find(
    f => f.properties?.id === coloniaSeleccionadaId
  );

  return (
    <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] rounded-xl overflow-hidden shadow-inner bg-[#E8EEF5]">
      <MapContainer
        center={[20.6767, -103.3470]}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {geojsonData && (
          <GeoJSON
            key={JSON.stringify(coloniaSeleccionadaId)}
            ref={geoJsonRef}
            data={geojsonData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}

        <MapController selectedFeature={selectedFeature} />
      </MapContainer>

      {/* Nota de atribución visible y leyenda rápida de mapa */}
      <div className="absolute bottom-2 left-2 z-20 bg-surface-container-lowest/90 backdrop-blur px-2.5 py-1 rounded-md text-[11px] text-on-surface-variant shadow-sm border border-outline-variant/30">
        Polígonos piloto de Guadalajara · Clic para ver ficha
      </div>
    </div>
  );
}

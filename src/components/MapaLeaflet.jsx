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
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true });
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
  filtroTipo = 'todos', // 'todos' | 'falta_agua'
}) {
  const geoJsonRef = useRef(null);

  // Mapeos rápidos
  const dataPorColonia = React.useMemo(() => {
    const map = {};
    (resumenTodasColonias || []).forEach(c => {
      map[c.id] = c;
    });
    return map;
  }, [resumenTodasColonias]);

  const styleFeature = (feature) => {
    const id = feature.properties?.id;
    const colData = dataPorColonia[id];
    const isSelected = id === coloniaSeleccionadaId;

    // 1. Si el filtro activo es "Falta de agua"
    if (filtroTipo === 'falta_agua') {
      const count = colData?.faltaAguaCount || 0;

      if (count === 0) {
        // Colonias sin reportes de falta de agua se atenúan
        return {
          fillColor: '#F8FAFC',
          weight: 1,
          opacity: 0.3,
          color: '#94A3B8',
          fillOpacity: 0.1,
          dashArray: '4',
        };
      }

      // Escala propia de azul para falta de agua
      let blueFill = '#BAE6FD'; // 1-2
      let blueBorder = '#0284C7';

      if (count >= 5) {
        blueFill = '#0284C7';
        blueBorder = '#075985';
      } else if (count >= 3) {
        blueFill = '#38BDF8';
        blueBorder = '#0369A1';
      }

      return {
        fillColor: blueFill,
        weight: isSelected ? 4 : 2.5,
        opacity: 1,
        color: isSelected ? '#002020' : blueBorder,
        fillOpacity: isSelected ? 0.9 : 0.75,
        dashArray: '',
      };
    }

    // 2. Filtro "Todas las colonias" (Semáforo de calidad normal)
    const estado = colData?.estado;
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
      fillOpacity: isSelected ? 0.85 : 0.65,
      dashArray: isSelected ? '' : '3',
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties || {};
    const id = props.id;
    const colData = dataPorColonia[id];
    const nombre = props.nombre || id;

    if (filtroTipo === 'falta_agua') {
      const count = colData?.faltaAguaCount || 0;
      layer.bindTooltip(`
        <div style="font-family: Inter, sans-serif; padding: 4px;">
          <strong style="font-size: 14px; color: #0C4A6E;">${nombre}</strong><br/>
          <span style="font-size: 12px; color: ${count > 0 ? '#0284C7' : '#64748B'}; font-weight: 700;">
            ${count > 0 ? `${count} avisos de falta de agua` : 'Sin avisos de falta de agua'}
          </span>
        </div>
      `, { sticky: true, direction: 'top' });
    } else {
      const estado = colData?.estado;
      layer.bindTooltip(`
        <div style="font-family: Inter, sans-serif; padding: 4px;">
          <strong style="font-size: 14px; color: #191c1e;">${nombre}</strong><br/>
          <span style="font-size: 12px; color: ${estado ? estado.color : '#64748B'}; font-weight: 700;">
            ${estado ? estado.nombre : 'Sin datos'} (${estado ? estado.n : 0} reportes de calidad)
          </span>
        </div>
      `, { sticky: true, direction: 'top' });
    }

    layer.on({
      click: () => {
        if (onSelectColonia) {
          onSelectColonia(id);
        }
      },
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ fillOpacity: 0.95, weight: 3.5 });
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
            key={`${filtroTipo}-${coloniaSeleccionadaId}`}
            ref={geoJsonRef}
            data={geojsonData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}

        <MapController selectedFeature={selectedFeature} />
      </MapContainer>

      {/* Indicador de capa en el mapa */}
      <div className="absolute bottom-2 left-2 z-20 bg-surface-container-lowest/90 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-semibold text-on-surface-variant shadow-sm border border-outline-variant/30">
        {filtroTipo === 'falta_agua'
          ? 'Capa: Falta de agua (escala azul independiente)'
          : 'Capa: Semáforo de calidad de agua vecinal'}
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip, useMap } from 'react-leaflet';
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

  // Contorno tenue de cada colonia. El color fuerte y el tamaño los llevan los círculos.
  const styleFeature = (feature) => {
    const id = feature.properties?.id;
    const colData = dataPorColonia[id];
    const isSelected = id === coloniaSeleccionadaId;

    if (filtroTipo === 'falta_agua') {
      const count = colData?.faltaAguaCount || 0;
      return {
        fillColor: count > 0 ? '#BAE6FD' : '#F8FAFC',
        weight: isSelected ? 3.5 : 1.5,
        opacity: count > 0 ? 0.9 : 0.4,
        color: isSelected ? '#075985' : count > 0 ? '#0284C7' : '#94A3B8',
        fillOpacity: count > 0 ? 0.18 : 0.06,
        dashArray: count > 0 ? '' : '4',
      };
    }

    const estado = colData?.estado;
    return {
      fillColor: estado ? estado.bg : '#F1F5F9',
      weight: isSelected ? 3.5 : 1.5,
      opacity: 0.9,
      color: isSelected ? '#00477F' : estado ? estado.color : '#64748B',
      fillOpacity: 0.2,
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

  // Centro de cada colonia, calculado a partir de su polígono (si cambian los polígonos, se recalcula solo)
  const centros = React.useMemo(() => {
    const out = {};
    (geojsonData?.features || []).forEach((f) => {
      try {
        const b = L.geoJSON(f).getBounds();
        if (b.isValid()) {
          const c = b.getCenter();
          out[f.properties?.id] = [c.lat, c.lng];
        }
      } catch (e) {
        console.error('Centro no calculado:', e);
      }
    });
    return out;
  }, [geojsonData]);

  // Un círculo por colonia: tamaño = número de reportes; color = semáforo (o azul en falta de agua)
  const circulos = React.useMemo(() => {
    const lista = (resumenTodasColonias || [])
      .map((c) => {
        const esFalta = filtroTipo === 'falta_agua';
        const n = esFalta ? c.faltaAguaCount || 0 : c.estado?.n || 0;
        return { c, n, esFalta };
      })
      .filter((x) => centros[x.c.id] && !(x.esFalta && x.n === 0));
    const nMax = Math.max(1, ...lista.map((x) => x.n));
    return lista.map(({ c, n, esFalta }) => {
      const diametro = n === 0 ? 26 : Math.round(26 + 30 * Math.sqrt(n / nMax)); // 26 a 56 px
      let relleno;
      let borde;
      if (esFalta) {
        relleno = n >= 5 ? '#0284C7' : n >= 3 ? '#38BDF8' : '#7DD3FC';
        borde = '#075985';
      } else {
        relleno = c.estado?.color || '#64748B';
        borde = relleno;
      }
      return { id: c.id, nombre: c.nombre, n, esFalta, diametro, relleno, borde, estado: c.estado };
    });
  }, [resumenTodasColonias, filtroTipo, centros]);

  const crearIcono = (circ, seleccionado) => {
    const d = circ.diametro;
    const textoOscuro = circ.esFalta && circ.n < 3;
    return L.divIcon({
      className: 'aguaclara-circulo',
      iconSize: [d, d],
      iconAnchor: [d / 2, d / 2],
      html: `<div style="width:${d}px;height:${d}px;border-radius:50%;background:${circ.relleno}CC;border:${seleccionado ? 4 : 2}px solid ${seleccionado ? '#00477F' : circ.borde};box-shadow:0 1px 4px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font:800 ${d >= 40 ? 15 : 13}px Inter,sans-serif;color:${textoOscuro ? '#0C4A6E' : '#fff'};text-shadow:${textoOscuro ? 'none' : '0 1px 2px rgba(0,0,0,.45)'};">${circ.n}</div>`,
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

        {circulos.map((circ) => (
          <Marker
            key={`${circ.id}-${filtroTipo}-${circ.n}-${circ.id === coloniaSeleccionadaId}`}
            position={centros[circ.id]}
            icon={crearIcono(circ, circ.id === coloniaSeleccionadaId)}
            eventHandlers={{ click: () => onSelectColonia && onSelectColonia(circ.id) }}
            keyboard={false}
          >
            <Tooltip direction="top" offset={[0, -circ.diametro / 2]}>
              <div style={{ fontFamily: 'Inter, sans-serif', padding: 2 }}>
                <strong style={{ fontSize: 14 }}>{circ.nombre}</strong>
                <br />
                <span style={{ fontSize: 12, fontWeight: 700, color: circ.esFalta ? '#0284C7' : circ.estado?.color }}>
                  {circ.esFalta
                    ? `${circ.n} avisos de falta de agua`
                    : `${circ.estado?.nombre || 'Sin datos'} (${circ.n} reportes de calidad)`}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ))}

        <MapController selectedFeature={selectedFeature} />
      </MapContainer>

      {/* Indicador de capa en el mapa */}
      <div className="absolute bottom-2 left-2 z-20 bg-surface-container-lowest/90 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-semibold text-on-surface-variant shadow-sm border border-outline-variant/30">
        {filtroTipo === 'falta_agua'
          ? 'Capa: Falta de agua · el tamaño del círculo es el número de avisos'
          : 'Capa: Semáforo de reportes · el tamaño del círculo es el número de reportes'}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PanelLayout from '../components/PanelLayout';
import {
  ACCIONES,
  ESTADOS_ACTUALIZACION,
  TIPOS_PROBLEMA,
  actualizacionesVigentes,
  fechaHora,
  folio,
  idsCorregidos,
} from '../utils/actualizaciones';

const DIA_MS = 24 * 3600 * 1000;
const POR_PAGINA = 10;

export default function PanelBitacora() {
  const { actualizaciones, coloniasPiloto } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [filtroColonia, setFiltroColonia] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [visibles, setVisibles] = useState(POR_PAGINA);

  const nombreColonia = (id) => coloniasPiloto.find((c) => c.id === id)?.nombre || id;
  const corregidas = useMemo(() => idsCorregidos(actualizaciones), [actualizaciones]);
  const ordenadas = useMemo(
    () => [...actualizaciones].sort((a, b) => b.timestamp - a.timestamp),
    [actualizaciones]
  );
  const vigentes = useMemo(() => actualizacionesVigentes(actualizaciones), [actualizaciones]);
  const ahora = Date.now();

  const coloniasCubiertas = new Set(vigentes.map((a) => a.colonia)).size;
  const ultimas24 = ordenadas.filter((a) => ahora - a.timestamp <= DIA_MS).length;

  const filtradas = ordenadas
    .filter((a) => filtroColonia === 'todas' || a.colonia === filtroColonia)
    .filter((a) => filtroEstado === 'todos' || a.estado === filtroEstado)
    .filter((a) => {
      const q = busqueda.trim().toLowerCase();
      if (!q) return true;
      return (
        folio(a).toLowerCase().includes(q) ||
        a.nota.toLowerCase().includes(q) ||
        (ACCIONES[a.accion] || '').toLowerCase().includes(q) ||
        nombreColonia(a.colonia).toLowerCase().includes(q)
      );
    });

  const tabs = [
    { id: 'todos', etiqueta: 'Todos' },
    { id: 'en_atencion', etiqueta: 'En atención' },
    { id: 'atendido', etiqueta: 'Atendido' },
    { id: 'en_revision', etiqueta: 'En revisión' },
  ];

  return (
    <PanelLayout>
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex flex-col gap-1 max-w-2xl">
          <span className="text-xs font-bold tracking-wider text-primary uppercase">Registro de actualizaciones</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Bitácora de actualizaciones publicadas</h1>
          <p className="text-sm sm:text-base text-on-surface-variant">
            Historial cronológico de lo que se ha publicado para la ciudadanía. Las publicaciones no se borran.
          </p>
        </div>
        <Link
          to="/panel/nueva"
          className="min-h-[48px] px-5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-sm inline-flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Nueva actualización
        </Link>
      </header>

      <section className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { etiqueta: 'Publicadas', valor: ordenadas.length, nota: 'en total' },
          { etiqueta: 'Últimas 24 h', valor: ultimas24, nota: 'publicadas' },
          { etiqueta: 'Cobertura', valor: `${coloniasCubiertas} / ${coloniasPiloto.length}`, nota: 'colonias con actualización' },
        ].map((t) => (
          <div key={t.etiqueta} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-3 sm:p-4">
            <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant block">{t.etiqueta}</span>
            <span className="text-2xl sm:text-3xl font-black text-primary block leading-tight">{t.valor}</span>
            <span className="text-[11px] text-on-surface-variant">{t.nota}</span>
          </div>
        ))}
      </section>

      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-3 sm:p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 flex-1">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setVisibles(POR_PAGINA); }}
              placeholder="Buscar por folio o palabra clave"
              className="flex-1 min-h-[44px] bg-transparent outline-none text-sm"
            />
          </div>
          <select
            value={filtroColonia}
            onChange={(e) => { setFiltroColonia(e.target.value); setVisibles(POR_PAGINA); }}
            className="min-h-[44px] rounded-xl bg-surface-container px-3 text-sm font-medium"
            aria-label="Filtrar por colonia"
          >
            <option value="todas">Todas las colonias</option>
            {coloniasPiloto.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setFiltroEstado(t.id); setVisibles(POR_PAGINA); }}
              className={`min-h-[38px] px-3.5 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                filtroEstado === t.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {t.etiqueta}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        {filtradas.length === 0 && (
          <p className="text-sm text-on-surface-variant py-8 text-center">
            Aún no hay actualizaciones{busqueda || filtroColonia !== 'todas' || filtroEstado !== 'todos' ? ' con esos filtros' : ''}.
          </p>
        )}

        {filtradas.slice(0, visibles).map((a) => {
          const meta = ESTADOS_ACTUALIZACION[a.estado];
          const fueCorregida = corregidas.has(a.id);
          return (
            <article
              key={a.id}
              className={`bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 flex flex-col gap-3 ${fueCorregida ? 'opacity-70' : ''}`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono font-bold bg-surface-container px-2 py-0.5 rounded">{folio(a)}</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold border ${meta.clases}`}>
                  <span className="material-symbols-outlined text-[14px]">{meta.icono}</span>
                  {meta.nombre}
                </span>
                <span className="text-on-surface-variant uppercase tracking-wide font-semibold">{ACCIONES[a.accion]}</span>
                {fueCorregida && (
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold">Corregida</span>
                )}
                {a.corrigeA && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">Corrección</span>
                )}
                {a.origen === 'demo' && (
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold">Ejemplo</span>
                )}
                <span className="ml-auto text-on-surface-variant">{fechaHora(a.timestamp)}</span>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="md:w-48 shrink-0">
                  <div className="font-bold text-on-surface">{nombreColonia(a.colonia)}</div>
                  <div className="text-xs text-on-surface-variant">{TIPOS_PROBLEMA[a.tipoProblema]}</div>
                </div>
                <p className="flex-1 text-sm text-on-surface bg-surface-container-low rounded-xl p-3">{a.nota}</p>
                <div className="md:w-48 shrink-0 text-xs text-on-surface-variant flex md:flex-col md:items-end justify-between gap-2">
                  <div className="md:text-right">
                    <span className="uppercase tracking-wide block text-[10px]">Autor del registro</span>
                    <span className="font-semibold text-on-surface">{a.autorNombre}</span>
                  </div>
                  {a.origen === 'firestore' && !fueCorregida && (
                    <Link
                      to={`/panel/nueva?corrige=${a.id}`}
                      className="min-h-[36px] px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Corregir
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {filtradas.length > visibles && (
          <button
            type="button"
            onClick={() => setVisibles((v) => v + POR_PAGINA)}
            className="self-center min-h-[46px] px-6 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-sm"
          >
            Mostrar más ({filtradas.length - visibles} restantes)
          </button>
        )}
      </section>

      <div className="rounded-2xl bg-primary-fixed/40 border border-primary/20 p-4 text-xs text-on-surface flex gap-3">
        <span className="material-symbols-outlined text-primary text-[22px] shrink-0">lock</span>
        <span>
          <strong>Registro permanente.</strong> Las actualizaciones son públicas y no pueden eliminarse, para mantener
          la trazabilidad. Si hay un error, usa "Corregir": se publica una nueva versión y la anterior queda marcada.
        </span>
      </div>
    </PanelLayout>
  );
}

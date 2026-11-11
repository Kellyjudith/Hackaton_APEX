import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PanelLayout from '../components/PanelLayout';
import {
  ACCIONES,
  ESTADOS_ACTUALIZACION,
  MAX_NOTA,
  MIN_NOTA,
  TIPOS_PROBLEMA,
  folio,
} from '../utils/actualizaciones';

const ICONOS_TIPO = { turbia: 'water_drop', olor: 'air', color: 'palette', falta_agua: 'water_drop' };

export default function PanelNueva() {
  const { coloniasPiloto, resumenTodasColonias, actualizaciones, autoridad, publicarActualizacion } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const original = useMemo(
    () => actualizaciones.find((a) => a.id === params.get('corrige') && a.origen === 'firestore') || null,
    [actualizaciones, params]
  );

  const [colonia, setColonia] = useState(original?.colonia || params.get('colonia') || 'oblatos');
  const [tipoProblema, setTipoProblema] = useState(original?.tipoProblema || 'turbia');
  const [estado, setEstado] = useState(original?.estado || 'en_atencion');
  const [accion, setAccion] = useState(original?.accion || 'limpieza_red');
  const [nota, setNota] = useState(original?.nota || '');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const resumen = resumenTodasColonias.find((c) => c.id === colonia);
  const nombreColonia = coloniasPiloto.find((c) => c.id === colonia)?.nombre || colonia;
  const notaValida = nota.trim().length >= MIN_NOTA && nota.length <= MAX_NOTA;
  const meta = ESTADOS_ACTUALIZACION[estado];

  const publicar = async () => {
    if (!notaValida || enviando) return;
    setError(null);
    setEnviando(true);
    try {
      await publicarActualizacion({
        colonia,
        tipoProblema,
        estado,
        accion,
        nota,
        corrigeA: original ? original.id : null,
      });
      navigate('/panel/bitacora');
    } catch (err) {
      console.error('Error al publicar actualización:', err);
      if (err && err.code === 'permission-denied') {
        setError('Tu cuenta no tiene permiso para publicar. Verifica que esté registrada como autorizada.');
      } else {
        setError('No se pudo publicar la actualización. Revisa tu conexión e inténtalo de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  };

  const botonSegmento = (activo) =>
    `min-h-[48px] px-3 rounded-xl text-sm font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors ${
      activo ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
    }`;

  return (
    <PanelLayout>
      <div className="flex flex-col gap-2">
        <Link to="/panel" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary self-start">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver al panel de control
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
          {original ? 'Corregir actualización' : 'Registrar actualización pública'}
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-3xl">
          Informa a la ciudadanía qué se está haciendo o qué se atendió en una colonia. Se mostrará en el mapa y en la
          ficha de la colonia.
        </p>
        {original && (
          <div className="rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-sm p-3">
            Esta publicación reemplazará a <strong>{folio(original)}</strong>. La original no se borra: queda en la
            bitácora marcada como corregida.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Formulario */}
        <section className="lg:col-span-7 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 sm:p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="colonia" className="text-sm font-bold text-on-surface">Colonia *</label>
            <select
              id="colonia"
              value={colonia}
              onChange={(e) => setColonia(e.target.value)}
              disabled={Boolean(original)}
              className="min-h-[48px] rounded-xl bg-surface-container px-3 text-base disabled:opacity-60"
            >
              {coloniasPiloto.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} ({c.municipio})</option>
              ))}
            </select>
            {resumen && (
              <div
                className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold border"
                style={{ backgroundColor: resumen.estado.bg, color: resumen.estado.text, borderColor: resumen.estado.border }}
              >
                <span>{resumen.estado.nombre}</span>
                <span className="text-xs font-bold bg-white/70 rounded-md px-2 py-0.5">
                  {resumen.totalReportes} reportes en 30 días
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-on-surface">Problema relacionado *</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(TIPOS_PROBLEMA).map(([id, etiqueta]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTipoProblema(id)}
                  aria-pressed={tipoProblema === id}
                  className={botonSegmento(tipoProblema === id)}
                >
                  <span className="material-symbols-outlined text-[20px]">{ICONOS_TIPO[id]}</span>
                  <span>{etiqueta}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-on-surface">Estado de la atención *</span>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(ESTADOS_ACTUALIZACION).map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setEstado(e.id)}
                  aria-pressed={estado === e.id}
                  className={botonSegmento(estado === e.id)}
                >
                  <span className="material-symbols-outlined text-[20px]">{e.icono}</span>
                  <span>{e.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="accion" className="text-sm font-bold text-on-surface">Acción realizada o en proceso *</label>
            <select
              id="accion"
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              className="min-h-[48px] rounded-xl bg-surface-container px-3 text-base"
            >
              {Object.entries(ACCIONES).map(([id, etiqueta]) => (
                <option key={id} value={id}>{etiqueta}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="nota" className="text-sm font-bold text-on-surface">Nota pública *</label>
              <span className="text-xs text-on-surface-variant">Redacción clara y sin tecnicismos</span>
            </div>
            <textarea
              id="nota"
              rows={5}
              value={nota}
              maxLength={MAX_NOTA}
              onChange={(e) => setNota(e.target.value)}
              className="rounded-xl bg-surface-container p-3 text-base resize-y outline-none border border-transparent focus:border-primary"
              placeholder="Ej. Se realizó la purga de la línea y se normalizó la presión en la zona."
            />
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>{nota.trim().length < MIN_NOTA ? `Escribe al menos ${MIN_NOTA} caracteres.` : ''}</span>
              <span className={nota.length >= MAX_NOTA ? 'text-error font-bold' : ''}>{nota.length} / {MAX_NOTA}</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container p-3.5 flex gap-3 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px] shrink-0">shield</span>
            <span>
              Esta actualización será visible de inmediato para toda la ciudadanía. No incluyas nombres de vecinos,
              teléfonos ni datos personales. No se puede borrar; si hay un error, se corrige con una nueva publicación.
            </span>
          </div>

          {error && (
            <div role="alert" className="rounded-xl bg-red-50 border border-red-300 text-red-900 text-sm p-3 font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Link
              to="/panel"
              className="min-h-[48px] px-5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container inline-flex items-center justify-center"
            >
              Descartar
            </Link>
            <button
              type="button"
              onClick={publicar}
              disabled={!notaValida || enviando}
              className={`min-h-[48px] px-6 rounded-xl font-bold text-base inline-flex items-center justify-center gap-2 transition-colors ${
                notaValida && !enviando
                  ? 'bg-primary hover:bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{enviando ? 'sync' : 'send'}</span>
              {enviando ? 'Publicando...' : original ? 'Publicar corrección' : 'Publicar actualización'}
            </button>
          </div>
        </section>

        {/* Vista previa ciudadana */}
        <aside className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-36">
          <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
            <span className="material-symbols-outlined text-[20px] text-primary">visibility</span>
            Vista previa ciudadana
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Actualización de la autoridad</span>
                <span className="text-xs text-on-surface-variant">Ahora</span>
              </div>
              <div className="font-bold text-lg text-on-surface">{nombreColonia}, Guadalajara</div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${meta.clases}`}>
                  <span className="material-symbols-outlined text-[14px]">{meta.icono}</span>
                  {meta.nombre}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container text-on-surface">
                  {TIPOS_PROBLEMA[tipoProblema]}
                </span>
              </div>
              <div className="text-sm text-on-surface">
                <span className="font-semibold">Acción: </span>{ACCIONES[accion]}
              </div>
              <p className="text-sm text-on-surface bg-surface-container-low rounded-xl p-3 min-h-[64px] whitespace-pre-line">
                {nota.trim() || 'Aquí aparecerá la nota pública que escribas.'}
              </p>
              <div className="text-[11px] text-on-surface-variant">
                Registrado por {autoridad?.nombre} · prototipo de demostración
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container p-4 text-sm flex flex-col gap-2">
            <span className="font-bold text-on-surface">Qué pasa al publicar</span>
            <ul className="text-on-surface-variant text-xs flex flex-col gap-1.5 list-disc pl-4">
              <li>Se muestra en la tarjeta del mapa y en la ficha de {nombreColonia}.</li>
              <li>Los reportes ciudadanos no se modifican: se compara cuántos hubo 15 días antes y desde la actualización.</li>
              <li>Queda registrada con tu nombre y la fecha, sin posibilidad de borrarla.</li>
            </ul>
          </div>
        </aside>
      </div>
    </PanelLayout>
  );
}

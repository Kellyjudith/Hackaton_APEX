import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { buscarColoniaPorPunto } from '../utils/geofencing';
import Mensajes from '../components/Mensajes';
import { verificarLimiteReporte } from '../utils/reportesStore';

export default function Reportar() {
  const navigate = useNavigate();
  const { modoDemo, coloniasPiloto, geojsonData, agregarReporte } = useApp();

  // Estados del formulario
  const [coloniaId, setColoniaId] = useState('oblatos');
  const [pestaña, setPestaña] = useState('calidad'); // 'calidad' | 'falta'
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null); // 'turbia' | 'olor' | 'color' | 'falta_agua' | null
  const [sintomas, setSintomas] = useState(null); // true | false | null
  const [avisoAceptado, setAvisoAceptado] = useState(false);

  // Estados de geolocalización y mensajes
  const [detectandoGps, setDetectandoGps] = useState(false);
  const [estadoMensaje, setEstadoMensaje] = useState(null); // null | 'fuera_de_zona' | 'ubicacion_no_permitida' | 'limite_48h'
  const [coloniaDetectadaNombre, setColoniaDetectadaNombre] = useState('Colonia Oblatos, Guadalajara');
  const [horasRestantes, setHorasRestantes] = useState(0);

  // Detección GPS
  const handleDetectarUbicacion = () => {
    if (!navigator.geolocation) {
      setEstadoMensaje('ubicacion_no_permitida');
      return;
    }

    setDetectandoGps(true);
    setEstadoMensaje(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectandoGps(false);
        const { longitude, latitude } = pos.coords;

        if (modoDemo) {
          setColoniaDetectadaNombre('Ubicación verificada (Modo Demostración)');
          return;
        }

        // Validación real con Turf.js
        const colEncontrada = buscarColoniaPorPunto(longitude, latitude, geojsonData);
        if (colEncontrada) {
          setColoniaId(colEncontrada.id);
          setColoniaDetectadaNombre(`${colEncontrada.nombre}, Guadalajara`);
        } else {
          setEstadoMensaje('fuera_de_zona');
        }
      },
      (err) => {
        setDetectandoGps(false);
        console.warn('Error GPS:', err);
        setEstadoMensaje('ubicacion_no_permitida');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const cambiarPestaña = (nuevaPestaña) => {
    setPestaña(nuevaPestaña);
    setTipoSeleccionado(null);
  };

  const toggleTipo = (tipo) => {
    setTipoSeleccionado(prev => (prev === tipo ? null : tipo));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!tipoSeleccionado) {
      return;
    }

    // Límite de 48 h (no se valida en Modo Demostración)
    if (!modoDemo) {
      const limite = verificarLimiteReporte();
      if (!limite.permitido) {
        setHorasRestantes(limite.horasRestantes);
        setEstadoMensaje('limite_48h');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    const hoy = new Date().toISOString().split('T')[0];

    const nuevo = {
      colonia: coloniaId,
      tipo: tipoSeleccionado,
      sintomas: sintomas,
      fecha: hoy,
      simulado: modoDemo,
    };

    const creado = agregarReporte(nuevo);

    if (creado) {
      navigate('/confirmacion', {
        state: {
          reporte: creado,
          coloniaNombre: coloniasPiloto.find(c => c.id === coloniaId)?.nombre || coloniaId,
        },
      });
    }
  };

  return (
    <div className="w-full pt-28 sm:pt-32 bg-background flex-1 text-left">
      <div className="max-w-[760px] mx-auto px-4 sm:px-margin py-4 sm:py-space-xl flex flex-col gap-6">

        {/* Encabezado */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">assignment</span>
            <span>Reporte Vecinal Rápido · 3 Pasos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Reportar problema con el agua
          </h1>
          <p className="text-xs sm:text-sm text-primary font-medium flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">timer</span>
            <span>Solo te tomará 1 minuto. No pedimos nombre ni datos personales.</span>
          </p>
        </div>

        {/* Mensaje de alerta condicional si ocurrió un evento */}
        {estadoMensaje && (
          <Mensajes
            tipo={estadoMensaje}
            horasRestantes={horasRestantes}
            onSeleccionarColonia={() => setEstadoMensaje(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* PASO 1: Ubicación */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-primary-container text-on-primary font-bold text-lg flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-on-surface">¿En qué colonia estás?</h2>
                <p className="text-xs sm:text-sm text-on-surface-variant">Confirma la zona de tu casa o negocio</p>
              </div>
            </div>

            {/* Tarjeta de ubicación activa */}
            <div className="bg-surface-container p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest text-primary flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[26px]">location_on</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold block">
                    Colonia seleccionada
                  </span>
                  <span className="text-base sm:text-lg font-bold text-on-surface">
                    {coloniasPiloto.find(c => c.id === coloniaId)?.nombre || coloniaId}, Guadalajara
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDetectarUbicacion}
                disabled={detectandoGps}
                className="min-h-[46px] px-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-primary font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/40"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {detectandoGps ? 'sync' : 'my_location'}
                </span>
                <span>{detectandoGps ? 'Detectando GPS...' : 'Usar mi GPS'}</span>
              </button>
            </div>

            {/* Píldoras de las 8 colonias piloto */}
            <div className="space-y-2 pt-1">
              <span className="text-xs sm:text-sm text-on-surface-variant font-medium block">
                O selecciona con un toque entre las 8 colonias piloto:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {coloniasPiloto.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setColoniaId(c.id);
                      setColoniaDetectadaNombre(`${c.nombre}, Guadalajara`);
                    }}
                    className={`min-h-[44px] px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                      coloniaId === c.id
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {c.nombre}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* PASO 2: Tipo de problema (3. Texto actualizado: "Elige el problema principal", UN solo tipo) */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-primary-container text-on-primary font-bold text-lg flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-on-surface">Elige el problema principal</h2>
                <p className="text-xs sm:text-sm text-on-surface-variant">Selecciona un solo tipo de afectación para este reporte</p>
              </div>
            </div>

            {/* Control segmentado: Calidad vs Falta de agua */}
            <div className="p-1 bg-surface-container rounded-xl flex items-center gap-1 max-w-md">
              <button
                type="button"
                onClick={() => cambiarPestaña('calidad')}
                className={`flex-1 min-h-[44px] py-1 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  pestaña === 'calidad'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">opacity</span>
                <span>Calidad del agua</span>
              </button>
              <button
                type="button"
                onClick={() => cambiarPestaña('falta')}
                className={`flex-1 min-h-[44px] py-1 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  pestaña === 'falta'
                    ? 'bg-surface-container-lowest text-sky-800 font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">water_damage</span>
                <span>Falta de agua</span>
              </button>
            </div>

            {/* Opciones de Calidad del Agua */}
            {pestaña === 'calidad' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'turbia',
                    titulo: 'Se ve turbia',
                    desc: 'Aspecto lechoso, arenoso o lodo visible.',
                    icono: 'opacity',
                    colorIcono: 'text-primary',
                  },
                  {
                    id: 'olor',
                    titulo: 'Huele mal',
                    desc: 'Olor a caño, drenaje, azufre o cloro excesivo.',
                    icono: 'air',
                    colorIcono: 'text-tertiary',
                  },
                  {
                    id: 'color',
                    titulo: 'Tiene color',
                    desc: 'Amarillenta, café oscuro o aspecto oxidado.',
                    icono: 'palette',
                    colorIcono: 'text-amber-600',
                  },
                ].map((op) => {
                  const activo = tipoSeleccionado === op.id;
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => toggleTipo(op.id)}
                      className={`text-left flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                        activo
                          ? 'bg-primary-fixed/40 border-2 border-primary ring-2 ring-primary/20 shadow-sm'
                          : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container hover:border-outline-variant/60'
                      }`}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined ${op.colorIcono} text-[24px]`}>
                              {op.icono}
                            </span>
                            <span className="font-bold text-base text-on-surface">{op.titulo}</span>
                          </div>
                          {activo ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-surface-container-lowest px-2 py-0.5 rounded-full border border-primary/30 shadow-xs shrink-0">
                              <span className="material-symbols-outlined text-[15px]">check_circle</span>
                              <span>Seleccionado</span>
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border-2 border-outline-variant/50 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{op.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Opciones de Falta de Agua: "No tengo agua en mi casa" */}
            {pestaña === 'falta' && (
              <div className="flex flex-col gap-3">
                {(() => {
                  const activo = tipoSeleccionado === 'falta_agua';
                  return (
                    <button
                      type="button"
                      onClick={() => toggleTipo('falta_agua')}
                      className={`text-left flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                        activo
                          ? 'bg-sky-50 border-2 border-sky-600 ring-2 ring-sky-300 shadow-sm'
                          : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container hover:border-outline-variant/60'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm mt-0.5 transition-colors ${
                        activo ? 'bg-sky-600 text-white' : 'bg-surface-container-lowest text-sky-700'
                      }`}>
                        <span className="material-symbols-outlined text-[24px]">water_damage</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-base text-on-surface">No tengo agua en mi casa</span>
                          {activo ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-900 bg-sky-200/80 px-2.5 py-0.5 rounded-full border border-sky-300 shrink-0">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              <span>Seleccionado</span>
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border-2 border-outline-variant/50 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                          Corte total en la toma domiciliaria o presión insuficiente para abastecer el tinaco.
                          Este reporte se contabiliza en la capa de falta de agua, fuera del semáforo de calidad.
                        </p>
                      </div>
                    </button>
                  );
                })()}
              </div>
            )}

            {/* Botón Continuar de Paso 2 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-outline-variant/20">
              <span className="text-xs text-on-surface-variant font-medium">
                {tipoSeleccionado
                  ? '✓ Opción seleccionada. Puedes pulsar Continuar.'
                  : 'Toca una opción para seleccionarla (pulsa de nuevo para desmarcar).'}
              </span>
              <button
                type="button"
                disabled={!tipoSeleccionado}
                onClick={() => {
                  const paso3 = document.getElementById('paso-3-section');
                  if (paso3) {
                    paso3.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`min-h-[46px] px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  tipoSeleccionado
                    ? 'bg-primary hover:bg-primary-container text-on-primary shadow-sm cursor-pointer active:scale-95'
                    : 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/30'
                }`}
              >
                <span>Continuar</span>
                <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
              </button>
            </div>
          </section>

          {/* PASO 3: Pregunta opcional de salud + Aviso */}
          <section id="paso-3-section" className="bg-surface-container-lowest rounded-2xl p-5 sm:p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface font-bold text-lg flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                  Malestar estomacal <span className="font-normal text-on-surface-variant text-sm">(opcional)</span>
                </h2>
                <p className="text-xs sm:text-sm text-on-surface-variant">Información de contexto comunitario anónimo</p>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-3">
              <p className="text-sm font-semibold text-on-surface">
                ¿Alguien en tu hogar tuvo malestar estomacal en la última semana?
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSintomas(true)}
                  className={`min-h-[44px] px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    sintomas === true
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/40'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setSintomas(false)}
                  className={`min-h-[44px] px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    sintomas === false
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-outline-variant/40'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setSintomas(null)}
                  className={`min-h-[44px] px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    sintomas === null
                      ? 'bg-surface-container-highest text-on-surface font-bold'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/40'
                  }`}
                >
                  Prefiero no responder
                </button>
              </div>

              <div className="flex items-start gap-2 pt-1 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] shrink-0 text-primary">info</span>
                <span>Autorreporte, no es un diagnóstico ni prueba de que el agua sea la causa.</span>
              </div>
            </div>

            {/* Aviso de Privacidad Obligatorio */}
            <div className="pt-2 border-t border-surface-container-high flex items-start gap-2.5">
              <input
                id="aviso-check"
                type="checkbox"
                checked={avisoAceptado}
                onChange={(e) => setAvisoAceptado(e.target.checked)}
                className="w-5 h-5 text-primary rounded mt-0.5 focus:ring-secondary shrink-0 cursor-pointer"
              />
              <label htmlFor="aviso-check" className="text-xs text-on-surface-variant leading-relaxed cursor-pointer">
                Entiendo que este reporte es público y anónimo para el semáforo vecinal. <strong>No se guardan coordenadas exactas</strong> ni nombres. No sustituye la solicitud de atención oficial ante el SIAPA.
              </label>
            </div>
          </section>

          {/* Botón de Envío */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Link
              to="/"
              className="w-full sm:w-auto min-h-[50px] px-6 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-sm flex items-center justify-center transition-colors"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={!avisoAceptado || !tipoSeleccionado}
              className={`w-full sm:w-auto min-h-[52px] px-8 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
                avisoAceptado && tipoSeleccionado
                  ? 'bg-primary hover:bg-primary-container text-on-primary cursor-pointer'
                  : 'bg-surface-container-high text-outline cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">send</span>
              <span>Enviar reporte vecinal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

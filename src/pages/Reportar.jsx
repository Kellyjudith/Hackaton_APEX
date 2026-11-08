import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { buscarColoniaPorPunto } from '../utils/geofencing';
import Mensajes from '../components/Mensajes';

export default function Reportar() {
  const navigate = useNavigate();
  const { modoDemo, coloniasPiloto, geojsonData, agregarReporte } = useApp();

  // Estados del formulario
  const [coloniaId, setColoniaId] = useState('oblatos');
  const [tipoCategoria, setTipoCategoria] = useState('calidad'); // 'calidad' | 'falta'
  const [tipoProblema, setTipoProblema] = useState('turbia'); // 'turbia' | 'olor' | 'color' | 'falta_agua'
  const [sintomas, setSintomas] = useState(null); // true | false | null
  const [avisoAceptado, setAvisoAceptado] = useState(true);

  // Estados de geolocalización y mensajes
  const [detectandoGps, setDetectandoGps] = useState(false);
  const [estadoMensaje, setEstadoMensaje] = useState(null); // null | 'fuera_de_zona' | 'ubicacion_no_permitida' | 'limite_48h'
  const [coloniaDetectadaNombre, setColoniaDetectadaNombre] = useState('Colonia Oblatos, Guadalajara');

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
          // En modo demo aceptamos y asignamos
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const tipoFinal = tipoCategoria === 'falta' ? 'falta_agua' : tipoProblema;
    const hoy = new Date().toISOString().split('T')[0];

    const nuevo = {
      colonia: coloniaId,
      tipo: tipoFinal,
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
    <div className="w-full pt-20 sm:pt-24 bg-background flex-1">
      <div className="max-w-[760px] mx-auto px-4 sm:px-margin py-4 sm:py-space-xl flex flex-col gap-6">

        {/* Encabezado */}
        <div className="text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">assignment</span>
            <span>Reporte Vecinal Rápido · 3 Pasos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Reportar problema con el agua
          </h1>
          <p className="text-sm sm:text-base text-primary font-medium flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px]">timer</span>
            <span>Solo te tomará 1 minuto. No pedimos nombre ni datos personales.</span>
          </p>
        </div>

        {/* Mensaje de alerta condicional si ocurrió un evento */}
        {estadoMensaje && (
          <Mensajes
            tipo={estadoMensaje}
            onSeleccionarColonia={() => setEstadoMensaje(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* PASO 1: Ubicación */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4 text-left">
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

          {/* PASO 2: Tipo de problema */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-primary-container text-on-primary font-bold text-lg flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-on-surface">¿Qué problema tienes con el agua?</h2>
                <p className="text-xs sm:text-sm text-on-surface-variant">Elige la opción que mejor describa la falla</p>
              </div>
            </div>

            {/* Control segmentado: Calidad vs Falta de agua */}
            <div className="p-1 bg-surface-container rounded-xl flex items-center gap-1 max-w-md">
              <button
                type="button"
                onClick={() => {
                  setTipoCategoria('calidad');
                  if (tipoProblema === 'falta_agua') setTipoProblema('turbia');
                }}
                className={`flex-1 min-h-[44px] py-1 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  tipoCategoria === 'calidad'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">opacity</span>
                <span>Calidad del agua</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipoCategoria('falta');
                  setTipoProblema('falta_agua');
                }}
                className={`flex-1 min-h-[44px] py-1 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                  tipoCategoria === 'falta'
                    ? 'bg-surface-container-lowest text-falta-agua font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">water_damage</span>
                <span>Falta de agua</span>
              </button>
            </div>

            {/* Opciones de Calidad del Agua */}
            {tipoCategoria === 'calidad' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                  tipoProblema === 'turbia'
                    ? 'bg-primary-fixed/40 border-primary shadow-sm'
                    : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                }`}>
                  <input
                    type="radio"
                    name="tipoProblema"
                    value="turbia"
                    checked={tipoProblema === 'turbia'}
                    onChange={() => setTipoProblema('turbia')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-primary text-[24px]">opacity</span>
                    <span className="font-bold text-base text-on-surface">Se ve turbia</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Aspecto lechoso, arenoso o lodo visible.</p>
                </label>

                <label className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                  tipoProblema === 'olor'
                    ? 'bg-primary-fixed/40 border-primary shadow-sm'
                    : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                }`}>
                  <input
                    type="radio"
                    name="tipoProblema"
                    value="olor"
                    checked={tipoProblema === 'olor'}
                    onChange={() => setTipoProblema('olor')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-tertiary text-[24px]">air</span>
                    <span className="font-bold text-base text-on-surface">Huele mal</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Olor a caño, drenaje, azufre o cloro excesivo.</p>
                </label>

                <label className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                  tipoProblema === 'color'
                    ? 'bg-primary-fixed/40 border-primary shadow-sm'
                    : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                }`}>
                  <input
                    type="radio"
                    name="tipoProblema"
                    value="color"
                    checked={tipoProblema === 'color'}
                    onChange={() => setTipoProblema('color')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-amber-600 text-[24px]">palette</span>
                    <span className="font-bold text-base text-on-surface">Tiene color</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Amarillenta, café oscuro o aspecto oxidado.</p>
                </label>
              </div>
            )}

            {/* Opciones de Falta de Agua */}
            {tipoCategoria === 'falta' && (
              <div className="p-4 rounded-xl bg-falta-agua-bg/40 border border-falta-agua-border flex items-start gap-3">
                <span className="material-symbols-outlined text-falta-agua text-[32px] shrink-0">water_damage</span>
                <div>
                  <h3 className="font-bold text-base text-on-surface">Corte total o baja presión extrema</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 leading-relaxed">
                    No hay suministro en toda la toma domiciliaria o la presión no alcanza a subir al tinaco.
                    Este reporte se contabiliza por separado y no altera el semáforo de calidad.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* PASO 3: Pregunta opcional de salud + Aviso */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4 text-left">
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
              disabled={!avisoAceptado}
              className={`w-full sm:w-auto min-h-[52px] px-8 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
                avisoAceptado
                  ? 'bg-primary hover:bg-primary-container text-on-primary'
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

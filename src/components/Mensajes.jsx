import React from 'react';
import { Link } from 'react-router-dom';

export default function Mensajes({ tipo, onSeleccionarColonia, onReintentar, horasRestantes = 36 }) {
  if (tipo === 'fuera_de_zona') {
    return (
      <article className="bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm flex flex-col gap-space-lg transition-all border border-outline-variant/40">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-md">
          <div className="w-14 h-14 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-tertiary-fixed text-[30px] fill-1">wrong_location</span>
          </div>
          <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-tertiary-fixed/60 text-on-tertiary-fixed font-bold text-xs self-start">
            <span className="material-symbols-outlined text-[18px] text-tertiary">warning</span>
            <span>Aviso · Fuera de cobertura piloto</span>
          </div>
        </div>

        <div className="flex flex-col gap-space-xs text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
            Tu ubicación está fuera de las colonias piloto
          </h2>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Por ahora aceptamos reportes de: Chapalita, Oblatos, Jardines de la Paz, Miravalle, Santa Cecilia, San Rafael, Santa Teresita y Centro.
            {!onSeleccionarColonia && ' Si estás dentro de una de ellas, intenta de nuevo con el GPS activado y al aire libre.'}
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-start gap-space-md pt-space-xs">
          {!onSeleccionarColonia && onReintentar && (
            <button
              type="button"
              onClick={onReintentar}
              className="inline-flex items-center justify-center min-h-[52px] px-space-lg bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary font-semibold text-base rounded-xl shadow-sm transition-all"
            >
              <span className="material-symbols-outlined mr-2 text-[20px]">my_location</span>
              Reintentar con el GPS
            </button>
          )}
          {onSeleccionarColonia && (
            <button
              type="button"
              onClick={onSeleccionarColonia}
              className="inline-flex items-center justify-center min-h-[52px] px-space-lg bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary font-semibold text-base rounded-xl shadow-sm transition-all"
            >
              <span className="material-symbols-outlined mr-2 text-[20px]">location_city</span>
              Elegir mi colonia manualmente
            </button>
          )}
          <Link
            to="/"
            className="inline-flex items-center justify-center min-h-[52px] px-space-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-base rounded-xl transition-colors"
          >
            Volver al mapa
          </Link>
        </div>
      </article>
    );
  }

  if (tipo === 'limite_48h') {
    return (
      <article className="bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm flex flex-col gap-space-lg transition-all border border-outline-variant/40">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-md">
          <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[30px] fill-1">schedule</span>
          </div>
          <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-primary-fixed/60 text-primary font-bold text-xs self-start">
            <span className="material-symbols-outlined text-[18px] text-primary">info</span>
            <span>Control cívico · Registro activo</span>
          </div>
        </div>

        <div className="flex flex-col gap-space-xs text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
            Ya enviaste un reporte recientemente
          </h2>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Podrás enviar otro reporte en aproximadamente {horasRestantes} horas. Así evitamos registros duplicados y protegemos la calidad de los datos cívicos.
          </p>
        </div>

        <div className="p-space-md bg-surface-container-low rounded-lg flex items-center gap-space-md">
          <span className="material-symbols-outlined text-secondary text-[24px]">timelapse</span>
          <div className="flex flex-col text-left">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant font-bold">Próxima habilitación</span>
            <span className="text-base font-medium text-on-surface">Recepción automática en {horasRestantes} horas</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-space-md pt-space-xs">
          <Link
            to="/"
            className="inline-flex items-center justify-center min-h-[52px] px-space-lg bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary font-semibold text-base rounded-xl shadow-sm transition-all"
          >
            <span className="material-symbols-outlined mr-2 text-[20px]">map</span>
            Volver al mapa
          </Link>
        </div>
      </article>
    );
  }

  // Permiso de geolocalización desactivado / denegado
  return (
    <article className="bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm flex flex-col gap-space-lg transition-all border border-outline-variant/40">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-md">
        <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-surface-variant text-[30px] fill-1">location_off</span>
        </div>
        <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold text-xs self-start">
          <span className="material-symbols-outlined text-[18px]">lock</span>
          <span>Permiso de ubicación · No otorgado</span>
        </div>
      </div>

      <div className="flex flex-col gap-space-xs text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
          No pudimos detectar tu ubicación automáticamente
        </h2>
        <p className="text-base text-on-surface-variant leading-relaxed">
          {onSeleccionarColonia
            ? 'Para ubicar tu reporte puedes habilitar la ubicación en tu navegador o seleccionar tu colonia directamente con un toque de la lista de colonias piloto.'
            : 'Para evitar reportes falsos necesitamos verificar que estás en una colonia piloto. Activa el permiso de ubicación en tu navegador (toca el candado junto a la dirección → Ubicación → Permitir) y vuelve a intentarlo.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-space-md pt-space-xs">
        {!onSeleccionarColonia && onReintentar && (
          <button
            type="button"
            onClick={onReintentar}
            className="inline-flex items-center justify-center min-h-[52px] px-space-lg bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary font-semibold text-base rounded-xl shadow-sm transition-all"
          >
            <span className="material-symbols-outlined mr-2 text-[20px]">my_location</span>
            Reintentar con el GPS
          </button>
        )}
        {onSeleccionarColonia && (
          <button
            type="button"
            onClick={onSeleccionarColonia}
            className="inline-flex items-center justify-center min-h-[52px] px-space-lg bg-primary hover:bg-primary-container active:scale-[0.99] text-on-primary font-semibold text-base rounded-xl shadow-sm transition-all"
          >
            <span className="material-symbols-outlined mr-2 text-[20px]">touch_app</span>
            Seleccionar colonia manualmente
          </button>
        )}
        <Link
          to="/"
          className="inline-flex items-center justify-center min-h-[52px] px-space-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-base rounded-xl transition-colors"
        >
          Volver al mapa
        </Link>
      </div>
    </article>
  );
}

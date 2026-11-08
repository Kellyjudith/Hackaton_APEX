import React from 'react';
import { Link } from 'react-router-dom';

export default function Ayuda() {
  return (
    <div className="w-full pt-28 sm:pt-32 bg-background flex-1 text-left">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-margin-desktop py-6 sm:py-space-xl flex flex-col gap-8">

        {/* Encabezado */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-6 sm:p-space-xl shadow-sm border border-outline-variant/30">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-surface-container-highest px-3 py-1 rounded-full text-xs font-bold text-on-surface uppercase tracking-wider w-fit">
              <span className="material-symbols-outlined text-[18px] text-primary fill-1">help</span>
              <span>Guía de uso ciudadano</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
              Centro de ayuda y dudas frecuentes
            </h1>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Todo lo que necesitas saber sobre cómo funciona AguaClara de forma clara, accesible y transparente.
            </p>
          </div>
        </div>

        {/* Accesos directos rápidos */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="#semaforo-detallado"
            className="group bg-surface-container-lowest p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-outline-variant/30 flex flex-col justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">traffic</span>
              </div>
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-0.5">Guía visual</span>
                <h2 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                  ¿Qué significa cada color del semáforo?
                </h2>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Conoce cómo se clasifican los reportes vecinales en verde, ámbar, rojo o gris.
            </p>
            <span className="text-xs font-bold text-primary inline-flex items-center gap-1">
              <span>Ver explicación</span>
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            </span>
          </a>

          <a
            href="#tres-pasos"
            className="group bg-surface-container-lowest p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-outline-variant/30 flex flex-col justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">touch_app</span>
              </div>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-0.5">Sin registros</span>
                <h2 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                  ¿Cómo hacer un reporte en 3 pasos?
                </h2>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              En menos de un minuto, sin trámites, sin contraseñas y sin recopilar datos personales.
            </p>
            <span className="text-xs font-bold text-primary inline-flex items-center gap-1">
              <span>Aprender los pasos</span>
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            </span>
          </a>

          <a
            href="#diferencia-siapa"
            className="group bg-surface-container-lowest p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-outline-variant/30 flex flex-col justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">balance</span>
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-0.5">Claridad total</span>
                <h2 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                  Diferencia entre AguaClara y SIAPA
                </h2>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Conoce la distinción entre reporte colectivo ciudadano y reporte oficial de atención domiciliaria.
            </p>
            <span className="text-xs font-bold text-primary inline-flex items-center gap-1">
              <span>Ver comparativa</span>
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
            </span>
          </a>
        </section>

        {/* Sección 1: El Semáforo */}
        <section id="semaforo-detallado" className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
          <div className="border-b border-surface-container-high pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">1. ¿Cómo se calcula el semáforo de colonias?</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              El semáforo se calcula evaluando los reportes ciudadanos recibidos durante los últimos <strong>30 días</strong>, normalizados por cada 1,000 viviendas de cada colonia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] flex items-start gap-3">
              <span className="material-symbols-outlined text-[#16A34A] text-[28px] shrink-0">check_circle</span>
              <div>
                <h3 className="font-bold text-sm text-[#14532D]">Pocos reportes (Verde)</h3>
                <p className="text-xs text-[#14532D] mt-0.5 leading-relaxed">
                  Menos de 1.5 reportes por cada 1,000 viviendas en los últimos 30 días. Indica actividad comunitaria habitual sin acumulación crítica de reportes.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FEF3C7] border border-[#FCD34D] flex items-start gap-3">
              <span className="material-symbols-outlined text-[#D97706] text-[28px] shrink-0">warning_amber</span>
              <div>
                <h3 className="font-bold text-sm text-[#78350F]">Reportes moderados (Ámbar)</h3>
                <p className="text-xs text-[#78350F] mt-0.5 leading-relaxed">
                  Entre 1.5 y 3.5 reportes por cada 1,000 viviendas. Sugiere una concentración inusual de quejas por agua turbia, olor o color en la colonia.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] flex items-start gap-3">
              <span className="material-symbols-outlined text-[#DC2626] text-[28px] shrink-0">report</span>
              <div>
                <h3 className="font-bold text-sm text-[#7F1D1D]">Muchos reportes (Rojo)</h3>
                <p className="text-xs text-[#7F1D1D] mt-0.5 leading-relaxed">
                  3.5 o más reportes por cada 1,000 viviendas. Denota un problema vecinal extendido y persistente que amerita atención comunitaria prioritaria.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] flex items-start gap-3">
              <span className="material-symbols-outlined text-[#64748B] text-[28px] shrink-0">help</span>
              <div>
                <h3 className="font-bold text-sm text-[#334155]">Sin datos suficientes (Gris)</h3>
                <p className="text-xs text-[#334155] mt-0.5 leading-relaxed">
                  Menos de 3 reportes recibidos en la ventana de 30 días, o falta de dato censal de viviendas. No se asigna color para evitar clasificaciones apresuradas.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-surface-container-low rounded-xl text-xs text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">info</span>
            <p>
              <strong>Regla fundamental:</strong> El semáforo <strong>indica el nivel de reportes ciudadanos</strong>, no la calidad del agua ni su potabilidad de laboratorio. Los tipos que entran al semáforo son exclusivamente turbia, olor y color. La falta de agua se registra y visualiza de forma independiente.
            </p>
          </div>
        </section>

        {/* Sección 2: Los 3 pasos para reportar */}
        <section id="tres-pasos" className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
          <div className="border-b border-surface-container-high pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">2. ¿Cómo reportar en 3 pasos?</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Diseñado para que cualquier persona en Guadalajara pueda registrar un reporte desde su teléfono en 1 minuto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 bg-surface-container-low rounded-xl flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center">1</div>
              <h3 className="font-bold text-sm text-on-surface">Ubicación territorial</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Usa tu GPS para detectar automáticamente tu colonia o elígela con un toque de entre las 8 colonias piloto de Guadalajara.
              </p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center">2</div>
              <h3 className="font-bold text-sm text-on-surface">Tipo de falla</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Elige la opción que mejor describa la situación: si el agua sale turbia, huele mal, tiene color raro o si hay falta total de suministro.
              </p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center">3</div>
              <h3 className="font-bold text-sm text-on-surface">Salud opcional y envío</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Responde de forma opcional si alguien en tu casa tuvo malestar estomacal. Acepta el aviso cívico y envía tu reporte de forma anónima.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 3: SIAPA vs AguaClara */}
        <section id="diferencia-siapa" className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
          <div className="border-b border-surface-container-high pb-3">
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">3. Diferencia entre AguaClara y el canal oficial del SIAPA</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              AguaClara no sustituye ni compite con el SIAPA; son herramientas con objetivos distintos y complementarios.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface font-bold uppercase text-[11px] tracking-wider border-b border-surface-container-high">
                  <th className="py-2.5 px-3">Aspecto</th>
                  <th className="py-2.5 px-3">SIAPA Oficial (Bot / SIAPATEL)</th>
                  <th className="py-2.5 px-3">AguaClara Jalisco</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high text-xs sm:text-sm">
                <tr>
                  <td className="py-2.5 px-3 font-bold">Tipo de reporte</td>
                  <td className="py-2.5 px-3">Individual, genera folio domiciliario</td>
                  <td className="py-2.5 px-3">Anónimo, colectivo y agregado por colonia</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Datos requeridos</td>
                  <td className="py-2.5 px-3">Nombre, teléfono, domicilio exacto y cuenta</td>
                  <td className="py-2.5 px-3">Ningún dato personal ni coordenadas exactas</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Visibilidad para el vecino</td>
                  <td className="py-2.5 px-3">No muestra cuántos vecinos tienen el mismo problema</td>
                  <td className="py-2.5 px-3">Muestra el nivel de reportes en el mapa de tu colonia</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold">Canal directo oficial</td>
                  <td className="py-2.5 px-3 font-semibold text-green-700">WhatsApp: 33 5164 4440 / Tel: 073</td>
                  <td className="py-2.5 px-3 text-primary">Plataforma cívica independiente</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

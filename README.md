# AguaClara Jalisco

Plataforma ciudadana de reportes de calidad del agua con **semáforo por colonia** y registro público de atención de la autoridad.
Proyecto del **Hackathon Jalisco Internacional 2026 · Reto 01: Ciudades Inteligentes (agua)**. Piloto: 8 colonias de Guadalajara
(Chapalita, Oblatos, Jardines de la Paz, Miravalle, Santa Cecilia, San Rafael, Santa Teresita y Centro).

- **Aplicación en línea:** https://hackaton-apex.vercel.app
- **Código fuente:** https://github.com/Kellyjudith/Hackaton_APEX.git

> **Importante:** el semáforo mide la *cantidad de reportes vecinales* por cada 1,000 viviendas, **no la calidad fisicoquímica del agua**.
> Los reportes **no se envían al SIAPA ni a ninguna autoridad**. Los reportes del modo demostración son **simulados**.

## Qué hace

| Sección | Ruta | Descripción |
|---|---|---|
| Mapa | `/` | Mapa de las 8 colonias con semáforo, tarjeta de colonia, último reporte y atención registrada |
| Reportar | `/reportar` | Reporte anónimo (problema + colonia por botón, mapa o GPS opcional). Límite de 1 reporte cada 48 h |
| Confirmación | `/confirmacion` | Resumen del reporte y canales oficiales (el reporte no se envía al SIAPA) |
| Ficha de colonia | `/colonia/:id` | Indicadores, gráficas, actividad reciente, actualizaciones de la autoridad, CSV |
| Informe | `/informe` | Informe imprimible (PDF desde el navegador) |
| Panel de consulta | `/autoridades` | Vista de solo lectura para quien prioriza inspecciones |
| Ayuda | `/ayuda` | Preguntas frecuentes, privacidad y limitaciones |
| Portal de autoridades (demostración) | `/panel/acceso`, `/panel`, `/panel/nueva`, `/panel/bitacora` | Registro público de acciones atendidas, con comparación antes/después |

## Cómo probar el proyecto

### Opción A · Sin instalar nada (recomendada)

1. Abrir https://hackaton-apex.vercel.app (funciona en computadora y celular; se puede instalar como app).
2. Activar **Modo demostración** con el botón de la barra superior: carga reportes simulados y actualizaciones de ejemplo.
3. Recorrer: Mapa → tocar una colonia → *Ver ficha completa y gráficas* → *Informe*; y *Reportar* para enviar un reporte.

### Opción B · En local

Requisitos: **Node.js 18 o superior** y npm.

```bash
git clone https://github.com/Kellyjudith/Hackaton_APEX.git
cd Hackaton_APEX
npm install
npm run dev        # abre http://localhost:5173
```

Para generar la versión de producción: `npm run build` (la salida queda en `dist/`) y `npm run preview`.

**Sin variables de entorno** la app funciona en *modo local*: los reportes se guardan solo en el navegador y el modo demostración
funciona completo. El **portal de autoridades** necesita Firebase y mostrará un aviso de que no está configurado.

Para conectar Firebase: copiar `.env.example` como `.env` y completar los valores del proyecto (`VITE_FIREBASE_*`).
El archivo `.env` está en `.gitignore` y **no se sube al repositorio**.

### Portal de autoridades (credenciales)

Las cuentas de autoridad **no se crean en la app**: se crean manualmente en Firebase Authentication y se autorizan en la colección
`autoridades` (documento con el UID de la cuenta). Por seguridad las credenciales de la cuenta de prueba **no se publican**
en este repositorio ni en documentos públicos; se entregan al jurado por separado si las solicita.

### Reglas de Firestore

Las reglas están en `firestore.rules` (lectura pública de reportes y actualizaciones; creación validada; sin edición ni borrado;
escritura de actualizaciones solo para cuentas autorizadas). Se publican desde la consola de Firebase.

## Tecnologías

React 18 · Vite 5 · Tailwind CSS 3 · react-router-dom 6 · Leaflet / react-leaflet (OpenStreetMap) · Turf (punto en polígono) ·
Recharts · PapaParse · Firebase (Auth y Firestore) · Vercel · PWA (manifest y service worker).

## Estructura

```
src/                  Código de la aplicación (pages, components, context, utils, firebase)
public/data/          Datos: colonias.geojson, viviendas.json, riesgo.json, reportes_demo.json, actualizaciones_demo.json
scripts/              Scripts para generar los datos de demostración
salidas/              Archivos de apoyo del procesamiento de datos
firestore.rules       Reglas de seguridad de Firestore
docs/                 Kit del reto
diseno/, diseno-panel/  Diseños de pantallas (Google Stitch)
```

## Reglas del semáforo

`tasa ajustada = reportes de calidad (30 días) ÷ viviendas × 1,000 × factor de riesgo`

- Ventana de 30 días; mínimo de 3 reportes (si no, estado gris "Sin datos suficientes").
- Factor de riesgo: alto 1.5 · medio 1.25 · bajo 1.0.
- Umbrales: ámbar desde 1.5 · rojo desde 3.5 (por calibrar con reportes reales).
- La falta de agua se muestra aparte y no entra al semáforo.

## Datos

| Fuente | Uso |
|---|---|
| Dataset 01 · INEGI, Censo de Población y Vivienda 2020 (manzanas) | Viviendas por colonia (denominador) y viviendas sin agua entubada |
| Dataset 05 · CENAPRED, Atlas Nacional de Riesgos | Indicador **municipal** de peligro por inundación (igual para las 8 colonias: no las distingue entre sí) |
| IIEG Jalisco | Polígonos de las colonias |
| Reportes de demostración | **Simulados**: se generan con `scripts/generar_reportes_demo.py` a partir de las viviendas reales |

## Privacidad

Sin cuentas ciudadanas, sin fotos, sin coordenadas guardadas y sin datos personales: solo colonia, tipo de problema y fecha
(y la respuesta de salud opcional, que se muestra únicamente con 10 o más respuestas).

## Limitaciones

- El semáforo refleja reportes vecinales; no verifica calidad del agua ni la atención oficial.
- Se puede elegir una colonia sin estar físicamente en ella.
- El riesgo es municipal y no distingue entre colonias.
- El portal de autoridades es una demostración (cuentas manuales, sin convenio ni verificación institucional).
- La comparación antes/después es descriptiva y no prueba causalidad.

## Declaración de uso de inteligencia artificial

Se usaron Claude, Antigravity y Google Stitch como apoyo para diseño, redacción y programación. El equipo revisó y validó el resultado.

\# CORRECCIONES (prevalecen sobre cualquier otro documento)



1\. SIN fotos, SIN Supabase, SIN Firebase Storage. El formulario es de 3 pasos: ubicación, tipo, pregunta opcional de malestar.

2\. NO se guardan coordenadas. Solo existen: reportes\_publicos {colonia, tipo, sintomas(true|false|null), fecha, simulado} y limites/{uid}. Reglas de Firestore: lectura pública; create solo con campos válidos (hasOnly), colonia dentro de las 8 piloto, sin update ni delete; limites solo de su propio uid con 48 h. Nunca reglas en modo prueba.

3\. config.js: VENTANA\_DIAS 30, MIN\_REPORTES 3, UMBRAL\_AMARILLO 1.5, UMBRAL\_ROJO 3.5, FACTOR\_RIESGO {alto:1.5, medio:1.25, bajo:1.0, sin\_dato:1.0}, MARGEN\_GEOFENCE\_METROS 75, LIMITE\_HORAS 48, MIN\_RESPUESTAS\_SALUD 10, TIPOS\_CALIDAD \['turbia','olor','color']. falta\_agua se muestra aparte, fuera del semáforo.

4\. Datasets: 01 (viviendas por colonia) y 05 (riesgo). Archivos viviendas.json y riesgo.json, ambos PROVISIONALES (marcados como "provisional" en código y UI) hasta que se reemplacen con datos reales.

5\. Datos demo: 109 reportes con la distribución de CONTEXTO.md (Oblatos 38, Santa Cecilia 29, Jardines de la Paz 16, Miravalle 14, Centro 5, Santa Teresita 4, Chapalita 3, San Rafael 0) y serie semanal 8,10,12,15,22,25,27,35. Todo con simulado:true y banner "Prototipo con datos de demostración".

6\. Páginas (9 pantallas de /diseno): Home (Mapa|Lista), Reportar, Confirmacion, Colonia, Informe, Autoridades (/autoridades), Ayuda y components/Mensajes. Se usa Colonia.jsx.

7\. /autoridades es SOLO LECTURA: filtros, orden y "Exportar CSV". Prohibido: "Marcar como resuelto", "Atender", "Asignar", "Responder".

8\. "Ya lo envié" se guarda en localStorage (fecha + días transcurridos).

9\. Salud: porcentaje solo con ≥10 respuestas; si no, "Datos insuficientes". Aviso fijo: "Autorreporte, no es un diagnóstico ni prueba de que el agua sea la causa".

10\. Quita del texto de la app: "tiempo real", "privacidad diferencial", "costo $0".

11\. Modo demostración con el banner "MODO DEMOSTRACIÓN: la ubicación y el límite de 48 h no se validan".

12\. Orden de trabajo (entrega lunes 9 de nov): Fase 1+2 con datos demo → deploy preliminar en Vercel → Firebase → pruebas en celular → PWA al final.

13\. Nunca subas credenciales: .env en .gitignore, solo .env.example.

14\. Los PDFs de /docs son solo referencia. No los uses como fuente de diseño ni de reglas.


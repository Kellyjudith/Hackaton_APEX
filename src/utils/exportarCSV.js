import Papa from 'papaparse';

/**
 * Descarga una lista de objetos como archivo CSV en el navegador.
 * @param {Array} datos - Arreglo de objetos a exportar
 * @param {string} nombreArchivo - Nombre del archivo a descargar (ej: 'reporte_oblatos.csv')
 */
export function descargarCSV(datos, nombreArchivo = 'aguaclara_evidencia.csv') {
  if (!datos || datos.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const csv = Papa.unparse(datos);
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', nombreArchivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

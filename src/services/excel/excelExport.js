import XLSX from 'xlsx-js-style';
import { buildRequerimientoSheet } from './buildRequerimientoSheet';
import { buildHorariosSheet } from './buildHorariosSheet';

export function generarExpedienteCompletoExcel({
  docenteInfo,
  programas,
  asignacionesHorarios,
  sesionesHorarios
}) {
  const workbook = XLSX.utils.book_new();

  // Hoja 1: Requerimiento de Contratación
  const wsRequerimiento = buildRequerimientoSheet({ docenteInfo, programas });
  XLSX.utils.book_append_sheet(workbook, wsRequerimiento, 'Requerimiento');

  // Hoja 2: Detalle de Horarios Semanales y Sesiones
  const wsHorarios = buildHorariosSheet({
    asignaciones: asignacionesHorarios,
    sesiones: sesionesHorarios
  });
  XLSX.utils.book_append_sheet(workbook, wsHorarios, 'Horarios');

  const nombreSanitizado = (docenteInfo.nombreCompleto || 'Docente').replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(workbook, `Requerimiento_${nombreSanitizado}.xlsx`);
}
import XLSX from 'xlsx-js-style';
import { buildRequerimientoSheet } from './buildRequerimientoSheet';
import { buildHorariosSheet } from './buildHorariosSheet';

/**
 * Genera y descarga el archivo consolidado con ambas hojas:
 * Hoja 1: Requerimiento de Contratación Docente
 * Hoja 2: Detalle de Horarios Semanales, Sesiones Efectivas y Control de Carga Horaria
 */
export function generarExpedienteCompletoExcel({
  docenteInfo,
  programas,
  asignacionesHorarios,
  sesionesHorarios
}) {
  const workbook = XLSX.utils.book_new();

  // 1. Hoja 1: Requerimiento de Contratación
  if (docenteInfo && programas && programas.length > 0) {
    const wsRequerimiento = buildRequerimientoSheet({ docenteInfo, programas });
    XLSX.utils.book_append_sheet(workbook, wsRequerimiento, 'Requerimiento');
  }

  // 2. Hoja 2: Detalle de Horarios y Control de Carga Horaria
  const wsHorarios = buildHorariosSheet({
    docenteInfo,
    asignaciones: asignacionesHorarios,
    sesiones: sesionesHorarios
  });
  XLSX.utils.book_append_sheet(workbook, wsHorarios, 'Horarios');

  // Descarga del archivo
  const nombreSanitizado = (docenteInfo?.nombreCompleto || 'Docente').replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(workbook, `Requerimiento_${nombreSanitizado}.xlsx`);
}

/**
 * Descarga únicamente la hoja de horarios
 */
export function exportarSoloHorariosExcel({ docenteNombre, docenteInfo, asignaciones, sesiones }) {
  const workbook = XLSX.utils.book_new();
  const wsHorarios = buildHorariosSheet({
    docenteInfo: docenteInfo || { nombreCompleto: docenteNombre },
    asignaciones,
    sesiones
  });
  XLSX.utils.book_append_sheet(workbook, wsHorarios, 'Horarios');

  const sanitized = (docenteNombre || docenteInfo?.nombreCompleto || 'Docente').replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(workbook, `Horarios_${sanitized}.xlsx`);
}
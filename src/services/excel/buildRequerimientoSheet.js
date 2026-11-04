import XLSX from 'xlsx-js-style';
import {
  FUNCION_COORDINADOR_DEFAULT,
  FUNCION_DOCENTE_DEFAULT,
  esCargoCoordinador
} from '../../const/academico';
import { calcularPeriodoGlobal, formatearRangoFechasTexto } from '../../utils/dateUtils';

const round2 = (n) => Math.round(n * 100) / 100;

const borderThin = {
  top: { style: 'thin', color: { rgb: '000000' } },
  bottom: { style: 'thin', color: { rgb: '000000' } },
  left: { style: 'thin', color: { rgb: '000000' } },
  right: { style: 'thin', color: { rgb: '000000' } }
};

const STYLES = {
  headerSection: {
    fill: { fgColor: { rgb: 'D9E1F2' } },
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: borderThin
  },
  headerSub: {
    fill: { fgColor: { rgb: 'D9E1F2' } },
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: borderThin
  },
  label: {
    font: { name: 'Calibri', sz: 10, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: borderThin
  },
  valueText: {
    font: { name: 'Calibri', sz: 10, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: borderThin
  },
  valueWrapped: {
    font: { name: 'Calibri', sz: 10, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    border: borderThin
  },
  valueEmail: {
    font: { name: 'Calibri', sz: 10, color: { rgb: '0563C1' }, underline: true },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: borderThin
  },
  resumenLabel: {
    font: { name: 'Calibri', sz: 10, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: borderThin
  },
  resumenValue: {
    font: { name: 'Calibri', sz: 10, color: { rgb: '000000' } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: borderThin
  },
  resumenTotalLabel: {
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: borderThin
  },
  resumenTotalValue: {
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: borderThin
  }
};

const esProgramaDiplomado = (prog) =>
  prog.tipo === 'DIPLOMADO' || Boolean(prog.nombre?.toUpperCase().includes('DIPLOMADO'));

/**
 * Cálculo único de tarifa/subtotal por asignación.
 * Prioridad: Coordinador > Diplomado > Tiempo Integral > Maestría estándar.
 */
function calcularPagoAsignacion({ asig, prog, docenteInfo }) {
  const horas = Number(asig.cantidadHoras) || 0;
  const pagoHoraBase = Number(docenteInfo.pagoPorHora) || 0;
  const esCoordinador = esCargoCoordinador(asig.cargo);
  const esDiplomado = esProgramaDiplomado(prog);
  const esTiempoIntegral = docenteInfo.tipoContratacion === 'TIEMPO INTEGRAL';

  if (esCoordinador) {
    const valorHora = Number(asig.pagoPorHora) || pagoHoraBase;
    return { tipo: 'COORDINADOR', horas, valorHora, subtotal: round2(horas * valorHora) };
  }
  if (esDiplomado) {
    const factor = Number(prog.factorSobrecupo) || 1.0;
    const valorHora = round2(pagoHoraBase * factor);
    return { tipo: 'DIPLOMADO', horas, valorHora, subtotal: round2(horas * valorHora) };
  }
  if (esTiempoIntegral) {
    const sueldo = Number(docenteInfo.sueldoNominal) || 0;
    const porcentaje = (Number(docenteInfo.porcentajePago) || 13) / 100;
    const meses = Number(docenteInfo.cantidadMeses) || 1;
    return { tipo: 'INTEGRAL', horas, valorHora: null, subtotal: round2(sueldo * porcentaje * meses) };
  }
  return { tipo: 'ESTANDAR', horas, valorHora: pagoHoraBase, subtotal: round2(horas * pagoHoraBase) };
}

export function buildRequerimientoSheet({ docenteInfo = {}, programas = [] }) {
  const worksheet = {};
  const merges = [];
  const rowsHeight = [];
  let maxRow = 0;
  let maxCol = 5;

  function setCell(r, c, val, style) {
    if (r > maxRow) maxRow = r;
    if (c > maxCol) maxCol = c;
    const cellRef = XLSX.utils.encode_cell({ r, c });
    let cellType = 's';
    if (typeof val === 'number') cellType = 'n';
    else if (typeof val === 'boolean') cellType = 'b';
    worksheet[cellRef] = { t: cellType, v: val ?? '', s: style || {} };
  }

  worksheet['!cols'] = [
    { wch: 4 }, { wch: 32 }, { wch: 65 }, { wch: 4 }, { wch: 34 }, { wch: 16 }
  ];

  // ---------- 1. INFORMACIÓN DEL DOCENTE ----------
  merges.push({ s: { r: 2, c: 1 }, e: { r: 2, c: 2 } });
  setCell(2, 1, 'REQUERIMIENTO DE CONTRATACIÓN', STYLES.headerSection);
  setCell(2, 2, '', STYLES.headerSection);
  setCell(3, 1, 'ITEM', STYLES.headerSub);
  setCell(3, 2, 'DETALLE', STYLES.headerSub);

  const esTiempoIntegral = docenteInfo.tipoContratacion === 'TIEMPO INTEGRAL';

  const infoDocenteFilas = [
    ['TIPO DE CONTRATO', docenteInfo.tipoContrato || 'SERVICIOS PROFESIONALES NO PERSONALES'],
    ['TIPO DE CONTRATACION', docenteInfo.tipoContratacion || 'TIEMPO NORMAL'],
    ['NOMBRE DEL CONTRATADO', (docenteInfo.nombreCompleto || '').toUpperCase()],
    ['PROFESION', (docenteInfo.profesion || '').toUpperCase()],
    ['NACIONALIDAD', (docenteInfo.nacionalidad || '').toUpperCase()],
    ['CORREO ELECTRONICO', (docenteInfo.correo || '').toLowerCase()],
    ['MODALIDAD DE SERVICIO', (docenteInfo.modalidadServicio || 'EN LINEA').toUpperCase()],
    ['PERIODO', calcularPeriodoGlobal(programas)]
  ];

  if (esTiempoIntegral) {
    infoDocenteFilas.push(['SUELDO NOMINAL', Number(docenteInfo.sueldoNominal) || 0]);
    infoDocenteFilas.push(['PORCENTAJE A PAGAR', `${Number(docenteInfo.porcentajePago) || 13}%`]);
    infoDocenteFilas.push(['CANTIDAD DE MESES', Number(docenteInfo.cantidadMeses) || 1]);
  } else {
    infoDocenteFilas.push(['CALIFICACIÓN DOCENTE', (docenteInfo.calificacionDocente || 'F1').toUpperCase()]);
    infoDocenteFilas.push(['PAGO POR HORA', Number(docenteInfo.pagoPorHora) || 0]);
  }

  infoDocenteFilas.forEach(([lbl, val], i) => {
    const r = 4 + i;
    setCell(r, 1, lbl, STYLES.label);
    setCell(r, 2, val, lbl === 'CORREO ELECTRONICO' ? STYLES.valueEmail : STYLES.valueText);
  });

  // ---------- 2. RESUMEN DE PAGO ----------
  merges.push({ s: { r: 2, c: 4 }, e: { r: 2, c: 5 } });
  setCell(2, 4, 'RESUMEN DE PAGO', STYLES.headerSection);
  setCell(2, 5, '', STYLES.headerSection);

  let resumenRow = 3;
  let totalMontoGeneral = 0;

  programas.forEach((prog, pIdx) => {
    (prog.asignaciones || []).forEach((asig, aIdx) => {
      const { subtotal } = calcularPagoAsignacion({ asig, prog, docenteInfo });
      totalMontoGeneral += subtotal;
      setCell(resumenRow, 4, `PROGRAMA ${pIdx + 1} - ASIGNACION ${aIdx + 1}`, STYLES.resumenLabel);
      setCell(resumenRow, 5, subtotal, STYLES.resumenValue);
      resumenRow++;
    });
  });

  setCell(resumenRow, 4, 'TOTAL', STYLES.resumenTotalLabel);
  setCell(resumenRow, 5, round2(totalMontoGeneral), STYLES.resumenTotalValue);

  // ---------- 3. PROGRAMAS Y ASIGNACIONES ----------
  let currentRow = Math.max(14, resumenRow + 1) + 2;

  const pushFila = (lbl, val, style = STYLES.valueText) => {
    setCell(currentRow, 1, lbl, STYLES.label);
    setCell(currentRow, 2, val, style);
    currentRow++;
  };

  const pushTitulo = (texto) => {
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
    setCell(currentRow, 1, texto, STYLES.headerSection);
    setCell(currentRow, 2, '', STYLES.headerSection);
    currentRow++;
  };

  programas.forEach((prog, pIdx) => {
    const esDiplomado = esProgramaDiplomado(prog);

    pushTitulo(`PROGRAMA ${pIdx + 1}`);
    pushFila('PROGRAMA', (prog.nombre || '').toUpperCase());
    pushFila('SOLICITUD DE APROBACION', prog.solicitudAprobacion || '');
    pushFila('ACUERDO DE APROBACIÓN', prog.acuerdoAprobacion || '');
    pushFila('EDICIÓN/COHORTE', (prog.edicionCohorte || '').toUpperCase());
    pushFila('COORDINADOR', (prog.coordinador || '').toUpperCase());
    if (esDiplomado) pushFila('CLASIFICACION DEL PROYECTO', prog.clasificacionProyecto || 'A');
    pushFila('ALUMNOS INSCRITOS', Number(prog.alumnosInscritos) || 0);
    if (esDiplomado) pushFila('FACTOR DE SOBRECUPO', Number(prog.factorSobrecupo) || 1.0);

    (prog.asignaciones || []).forEach((asig, aIdx) => {
      const esCoordinador = esCargoCoordinador(asig.cargo);
      const pago = calcularPagoAsignacion({ asig, prog, docenteInfo });

      pushTitulo(`ASIGNACIÓN ${aIdx + 1}`);
      pushFila('CARGO', (asig.cargo || '').toUpperCase());

      rowsHeight[currentRow] = { hpt: 48 };
      pushFila(
        'FUNCIONES',
        esCoordinador ? FUNCION_COORDINADOR_DEFAULT : (asig.funciones || FUNCION_DOCENTE_DEFAULT),
        STYLES.valueWrapped
      );

      pushFila('MODULO/CICLO', (asig.moduloCiclo || '').toUpperCase());
      if (!esCoordinador) pushFila('ASIGNATURA', (asig.asignatura || '').toUpperCase());
      pushFila('PERIODO', asig.periodoTexto || formatearRangoFechasTexto(asig.fechaInicio, asig.fechaFin));

      switch (pago.tipo) {
        case 'COORDINADOR':
          pushFila('VALOR POR HORA', pago.valorHora);
          pushFila('CANTIDAD DE HORAS', pago.horas);
          break;
        case 'DIPLOMADO':
          pushFila('CANTIDAD DE HORAS', pago.horas);
          pushFila('VALOR POR HORA', pago.valorHora);
          break;
        default: // INTEGRAL y ESTANDAR
          pushFila('CANTIDAD DE HORAS', pago.horas);
      }
      pushFila('SUBTOTAL', pago.subtotal);
    });

    currentRow++;
  });

  worksheet['!merges'] = merges;
  worksheet['!rows'] = rowsHeight;
  worksheet['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: maxRow, c: maxCol }
  });

  return worksheet;
}
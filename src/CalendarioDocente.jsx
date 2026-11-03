import React, { useState, useMemo, useRef, useEffect } from 'react';
import XLSX from 'xlsx-js-style';

// ==========================================
// 1. ICONOS SVG ESTILIZADOS
// ==========================================
const IconCalendar = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconClock = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconPlus = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
  </svg>
);
const IconEdit = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const IconTrash = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconDownload = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);
const IconUpload = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
  </svg>
);
const IconAlert = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const IconCheck = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);
const IconLayers = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);
const IconX = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ==========================================
// 2. CONSTANTES INSTITUCIONALES (UES)
// ==========================================
const ASUETOS_BASE = {
  // 2026
  '2026-01-01': 'Año Nuevo',
  '2026-03-30': 'Semana Santa', '2026-03-31': 'Semana Santa', '2026-04-01': 'Semana Santa',
  '2026-04-02': 'Semana Santa', '2026-04-03': 'Semana Santa', '2026-04-04': 'Semana Santa', '2026-04-05': 'Semana Santa',
  '2026-05-01': 'Día del Trabajo', '2026-05-10': 'Día de la Madre', '2026-06-17': 'Día del Padre',
  '2026-08-01': 'Vacaciones Agostinas', '2026-08-02': 'Vacaciones Agostinas', '2026-08-03': 'Vacaciones Agostinas',
  '2026-08-04': 'Vacaciones Agostinas', '2026-08-05': 'Vacaciones Agostinas', '2026-08-06': 'Vacaciones Agostinas',
  '2026-08-07': 'Vacaciones Agostinas', '2026-09-15': 'Independencia', '2026-11-02': 'Difuntos', '2026-12-25': 'Navidad',
  // 2027
  '2027-01-01': 'Año Nuevo',
  '2027-03-22': 'Semana Santa', '2027-03-23': 'Semana Santa', '2027-03-24': 'Semana Santa',
  '2027-03-25': 'Semana Santa', '2027-03-26': 'Semana Santa', '2027-03-27': 'Semana Santa', '2027-03-28': 'Semana Santa',
  '2027-05-01': 'Día del Trabajo', '2027-05-10': 'Día de la Madre', '2027-06-17': 'Día del Padre',
  '2027-08-01': 'Vacaciones Agostinas', '2027-08-02': 'Vacaciones Agostinas', '2027-08-03': 'Vacaciones Agostinas',
  '2027-08-04': 'Vacaciones Agostinas', '2027-08-05': 'Vacaciones Agostinas', '2027-08-06': 'Vacaciones Agostinas',
  '2027-08-07': 'Vacaciones Agostinas', '2027-09-15': 'Independencia', '2027-11-02': 'Difuntos', '2027-12-25': 'Navidad'
};

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
  { id: 0, nombre: 'Domingo' }
];

const MESES_ES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

const FUNCION_COORDINADOR_DEFAULT = "Liderar la gestión estratégica y operativa de la maestría mediante la planificación, rendición de cuentas y coordinación de recursos logísticos.";
const FUNCION_DOCENTE_DEFAULT = "Preparar clases, discusiones, impartir clases y discusiones, consulta y atención al estudiante, diseño y administración de exámenes y calificaciones.";

// ==========================================
// 3. UTILIDADES DE FECHAS
// ==========================================
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const formatTime12h = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')}${ampm}`;
};

const formatDateIso = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDateDDMMYYYY = (isoStr) => {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  return `${d}/${m}/${y}`;
};

const getMondayIso = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(dt.setDate(diff));
  return formatDateIso(monday);
};

const parseDate = (dateInput) => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [y, m, d] = dateInput.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateInput)) {
      const [d, m, y] = dateInput.split('/').map(Number);
      return new Date(y, m - 1, d);
    }
  }
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? null : d;
};

const formatearRangoFechasTexto = (fechaInicioInput, fechaFinInput) => {
  const fIni = parseDate(fechaInicioInput);
  const fFin = parseDate(fechaFinInput);
  if (!fIni || !fFin) return '';

  const dIni = fIni.getDate();
  const mIni = MESES_ES[fIni.getMonth()];
  const yIni = fIni.getFullYear();

  const dFin = fFin.getDate();
  const mFin = MESES_ES[fFin.getMonth()];
  const yFin = fFin.getFullYear();

  if (yIni === yFin) {
    if (mIni === mFin) return `${dIni} AL ${dFin} DE ${mFin}`;
    return `${dIni} DE ${mIni} AL ${dFin} DE ${mFin}`;
  }
  return `${dIni} DE ${mIni} DE ${yIni} AL ${dFin} DE ${mFin} DE ${yFin}`;
};

const calcularPeriodoGlobal = (programas) => {
  let minDate = null;
  let maxDate = null;

  programas.forEach((prog) => {
    (prog.asignaciones || []).forEach((asig) => {
      const fIni = parseDate(asig.fechaInicio);
      const fFin = parseDate(asig.fechaFin);
      if (fIni && (!minDate || fIni < minDate)) minDate = fIni;
      if (fFin && (!maxDate || fFin > maxDate)) maxDate = fFin;
    });
  });

  return minDate && maxDate ? formatearRangoFechasTexto(minDate, maxDate) : '';
};

// ==========================================
// 4. GENERADORES DE HOJAS EXCEL
// ==========================================
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
    font: { name: 'Calibri', sz: 10, bold: false, color: { rgb: '000000' } },
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

function buildRequerimientoSheet({ docenteInfo = {}, programas = [] }) {
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
    worksheet[cellRef] = {
      t: cellType,
      v: val !== undefined && val !== null ? val : '',
      s: style || {}
    };
  }

  worksheet['!cols'] = [
    { wch: 4 },  // A
    { wch: 32 }, // B
    { wch: 65 }, // C
    { wch: 4 },  // D
    { wch: 34 }, // E
    { wch: 16 }  // F
  ];

  // 1. TÍTULO GENERAL (CUADRO INFORMACIÓN DEL DOCENTE)
  merges.push({ s: { r: 2, c: 1 }, e: { r: 2, c: 2 } });
  setCell(2, 1, 'REQUERIMIENTO DE CONTRATACIÓN', STYLES.headerSection);
  setCell(2, 2, '', STYLES.headerSection);

  setCell(3, 1, 'ITEM', STYLES.headerSub);
  setCell(3, 2, 'DETALLE', STYLES.headerSub);

  const periodoGeneral = calcularPeriodoGlobal(programas);
  const pagoHoraBase = Number(docenteInfo.pagoPorHora) || 0;

  // Calificación docente y pago por hora van aquí centralizados
  const esTiempoIntegral = docenteInfo.tipoContratacion === 'TIEMPO INTEGRAL';

  const infoDocenteFilas = [
    ['TIPO DE CONTRATO', docenteInfo.tipoContrato || 'SERVICIOS PROFESIONALES NO PERSONALES'],
    ['TIPO DE CONTRATACION', docenteInfo.tipoContratacion || 'TIEMPO NORMAL'],
    ['NOMBRE DEL CONTRATADO', (docenteInfo.nombreCompleto || '').toUpperCase()],
    ['PROFESION', (docenteInfo.profesion || '').toUpperCase()],
    ['NACIONALIDAD', (docenteInfo.nacionalidad || '').toUpperCase()],
    ['CORREO ELECTRONICO', (docenteInfo.correo || '').toLowerCase()],
    ['MODALIDAD DE SERVICIO', (docenteInfo.modalidadServicio || 'EN LINEA').toUpperCase()],
    ['PERIODO', periodoGeneral]
  ];

  if (esTiempoIntegral) {
    infoDocenteFilas.push(['SUELDO NOMINAL', Number(docenteInfo.sueldoNominal) || 0]);
    infoDocenteFilas.push(['PORCENTAJE A PAGAR', `${Number(docenteInfo.porcentajePago) || 13}%`]);
    infoDocenteFilas.push(['CANTIDAD DE MESES', Number(docenteInfo.cantidadMeses) || 1]);
  } else {
    infoDocenteFilas.push(['CALIFICACIÓN DOCENTE', (docenteInfo.calificacionDocente || 'F1').toUpperCase()]);
    infoDocenteFilas.push(['PAGO POR HORA', pagoHoraBase]);
  }

  infoDocenteFilas.forEach((fila, i) => {
    const r = 4 + i;
    const esEmail = fila[0] === 'CORREO ELECTRONICO';
    setCell(r, 1, fila[0], STYLES.label);
    setCell(r, 2, fila[1], esEmail ? STYLES.valueEmail : STYLES.valueText);
  });

  // 2. RESUMEN DE PAGO (Col E y F)
  merges.push({ s: { r: 2, c: 4 }, e: { r: 2, c: 5 } });
  setCell(2, 4, 'RESUMEN DE PAGO', STYLES.headerSection);
  setCell(2, 5, '', STYLES.headerSection);

  let resumenRow = 3;
  let totalMontoGeneral = 0;

  programas.forEach((prog, pIdx) => {
    const esDiplomado = prog.tipo === 'DIPLOMADO' || prog.nombre?.toUpperCase().includes('DIPLOMADO');
    const factorProg = Number(prog.factorSobrecupo) || 1.0;

    (prog.asignaciones || []).forEach((asig, aIdx) => {
      const esCoordinador = asig.cargo?.toUpperCase().includes('COORDINAD');
      let subtotal = 0;

      if (esCoordinador) {
        // Coordinación toma su propio valor por hora específico
        const tarifaCoord = Number(asig.pagoPorHora) || pagoHoraBase;
        subtotal = (Number(asig.cantidadHoras) || 0) * tarifaCoord;
      } else if (esDiplomado) {
        const valorHora = Math.round(pagoHoraBase * factorProg * 100) / 100;
        subtotal = Math.round((Number(asig.cantidadHoras) || 0) * valorHora * 100) / 100;
      } else if (esTiempoIntegral) {
        // Fórmula Tiempo Integral: Sueldo * Porcentaje * Meses
        const sueldo = Number(docenteInfo.sueldoNominal) || 0;
        const porcentaje = (Number(docenteInfo.porcentajePago) || 13) / 100;
        const meses = Number(docenteInfo.cantidadMeses) || 1;
        subtotal = Math.round(sueldo * porcentaje * meses * 100) / 100;
      } else {
        subtotal = (Number(asig.cantidadHoras) || 0) * pagoHoraBase;
      }

      totalMontoGeneral += subtotal;
      const labelResumen = `PROGRAMA ${pIdx + 1} - ASIGNACION ${aIdx + 1}`;
      setCell(resumenRow, 4, labelResumen, STYLES.resumenLabel);
      setCell(resumenRow, 5, subtotal, STYLES.resumenValue);
      resumenRow++;
    });
  });

  setCell(resumenRow, 4, 'TOTAL', STYLES.resumenTotalLabel);
  setCell(resumenRow, 5, totalMontoGeneral, STYLES.resumenTotalValue);
  const resumenEndRow = resumenRow;

  // 3. PROGRAMAS Y ASIGNACIONES
  let currentRow = Math.max(14, resumenEndRow + 1) + 2;

  programas.forEach((prog, pIdx) => {
    const esDiplomado = prog.tipo === 'DIPLOMADO' || prog.nombre?.toUpperCase().includes('DIPLOMADO');
    const factorProg = Number(prog.factorSobrecupo) || 1.0;

    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
    setCell(currentRow, 1, `PROGRAMA ${pIdx + 1}`, STYLES.headerSection);
    setCell(currentRow, 2, '', STYLES.headerSection);
    currentRow++;

    // Encabezado del Programa: alumnos y sobrecupo pertenecen al Programa
    const filasPrograma = [
      ['PROGRAMA', (prog.nombre || '').toUpperCase()],
      ['SOLICITUD DE APROBACION', prog.solicitudAprobacion || ''],
      ['ACUERDO DE APROBACIÓN', prog.acuerdoAprobacion || ''],
      ['EDICIÓN/COHORTE', (prog.edicionCohorte || '').toUpperCase()],
      ['COORDINADOR', (prog.coordinador || '').toUpperCase()]
    ];

    if (esDiplomado) {
      filasPrograma.push(['CLASIFICACION DEL PROYECTO', prog.clasificacionProyecto || 'A']);
    }
    // Alumnos y Sobrecupo van a nivel de programa
    filasPrograma.push(['ALUMNOS INSCRITOS', Number(prog.alumnosInscritos) || 0]);
    if (esDiplomado) {
      filasPrograma.push(['FACTOR DE SOBRECUPO', factorProg]);
    }

    filasPrograma.forEach(([lbl, val]) => {
      setCell(currentRow, 1, lbl, STYLES.label);
      setCell(currentRow, 2, val, STYLES.valueText);
      currentRow++;
    });

    // Desglose de Asignaciones
    (prog.asignaciones || []).forEach((asig, aIdx) => {
      const esCoordinador = asig.cargo?.toUpperCase().includes('COORDINAD');

      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
      setCell(currentRow, 1, `ASIGNACIÓN ${aIdx + 1}`, STYLES.headerSection);
      setCell(currentRow, 2, '', STYLES.headerSection);
      currentRow++;

      const rangoPeriodo = asig.periodoTexto || formatearRangoFechasTexto(asig.fechaInicio, asig.fechaFin);

      setCell(currentRow, 1, 'CARGO', STYLES.label);
      setCell(currentRow, 2, (asig.cargo || '').toUpperCase(), STYLES.valueText);
      currentRow++;

      // Funciones según cargo
      const funcionesTexto = esCoordinador
        ? FUNCION_COORDINADOR_DEFAULT
        : (asig.funciones || FUNCION_DOCENTE_DEFAULT);

      rowsHeight[currentRow] = { hpt: 48 };
      setCell(currentRow, 1, 'FUNCIONES', STYLES.label);
      setCell(currentRow, 2, funcionesTexto, STYLES.valueWrapped);
      currentRow++;

      setCell(currentRow, 1, 'MODULO/CICLO', STYLES.label);
      setCell(currentRow, 2, (asig.moduloCiclo || '').toUpperCase(), STYLES.valueText);
      currentRow++;

      // Si es coordinador, NO se incluye asignatura
      if (!esCoordinador) {
        setCell(currentRow, 1, 'ASIGNATURA', STYLES.label);
        setCell(currentRow, 2, (asig.asignatura || '').toUpperCase(), STYLES.valueText);
        currentRow++;
      }

      setCell(currentRow, 1, 'PERIODO', STYLES.label);
      setCell(currentRow, 2, rangoPeriodo, STYLES.valueText);
      currentRow++;

      // En el Excel, calificación docente y pago por hora NO se repiten aquí
      if (esDiplomado && !esCoordinador) {
        const valorHora = Math.round(pagoHoraBase * factorProg * 100) / 100;
        const subtotal = Math.round((Number(asig.cantidadHoras) || 0) * valorHora * 100) / 100;

        setCell(currentRow, 1, 'CANTIDAD DE HORAS', STYLES.label);
        setCell(currentRow, 2, Number(asig.cantidadHoras) || 0, STYLES.valueText);
        currentRow++;

        setCell(currentRow, 1, 'VALOR POR HORA', STYLES.label);
        setCell(currentRow, 2, valorHora, STYLES.valueText);
        currentRow++;

        setCell(currentRow, 1, 'SUBTOTAL', STYLES.label);
        setCell(currentRow, 2, subtotal, STYLES.valueText);
        currentRow++;
      } else if (esCoordinador) {
        // Asignación de Coordinación: muestra tarifa específica y horas
        const tarifaCoord = Number(asig.pagoPorHora) || pagoHoraBase;
        const subtotal = (Number(asig.cantidadHoras) || 0) * tarifaCoord;

        setCell(currentRow, 1, 'VALOR POR HORA', STYLES.label);
        setCell(currentRow, 2, tarifaCoord, STYLES.valueText);
        currentRow++;

        setCell(currentRow, 1, 'CANTIDAD DE HORAS', STYLES.label);
        setCell(currentRow, 2, Number(asig.cantidadHoras) || 0, STYLES.valueText);
        currentRow++;

        setCell(currentRow, 1, 'SUBTOTAL', STYLES.label);
        setCell(currentRow, 2, subtotal, STYLES.valueText);
        currentRow++;
      } else if (esTiempoIntegral) {
        // Asignación Tiempo Integral
        const sueldo = Number(docenteInfo.sueldoNominal) || 0;
        const porcentaje = (Number(docenteInfo.porcentajePago) || 13) / 100;
        const meses = Number(docenteInfo.cantidadMeses) || 1;
        const subtotal = Math.round(sueldo * porcentaje * meses * 100) / 100;

        setCell(currentRow, 1, 'CANTIDAD DE HORAS', STYLES.label);
        setCell(currentRow, 2, Number(asig.cantidadHoras) || 0, STYLES.valueText);
        currentRow++;

        setCell(currentRow, 1, 'SUBTOTAL', STYLES.label);
        setCell(currentRow, 2, subtotal, STYLES.valueText);
        currentRow++;
      } else if (esCoordinador) {
        // Asignación de Coordinación: muestra tarifa específica y horas
        const tarifaCoord = Number(asig.pagoPorHora) || pagoHoraBase;
        const subtotal = (Number(asig.cantidadHoras) || 0) * tarifaCoord;

        setCell(currentRow, 1, 'VALOR POR HORA', STYLES.label);
        setCell(currentRow, 2, tarifaCoord, STYLES.valueText);
        currentRow++;

        setCell(currentRow, 1, 'CANTIDAD DE HORAS', STYLES.label);
        setCell(currentRow, 2, Number(asig.cantidadHoras) || 0, STYLES.valueText);
        currentRow++;

        setCell(currentRow, 1, 'SUBTOTAL', STYLES.label);
        setCell(currentRow, 2, subtotal, STYLES.valueText);
        currentRow++;
      } else if (esTiempoIntegral) {
        // Asignación Tiempo Integral
        const sueldo = Number(docenteInfo.sueldoNominal) || 0;
        const porcentaje = (Number(docenteInfo.porcentajePago) || 13) / 100;
        const meses = Number(docenteInfo.cantidadMeses) || 1;
        const subtotal = Math.round(sueldo * porcentaje * meses * 100) / 100;

        setCell(currentRow, 1, 'CANTIDAD DE HORAS', STYLES.label);
        setCell(currentRow, 2, Number(asig.cantidadHoras) || 0, STYLES.valueText);
        currentRow++;

        setCell(currentRow, 1, 'SUBTOTAL', STYLES.label);
        setCell(currentRow, 2, subtotal, STYLES.valueText);
        currentRow++;
      } else {
        // Maestría estándar
        const subtotal = (Number(asig.cantidadHoras) || 0) * pagoHoraBase;

        setCell(currentRow, 1, 'CANTIDAD DE HORAS', STYLES.label);
        setCell(currentRow, 2, Number(asig.cantidadHoras) || 0, STYLES.valueText);
        currentRow++;

        setCell(currentRow, 1, 'SUBTOTAL', STYLES.label);
        setCell(currentRow, 2, subtotal, STYLES.valueText);
        currentRow++;
      }
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

function buildHorariosSheet({ asignaciones, sesiones }) {
  const leftRows = [
    ['Día', 'Fecha', 'N° Horas', 'Mes', 'Asignación']
  ];

  const sesionesEfectivas = sesiones
    .filter((s) => s.activa)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  let sumaTotalHoras = 0;

  sesionesEfectivas.forEach((s) => {
    sumaTotalHoras += s.duracionHoras;
    const [year, month, day] = s.fecha.split('-');
    const numeroDia = parseInt(day, 10);
    const fechaObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const mesStr = fechaObj.toLocaleString('es-ES', { month: 'long' });
    const mesLimpio = mesStr.charAt(0).toUpperCase() + mesStr.slice(1);

    leftRows.push([s.nombreDia, numeroDia, s.duracionHoras, mesLimpio, s.materia]);
  });

  leftRows.push(['', 'TOTAL', sumaTotalHoras, 'horas', '']);

  const rightRows = [];
  const rightMeta = [];

  asignaciones.forEach((asig, index) => {
    if (index > 0) {
      rightRows.push(['', '']);
      rightMeta.push('empty');
    }

    rightRows.push([asig.materia, '']);
    rightMeta.push('title');

    rightRows.push(['Día', 'Horario']);
    rightMeta.push('header');

    const diasActivos = DIAS_SEMANA.filter((d) => asig.dias[d.id]?.activo);
    if (diasActivos.length === 0) {
      rightRows.push(['Sin horario semanal', 'No configurado']);
      rightMeta.push('data');
    } else {
      diasActivos.forEach((d) => {
        const c = asig.dias[d.id];
        rightRows.push([d.nombre, `${formatTime12h(c.horaInicio)} a ${formatTime12h(c.horaFin)}`]);
        rightMeta.push('data');
      });
    }

    if (asig.excepciones && Object.keys(asig.excepciones).length > 0) {
      Object.keys(asig.excepciones).sort().forEach((fStr) => {
        const ex = asig.excepciones[fStr];
        const [y, m, d] = fStr.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        const nombreDia = DIAS_SEMANA.find((dia) => dia.id === dt.getDay())?.nombre.toLowerCase() || '';
        const nombreMes = dt.toLocaleString('es-ES', { month: 'long' });
        const etiqueta = `${nombreDia} ${dt.getDate()} de ${nombreMes}`;
        const rango = ex.tipo === 'MODIFICAR'
          ? `${formatTime12h(ex.horaInicio)} a ${formatTime12h(ex.horaFin)}`
          : 'Clase cancelada';

        rightRows.push([etiqueta, rango]);
        rightMeta.push('data');
      });
    }
  });

  const totalFilas = Math.max(leftRows.length, rightRows.length);
  const matrizFinal = [];

  for (let i = 0; i < totalFilas; i++) {
    const left = leftRows[i] || ['', '', '', '', ''];
    const right = rightRows[i] || ['', ''];
    matrizFinal.push([...left, '', ...right]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(matrizFinal);
  const indiceTotal = leftRows.length - 1;

  const EXCEL_STYLES = {
    headerDark: {
      fill: { fgColor: { rgb: '1E293B' } },
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin
    },
    headerNavy: {
      fill: { fgColor: { rgb: '3730A3' } },
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: borderThin
    },
    headerLight: {
      fill: { fgColor: { rgb: 'E2E8F0' } },
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '1E293B' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderThin
    },
    totalRow: (align = 'center') => ({
      fill: { fgColor: { rgb: 'F1F5F9' } },
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '0F172A' } },
      alignment: { horizontal: align, vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: '94A3B8' } },
        bottom: { style: 'medium', color: { rgb: '94A3B8' } },
        left: { style: 'thin', color: { rgb: 'CBD5E1' } },
        right: { style: 'thin', color: { rgb: 'CBD5E1' } }
      }
    }),
    dataCell: (align = 'left') => ({
      font: { name: 'Calibri', sz: 10 },
      alignment: { horizontal: align, vertical: 'center' },
      border: borderThin
    })
  };

  for (let r = 0; r < leftRows.length; r++) {
    for (let c = 0; c < 5; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };

      if (r === 0) {
        worksheet[cellRef].s = EXCEL_STYLES.headerDark;
      } else if (r === indiceTotal) {
        worksheet[cellRef].s = EXCEL_STYLES.totalRow(c === 1 || c === 2 || c === 3 ? 'center' : 'left');
      } else {
        worksheet[cellRef].s = EXCEL_STYLES.dataCell(c === 1 || c === 2 || c === 3 ? 'center' : 'left');
      }
    }
  }

  for (let r = 0; r < rightRows.length; r++) {
    const tipo = rightMeta[r];
    if (tipo === 'empty') continue;

    for (let c = 6; c <= 7; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };

      if (tipo === 'title') worksheet[cellRef].s = EXCEL_STYLES.headerNavy;
      else if (tipo === 'header') worksheet[cellRef].s = EXCEL_STYLES.headerLight;
      else worksheet[cellRef].s = EXCEL_STYLES.dataCell(c === 6 ? 'left' : 'center');
    }
  }

  worksheet['!cols'] = [
    { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 38 },
    { wch: 6 },
    { wch: 28 }, { wch: 28 }
  ];

  return worksheet;
}

function generarExpedienteCompletoExcel({ docenteInfo, programas, asignacionesHorarios, sesionesHorarios }) {
  const workbook = XLSX.utils.book_new();
  const wsRequerimiento = buildRequerimientoSheet({ docenteInfo, programas });
  XLSX.utils.book_append_sheet(workbook, wsRequerimiento, 'Requerimiento');

  const wsHorarios = buildHorariosSheet({
    asignaciones: asignacionesHorarios,
    sesiones: sesionesHorarios
  });
  XLSX.utils.book_append_sheet(workbook, wsHorarios, 'Horarios');

  const nombreSanitizado = (docenteInfo.nombreCompleto || 'Docente').replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(workbook, `Requerimiento_${nombreSanitizado}.xlsx`);
}

// ==========================================
// 5. COMPONENTE PRINCIPAL
// ==========================================
export default function DocenteScheduleTool() {
  const [docenteNombre, setDocenteNombre] = useState('LEONARDO JAVIER MENDOZA BLANCO');

  const [asignaciones, setAsignaciones] = useState([
    {
      id: 'asig-1',
      programaNombre: 'MAESTRÍA EN ENERGÍAS RENOVABLES Y MEDIO AMBIENTE',
      programaTipo: 'MAESTRIA',
      materia: 'CELDAS DE COMBUSTIBLE Y PILAS DE HIDROGENO',
      cargo: 'DOCENTE DE MAESTRIA',
      fechaInicio: '2026-10-19',
      fechaFin: '2026-11-16',
      dias: {
        2: { activo: true, horaInicio: '18:00', horaFin: '21:00' },
        4: { activo: true, horaInicio: '18:00', horaFin: '21:00' }
      },
      excepciones: {}
    },
    {
      id: 'asig-2',
      programaNombre: 'DIPLOMADO EN POWER BI',
      programaTipo: 'DIPLOMADO',
      materia: 'MODULO II',
      cargo: 'DOCENTE DE DIPLOMADO',
      fechaInicio: '2026-11-03',
      fechaFin: '2026-12-12',
      dias: {
        6: { activo: true, horaInicio: '08:00', horaFin: '12:00' }
      },
      excepciones: {}
    }
  ]);

  const [activeTab, setActiveTab] = useState('calendario');
  const [asignacionSeleccionadaId, setAsignacionSeleccionadaId] = useState('asig-1');
  const [seleccionadasResumen, setSeleccionadasResumen] = useState(['asig-1', 'asig-2']);
  const [diasFiltro, setDiasFiltro] = useState([]);

  useEffect(() => {
    if(currentAsig?.dias) {
      const diasActivos = DIAS_SEMANA
      .filter((d)=>currentAsig.dias[d.id]?.activo)
      .map((d)=>d.id);
      setDiasFiltro(diasActivos);
    }
  }, [asignacionSeleccionadaId]);

  // Modales
  const [modalAsignacionAbierto, setModalAsignacionAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formAsignacion, setFormAsignacion] = useState({
    id: '',
    programaNombre: '',
    programaTipo: 'MAESTRIA',
    cargo: 'DOCENTE DE MAESTRIA',
    materia: '',
    fechaInicio: '2026-10-19',
    fechaFin: '2026-11-16',
    dias: {
      1: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
      2: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
      3: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
      4: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
      5: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
      6: { activo: false, horaInicio: '08:00', horaFin: '12:00' },
      0: { activo: false, horaInicio: '08:00', horaFin: '12:00' }
    }
  });

  const [modalExcepcion, setModalExcepcion] = useState(null);
  const [excepForm, setExcepForm] = useState({
    fecha: '',
    tipo: 'MODIFICAR',
    horaInicio: '18:00',
    horaFin: '21:00',
    motivo: ''
  });

  // Modal Requerimiento
  const [modalRequerimientoAbierto, setModalRequerimientoAbierto] = useState(false);
  const [requerimientoForm, setRequerimientoForm] = useState(null);

  // Referencia de archivo para importar JSON
  const fileInputRef = useRef(null);

  // Cómputo de Sesiones
  const todasLasSesiones = useMemo(() => {
    const sesiones = [];

    asignaciones.forEach((asig) => {
      if (!asig.fechaInicio || !asig.fechaFin) return;

      const [startYear, startMonth, startDay] = asig.fechaInicio.split('-').map(Number);
      const [endYear, endMonth, endDay] = asig.fechaFin.split('-').map(Number);

      let current = new Date(startYear, startMonth - 1, startDay);
      const end = new Date(endYear, endMonth - 1, endDay);

      while (current <= end) {
        const fechaStr = formatDateIso(current);
        const dayOfWeek = current.getDay();
        const asuetoNombre = ASUETOS_BASE[fechaStr];
        const configDia = asig.dias[dayOfWeek];
        const excepcion = asig.excepciones ? asig.excepciones[fechaStr] : null;

        let sesionValida = false;
        let hInicio = '';
        let hFin = '';
        let duracionHoras = 0;
        let esAsueto = Boolean(asuetoNombre);
        let estado = 'REGULAR';

        if (excepcion) {
          if (excepcion.tipo === 'CANCELAR') {
            estado = 'CANCELADO';
          } else if (excepcion.tipo === 'MODIFICAR') {
            sesionValida = true;
            estado = 'MODIFICADO';
            hInicio = excepcion.horaInicio;
            hFin = excepcion.horaFin;
          }
        } else if (configDia && configDia.activo && !esAsueto) {
          sesionValida = true;
          hInicio = configDia.horaInicio;
          hFin = configDia.horaFin;
        }

        if (sesionValida && hInicio && hFin) {
          const minutos = timeToMinutes(hFin) - timeToMinutes(hInicio);
          duracionHoras = Math.max(0, minutos / 60);
        }

        sesiones.push({
          id: `${asig.id}_${fechaStr}`,
          asignacionId: asig.id,
          programaNombre: asig.programaNombre,
          materia: asig.materia,
          fecha: fechaStr,
          diaSemanaId: dayOfWeek,
          nombreDia: DIAS_SEMANA.find((d) => d.id === dayOfWeek)?.nombre || '',
          esAsueto,
          asuetoNombre,
          estado,
          excepcion,
          horaInicio: hInicio,
          horaFin: hFin,
          duracionHoras,
          activa: sesionValida && !esAsueto
        });

        current.setDate(current.getDate() + 1);
      }
    });

    return sesiones;
  }, [asignaciones]);

  // Auditoría de Choques
  const mapaDeChoques = useMemo(() => {
    const choques = {};
    const porFecha = {};

    todasLasSesiones
      .filter((s) => s.activa)
      .forEach((s) => {
        if (!porFecha[s.fecha]) porFecha[s.fecha] = [];
        porFecha[s.fecha].push(s);
      });

    Object.entries(porFecha).forEach(([fecha, sesList]) => {
      if (sesList.length > 1) {
        for (let i = 0; i < sesList.length; i++) {
          for (let j = i + 1; j < sesList.length; j++) {
            const s1 = sesList[i];
            const s2 = sesList[j];

            const start1 = timeToMinutes(s1.horaInicio);
            const end1 = timeToMinutes(s1.horaFin);
            const start2 = timeToMinutes(s2.horaInicio);
            const end2 = timeToMinutes(s2.horaFin);

            if (Math.max(start1, start2) < Math.min(end1, end2)) {
              if (!choques[s1.id]) choques[s1.id] = [];
              if (!choques[s2.id]) choques[s2.id] = [];

              choques[s1.id].push({ contra: s2.materia, rango: `${s2.horaInicio} - ${s2.horaFin}` });
              choques[s2.id].push({ contra: s1.materia, rango: `${s1.horaInicio} - ${s1.horaFin}` });
            }
          }
        }
      }
    });

    return choques;
  }, [todasLasSesiones]);

  // Resumen de Asignaciones
  const resumenPorAsignacion = useMemo(() => {
    return asignaciones.map((asig) => {
      const sesionesAsig = todasLasSesiones.filter((s) => s.activa && s.asignacionId === asig.id);
      const totalHoras = sesionesAsig.reduce((acc, curr) => acc + curr.duracionHoras, 0);
      return {
        id: asig.id,
        programaNombre: asig.programaNombre,
        programaTipo: asig.programaTipo,
        cargo: asig.cargo,
        materia: asig.materia,
        fechaInicio: asig.fechaInicio,
        fechaFin: asig.fechaFin,
        totalHoras,
        totalSesiones: sesionesAsig.length
      };
    });
  }, [asignaciones, todasLasSesiones]);

  const totalesSeleccionados = useMemo(() => {
    const filtradas = resumenPorAsignacion.filter((a) => seleccionadasResumen.includes(a.id));
    const totalHoras = filtradas.reduce((acc, curr) => acc + curr.totalHoras, 0);
    const totalSesiones = filtradas.reduce((acc, curr) => acc + curr.totalSesiones, 0);
    return { totalHoras, totalSesiones };
  }, [resumenPorAsignacion, seleccionadasResumen]);

  const metricasAsigActiva = useMemo(() => {
    let totalHoras = 0;
    let totalSesiones = 0;
    const porMes = {};
    const porSemana = {};

    todasLasSesiones
      .filter((s) => s.activa && s.asignacionId === asignacionSeleccionadaId)
      .forEach((s) => {
        totalHoras += s.duracionHoras;
        totalSesiones += 1;
        const mesKey = s.fecha.substring(0, 7);
        porMes[mesKey] = (porMes[mesKey] || 0) + s.duracionHoras;

        const semanaKey = getMondayIso(s.fecha);
        porSemana[semanaKey] = (porSemana[semanaKey] || 0) + s.duracionHoras;
      });

    return { totalHoras, totalSesiones, porMes, porSemana };
  }, [todasLasSesiones, asignacionSeleccionadaId]);

  // Manejadores de Estado y Modales
  const handleLimpiarTodo = () => {
    if (window.confirm('¿Deseas eliminar todas las asignaciones y limpiar los datos?')) {
      setDocenteNombre('');
      setAsignaciones([]);
      setAsignacionSeleccionadaId(null);
      setSeleccionadasResumen([]);
    }
  };

  const handleAbrirCrear = () => {
    setModoEdicion(false);
    setFormAsignacion({
      id: `asig-${Date.now()}`,
      programaNombre: asignaciones[0]?.programaNombre || '',
      programaTipo: asignaciones[0]?.programaTipo || 'MAESTRIA',
      cargo: 'DOCENTE DE MAESTRIA',
      materia: '',
      fechaInicio: '2026-10-19',
      fechaFin: '2026-11-16',
      dias: {
        1: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
        2: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
        3: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
        4: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
        5: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
        6: { activo: false, horaInicio: '08:00', horaFin: '12:00' },
        0: { activo: false, horaInicio: '08:00', horaFin: '12:00' }
      }
    });
    setModalAsignacionAbierto(true);
  };

  const handleAbrirEditar = (asig) => {
    setModoEdicion(true);
    setFormAsignacion({
      id: asig.id,
      programaNombre: asig.programaNombre || '',
      programaTipo: asig.programaTipo || 'MAESTRIA',
      cargo: asig.cargo || 'DOCENTE DE MAESTRIA',
      materia: asig.materia,
      fechaInicio: asig.fechaInicio,
      fechaFin: asig.fechaFin,
      dias: JSON.parse(JSON.stringify(asig.dias))
    });
    setModalAsignacionAbierto(true);
  };

  const handleGuardarAsignacion = (e) => {
    e.preventDefault();
    const esCoord = formAsignacion.cargo?.toUpperCase().includes('COORDINAD');
    if (!formAsignacion.programaNombre.trim() || (!esCoord && !formAsignacion.materia.trim())) {
      alert('Por favor completa los campos requeridos de la asignación.');
      return;
    }

    const payload = {
      ...formAsignacion,
      materia: esCoord ? `Coordinación Académica - ${formAsignacion.programaNombre}` : formAsignacion.materia
    };

    if (modoEdicion) {
      setAsignaciones((prev) => prev.map((a) => (a.id === payload.id ? { ...a, ...payload } : a)));
    } else {
      const nueva = { ...payload, excepciones: {} };
      setAsignaciones((prev) => [...prev, nueva]);
      setAsignacionSeleccionadaId(nueva.id);
      setSeleccionadasResumen((prev) => [...prev, nueva.id]);
    }
    setModalAsignacionAbierto(false);
  };

  const handleEliminarAsignacion = (idAEliminar) => {
    if (window.confirm('¿Deseas eliminar permanentemente esta asignación?')) {
      const restantes = asignaciones.filter((a) => a.id !== idAEliminar);
      setAsignaciones(restantes);
      setSeleccionadasResumen((prev) => prev.filter((id) => id !== idAEliminar));
      if (asignacionSeleccionadaId === idAEliminar) {
        setAsignacionSeleccionadaId(restantes.length > 0 ? restantes[0].id : null);
      }
    }
  };

  // Respaldo JSON (Exportar / Importar)
  const descargarRespaldoJSON = (datosPersonalizados = null) => {
    const payload = datosPersonalizados || {
      docenteNombre,
      asignaciones,
      seleccionadasResumen,
      fechaExportacion: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const sanitized = (docenteNombre || 'Docente').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.href = url;
    link.download = `Respaldo_Horarios_${sanitized}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCargarRespaldoJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const datos = JSON.parse(event.target.result);
        if (datos.docenteNombre !== undefined) setDocenteNombre(datos.docenteNombre);
        if (Array.isArray(datos.asignaciones)) {
          setAsignaciones(datos.asignaciones);
          if (datos.asignaciones.length > 0) {
            setAsignacionSeleccionadaId(datos.asignaciones[0].id);
            setSeleccionadasResumen(datos.seleccionadasResumen || datos.asignaciones.map((a) => a.id));
          } else {
            setAsignacionSeleccionadaId(null);
            setSeleccionadasResumen([]);
          }
        }
        alert('¡Respaldo JSON cargado exitosamente!');
      } catch (err) {
        alert('El archivo no es un JSON válido.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Apertura del Modal de Requerimiento
  const handleAbrirModalRequerimiento = () => {
    const filtradas = asignaciones.filter((a) => seleccionadasResumen.includes(a.id));
    if (filtradas.length === 0) {
      alert('Por favor selecciona al menos una asignación mediante los checkboxes.');
      return;
    }

    const mapaProgramas = {};

    filtradas.forEach((asig) => {
      const pNombre = asig.programaNombre || 'Programa Sin Nombre';
      const esDip = asig.programaTipo === 'DIPLOMADO';
      const esCoord = asig.cargo?.toUpperCase().includes('COORDINAD');

      if (!mapaProgramas[pNombre]) {
        mapaProgramas[pNombre] = {
          nombre: pNombre,
          tipo: asig.programaTipo || 'MAESTRIA',
          solicitudAprobacion: '',
          acuerdoAprobacion: '',
          edicionCohorte: esDip ? 'EDICION II 2026' : '7° COHORTE',
          coordinador: esDip ? 'MSC. VIRGILIO REYES' : 'MSC. JORGE ALBERTO ZETINO CHICAS',
          clasificacionProyecto: 'A',
          // Alumnos y factor se controlan ahora a nivel de programa
          alumnosInscritos: esDip ? 46 : 10,
          factorSobrecupo: 1.25,
          asignaciones: []
        };
      }

      const resumen = resumenPorAsignacion.find((r) => r.id === asig.id);
      const horasCalculadas = resumen ? resumen.totalHoras : 0;

      mapaProgramas[pNombre].asignaciones.push({
        asigId: asig.id,
        asignatura: asig.materia,
        fechaInicio: asig.fechaInicio,
        fechaFin: asig.fechaFin,
        cargo: asig.cargo || (esDip ? 'DOCENTE DE DIPLOMADO' : 'DOCENTE DE MAESTRIA'),
        funciones: esCoord ? FUNCION_COORDINADOR_DEFAULT : FUNCION_DOCENTE_DEFAULT,
        moduloCiclo: 'CICLO II',
        cantidadHoras: horasCalculadas,
        pagoPorHora: esCoord ? (asig.pagoPorHora || 25.0) : '' // Tarifa propia para coordinación
      });
    });

    setRequerimientoForm({
      docenteInfo: {
        nombreCompleto: docenteNombre,
        tipoContrato: 'SERVICIOS PROFESIONALES NO PERSONALES',
        tipoContratacion: 'TIEMPO NORMAL',
        profesion: 'DOCTOR',
        nacionalidad: 'NICARAGUENSE',
        correo: 'leonardo.mendoza@ues.edu.sv',
        modalidadServicio: 'EN LINEA',
        // Calificación docente y pago por hora van centralizados aquí
        calificacionDocente: 'F6',
        pagoPorHora: 22.50,
        sueldoNominal: 1200.00,
        porcentajePago: 13,
        cantidadMeses: 1
      },
      programas: Object.values(mapaProgramas)
    });

    setModalRequerimientoAbierto(true);
  };

  const handleConfirmarDescargaExcel = (e) => {
    e.preventDefault();
    if (!requerimientoForm) return;

    const asignacionesFiltradas = asignaciones.filter((a) => seleccionadasResumen.includes(a.id));
    const sesionesFiltradas = todasLasSesiones.filter((s) => seleccionadasResumen.includes(s.asignacionId));

    generarExpedienteCompletoExcel({
      docenteInfo: requerimientoForm.docenteInfo,
      programas: requerimientoForm.programas,
      asignacionesHorarios: asignacionesFiltradas,
      sesionesHorarios: sesionesFiltradas
    });

    descargarRespaldoJSON({
      docenteNombre,
      docenteInfo: requerimientoForm.docenteInfo,
      programas: requerimientoForm.programas,
      asignaciones,
      seleccionadasResumen,
      fechaExportacion: new Date().toISOString()
    });

    setModalRequerimientoAbierto(false);
  };

  const guardarExcepcion = () => {
    if (!excepForm.fecha) return;

    setAsignaciones((prev) =>
      prev.map((asig) => {
        if (asig.id !== asignacionSeleccionadaId) return asig;
        const nuevasExcepciones = { ...(asig.excepciones || {}) };

        if (excepForm.tipo === 'RESET') {
          delete nuevasExcepciones[excepForm.fecha];
        } else {
          nuevasExcepciones[excepForm.fecha] = {
            tipo: excepForm.tipo,
            horaInicio: excepForm.horaInicio,
            horaFin: excepForm.horaFin,
            motivo: excepForm.motivo || 'Ajuste operativo'
          };
        }
        return { ...asig, excepciones: nuevasExcepciones };
      })
    );
    setModalExcepcion(null);
  };

  const currentAsig = asignaciones.find((a) => a.id === asignacionSeleccionadaId) || asignaciones[0] || null;
  const cantidadChoquesTotales = Object.keys(mapaDeChoques).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      {/* Input oculto para cargar respaldo JSON */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCargarRespaldoJSON}
        accept=".json,application/json"
        className="hidden"
      />

      {/* ENCABEZADO */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              Escuela de Posgrado FIA-UES
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Ciclos 2026 / 2027
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Programación y Validación de Horarios Docentes
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold cursor-pointer transition-colors"
            title="Importar un archivo JSON previamente descargado"
          >
            <IconUpload className="w-3.5 h-3.5 text-slate-500" />
            Cargar Respaldo
          </button>

          <button
            type="button"
            onClick={handleLimpiarTodo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold cursor-pointer transition-colors"
          >
            <IconTrash className="w-3.5 h-3.5 text-slate-500" />
            Limpiar Todo
          </button>

          <div className="border-l border-slate-200 pl-3">
            <label className="block text-[11px] text-slate-500 font-medium">Docente Asignado</label>
            <input
              type="text"
              placeholder="Nombre del docente..."
              value={docenteNombre}
              onChange={(e) => setDocenteNombre(e.target.value)}
              className="text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded px-2.5 py-1 focus:ring-1 focus:ring-slate-500 focus:outline-none w-56"
            />
          </div>

          <div className="border-l border-slate-200 pl-3">
            {cantidadChoquesTotales > 0 ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5">
                <IconAlert className="w-3.5 h-3.5 text-red-600" />
                <span>{cantidadChoquesTotales} Choque(s)</span>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1">
                <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sin choques</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Barra Lateral Izquierda */}
        <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col p-4 space-y-4 flex-shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-800">
              <IconLayers className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Programas y Asignaciones</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {asignaciones.length} total
            </span>
          </div>

          <button
            type="button"
            onClick={handleAbrirCrear}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer transition-colors"
          >
            <IconPlus className="w-3.5 h-3.5" />
            Nueva Asignación
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {asignaciones.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8 italic">
                No hay asignaciones registradas.
              </p>
            ) : (
              asignaciones.map((asig) => {
                const esActiva = asig.id === asignacionSeleccionadaId;
                const diasActivos = DIAS_SEMANA.filter((d) => asig.dias[d.id]?.activo);
                const esCoord = asig.cargo?.toUpperCase().includes('COORDINAD');

                return (
                  <div
                    key={asig.id}
                    onClick={() => setAsignacionSeleccionadaId(asig.id)}
                    className={`p-3 rounded border text-left cursor-pointer transition-colors ${
                      esActiva
                        ? 'border-slate-800 bg-slate-50 text-slate-900'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-200 text-slate-700">
                        {asig.programaTipo || 'PROGRAMA'}
                      </span>
                      {esCoord && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-indigo-100 text-indigo-800">
                          COORDINACIÓN
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-medium text-slate-500 truncate" title={asig.programaNombre}>
                      {asig.programaNombre}
                    </p>
                    <span className="font-bold text-xs leading-snug line-clamp-2 mt-0.5">
                      {asig.materia}
                    </span>

                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                      <IconCalendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDateDDMMYYYY(asig.fechaInicio)} al {formatDateDDMMYYYY(asig.fechaFin)}</span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <IconClock className="w-3 h-3 text-slate-400" />
                      <span>
                        {diasActivos.length > 0
                          ? diasActivos.map((d) => d.nombre.slice(0, 3)).join(', ')
                          : 'Sin horario semanal'}
                      </span>
                    </div>

                    {esActiva && (
                      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAbrirEditar(asig);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          <IconEdit className="w-3 h-3 text-slate-500" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEliminarAsignacion(asig.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          <IconTrash className="w-3 h-3 text-rose-600" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Panel Central */}
        <main className="flex-1 p-6 overflow-y-auto space-y-5">
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('calendario')}
              className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                activeTab === 'calendario'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Fechas y Sesiones
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('metricas')}
              className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                activeTab === 'metricas'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Resumen de Horas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('choques')}
              className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors inline-flex items-center gap-1.5 ${
                activeTab === 'choques'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Auditoría de Choques</span>
              {cantidadChoquesTotales > 0 && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-bold">
                  {cantidadChoquesTotales}
                </span>
              )}
            </button>
          </div>

          {!currentAsig && (
            <div className="bg-white border border-dashed border-slate-300 rounded p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-700">No hay materias asignadas</p>
              <button
                type="button"
                onClick={handleAbrirCrear}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded cursor-pointer transition-colors"
              >
                + Crear Asignación
              </button>
            </div>
          )}

          {/* TAB 1: Fechas y Sesiones */}
          {currentAsig && activeTab === 'calendario' && (
            <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    {currentAsig.programaTipo}: {currentAsig.programaNombre}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {currentAsig.materia}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Vigencia: {formatDateDDMMYYYY(currentAsig.fechaInicio)} al {formatDateDDMMYYYY(currentAsig.fechaFin)}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> Normal
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Modificado
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Asueto UES
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span> Choque
                  </span>
                </div>
              </div>

              {/* Barra de Filtro por Días de la Semana */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-700 mr-1">Filtrar días:</span>
                  {DIAS_SEMANA.map((dia) => {
                    const tieneAsignacion = Boolean(currentAsig?.dias?.[dia.id]?.activo);
                    const estaSeleccionado = diasFiltro.includes(dia.id);

                    return (
                      <button
                        key={dia.id}
                        type="button"
                        onClick={() => {
                          setDiasFiltro((prev) =>
                            prev.includes(dia.id)
                              ? prev.filter((id) => id !== dia.id)
                              : [...prev, dia.id]
                          );
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer border transition-colors inline-flex items-center gap-1.5 ${
                          estaSeleccionado
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span>{dia.nombre}</span>
                        {tieneAsignacion && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              estaSeleccionado ? 'bg-emerald-400' : 'bg-emerald-600'
                            }`}
                            title="Tiene horario asignado"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDiasFiltro(DIAS_SEMANA.map((d) => d.id))}
                    className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    Ver todos
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      const activos = DIAS_SEMANA
                        .filter((d) => currentAsig?.dias?.[d.id]?.activo)
                        .map((d) => d.id);
                      setDiasFiltro(activos);
                    }}
                    className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    Días con asignación
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Día</th>
                      <th className="py-2.5 px-3">Horario</th>
                      <th className="py-2.5 px-3 text-center">N° Horas</th>
                      <th className="py-2.5 px-3">Estado / Observación</th>
                      <th className="py-2.5 px-3 text-right">Ajuste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todasLasSesiones
                      .filter((s) => s.asignacionId === currentAsig.id && diasFiltro.includes(s.diaSemanaId))
                      .map((s) => {
                        const conflicto = mapaDeChoques[s.id];
                        let filaBg = 'hover:bg-slate-50';
                        if (s.esAsueto) filaBg = 'bg-blue-50/40 hover:bg-blue-50';
                        else if (s.estado === 'MODIFICADO') filaBg = 'bg-amber-50/50 hover:bg-amber-50';
                        else if (s.estado === 'CANCELADO') filaBg = 'bg-slate-100 text-slate-400';
                        if (conflicto) filaBg = 'bg-red-50 text-red-900';

                        return (
                          <tr key={s.id} className={filaBg}>
                            <td className="py-2 px-3 font-semibold text-slate-900">{formatDateDDMMYYYY(s.fecha)}</td>
                            <td className="py-2 px-3 text-slate-600">{s.nombreDia}</td>
                            <td className="py-2 px-3 font-mono text-slate-800">
                              {s.activa ? `${formatTime12h(s.horaInicio)} a ${formatTime12h(s.horaFin)}` : '—'}
                            </td>
                            <td className="py-2 px-3 font-bold text-center text-slate-900">
                              {s.duracionHoras > 0 ? `${s.duracionHoras.toFixed(1)} h` : '0 h'}
                            </td>
                            <td className="py-2 px-3">
                              {conflicto ? (
                                <span className="text-red-700 font-semibold flex items-center gap-1">
                                  <IconAlert className="w-3.5 h-3.5 text-red-600" />
                                  Choque con: {conflicto.map((c) => `${c.contra} (${c.rango})`).join(', ')}
                                </span>
                              ) : s.esAsueto ? (
                                <span className="text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[11px] font-medium">
                                  {s.asuetoNombre}
                                </span>
                              ) : s.estado === 'MODIFICADO' ? (
                                <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] font-medium">
                                  Modificado: {s.excepcion?.motivo || 'Ajuste horario'}
                                </span>
                              ) : s.estado === 'CANCELADO' ? (
                                <span className="text-slate-500 italic">Clase cancelada</span>
                              ) : (
                                <span className="text-emerald-700 font-medium">Clase regular</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {!s.esAsueto && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExcepForm({
                                      fecha: s.fecha,
                                      tipo: s.excepcion?.tipo || 'MODIFICAR',
                                      horaInicio: s.horaInicio || '18:00',
                                      horaFin: s.horaFin || '21:00',
                                      motivo: s.excepcion?.motivo || ''
                                    });
                                    setModalExcepcion(s);
                                  }}
                                  className="px-2 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-semibold cursor-pointer transition-colors"
                                >
                                  {s.excepcion ? 'Editar Ajuste' : 'Cambiar Día'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {todasLasSesiones.filter(
                      (s) => s.asignacionId === currentAsig.id && diasFiltro.includes(s.diaSemanaId)
                    ).length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                          No hay sesiones programadas para los días seleccionados en el filtro.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Resumen de Horas */}
          {activeTab === 'metricas' && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Recuento Consolidado por Asignación
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Selecciona las asignaciones para incluirlas en el cálculo y en el Requerimiento de Contratación.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAbrirModalRequerimiento}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold cursor-pointer transition-colors shadow-sm"
                  >
                    <IconDownload className="w-3.5 h-3.5" />
                    Descargar Resumen Excel
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={asignaciones.length > 0 && seleccionadasResumen.length === asignaciones.length}
                            onChange={() => {
                              if (seleccionadasResumen.length === asignaciones.length) {
                                setSeleccionadasResumen([]);
                              } else {
                                setSeleccionadasResumen(asignaciones.map((a) => a.id));
                              }
                            }}
                            className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                          />
                        </th>
                        <th className="py-2.5 px-3">Programa</th>
                        <th className="py-2.5 px-3">Cargo</th>
                        <th className="py-2.5 px-3">Asignación</th>
                        <th className="py-2.5 px-3">Fecha Inicio</th>
                        <th className="py-2.5 px-3">Fecha Fin</th>
                        <th className="py-2.5 px-3 text-center">Sesiones</th>
                        <th className="py-2.5 px-3 text-right">Total Horas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resumenPorAsignacion.map((item) => {
                        const estaMarcada = seleccionadasResumen.includes(item.id);

                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors ${estaMarcada ? 'bg-slate-50/60' : 'opacity-60 bg-white'}`}
                          >
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={estaMarcada}
                                onChange={() => {
                                  setSeleccionadasResumen((prev) =>
                                    prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                                  );
                                }}
                                className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-200 text-slate-700 mr-2">
                                {item.programaTipo}
                              </span>
                              {item.programaNombre}
                            </td>
                            <td className="py-3 px-3 text-slate-700 font-medium">
                              {item.cargo}
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-900">
                              {item.materia}
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-mono">
                              {formatDateDDMMYYYY(item.fechaInicio)}
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-mono">
                              {formatDateDDMMYYYY(item.fechaFin)}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-700">
                              {item.totalSesiones} clases
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-slate-900">
                              {item.totalHoras.toFixed(1)} h
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-100 text-slate-900 font-bold border-t border-slate-200">
                      <tr>
                        <td colSpan={6} className="py-2.5 px-3 text-slate-700 uppercase text-[11px]">
                          Total Asignaciones Seleccionadas ({seleccionadasResumen.length} de {asignaciones.length})
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-xs">
                          {totalesSeleccionados.totalSesiones} clases
                        </td>
                        <td className="py-2.5 px-3 text-right text-xs">
                          {totalesSeleccionados.totalHoras.toFixed(1)} h
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {currentAsig && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white border border-slate-200 rounded p-4 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Distribución por Mes ({currentAsig.materia})
                    </h4>
                    <div className="divide-y divide-slate-100 text-xs">
                      {Object.entries(metricasAsigActiva.porMes).map(([mes, horas]) => (
                        <div key={mes} className="py-2 flex justify-between items-center">
                          <span className="font-medium text-slate-700">{mes}</span>
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {horas.toFixed(1)} h
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded p-4 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Distribución por Semana ({currentAsig.materia})
                    </h4>
                    <div className="divide-y divide-slate-100 text-xs max-h-[220px] overflow-y-auto pr-1">
                      {Object.entries(metricasAsigActiva.porSemana).map(([semana, horas]) => (
                        <div key={semana} className="py-2 flex justify-between items-center">
                          <span className="text-slate-600">Semana del {formatDateDDMMYYYY(semana)}</span>
                          <span className="font-mono font-semibold text-slate-900">{horas.toFixed(1)} h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Auditoría de Choques */}
          {activeTab === 'choques' && (
            <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Auditoría Cruzada de Choques Horarios
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verificación de compatibilidad entre todas las asignaciones programadas para {docenteNombre || 'el docente'}.
                </p>
              </div>

              {cantidadChoquesTotales === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded">
                  <IconCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">Horarios compatibles y verificados</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    No se detectaron choques de horario en ninguna fecha del ciclo.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {Object.entries(mapaDeChoques).map(([sesionId, conflictos]) => {
                    const sesion = todasLasSesiones.find((s) => s.id === sesionId);
                    if (!sesion) return null;

                    return (
                      <div
                        key={sesionId}
                        className="p-3 rounded border border-red-200 bg-red-50 text-xs text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold block text-sm">
                            {formatDateDDMMYYYY(sesion.fecha)} ({sesion.nombreDia})
                          </span>
                          <span className="text-red-700">
                            {sesion.materia}: {formatTime12h(sesion.horaInicio)} a {formatTime12h(sesion.horaFin)}
                          </span>
                        </div>
                        <div className="sm:text-right">
                          <span className="font-bold text-red-800 block">Conflicto con:</span>
                          {conflictos.map((c, i) => (
                            <span key={i} className="block text-red-700">
                              {c.contra} ({c.rango})
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: CREAR / EDITAR ASIGNACIÓN */}
      {modalAsignacionAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                {modoEdicion ? 'Editar Asignación' : 'Nueva Asignación Docente'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAsignacionAbierto(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarAsignacion} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nombre del Programa Académico</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. MAESTRÍA EN ENERGÍAS RENOVABLES"
                    value={formAsignacion.programaNombre}
                    onChange={(e) => setFormAsignacion({ ...formAsignacion, programaNombre: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Programa</label>
                  <select
                    value={formAsignacion.programaTipo}
                    onChange={(e) => setFormAsignacion({ ...formAsignacion, programaTipo: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="MAESTRIA">Maestría / Doctorado</option>
                    <option value="DIPLOMADO">Diplomado / Curso</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cargo a Desempeñar</label>
                  <select
                    value={formAsignacion.cargo}
                    onChange={(e) => setFormAsignacion({ ...formAsignacion, cargo: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="DOCENTE DE MAESTRIA">DOCENTE DE MAESTRÍA</option>
                    <option value="DOCENTE DE DIPLOMADO">DOCENTE DE DIPLOMADO</option>
                    <option value="COORDINADOR DE MAESTRIA">COORDINADOR DE MAESTRÍA</option>
                    <option value="COORDINADOR DE DIPLOMADO">COORDINADOR DE DIPLOMADO</option>
                  </select>
                </div>

                {!formAsignacion.cargo?.toUpperCase().includes('COORDINAD') ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre de la Asignatura / Módulo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Celdas de Combustible"
                      value={formAsignacion.materia}
                      onChange={(e) => setFormAsignacion({ ...formAsignacion, materia: e.target.value })}
                      className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center pt-5 text-indigo-700 text-xs italic">
                    <span>* El cargo de coordinador no requiere registrar asignatura.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    required
                    value={formAsignacion.fechaInicio}
                    onChange={(e) => setFormAsignacion({ ...formAsignacion, fechaInicio: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Fin</label>
                  <input
                    type="date"
                    required
                    value={formAsignacion.fechaFin}
                    onChange={(e) => setFormAsignacion({ ...formAsignacion, fechaFin: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">Horario Semanal Recurrente</label>
                <div className="space-y-2 border border-slate-200 rounded p-3 max-h-52 overflow-y-auto bg-slate-50">
                  {DIAS_SEMANA.map((dia) => {
                    const conf = formAsignacion.dias[dia.id] || { activo: false, horaInicio: '18:00', horaFin: '20:00' };

                    return (
                      <div
                        key={dia.id}
                        className={`flex items-center justify-between p-2 rounded border transition-colors ${
                          conf.activo ? 'bg-white border-slate-300' : 'bg-slate-100/50 border-slate-200 opacity-60'
                        }`}
                      >
                        <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-800 w-28">
                          <input
                            type="checkbox"
                            checked={conf.activo}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormAsignacion({
                                ...formAsignacion,
                                dias: { ...formAsignacion.dias, [dia.id]: { ...conf, activo: checked } }
                              });
                            }}
                            className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                          />
                          <span>{dia.nombre}</span>
                        </label>

                        {conf.activo && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">De:</span>
                            <input
                              type="time"
                              value={conf.horaInicio}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormAsignacion({
                                  ...formAsignacion,
                                  dias: { ...formAsignacion.dias, [dia.id]: { ...conf, horaInicio: val } }
                                });
                              }}
                              className="border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
                            />
                            <span className="text-[10px] text-slate-500">A:</span>
                            <input
                              type="time"
                              value={conf.horaFin}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormAsignacion({
                                  ...formAsignacion,
                                  dias: { ...formAsignacion.dias, [dia.id]: { ...conf, horaFin: val } }
                                });
                              }}
                              className="border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalAsignacionAbierto(false)}
                  className="px-3 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  {modoEdicion ? 'Actualizar Asignación' : 'Crear Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AJUSTE PUNTUAL DE FECHA */}
      {modalExcepcion && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Ajuste para el {formatDateDDMMYYYY(modalExcepcion.fecha)} ({modalExcepcion.nombreDia})
              </h3>
              <button
                type="button"
                onClick={() => setModalExcepcion(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Acción a realizar</label>
                <select
                  value={excepForm.tipo}
                  onChange={(e) => setExcepForm({ ...excepForm, tipo: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="MODIFICAR">Cambiar horario para esta fecha puntual</option>
                  <option value="CANCELAR">Cancelar clase en esta fecha</option>
                  <option value="RESET">Restablecer a horario regular</option>
                </select>
              </div>

              {excepForm.tipo === 'MODIFICAR' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Hora Inicio</label>
                    <input
                      type="time"
                      value={excepForm.horaInicio}
                      onChange={(e) => setExcepForm({ ...excepForm, horaInicio: e.target.value })}
                      className="w-full border border-slate-300 rounded p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Hora Fin</label>
                    <input
                      type="time"
                      value={excepForm.horaFin}
                      onChange={(e) => setExcepForm({ ...excepForm, horaFin: e.target.value })}
                      className="w-full border border-slate-300 rounded p-1.5"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 mb-1">Motivo / Justificación</label>
                <input
                  type="text"
                  placeholder="Ej. Reposición, ajuste operativo..."
                  value={excepForm.motivo}
                  onChange={(e) => setExcepForm({ ...excepForm, motivo: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalExcepcion(null)}
                className="px-3 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={guardarExcepcion}
                className="px-4 py-1.5 rounded text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
              >
                Aplicar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUERIMIENTO DE CONTRATACIÓN (COMPLETO) */}
      {modalRequerimientoAbierto && requerimientoForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded-lg max-w-4xl w-full p-6 space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Requerimiento de Contratación Docente
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifica los datos generales y los parámetros por programa para emitir el requerimiento formal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalRequerimientoAbierto(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarDescargaExcel} className="flex-1 overflow-y-auto space-y-6 pr-2 text-xs">
              {/* Sección 1: Información General del Contratado */}
              <div className="border border-slate-200 rounded p-4 bg-slate-50/50 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5">
                  1. Información General del Contratado
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={requerimientoForm.docenteInfo.nombreCompleto}
                      onChange={(e) =>
                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: { ...requerimientoForm.docenteInfo, nombreCompleto: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Profesión</label>
                    <input
                      type="text"
                      value={requerimientoForm.docenteInfo.profesion}
                      onChange={(e) =>
                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: { ...requerimientoForm.docenteInfo, profesion: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nacionalidad</label>
                    <input
                      type="text"
                      value={requerimientoForm.docenteInfo.nacionalidad}
                      onChange={(e) =>
                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: { ...requerimientoForm.docenteInfo, nacionalidad: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={requerimientoForm.docenteInfo.correo}
                      onChange={(e) =>
                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: { ...requerimientoForm.docenteInfo, correo: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>

                  {/* Listas Desplegables Condicionales */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Contrato</label>
                    <select
                      value={requerimientoForm.docenteInfo.tipoContrato}
                      onChange={(e) => {
                        const nuevoContrato = e.target.value;
                        const nuevaContratacion = nuevoContrato === 'SERVICIOS PERSONALES'
                          ? 'TIEMPO ADICIONAL'
                          : 'TIEMPO NORMAL';

                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: {
                            ...requerimientoForm.docenteInfo,
                            tipoContrato: nuevoContrato,
                            tipoContratacion: nuevaContratacion
                          }
                        });
                      }}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs cursor-pointer focus:ring-1 focus:ring-slate-800 focus:outline-none"
                    >
                      <option value="SERVICIOS PROFESIONALES NO PERSONALES">SERVICIOS PROFESIONALES NO PERSONALES</option>
                      <option value="SERVICIOS PERSONALES">SERVICIOS PERSONALES</option>
                      <option value="AD HONOREM">AD HONOREM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Contratación</label>
                    <select
                      value={requerimientoForm.docenteInfo.tipoContratacion}
                      onChange={(e) =>
                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: { ...requerimientoForm.docenteInfo, tipoContratacion: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs cursor-pointer focus:ring-1 focus:ring-slate-800 focus:outline-none"
                    >
                      {requerimientoForm.docenteInfo.tipoContrato === 'SERVICIOS PERSONALES' ? (
                        <>
                          <option value="TIEMPO ADICIONAL">TIEMPO ADICIONAL</option>
                          <option value="TIEMPO INTEGRAL">TIEMPO INTEGRAL</option>
                        </>
                      ) : (
                        <option value="TIEMPO NORMAL">TIEMPO NORMAL</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Modalidad de Servicio</label>
                    <input
                      type="text"
                      value={requerimientoForm.docenteInfo.modalidadServicio}
                      onChange={(e) =>
                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: { ...requerimientoForm.docenteInfo, modalidadServicio: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>

                  {/* Si es Tiempo Integral se piden sueldo, porcentaje y meses; si no, calificación y pago por hora */}
                  {requerimientoForm.docenteInfo.tipoContratacion === 'TIEMPO INTEGRAL' ? (
                    <>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Sueldo Nominal ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={requerimientoForm.docenteInfo.sueldoNominal}
                          onChange={(e) =>
                            setRequerimientoForm({
                              ...requerimientoForm,
                              docenteInfo: { ...requerimientoForm.docenteInfo, sueldoNominal: e.target.value }
                            })
                          }
                          className="w-full border border-slate-300 rounded p-1.5 bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Porcentaje a Pagar (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={requerimientoForm.docenteInfo.porcentajePago}
                          onChange={(e) =>
                            setRequerimientoForm({
                              ...requerimientoForm,
                              docenteInfo: { ...requerimientoForm.docenteInfo, porcentajePago: e.target.value }
                            })
                          }
                          className="w-full border border-slate-300 rounded p-1.5 bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Cantidad de Meses</label>
                        <input
                          type="number"
                          value={requerimientoForm.docenteInfo.cantidadMeses}
                          onChange={(e) =>
                            setRequerimientoForm({
                              ...requerimientoForm,
                              docenteInfo: { ...requerimientoForm.docenteInfo, cantidadMeses: e.target.value }
                            })
                          }
                          className="w-full border border-slate-300 rounded p-1.5 bg-white font-bold"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Calificación Docente</label>
                        <select
                          value={requerimientoForm.docenteInfo.calificacionDocente}
                          onChange={(e) =>
                            setRequerimientoForm({
                              ...requerimientoForm,
                              docenteInfo: { ...requerimientoForm.docenteInfo, calificacionDocente: e.target.value }
                            })
                          }
                          className="w-full border border-slate-300 rounded p-1.5 bg-white cursor-pointer font-bold"
                        >
                          {['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'].map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Pago por Hora ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={requerimientoForm.docenteInfo.pagoPorHora}
                          onChange={(e) =>
                            setRequerimientoForm({
                              ...requerimientoForm,
                              docenteInfo: { ...requerimientoForm.docenteInfo, pagoPorHora: e.target.value }
                            })
                          }
                          className="w-full border border-slate-300 rounded p-1.5 bg-white font-bold"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Sección 2: Programas y Asignaciones Dinámicas */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5">
                  2. Parámetros Académicos por Programa
                </h4>

                {requerimientoForm.programas.map((prog, pIdx) => {
                  const esDip = prog.tipo === 'DIPLOMADO';

                  return (
                    <div key={pIdx} className="border border-slate-300 rounded p-4 bg-white space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-bold text-slate-900 text-xs uppercase">
                          Programa {pIdx + 1}: {prog.nombre}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {prog.tipo}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-medium text-slate-600 mb-1">Edición / Cohorte</label>
                          <input
                            type="text"
                            value={prog.edicionCohorte}
                            onChange={(e) => {
                              const val = e.target.value;
                              const nuevosProgs = [...requerimientoForm.programas];
                              nuevosProgs[pIdx].edicionCohorte = val;
                              setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                            }}
                            className="w-full border border-slate-300 rounded p-1.5"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-600 mb-1">Coordinador del Programa</label>
                          <input
                            type="text"
                            value={prog.coordinador}
                            onChange={(e) => {
                              const val = e.target.value;
                              const nuevosProgs = [...requerimientoForm.programas];
                              nuevosProgs[pIdx].coordinador = val;
                              setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                            }}
                            className="w-full border border-slate-300 rounded p-1.5"
                          />
                        </div>

                        {/* Alumnos y Sobrecupo a nivel de Programa */}
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Alumnos Inscritos (del Programa)</label>
                          <input
                            type="number"
                            value={prog.alumnosInscritos}
                            onChange={(e) => {
                              const val = e.target.value;
                              const nuevosProgs = [...requerimientoForm.programas];
                              nuevosProgs[pIdx].alumnosInscritos = val;
                              setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                            }}
                            className="w-full border border-slate-300 rounded p-1.5 font-bold"
                          />
                        </div>

                        {esDip && (
                          <>
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Factor Sobrecupo (del Programa)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={prog.factorSobrecupo}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const nuevosProgs = [...requerimientoForm.programas];
                                  nuevosProgs[pIdx].factorSobrecupo = val;
                                  setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                }}
                                className="w-full border border-slate-300 rounded p-1.5 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-slate-600 mb-1">Clasificación del Proyecto</label>
                              <input
                                type="text"
                                value={prog.clasificacionProyecto}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const nuevosProgs = [...requerimientoForm.programas];
                                  nuevosProgs[pIdx].clasificacionProyecto = val;
                                  setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                }}
                                className="w-full border border-slate-300 rounded p-1.5"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Asignaciones del programa */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[11px] font-bold text-slate-700 block uppercase">
                          Asignaciones incluidas:
                        </span>

                        {prog.asignaciones.map((asig, aIdx) => {
                          const esCoord = asig.cargo?.toUpperCase().includes('COORDINAD');

                          return (
                            <div key={aIdx} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-3">
                              <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                                <span>
                                  Asignación {aIdx + 1}: {esCoord ? 'COORDINACIÓN ACADÉMICA' : asig.asignatura}
                                </span>
                                <span className="text-slate-500 font-normal">
                                  {formatearRangoFechasTexto(asig.fechaInicio, asig.fechaFin)}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                                <div>
                                  <label className="block text-[10px] text-slate-600 mb-0.5">Cargo</label>
                                  <input
                                    type="text"
                                    value={asig.cargo}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const nuevosProgs = [...requerimientoForm.programas];
                                      nuevosProgs[pIdx].asignaciones[aIdx].cargo = val;
                                      if (val.toUpperCase().includes('COORDINAD')) {
                                        nuevosProgs[pIdx].asignaciones[aIdx].funciones = FUNCION_COORDINADOR_DEFAULT;
                                      }
                                      setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                    }}
                                    className="w-full border border-slate-300 rounded p-1 bg-white"
                                  />
                                </div>

                                {!esCoord ? (
                                  <div>
                                    <label className="block text-[10px] text-slate-600 mb-0.5">Asignatura</label>
                                    <input
                                      type="text"
                                      value={asig.asignatura}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const nuevosProgs = [...requerimientoForm.programas];
                                        nuevosProgs[pIdx].asignaciones[aIdx].asignatura = val;
                                        setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                      }}
                                      className="w-full border border-slate-300 rounded p-1 bg-white"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center pt-3 text-[11px] text-indigo-700 italic">
                                    <span>* Sin asignatura asignada</span>
                                  </div>
                                )}

                                <div>
                                  <label className="block text-[10px] text-slate-600 mb-0.5">Módulo / Ciclo</label>
                                  <input
                                    type="text"
                                    value={asig.moduloCiclo}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const nuevosProgs = [...requerimientoForm.programas];
                                      nuevosProgs[pIdx].asignaciones[aIdx].moduloCiclo = val;
                                      setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                    }}
                                    className="w-full border border-slate-300 rounded p-1 bg-white"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] text-slate-600 mb-0.5">Cantidad Horas (Calculadas)</label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={asig.cantidadHoras}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const nuevosProgs = [...requerimientoForm.programas];
                                      nuevosProgs[pIdx].asignaciones[aIdx].cantidadHoras = val;
                                      setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                    }}
                                    className="w-full border border-slate-300 rounded p-1 bg-white font-bold"
                                  />
                                </div>

                                {esCoord && (
                                  <div>
                                    <label className="block text-[10px] text-indigo-700 font-semibold mb-0.5">
                                      Valor por Hora Coordinación ($)
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={asig.pagoPorHora}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const nuevosProgs = [...requerimientoForm.programas];
                                        nuevosProgs[pIdx].asignaciones[aIdx].pagoPorHora = val;
                                        setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                      }}
                                      className="w-full border border-indigo-300 rounded p-1 bg-white font-bold text-indigo-900"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalRequerimientoAbierto(false)}
                  className="px-4 py-2 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                >
                  <IconDownload className="w-4 h-4" />
                  Generar y Descargar Excel (+ Respaldo JSON)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
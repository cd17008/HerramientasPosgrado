import XLSX from 'xlsx-js-style';

// ==========================================
// UTILIDADES DE FECHA EN ESPAÑOL
// ==========================================
const MESES_ES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

function parseDate(dateInput) {
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
}

export function formatearRangoFechasTexto(fechaInicioInput, fechaFinInput) {
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
}

function calcularPeriodoGlobal(programas) {
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
}

// ==========================================
// ESTILOS DE CELDA
// ==========================================
const borderThin = {
  top: { style: 'thin', color: { rgb: '000000' } },
  bottom: { style: 'thin', color: { rgb: '000000' } },
  left: { style: 'thin', color: { rgb: '000000' } },
  right: { style: 'thin', color: { rgb: '000000' } }
};

const STYLES = {
  headerSection: {
    fill: { fgColor: { rgb: 'D9E1F2' } }, // Color lavanda/celeste idéntico a tu plantilla
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

// ==========================================
// CONSTRUCTOR DE LA HOJA
// ==========================================
export function buildRequerimientoSheet({ docenteInfo = {}, programas = [] }) {
  const worksheet = {};
  const merges = [];
  const rowsHeight = [];

  // Rastrear dinámicamente los límites para calcular !ref
  let maxRow = 0;
  let maxCol = 5; // A (0) hasta F (5)

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

  // Ancho de columnas según la distribución de tu imagen
  worksheet['!cols'] = [
    { wch: 4 },  // A (Margen)
    { wch: 32 }, // B (Etiquetas principales)
    { wch: 65 }, // C (Detalles del docente / programa)
    { wch: 4 },  // D (Espacio separador)
    { wch: 34 }, // E (Etiquetas del Resumen de pago)
    { wch: 16 }  // F (Montos numéricos)
  ];

  // ----------------------------------------------------
  // 1. CUADRO: INFORMACIÓN DEL DOCENTE (Columnas B y C)
  // ----------------------------------------------------
  // Fila 3 en Excel (r=2)
  merges.push({ s: { r: 2, c: 1 }, e: { r: 2, c: 2 } });
  setCell(2, 1, 'REQUERIMIENTO DE CONTRATACIÓN', STYLES.headerSection);
  setCell(2, 2, '', STYLES.headerSection);

  // Fila 4 en Excel (r=3)
  setCell(3, 1, 'ITEM', STYLES.headerSub);
  setCell(3, 2, 'DETALLE', STYLES.headerSub);

  const periodoGeneral = calcularPeriodoGlobal(programas);

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

  infoDocenteFilas.forEach((fila, i) => {
    const r = 4 + i; // r=4 a r=11 (Filas 5 a 12 de Excel)
    const esEmail = fila[0] === 'CORREO ELECTRONICO';
    setCell(r, 1, fila[0], STYLES.label);
    setCell(r, 2, fila[1], esEmail ? STYLES.valueEmail : STYLES.valueText);
  });

  // ----------------------------------------------------
  // 2. CUADRO: RESUMEN DE PAGO (Columnas E y F)
  // ----------------------------------------------------
  merges.push({ s: { r: 2, c: 4 }, e: { r: 2, c: 5 } });
  setCell(2, 4, 'RESUMEN DE PAGO', STYLES.headerSection);
  setCell(2, 5, '', STYLES.headerSection);

  let resumenRow = 3;
  let totalMontoGeneral = 0;

  programas.forEach((prog, pIdx) => {
    (prog.asignaciones || []).forEach((asig, aIdx) => {
      const esDiplomado = prog.tipo === 'DIPLOMADO' || prog.nombre?.toUpperCase().includes('DIPLOMADO');
      let subtotal = 0;

      if (esDiplomado) {
        const factor = Number(asig.factorSobrecupo) || 1.0;
        const pagoHora = Number(asig.pagoPorHora) || 0;
        const valorHora = Number(asig.valorPorHora) || Math.round(pagoHora * factor * 100) / 100;
        subtotal = Number(asig.subtotal) || Math.round((Number(asig.cantidadHoras) || 0) * valorHora * 100) / 100;
      } else {
        subtotal = Number(asig.subtotal) || (Number(asig.cantidadHoras) || 0) * (Number(asig.pagoPorHora) || 0);
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

  // ----------------------------------------------------
  // 3. PROGRAMAS Y ASIGNACIONES DINÁMICAS (Columnas B y C)
  // ----------------------------------------------------
  let currentRow = Math.max(12, resumenEndRow + 1) + 2;

  programas.forEach((prog, pIdx) => {
    const esDiplomado = prog.tipo === 'DIPLOMADO' || prog.nombre?.toUpperCase().includes('DIPLOMADO');

    // Título del Programa (ej. PROGRAMA 1)
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
    setCell(currentRow, 1, `PROGRAMA ${pIdx + 1}`, STYLES.headerSection);
    setCell(currentRow, 2, '', STYLES.headerSection);
    currentRow++;

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

    filasPrograma.forEach(([lbl, val]) => {
      setCell(currentRow, 1, lbl, STYLES.label);
      setCell(currentRow, 2, val, STYLES.valueText);
      currentRow++;
    });

    // Desglose de Asignaciones del programa
    (prog.asignaciones || []).forEach((asig, aIdx) => {
      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
      setCell(currentRow, 1, `ASIGNACIÓN ${aIdx + 1}`, STYLES.headerSection);
      setCell(currentRow, 2, '', STYLES.headerSection);
      currentRow++;

      const rangoPeriodo = asig.periodoTexto || formatearRangoFechasTexto(asig.fechaInicio, asig.fechaFin);

      setCell(currentRow, 1, 'CARGO', STYLES.label);
      setCell(currentRow, 2, (asig.cargo || '').toUpperCase(), STYLES.valueText);
      currentRow++;

      rowsHeight[currentRow] = { hpt: 48 }; // Altura adecuada para texto largo
      setCell(currentRow, 1, 'FUNCIONES', STYLES.label);
      setCell(
        currentRow,
        2,
        asig.funciones || 'Preparar clases, discusiones, impartir clases y discusiones, consulta y atención al estudiante, diseño y administración de exámenes y calificaciones.',
        STYLES.valueWrapped
      );
      currentRow++;

      setCell(currentRow, 1, 'MODULO/CICLO', STYLES.label);
      setCell(currentRow, 2, (asig.moduloCiclo || '').toUpperCase(), STYLES.valueText);
      currentRow++;

      setCell(currentRow, 1, 'ASIGNATURA', STYLES.label);
      setCell(currentRow, 2, (asig.asignatura || '').toUpperCase(), STYLES.valueText);
      currentRow++;

      setCell(currentRow, 1, 'PERIODO', STYLES.label);
      setCell(currentRow, 2, rangoPeriodo, STYLES.valueText);
      currentRow++;

      setCell(currentRow, 1, 'ALUMNOS INSCRITOS', STYLES.label);
      setCell(currentRow, 2, Number(asig.alumnosInscritos) || 0, STYLES.valueText);
      currentRow++;

      if (esDiplomado) {
        const factor = Number(asig.factorSobrecupo) || 1.0;
        const pagoHora = Number(asig.pagoPorHora) || 0;
        const valorHora = Number(asig.valorPorHora) || Math.round(pagoHora * factor * 100) / 100;
        const subtotal = Number(asig.subtotal) || Math.round((Number(asig.cantidadHoras) || 0) * valorHora * 100) / 100;

        const camposDiplomado = [          
          ['CALIFICACIÓN DOCENTE', asig.calificacionDocente || 'F1'],
          ['PAGO POR HORA', pagoHora],
          ['CANTIDAD DE HORAS', Number(asig.cantidadHoras) || 0],
          ['FACTOR DE SOBRECUPO', factor],
          ['VALOR POR HORA', valorHora],
          ['SUBTOTAL', subtotal]
        ];

        camposDiplomado.forEach(([lbl, val]) => {
          setCell(currentRow, 1, lbl, STYLES.label);
          setCell(currentRow, 2, val, STYLES.valueText);
          currentRow++;
        });
      } else {
        const subtotal = Number(asig.subtotal) || (Number(asig.cantidadHoras) || 0) * (Number(asig.pagoPorHora) || 0);
        const camposMaestria = [
          ['CANTIDAD DE HORAS', Number(asig.cantidadHoras) || 0],
          ['PAGO POR HORA', Number(asig.pagoPorHora) || 0],
          ['SUBTOTAL', subtotal]
        ];

        camposMaestria.forEach(([lbl, val]) => {
          setCell(currentRow, 1, lbl, STYLES.label);
          setCell(currentRow, 2, val, STYLES.valueText);
          currentRow++;
        });
      }
    });

    currentRow++;
  });

  // ----------------------------------------------------
  // 4. METADATOS Y CORRECCIÓN CLAVE DE !ref
  // ----------------------------------------------------
  worksheet['!merges'] = merges;
  worksheet['!rows'] = rowsHeight;

  // ESTA ES LA LÍNEA QUE RESUELVE EL ERROR:
  worksheet['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: maxRow, c: maxCol }
  });

  return worksheet;
}
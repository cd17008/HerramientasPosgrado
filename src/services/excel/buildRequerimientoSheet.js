import XLSX from 'xlsx-js-style';

const MESES_ES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

const CURRENCY_NUM_FMT = '$#,##0.00';

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
  valueCurrency: {
    font: { name: 'Calibri', sz: 10, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: borderThin,
    numFmt: CURRENCY_NUM_FMT
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
    border: borderThin,
    numFmt: CURRENCY_NUM_FMT
  },
  resumenTotalLabel: {
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: borderThin
  },
  resumenTotalValue: {
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: borderThin,
    numFmt: CURRENCY_NUM_FMT
  }
};

function calcularDesgloseAsignacion({ prog, asig, docenteInfo }) {
  const tipoProgNorm = String(prog.tipoPrograma || prog.tipo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
  const esEC = prog.unidad
    ? String(prog.unidad).trim().toUpperCase() === 'EC'
    : tipoProgNorm !== 'MAESTRIA' && tipoProgNorm !== 'DOCTORADO';
  const esMAYDOC = !esEC;
  const cargoUpper = (asig.cargo || '').toUpperCase();
  const esCoordinador =
    cargoUpper.includes('COORDINAD') || cargoUpper.includes('COORDINAC');
  const esTiempoIntegral =
    (docenteInfo.tipoContratacion || '').toUpperCase() === 'TIEMPO INTEGRAL';

  const pagoHoraBase =
    Number(docenteInfo.valorAjustadoHora || docenteInfo.pagoPorHora) || 0;
  const aplicaSobrecupo = esEC && !esCoordinador;
  const factorProg = aplicaSobrecupo
    ? Number(prog.factorSobrecupo ?? asig.factorSobrecupo) || 1.0
    : 1.0;

  // totalHoras = horas asignadas en la programación
  let totalHoras = 0;
  let horasPAE = 0;

  if (asig.totalHoras !== undefined || asig.horasConSobrecupo !== undefined) {
    totalHoras =
      Math.round((Number(asig.totalHoras ?? asig.horasConSobrecupo) || 0) * 100) / 100;
    horasPAE =
      asig.horasPAE !== undefined
        ? Math.round(Number(asig.horasPAE) * 100) / 100
        : aplicaSobrecupo
          ? Math.round((totalHoras / factorProg) * 100) / 100
          : totalHoras;
  } else if (asig.horasPAE !== undefined) {
    horasPAE = Math.round(Number(asig.horasPAE) * 100) / 100;
    totalHoras = aplicaSobrecupo
      ? Math.round(horasPAE * factorProg * 100) / 100
      : horasPAE;
  } else {
    totalHoras = Math.round((Number(asig.cantidadHoras) || 0) * 100) / 100;
    horasPAE = aplicaSobrecupo
      ? Math.round((totalHoras / factorProg) * 100) / 100
      : totalHoras;
  }

  // Diferencia entre total de horas asignadas y horas PAE
  const horasSobrecupo = aplicaSobrecupo
    ? Math.max(0, Math.round((totalHoras - horasPAE) * 100) / 100)
    : 0;

  const tarifaAplicada = esCoordinador
    ? Number(asig.pagoPorHora) || pagoHoraBase
    : pagoHoraBase;

  let subtotal = 0;
  if (asig.subtotal !== undefined && asig.subtotal !== null) {
    subtotal = Math.round(Number(asig.subtotal) * 100) / 100;
  } else if (esCoordinador) {
    subtotal = Math.round(horasPAE * tarifaAplicada * 100) / 100;
  } else if (esTiempoIntegral) {
    const sueldo = Number(docenteInfo.salarioMensual ?? docenteInfo.sueldoNominal) || 0;
    const porcentaje = (Number(docenteInfo.porcentajePago) || 13) / 100;
    const meses = Number(docenteInfo.cantidadMeses) || 1;
    subtotal = Math.round(sueldo * porcentaje * meses * 100) / 100;
  } else {
    subtotal = Math.round(totalHoras * tarifaAplicada * 100) / 100;
  }

  return {
    esDiplomado: esEC,
    esMAYDOC,
    esCoordinador,
    esTiempoIntegral,
    factorProg,
    horasPAE,
    horasSobrecupo,
    totalHoras,
    tarifaAplicada,
    subtotal
  };
}

export function buildRequerimientoSheet({ docenteInfo = {}, programas = [] }) {
  const worksheet = {};
  const merges = [];
  const rowsHeight = [];

  let maxRow = 0;
  let maxCol = 5;

  function setCell(r, c, val, style, isCurrency = false) {
    if (r > maxRow) maxRow = r;
    if (c > maxCol) maxCol = c;

    const cellRef = XLSX.utils.encode_cell({ r, c });
    let cellType = 's';
    if (typeof val === 'number') cellType = 'n';
    else if (typeof val === 'boolean') cellType = 'b';

    const cellObj = {
      t: cellType,
      v: val !== undefined && val !== null ? val : '',
      s: isCurrency ? { ...(style || {}), numFmt: CURRENCY_NUM_FMT } : (style || {})
    };

    if (isCurrency && cellType === 'n') {
      cellObj.z = CURRENCY_NUM_FMT;
    }

    worksheet[cellRef] = cellObj;
  }

  worksheet['!cols'] = [
    { wch: 4 },  // A
    { wch: 34 }, // B
    { wch: 65 }, // C
    { wch: 4 },  // D
    { wch: 34 }, // E
    { wch: 18 }  // F
  ];

  // ----------------------------------------------------
  // 1. CUADRO: INFORMACIÓN DEL DOCENTE (Columnas B y C)
  // ----------------------------------------------------
  merges.push({ s: { r: 2, c: 1 }, e: { r: 2, c: 2 } });
  setCell(2, 1, 'REQUERIMIENTO DE CONTRATACIÓN', STYLES.headerSection);
  setCell(2, 2, '', STYLES.headerSection);

  setCell(3, 1, 'ITEM', STYLES.headerSub);
  setCell(3, 2, 'DETALLE', STYLES.headerSub);

  const periodoGeneral = calcularPeriodoGlobal(programas);
  const esTiempoIntegral = docenteInfo.tipoContratacion === 'TIEMPO INTEGRAL';
  const tieneDiplomado = programas.some(
    (p) => p.tipo === 'DIPLOMADO' || p.nombre?.toUpperCase().includes('DIPLOMADO')
  );
  const tipoContratacionUpper = (docenteInfo.tipoContratacion || '').toUpperCase();
  const esTiempoAdicional = tipoContratacionUpper === 'TIEMPO ADICIONAL';

  const infoDocenteFilas = [
    { label: 'TIPO DE CONTRATO', value: (docenteInfo.tipoContrato || 'SERVICIOS PROFESIONALES NO PERSONALES').toUpperCase() },
    { label: 'TIPO DE CONTRATACION', value: tipoContratacionUpper },
    { label: 'NOMBRE DEL CONTRATADO', value: (docenteInfo.nombreCompleto || '').toUpperCase() },
    { label: 'PROFESION', value: (docenteInfo.profesion || '').toUpperCase() },
    { label: 'NACIONALIDAD', value: (docenteInfo.nacionalidad || '').toUpperCase() },
    { label: 'CORREO ELECTRONICO', value: (docenteInfo.correo || '').toLowerCase(), isEmail: true },
    { label: 'MODALIDAD DE SERVICIO', value: (docenteInfo.modalidadServicio || 'EN LINEA').toUpperCase() },
    { label: 'PERIODO', value: periodoGeneral }
  ];

  if (esTiempoIntegral) {
    const salarioMensual = Number(docenteInfo.salarioMensual ?? docenteInfo.sueldoNominal) || 0;
    const porcentaje = Number(docenteInfo.porcentajePago) || 0;
    const valorMes = Number(docenteInfo.valorPorMes) || Math.round(salarioMensual * (porcentaje / 100) * 100) / 100;

    infoDocenteFilas.push(
      { label: 'SALARIO MENSUAL', value: salarioMensual, isCurrency: true },
      { label: 'PORCENTAJE A PAGAR', value: `${porcentaje}%` },
      { label: 'VALOR POR MES', value: valorMes, isCurrency: true }
    );
  } else if (esTiempoAdicional) {
    const salario = Number(docenteInfo.salario) || 0;
    const pagoHoraBase = Number(docenteInfo.valorPorHora) || (salario > 0 ? Math.round((salario / 160) * 100) / 100 : 0);
    const porcentaje = Number(docenteInfo.porcentajePago) || 0;
    const pagoHoraAjustado =
      Number(docenteInfo.valorAjustadoHora) ||
      Math.round(pagoHoraBase * (porcentaje / 100) * 100) / 100 ||
      Number(docenteInfo.pagoPorHora) ||
      0;

    infoDocenteFilas.push(
      { label: 'ESCALAFÓN', value: (docenteInfo.escalafon || '').toUpperCase() },
      { label: 'PAGO POR HORA', value: pagoHoraBase, isCurrency: true },
      { label: 'PORCENTAJE A PAGAR', value: `${porcentaje}%` },
      { label: 'PAGO POR HORA AJUSTADO', value: pagoHoraAjustado, isCurrency: true }
    );
  } else {
    if (tieneDiplomado) {
      infoDocenteFilas.push({
        label: 'CALIFICACIÓN DOCENTE',
        value: (docenteInfo.calificacionDocente || 'F1').toUpperCase()
      });
    }
    infoDocenteFilas.push({
      label: 'PAGO POR HORA',
      value: Number(docenteInfo.pagoPorHora) || 0,
      isCurrency: true
    });
  }

  infoDocenteFilas.forEach((fila, i) => {
    const r = 4 + i;
    setCell(r, 1, fila.label, STYLES.label);
    const estiloValor = fila.isEmail
      ? STYLES.valueEmail
      : fila.isCurrency
        ? STYLES.valueCurrency
        : STYLES.valueText;
    setCell(r, 2, fila.value, estiloValor, Boolean(fila.isCurrency));
  });

  // ----------------------------------------------------
  // 2. CUADRO SUPERIOR DERECHO: RESUMEN DE PAGO (Col E y F)
  // ----------------------------------------------------
  merges.push({ s: { r: 2, c: 4 }, e: { r: 2, c: 5 } });
  setCell(2, 4, 'RESUMEN DE PAGO', STYLES.headerSection);
  setCell(2, 5, '', STYLES.headerSection);

  let resumenRow = 3;
  let totalMontoGeneral = 0;

  programas.forEach((prog, pIdx) => {
    (prog.asignaciones || []).forEach((asig, aIdx) => {
      const { subtotal, esMAYDOC } = calcularDesgloseAsignacion({ prog, asig, docenteInfo });
      totalMontoGeneral = Math.round((totalMontoGeneral + subtotal) * 100) / 100;

      const idProg = (prog.codigo || prog.nombre || '').trim().toUpperCase();
      const modCiclo = (asig.moduloCiclo || '').trim().toUpperCase();
      const materia = (asig.asignatura || asig.materia || asig.cargo || '').trim().toUpperCase();
      const sufijoResumen = esMAYDOC
        ? materia
        : modCiclo || (asig.cargo || '').trim().toUpperCase();
      const labelResumen = sufijoResumen ? `${idProg} - ${sufijoResumen}` : idProg;

      setCell(resumenRow, 4, labelResumen, STYLES.resumenLabel);
      setCell(resumenRow, 5, subtotal, STYLES.resumenValue, true);
      resumenRow++;
    });
  });

  setCell(resumenRow, 4, 'TOTAL', STYLES.resumenTotalLabel);
  setCell(resumenRow, 5, totalMontoGeneral, STYLES.resumenTotalValue, true);
  const resumenEndRow = resumenRow;

  // ----------------------------------------------------
  // 3. PROGRAMAS Y ASIGNACIONES DINÁMICAS (Col B y C)
  // ----------------------------------------------------
  let currentRow = Math.max(4 + infoDocenteFilas.length, resumenEndRow + 1) + 2;

  programas.forEach((prog, pIdx) => {
    const esDiplomado = prog.tipo === 'DIPLOMADO' || prog.nombre?.toUpperCase().includes('DIPLOMADO');

    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
    setCell(currentRow, 1, `PROGRAMA ${pIdx + 1}`, STYLES.headerSection);
    setCell(currentRow, 2, '', STYLES.headerSection);
    currentRow++;

    const filasPrograma = [
      ['PROGRAMA', (prog.nombre || '').toUpperCase()],
      ['CÓDIGO DEL PROGRAMA', (prog.codigo || '').toUpperCase()],
      ['N° DE SOLICITUD', (prog.solicitudAprobacion || '').toUpperCase()],
      ['ACUERDO DE IMPARTICIÓN', (prog.acuerdoImparticion || prog.acuerdoAprobacion || '').toUpperCase()],
      ['EDICIÓN/COHORTE', (prog.edicionCohorte || '').toUpperCase()],
      ['COORDINADOR', (prog.coordinador || '').toUpperCase()]
    ];

    if (esDiplomado) {
      filasPrograma.push(['CLASIFICACION DEL PROYECTO', (prog.clasificacionProyecto || 'A').toUpperCase()]);
    }

    filasPrograma.forEach(([lbl, val]) => {
      setCell(currentRow, 1, lbl, STYLES.label);
      setCell(currentRow, 2, val, STYLES.valueText);
      currentRow++;
    });

    (prog.asignaciones || []).forEach((asig, aIdx) => {
      const calc = calcularDesgloseAsignacion({ prog, asig, docenteInfo });

      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
      setCell(currentRow, 1, `ASIGNACIÓN ${aIdx + 1}`, STYLES.headerSection);
      setCell(currentRow, 2, '', STYLES.headerSection);
      currentRow++;

      const rangoPeriodo = asig.periodoTexto || formatearRangoFechasTexto(asig.fechaInicio, asig.fechaFin);

      setCell(currentRow, 1, 'CARGO', STYLES.label);
      setCell(currentRow, 2, (asig.cargo || '').toUpperCase(), STYLES.valueText);
      currentRow++;

      rowsHeight[currentRow] = { hpt: 48 };
      setCell(currentRow, 1, 'FUNCIONES', STYLES.label);
      setCell(
        currentRow,
        2,
        asig.funciones || 'Preparar clases, discusiones, impartir clases y discusiones, consulta y atención al estudiante, diseño y administración de exámenes y calificaciones.',
        STYLES.valueWrapped
      );
      currentRow++;

      if (!calc.esCoordinador) {
        setCell(currentRow, 1, 'MODULO/CICLO', STYLES.label);
        setCell(
          currentRow,
          2,
          (asig.moduloCiclo || asig.modulo || asig.ciclo || '').toUpperCase(),
          STYLES.valueText
        );
        currentRow++;

        setCell(currentRow, 1, 'ASIGNATURA', STYLES.label);
        setCell(currentRow, 2, (asig.asignatura || '').toUpperCase(), STYLES.valueText);
        currentRow++;
      }

      setCell(currentRow, 1, 'PERIODO', STYLES.label);
      setCell(currentRow, 2, rangoPeriodo, STYLES.valueText);
      currentRow++;

      if (!calc.esCoordinador) {
        setCell(currentRow, 1, 'ALUMNOS INSCRITOS', STYLES.label);
        setCell(currentRow, 2, Number(prog.alumnosInscritos ?? asig.alumnosInscritos) || 0, STYLES.valueText);
        currentRow++;
      }

      if (calc.esDiplomado && !calc.esCoordinador) {
        setCell(currentRow, 1, 'FACTOR DE SOBRECUPO', STYLES.label);
        setCell(currentRow, 2, calc.factorProg, STYLES.valueText);
        currentRow++;
      }

      if (calc.esCoordinador) {
        setCell(currentRow, 1, 'VALOR POR HORA', STYLES.label);
        setCell(currentRow, 2, calc.tarifaAplicada, STYLES.valueCurrency, true);
        currentRow++;
      }

      // Horas PAE y Horas Sobrecupo por cada asignación
      // Solo se muestran en Educación Continua cuando el cargo no es Coordinación
      if (!calc.esMAYDOC && !calc.esCoordinador) {
        setCell(currentRow, 1, 'CANTIDAD DE HORAS (PAE)', STYLES.label);
        setCell(currentRow, 2, calc.horasPAE, STYLES.valueText);
        currentRow++;

        setCell(currentRow, 1, 'CANTIDAD DE HORAS (SOBRECUPO)', STYLES.label);
        setCell(currentRow, 2, calc.horasSobrecupo, STYLES.valueText);
        currentRow++;
      }

      setCell(currentRow, 1, 'TOTAL HORAS', STYLES.label);
      setCell(currentRow, 2, calc.totalHoras, STYLES.valueText);
      currentRow++;

      setCell(currentRow, 1, 'SUBTOTAL', STYLES.label);
      setCell(currentRow, 2, calc.subtotal, STYLES.valueCurrency, true);
      currentRow++;
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
import XLSX from 'xlsx-js-style';

const BORDER_THIN = {
  top: { style: 'thin', color: { rgb: '000000' } },
  bottom: { style: 'thin', color: { rgb: '000000' } },
  left: { style: 'thin', color: { rgb: '000000' } },
  right: { style: 'thin', color: { rgb: '000000' } }
};

const STYLES = {
  headerBlue: {
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
    fill: { fgColor: { rgb: 'D9E1F2' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: BORDER_THIN
  },
  cellCenter: {
    font: { name: 'Calibri', sz: 11, bold: false, color: { rgb: '000000' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER_THIN
  },
  cellLeft: {
    font: { name: 'Calibri', sz: 11, bold: false, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
    border: BORDER_THIN
  },
  totalBold: {
    font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: BORDER_THIN
  },
  statusOk: {
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '166534' } },
    fill: { fgColor: { rgb: 'DCFCE7' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: BORDER_THIN
  },
  statusWarn: {
    font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '991B1B' } },
    fill: { fgColor: { rgb: 'FEE2E2' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: BORDER_THIN
  }
};

const DIAS_ORDEN = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
  { id: 0, nombre: 'Domingo' }
];

const NOMBRES_DIAS_MIN = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado'
];

const MESES_CORTOS = [
  'ene.',
  'feb.',
  'mar.',
  'abr.',
  'may.',
  'jun.',
  'jul.',
  'ago.',
  'sep.',
  'oct.',
  'nov.',
  'dic.'
];

function unirConComasYY(items = []) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} y ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

function agruparFechasCanceladasPorDia(excepciones = {}) {
  const gruposPorDia = new Map(); // dayOfWeek (0..6) -> [{ day, mesCorto }]

  Object.entries(excepciones)
    .filter(([, excep]) => excep && excep.tipo === 'CANCELAR')
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([fechaIso]) => {
      const [year, month, day] = fechaIso.split('-').map(Number);
      const fecha = new Date(year, month - 1, day);
      const dayOfWeek = fecha.getDay();

      if (!gruposPorDia.has(dayOfWeek)) {
        gruposPorDia.set(dayOfWeek, []);
      }
      gruposPorDia.get(dayOfWeek).push(`${day} ${MESES_CORTOS[month - 1]}`);
    });

  // Ordenar de lunes (1) a domingo (0)
  const ordenDias = [1, 2, 3, 4, 5, 6, 0];
  const lineasCanceladas = [];

  ordenDias.forEach((dayOfWeek) => {
    const listaFechas = gruposPorDia.get(dayOfWeek);
    if (!listaFechas || listaFechas.length === 0) return;

    const nombreDia = NOMBRES_DIAS_MIN[dayOfWeek];
    lineasCanceladas.push(`${nombreDia} ${unirConComasYY(listaFechas)}`);
  });

  return lineasCanceladas;
}

const formatearHora12 = (hora24) => {
  if (!hora24) return '';
  const [hStr, mStr] = hora24.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
};

const formatearFechaCorta = (isoStr) => {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  return `${d}/${m}/${y}`;
};

const obtenerLunesIso = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(dt.setDate(diff));
  const yy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};

const obtenerTituloAsignacion = (item) => {
  const idProg = (
    item.codigoPrograma ||
    item.programaCodigo ||
    item.programaNombre ||
    item.programa ||
    ''
  )
    .trim()
    .toUpperCase();

  const cargo = (item.cargo || '').trim().toUpperCase();
  const esCoordinador = cargo.includes('COORDINAD') || cargo.includes('COORDINAC');

  const mod = esCoordinador ? '' : (item.moduloCiclo || '').trim().toUpperCase();
  const sufijo = mod || (esCoordinador ? cargo || 'COORDINACIÓN' : '');

  if (idProg && sufijo) return `${idProg} - ${sufijo}`;
  if (idProg) return idProg;
  return (sufijo || item.materia || '').toUpperCase();
};

/**
 * Agrupa las sesiones efectivas por mes ('YYYY-MM') y evalúa:
 * - TIEMPO INTEGRAL: >= 20 horas/mes O >= 5 horas/semana en el mes
 * - TIEMPO ADICIONAL: <= 40 horas/mes
 */
function evaluarControlCargaHoraria({ sesionesEfectivas, tipoContratacion }) {
  const porMes = new Map();

  sesionesEfectivas.forEach((s) => {
    const mesKey = s.fecha.substring(0, 7); // 'YYYY-MM'
    const semanaKey = obtenerLunesIso(s.fecha);
    const dur = Number(s.duracionHoras ?? s.horas) || 0;

    if (!porMes.has(mesKey)) {
      const [year, month] = mesKey.split('-').map(Number);
      const fechaObj = new Date(year, month - 1, 1);
      const mesNombre = fechaObj.toLocaleString('es-ES', { month: 'long' });
      const labelMes = `${mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)} ${year}`;

      porMes.set(mesKey, {
        mesKey,
        labelMes,
        totalHoras: 0,
        semanas: new Map()
      });
    }

    const entry = porMes.get(mesKey);
    entry.totalHoras += dur;
    entry.semanas.set(semanaKey, (entry.semanas.get(semanaKey) || 0) + dur);
  });

  return Array.from(porMes.values())
    .sort((a, b) => a.mesKey.localeCompare(b.mesKey))
    .map((m) => {
      const totalHoras = Math.round(m.totalHoras * 100) / 100;
      const horasSemanas = Array.from(m.semanas.values());
      const numSemanas = horasSemanas.length || 1;
      const promedioSemanal = Math.round((totalHoras / numSemanas) * 100) / 100;
      const maxSemanal = horasSemanas.length > 0 ? Math.max(...horasSemanas) : 0;

      if (tipoContratacion === 'TIEMPO INTEGRAL') {
        const cumpleMensual = totalHoras >= 20;
        const cumpleSemanal = maxSemanal >= 5 || promedioSemanal >= 5;
        const cumple = cumpleMensual || cumpleSemanal;

        return {
          mes: m.labelMes,
          horasMes: totalHoras,
          horasSemana: promedioSemanal,
          cumple,
          estado: cumple
            ? `CUMPLE (${cumpleMensual ? '>=20h/mes' : '>=5h/sem'})`
            : 'INCOMPLETO (<20h/mes y <5h/sem)'
        };
      }

      // TIEMPO ADICIONAL: máximo 40 horas al mes
      const cumpleTope = totalHoras <= 40;
      return {
        mes: m.labelMes,
        horasMes: totalHoras,
        horasSemana: promedioSemanal,
        cumple: cumpleTope,
        estado: cumpleTope
          ? 'DENTRO DE LÍMITE (<=40h/mes)'
          : `EXCEDE LÍMITE (+${(totalHoras - 40).toFixed(1)}h sobre 40h)`
      };
    });
}

export function buildHorariosSheet({ docenteInfo = {}, asignaciones = [], sesiones = [] }) {
  const mapaTitulosPorId = new Map();
  asignaciones.forEach((asig) => {
    mapaTitulosPorId.set(asig.id, obtenerTituloAsignacion(asig));
  });

  // 1. Construcción de la tabla izquierda: Sesiones efectivas
  const leftRows = [['Día', 'Fecha', 'N° Horas', 'Mes', 'Asignación']];

  const sesionesEfectivas = sesiones
    .filter((s) => s.activa)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  let sumaTotalHoras = 0;

  sesionesEfectivas.forEach((s) => {
    const duracion = Number(s.duracionHoras ?? s.horas) || 0;
    sumaTotalHoras += duracion;
    const [year, month, day] = s.fecha.split('-');
    const numeroDia = parseInt(day, 10);
    const fechaObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const mesStr = fechaObj.toLocaleString('es-ES', { month: 'long' });
    const mesLimpio = mesStr.charAt(0).toUpperCase() + mesStr.slice(1);
    const tituloAsignacion = mapaTitulosPorId.get(s.asignacionId) || obtenerTituloAsignacion(s);

    leftRows.push([s.nombreDia, numeroDia, duracion, mesLimpio, tituloAsignacion]);
  });

  leftRows.push(['', 'TOTAL', Math.round(sumaTotalHoras * 100) / 100, 'horas', '']);

  // 2. Construcción de la tabla derecha: Horarios semanales por asignación
  const rightRows = [];
  const rightMeta = [];

  asignaciones.forEach((asig, index) => {
    if (index > 0) {
      rightRows.push(['', '']);
      rightMeta.push('empty');
    }

    rightRows.push([obtenerTituloAsignacion(asig), '']);
    rightMeta.push('title');

    rightRows.push(['Día', 'Horario']);
    rightMeta.push('header');

    // 1. Días base regulares (Lunes a Domingo)
    DIAS_ORDEN.forEach(({ id, nombre }) => {
      const cfg = asig.dias?.[id];
      if (cfg?.activo && cfg.horaInicio && cfg.horaFin) {
        rightRows.push([
          nombre,
          `${formatearHora12(cfg.horaInicio)} a ${formatearHora12(cfg.horaFin)}`
        ]);
        rightMeta.push('row');
      }
    });

    // 2. Días puntuales con horario ajustado (MODIFICAR)
    Object.entries(asig.excepciones || {})
      .filter(([, excep]) => excep && excep.tipo === 'MODIFICAR')
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([fechaIso, excep]) => {
        const [year, month, day] = fechaIso.split('-').map(Number);
        const fecha = new Date(year, month - 1, day);
        const etiquetaDia = `${NOMBRES_DIAS_MIN[fecha.getDay()]} ${day} ${MESES_CORTOS[month - 1]}`;

        rightRows.push([
          etiquetaDia,
          `${formatearHora12(excep.horaInicio)} a ${formatearHora12(excep.horaFin)}`
        ]);
        rightMeta.push('row');
      });

    // 3. Días cancelados agrupados por día de la semana (CANCELAR)
    const gruposCancelados = agruparFechasCanceladasPorDia(asig.excepciones || {});
    gruposCancelados.forEach((textoAgrupado) => {
      rightRows.push([textoAgrupado, 'Sin asignación']);
      rightMeta.push('cancelled');
    });
  });

  // 3. Cuadro de Control de Carga Horaria (Tiempo Integral / Tiempo Adicional)
  const tipoContratacionUpper = (docenteInfo?.tipoContratacion || '').trim().toUpperCase();
  const mostrarControlCarga =
    tipoContratacionUpper === 'TIEMPO INTEGRAL' || tipoContratacionUpper === 'TIEMPO ADICIONAL';

  const filasControl = mostrarControlCarga
    ? evaluarControlCargaHoraria({
      sesionesEfectivas,
      tipoContratacion: tipoContratacionUpper
    })
    : [];

  // 4. Ensamblaje en hoja de cálculo
  const ws = {};
  const merges = [];

  const setCell = (r, c, value, style, isNumber = false) => {
    const cellRef = XLSX.utils.encode_cell({ r, c });
    ws[cellRef] = {
      v: value,
      t: isNumber ? 'n' : 's',
      s: style
    };
  };

  // Pintar tabla izquierda (Columnas A-E -> índices 0-4)
  leftRows.forEach((row, rIdx) => {
    const isHeader = rIdx === 0;
    const isTotal = rIdx === leftRows.length - 1;

    row.forEach((val, cIdx) => {
      if (isHeader) {
        setCell(rIdx, cIdx, val, STYLES.headerBlue);
      } else if (isTotal) {
        if (val !== '') {
          setCell(rIdx, cIdx, val, STYLES.totalBold, cIdx === 2);
        }
      } else {
        const esNumero = cIdx === 1 || cIdx === 2;
        const estilo = cIdx === 4 ? STYLES.cellLeft : STYLES.cellCenter;
        setCell(rIdx, cIdx, val, estilo, esNumero);
      }
    });
  });

  // Pintar tabla derecha de horarios semanales (Columnas G-H -> índices 6-7)
  rightRows.forEach((row, rIdx) => {
    const meta = rightMeta[rIdx];
    if (meta === 'empty') return;

    if (meta === 'title') {
      setCell(rIdx, 6, row[0], STYLES.headerBlue);
      setCell(rIdx, 7, '', STYLES.headerBlue);
      merges.push({ s: { r: rIdx, c: 6 }, e: { r: rIdx, c: 7 } });
    } else if (meta === 'header') {
      setCell(rIdx, 6, row[0], STYLES.headerBlue);
      setCell(rIdx, 7, row[1], STYLES.headerBlue);
    } else {
      setCell(rIdx, 6, row[0], STYLES.cellCenter);
      setCell(rIdx, 7, row[1], STYLES.cellCenter);
    }
  });

  // Pintar bloque de Control de Carga Horaria debajo de los horarios (Columnas G-J -> índices 6-9)
  let ultimaFilaControl = 0;
  if (mostrarControlCarga && filasControl.length > 0) {
    let rControl = rightRows.length > 0 ? rightRows.length + 2 : 0;

    const tituloControl =
      tipoContratacionUpper === 'TIEMPO INTEGRAL'
        ? 'CONTROL DE CUMPLIMIENTO - TIEMPO INTEGRAL (MÍN. 20H/MES O 5H/SEM)'
        : 'CONTROL DE CARGA HORARIA - TIEMPO ADICIONAL (MÁX. 40H/MES)';

    for (let c = 6; c <= 9; c++) {
      setCell(rControl, c, c === 6 ? tituloControl : '', STYLES.headerBlue);
    }
    merges.push({ s: { r: rControl, c: 6 }, e: { r: rControl, c: 9 } });
    rControl++;

    const headersControl = ['Mes', 'Horas Mes', 'Prom. Semanal', 'Estado / Lineamiento'];
    headersControl.forEach((h, idx) => {
      setCell(rControl, 6 + idx, h, STYLES.headerBlue);
    });
    rControl++;

    filasControl.forEach((item) => {
      setCell(rControl, 6, item.mes, STYLES.cellLeft);
      setCell(rControl, 7, item.horasMes, STYLES.cellCenter, true);
      setCell(rControl, 8, item.horasSemana, STYLES.cellCenter, true);
      setCell(
        rControl,
        9,
        item.estado,
        item.cumple ? STYLES.statusOk : STYLES.statusWarn
      );
      rControl++;
    });

    ultimaFilaControl = rControl;
  }

  const maxRow = Math.max(leftRows.length, rightRows.length, ultimaFilaControl, 1);
  const maxCol = mostrarControlCarga && filasControl.length > 0 ? 9 : 7;

  ws['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: maxRow - 1, c: maxCol }
  });
  ws['!merges'] = merges;
  ws['!cols'] = [
    { wch: 13 }, // A: Día
    { wch: 10 }, // B: Fecha
    { wch: 12 }, // C: N° Horas
    { wch: 14 }, // D: Mes
    { wch: 36 }, // E: Asignación
    { wch: 4 },  // F: Separador
    { wch: 22 }, // G: Día / Mes control
    { wch: 24 }, // H: Horario / Horas Mes
    { wch: 16 }, // I: Prom. Semanal
    { wch: 32 }  // J: Estado / Lineamiento
  ];

  return ws;
}
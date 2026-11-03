import XLSX from 'xlsx-js-style';

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
  { id: 0, nombre: 'Domingo' }
];

const formatTime12h = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')}${ampm}`;
};

const borderThin = {
  top: { style: 'thin', color: { rgb: 'CBD5E1' } },
  bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
  left: { style: 'thin', color: { rgb: 'CBD5E1' } },
  right: { style: 'thin', color: { rgb: 'CBD5E1' } }
};

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

export function buildHorariosSheet({ asignaciones, sesiones }) {
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
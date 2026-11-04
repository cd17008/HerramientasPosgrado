import { MESES_ES } from '../const/academico';

export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export const formatTime12h = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')}${ampm}`;
};

export const formatDateIso = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatDateDDMMYYYY = (isoStr) => {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  return `${d}/${m}/${y}`;
};

export const getMondayIso = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  return formatDateIso(new Date(dt.setDate(diff)));
};

export const parseDate = (dateInput) => {
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

export const formatearRangoFechasTexto = (fechaInicioInput, fechaFinInput) => {
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

export const calcularPeriodoGlobal = (programas) => {
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
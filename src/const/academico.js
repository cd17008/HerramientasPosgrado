export const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
  { id: 0, nombre: 'Domingo' }
];

export const MESES_ES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

export const FUNCION_COORDINADOR_DEFAULT =
  'Liderar la gestión estratégica y operativa de la maestría mediante la planificación, rendición de cuentas y coordinación de recursos logísticos.';

export const FUNCION_DOCENTE_DEFAULT =
  'Preparar clases, discusiones, impartir clases y discusiones, consulta y atención al estudiante, diseño y administración de exámenes y calificaciones.';

export const esCargoCoordinador = (cargo) =>
  Boolean(cargo?.toUpperCase().includes('COORDINAD'));

export const ASUETOS_BASE = {
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
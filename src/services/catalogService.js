import docentesData from '../data/docentes.json';
import programasData from '../data/programas.json';
import asignaturasData from '../data/asignaturas.json';
import catalogosData from '../data/catalogos.json';
import tarifasData from '../data/tarifas.json';

const normalizeText = (text = '') =>
  String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();

/**
 * Listados base desde catálogos maestros
 */
export const getDocentes = () => (Array.isArray(docentesData) ? docentesData : docentesData?.docentes || []);

export const getProgramas = () => (Array.isArray(programasData) ? programasData : programasData?.programas || []);

export const getAsignaturas = () =>
  Array.isArray(asignaturasData) ? asignaturasData : asignaturasData?.asignaturas || [];

export const getCatalogos = () => ({
  tiposContrato: catalogosData?.tiposContrato || [
    'SERVICIOS PROFESIONALES NO PERSONALES',
    'SERVICIOS PERSONALES',
    'AD HONOREM'
  ],
  modalidadesServicio: catalogosData?.modalidadesServicio || ['EN LINEA', 'PRESENCIAL', 'SEMIPRESENCIAL'],
  tiposPrograma: catalogosData?.tiposPrograma || [
    'DIPLOMADO',
    'MAESTRIA',
    'DOCTORADO',
    'CURSO',
    'SEMINARIO'
  ],
  cargos: catalogosData?.cargos || [
    'DOCENTE',
    'COORDINADOR',
    'ASESOR DE TESIS'
  ],
  clasificacionesProyecto: catalogosData?.clasificacionesProyecto || ['A', 'B', 'C'],
  calificacionesDocente: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9']
});

/**
 * Regla de negocio: Tipo de Contratación permitido según Tipo de Contrato
 */
export function getOpcionesContratacion(tipoContrato = '') {
  const norm = normalizeText(tipoContrato);
  if (norm.includes('NO PERSONALES') || norm.includes('AD HONOREM')) {
    return ['TIEMPO NORMAL'];
  }
  if (norm.includes('PERSONALES')) {
    return ['TIEMPO ADICIONAL', 'TIEMPO INTEGRAL'];
  }
  return ['TIEMPO NORMAL', 'TIEMPO ADICIONAL', 'TIEMPO INTEGRAL'];
}

/**
 * Autocompletado de docente por nombre exacto o coincidencia
 */
export function buscarDocentePorNombre(nombre = '') {
  const norm = normalizeText(nombre);
  if (!norm) return null;
  return getDocentes().find((d) => normalizeText(d.nombreCompleto || d.nombre) === norm) || null;
}

/**
 * Autocompletado de programa maestro (solo datos generales: código, nombre, tipo, clasificación)
 */
export function buscarProgramaMaestro(valor = '') {
  const norm = normalizeText(valor);
  if (!norm) return null;
  return (
    getProgramas().find(
      (p) => normalizeText(p.nombre) === norm || normalizeText(p.codigo) === norm
    ) || null
  );
}

/**
 * Filtra asignaturas/módulos pertenecientes a un código de programa
 */
export function getAsignaturasPorPrograma(codigoPrograma = '') {
  const normCod = normalizeText(codigoPrograma);
  if (!normCod) return [];
  return getAsignaturas().filter(
    (a) =>
      normalizeText(a.codigoPrograma || a.programaCodigo || a.codigo_programa) === normCod
  );
}

/**
 * Obtiene el pago por hora según la escala docente F1–F9
 */
export function getTarifaPorCalificacion(calificacion = 'F1') {
  const cal = normalizeText(calificacion);

  // Intenta leer desde tarifas.json si existe mapeo directo
  const mapaTarifas = tarifasData?.calificaciones || tarifasData?.tarifas || tarifasData;
  if (mapaTarifas && typeof mapaTarifas[cal] === 'number') {
    return mapaTarifas[cal];
  }

  // Respaldo institucional estándar
  if (['F1', 'F2'].includes(cal)) return 18.75;
  if (['F3', 'F4'].includes(cal)) return 20.0;
  if (['F5', 'F6', 'F7', 'F8', 'F9'].includes(cal)) return 22.5;
  return 18.75;
}

/**
 * Filtra los programas maestros según su propiedad "categoria"
 */
export function getProgramasPorCategoria(tipoPrograma = '') {
  const normTipo = normalizeText(tipoPrograma);
  if (!normTipo) return getProgramas();

  return getProgramas().filter((p) => {
    const cat = normalizeText(p.categoria || p.tipo || p.tipoPrograma || '');
    return cat === normTipo;
  });
}

/**
 * Sugiere el factor de sobrecupo cruzando clasificación del proyecto (A, B, C)
 * con la cantidad de alumnos inscritos según la tabla oficial de Educación Continua.
 */
export function calcularFactorSobrecupo(clasificacion = 'A', alumnosInscritos = 0) {
  const alumnos = Number(alumnosInscritos) || 0;
  const cat = normalizeText(clasificacion);

  if (alumnos <= 0) return 1.0;

  // 1. Si tarifas.json define reglas/rangos por clasificación, evalúalos primero
  const tablaJson =
    tarifasData?.sobrecupo?.[cat] ||
    tarifasData?.factoresSobrecupo?.[cat] ||
    tarifasData?.rangosSobrecupo?.[cat];

  if (Array.isArray(tablaJson) && tablaJson.length > 0) {
    const regla = tablaJson.find((r) => {
      const min = r.min ?? 0;
      const max = r.max ?? Infinity;
      return alumnos >= min && alumnos <= max;
    });
    if (regla && typeof regla.factor === 'number') {
      return regla.factor;
    }
  }

  // 2. Respaldo exacto según tabla de referencia oficial
  if (cat === 'A') {
    if (alumnos <= 30) return 1.0;
    if (alumnos <= 45) return 1.25;
    if (alumnos <= 70) return 1.5;
    return 2.0;
  }

  if (cat === 'B') {
    if (alumnos <= 35) return 1.0;
    if (alumnos <= 50) return 1.25;
    if (alumnos <= 70) return 1.5;
    return 2.0;
  }

  if (cat === 'C') {
    if (alumnos <= 40) return 1.0;
    if (alumnos <= 60) return 1.25;
    if (alumnos <= 70) return 1.5;
    return 2.0;
  }

  return 1.0;
}
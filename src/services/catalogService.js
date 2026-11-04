import programas from '../data/programas.json';
import asignaturas from '../data/asignaturas.json';
import docentes from '../data/docentes.json';
import cohortes from '../data/cohortes.json';
import tarifas from '../data/tarifas.json';
import catalogos from '../data/catalogos.json';

const norm = (s) => (s || '').trim().toUpperCase();

// ---------- Programas ----------
/** @param {{ tipo?: 'MAESTRIA'|'DIPLOMADO', unidad?: 'MAYDOC'|'EC' }} filtros */
export const getProgramas = ({ tipo, unidad } = {}) =>
  programas.filter((p) => (!tipo || p.tipo === tipo) && (!unidad || p.unidad === unidad));

export const getProgramaPorCodigo = (codigo) => programas.find((p) => p.codigo === codigo) || null;

export const getProgramaPorNombre = (nombre) =>
  programas.find((p) => norm(p.nombre) === norm(nombre)) || null;

// ---------- Asignaturas ----------
/** Asignaturas de un programa. Excluye las que en el Excel aún no tienen nombre real. */
export const getAsignaturasPorPrograma = (codigoPrograma) =>
  (asignaturas[codigoPrograma] || []).filter((a) => !a.pendiente);

// ---------- Docentes ----------
export const getDocentes = () => docentes;

export const getDocentePorNombre = (nombre) =>
  docentes.find((d) => norm(d.nombre) === norm(nombre)) || null;

// ---------- Tarifas ----------
export const getCategoriasDocente = () => tarifas.categoriasDocente;

export const getTasaPorCategoria = (categoria) =>
  tarifas.categoriasDocente.find((c) => c.id === categoria)?.tasaHora ?? null;

/**
 * Factor de sobrecupo sugerido según clasificación (A/B/C) y cantidad de alumnos.
 * Devuelve el primer tramo cuyo máximo cubre la cantidad; si excede todos, el último factor.
 */
export const sugerirFactorSobrecupo = (clasificacion, alumnos) => {
  const fila = tarifas.factoresSobrecupo.find((f) => f.clasificacion === clasificacion);
  const n = Number(alumnos);
  if (!fila || !Number.isFinite(n) || n <= 0) return null;
  const tramo = fila.tramos.find((t) => t.maxAlumnos !== null && n <= t.maxAlumnos);
  return (tramo ?? fila.tramos[fila.tramos.length - 1]).factor;
};

export const getClasificaciones = () => tarifas.factoresSobrecupo.map((f) => f.clasificacion);

// ---------- Cohortes / ediciones ----------
/** Números de cohorte conocidos para un programa, ej. MINGES -> [5] */
export const getCohortesPorPrograma = (codigoPrograma) => [
  ...new Set(cohortes.filter((c) => c.programa === codigoPrograma).map((c) => c.cohorte))
];

/** Estudiantes registrados para programa + cohorte + ciclo (o null si no hay dato). */
export const getEstudiantes = (codigoPrograma, cohorte, ciclo) =>
  cohortes.find(
    (c) => c.programa === codigoPrograma && c.cohorte === Number(cohorte) && c.ciclo === ciclo
  )?.estudiantes ?? null;

export const getEdiciones = () => catalogos.ediciones;

// ---------- Catálogos simples ----------
export const getNacionalidades = () => catalogos.nacionalidades;
export const getGradosAcademicos = () => catalogos.gradosAcademicos;
/** Grados sin la marca Nacional/Extranjero: ["Maestro/a", "Doctor/a", ...] */
export const getGrados = () => [
  ...new Set(catalogos.gradosAcademicos.map((g) => g.replace(/\s+(Nacional|Extranjero)$/, '')))
];
export const getFacultades = () => catalogos.facultades;
export const getEstadosSolicitud = () => catalogos.estadosSolicitud;
export const getTiposContratoEP = () => catalogos.tiposContratoEP;

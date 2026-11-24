import {
    calcularPagoAsignacion,
    esProgramaEC
} from './sesionCalculations';
import { getAsignaturasPorPrograma } from '../services/catalogService';
const DIAS_SEMANA_NOMBRE = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
};

const TEXTO_FUNCIONES_DOCENTE =
    'Preparar clases, discusiones, impartir clases y discusiones, consulta y atención al estudiante, diseño y administración de exámenes y calificaciones.';

const TEXTO_FUNCIONES_COORDINADOR =
    'Liderar la gestión estratégica y operativa de la maestría mediante la planificación, rendición de cuentas y coordinación de recursos logísticos.';

export function construirPayloadExportacion({
    docente = {},
    programas = [],
    asignaciones = [],
    todasLasSesiones = [],
    seleccionadasIds = []
}) {
    const setSeleccionadas = new Set(seleccionadasIds);
    const asignacionesSeleccionadas = asignaciones.filter((a) => setSeleccionadas.has(a.id));
    const mapaProgramas = new Map(programas.map((p) => [p.id, p]));

    // 1. Normalizar información del docente
    const salario = Number(docente.salario) || 0;
    const valorPorHora =
        docente.valorPorHora !== undefined
            ? Number(docente.valorPorHora)
            : salario > 0
                ? Math.round((salario / 160) * 100) / 100
                : 0;
    const porcentajePago = Number(docente.porcentajePago) || 0;
    const valorAjustadoHora =
        docente.valorAjustadoHora !== undefined
            ? Number(docente.valorAjustadoHora)
            : Math.round(valorPorHora * (porcentajePago / 100) * 100) / 100;

    const salarioMensual = Number(docente.salarioMensual ?? docente.sueldoNominal) || 0;
    const valorPorMes =
        docente.valorPorMes !== undefined
            ? Number(docente.valorPorMes)
            : Math.round(salarioMensual * (porcentajePago / 100) * 100) / 100;

    const docenteInfo = {
        ...docente,
        nombreCompleto: (docente.nombreCompleto || '').trim(),
        profesion: (docente.profesion || '').trim(),
        nacionalidad: (docente.nacionalidad || 'SALVADOREÑA').trim(),
        correo: (docente.correo || '').trim(),
        tipoContrato: docente.tipoContrato || 'SERVICIOS PROFESIONALES NO PERSONALES',
        tipoContratacion: docente.tipoContratacion || 'TIEMPO NORMAL',
        modalidadServicio: docente.modalidadServicio || 'EN LINEA',
        calificacionDocente: docente.calificacionDocente || 'F1',
        pagoPorHora: Number(docente.pagoPorHora) || 0,
        escalafon: (docente.escalafon || '').trim(),
        salario,
        valorPorHora,
        porcentajePago,
        valorAjustadoHora,
        salarioMensual,
        sueldoNominal: salarioMensual,
        valorPorMes,
        cantidadMeses: Number(docente.cantidadMeses) || 1
    };

    // 2. Agrupar asignaciones seleccionadas por programa
    const programasExport = programas
        .map((prog) => {
            const asigsDelPrograma = asignacionesSeleccionadas.filter(
                (a) => a.programaId === prog.id
            );
            if (asigsDelPrograma.length === 0) return null;

            const tipoNorm = (
                prog.tipoPrograma ||
                prog.tipo ||
                (esProgramaEC(prog) ? 'DIPLOMADO' : 'MAESTRIA')
            ).toUpperCase();
            const asignaturasCatalogo = getAsignaturasPorPrograma(prog.codigo || '');

            const asignacionesEnriquecidas = asigsDelPrograma.map((asig) => {
                const sesionesAsig = todasLasSesiones.filter(
                    (s) => s.activa && s.asignacionId === asig.id
                );
                const horasBase = sesionesAsig.reduce(
                    (acc, s) => acc + (Number(s.duracionHoras ?? s.horas) || 0),
                    0
                );
                const esCoordinador = (asig.cargo || '').toUpperCase().includes('COORDINAD');

                const matNorm = (asig.materia || asig.asignatura || '').trim().toUpperCase();
                const itemCat = asignaturasCatalogo.find(
                    (c) => (c.nombre || c.asignatura || '').trim().toUpperCase() === matNorm
                );
                const moduloResuelto = esCoordinador
                    ? ''
                    : (
                        asig.moduloCiclo ||
                        asig.modulo ||
                        asig.ciclo ||
                        itemCat?.ciclo ||
                        itemCat?.modulo ||
                        ''
                    ).trim();

                const calculo = calcularPagoAsignacion({
                    asig: { ...asig, moduloCiclo: moduloResuelto },
                    programa: prog,
                    docenteInfo,
                    horasBase,
                    sesionesAsig
                });

                const totalHorasAsignadas = Math.round(horasBase * 100) / 100;
                const horasPAE = calculo.horasPAE;
                const horasSobrecupoDif = Math.max(
                    0,
                    Math.round((totalHorasAsignadas - horasPAE) * 100) / 100
                );

                return {
                    ...asig,
                    asigId: asig.id,
                    asignatura: asig.materia || asig.asignatura || '',
                    moduloCiclo: moduloResuelto,
                    cargo: asig.cargo || 'DOCENTE',
                    funciones:
                        asig.funciones ||
                        (esCoordinador ? TEXTO_FUNCIONES_COORDINADOR : TEXTO_FUNCIONES_DOCENTE),
                    alumnosInscritos: Number(prog.alumnosInscritos ?? asig.alumnosInscritos) || 0,
                    cantidadHoras: horasPAE,
                    horasPAE,
                    horasSobrecupo: horasSobrecupoDif,
                    totalHoras: totalHorasAsignadas,
                    horasConSobrecupo: totalHorasAsignadas,
                    factorSobrecupo: calculo.factorSobrecupo,
                    pagoPorHora: calculo.tarifaAplicada,
                    tarifaAplicada: calculo.tarifaAplicada,
                    valorPorMes: calculo.valorPorMes,
                    horasSemanalesBase: calculo.horasSemanalesBase,
                    mesesCompletos: calculo.mesesCompletos,
                    mesesIncompletos: calculo.mesesIncompletos,
                    totalMesesEvaluados: calculo.totalMesesEvaluados,
                    detalleMesesIntegral: calculo.detalleMesesIntegral,
                    subtotal: calculo.subtotal
                };
            });

            return {
                ...prog,
                tipo: tipoNorm,
                tipoPrograma: tipoNorm,
                codigo: (prog.codigo || '').trim(),
                solicitudAprobacion: prog.solicitudAprobacion || prog.numeroSolicitud || '',
                acuerdoImparticion:
                    prog.acuerdoImparticion || prog.numeroAcuerdo || prog.acuerdoAprobacion || '',
                edicionCohorte: prog.edicionCohorte || '',
                coordinador: prog.coordinador || '',
                clasificacionProyecto: prog.clasificacionProyecto || 'A',
                alumnosInscritos: Number(prog.alumnosInscritos) || 0,
                factorSobrecupo: Number(prog.factorSobrecupo) || 1.0,
                asignaciones: asignacionesEnriquecidas
            };
        })
        .filter(Boolean);

    // 3. Preparar asignaciones y sesiones para la hoja de Horarios
    const asignacionesHorarios = asignacionesSeleccionadas.map((asig) => {
        const prog = mapaProgramas.get(asig.programaId) || {};
        return {
            ...asig,
            programaNombre: prog.nombre || '',
            codigoPrograma: prog.codigo || '',
            moduloCiclo: asig.moduloCiclo || ''
        };
    });

    const mapaAsignaciones = new Map(asignacionesSeleccionadas.map((a) => [a.id, a]));

    const sesionesHorarios = todasLasSesiones
        .filter((s) => s.activa && setSeleccionadas.has(s.asignacionId))
        .map((s) => {
            const prog = mapaProgramas.get(s.programaId) || {};
            const asigOrig = mapaAsignaciones.get(s.asignacionId) || {};
            const diaIdx =
                s.diaSemanaId !== undefined
                    ? s.diaSemanaId
                    : new Date(`${s.fecha}T00:00:00`).getDay();

            return {
                ...s,
                activa: true,
                cargo: s.cargo || asigOrig.cargo || '',
                nombreDia: s.nombreDia || DIAS_SEMANA_NOMBRE[diaIdx] || '',
                duracionHoras: Number(s.duracionHoras ?? s.horas) || 0,
                programaNombre: prog.nombre || '',
                codigoPrograma: prog.codigo || '',
                moduloCiclo: s.moduloCiclo || asigOrig.moduloCiclo || ''
            };
        });

    return {
        docenteInfo,
        programas: programasExport,
        asignacionesHorarios,
        sesionesHorarios
    };
}

/**
 * Descarga el archivo de respaldo JSON con la nueva estructura v2.
 */
export function descargarRespaldoJSON({ docente, programas, asignaciones, seleccionadasResumen }) {
    const payload = {
        version: 2,
        fechaExportacion: new Date().toISOString(),
        docente,
        programas,
        asignaciones,
        seleccionadasResumen
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const nombreLimpio = (docente?.nombreCompleto || 'Docente').replace(/[^a-zA-Z0-9_-]/g, '_');

    link.href = url;
    link.download = `Respaldo_Horarios_${nombreLimpio}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Parsea un respaldo JSON (soporta v2 jerárquico y migra automáticamente respaldos v1).
 */
export function parsearRespaldoJSON(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('El archivo JSON no tiene un formato válido.');
    }

    // Formato v2 (actual)
    if (data.version === 2 && data.docente && Array.isArray(data.programas)) {
        return {
            docente: { ...data.docente, registrado: Boolean(data.docente.nombreCompleto) },
            programas: data.programas,
            asignaciones: Array.isArray(data.asignaciones) ? data.asignaciones : [],
            seleccionadasResumen: Array.isArray(data.seleccionadasResumen)
                ? data.seleccionadasResumen
                : (data.asignaciones || []).map((a) => a.id)
        };
    }

    // Retrocompatibilidad con respaldos v1 (estructura plana anterior)
    const docPrev = data.docenteInfo || {};
    const docente = {
        registrado: Boolean(data.docenteNombre || docPrev.nombreCompleto),
        nombreCompleto: data.docenteNombre || docPrev.nombreCompleto || '',
        profesion: docPrev.profesion || '',
        nacionalidad: docPrev.nacionalidad || 'SALVADOREÑA',
        correo: docPrev.correo || '',
        tipoContrato: docPrev.tipoContrato || 'SERVICIOS PROFESIONALES NO PERSONALES',
        tipoContratacion: docPrev.tipoContratacion || 'TIEMPO NORMAL',
        modalidadServicio: docPrev.modalidadServicio || 'EN LINEA',
        calificacionDocente: docPrev.calificacionDocente || 'F1',
        pagoPorHora: Number(docPrev.pagoPorHora) || 18.75,
        sueldoNominal: Number(docPrev.sueldoNominal) || 0,
        porcentajePago: Number(docPrev.porcentajePago) || 13,
        cantidadMeses: Number(docPrev.cantidadMeses) || 1
    };

    const mapaProgramas = new Map();
    const asignacionesMigradas = (data.asignaciones || []).map((asig) => {
        const nombreProg = (asig.programaNombre || 'PROGRAMA IMPORTADO').trim();
        if (!mapaProgramas.has(nombreProg)) {
            const progInfo = (data.programas || []).find((p) => p.nombre === nombreProg) || {};
            mapaProgramas.set(nombreProg, {
                id: `prog-mig-${mapaProgramas.size + 1}`,
                tipoPrograma: asig.programaTipo || progInfo.tipo || 'DIPLOMADO',
                nombre: nombreProg,
                codigo: progInfo.codigo || '',
                edicionCohorte: progInfo.edicionCohorte || '',
                coordinador: progInfo.coordinador || '',
                alumnosInscritos: Number(progInfo.alumnosInscritos) || 0,
                factorSobrecupo: Number(progInfo.factorSobrecupo) || 1,
                clasificacionProyecto: progInfo.clasificacionProyecto || 'A',
                numeroSolicitud: asig.numeroSolicitud || progInfo.solicitudAprobacion || '',
                numeroAcuerdo: asig.numeroAprobacion || progInfo.acuerdoImparticion || progInfo.acuerdoAprobacion || ''
            });
        }

        const prog = mapaProgramas.get(nombreProg);
        return {
            id: asig.id || `asig-mig-${Date.now()}`,
            programaId: prog.id,
            cargo: asig.cargo || 'DOCENTE',
            materia: asig.materia || '',
            moduloCiclo: asig.moduloCiclo || '',
            fechaInicio: asig.fechaInicio || '',
            fechaFin: asig.fechaFin || '',
            dias: asig.dias || {},
            excepciones: asig.excepciones || {}
        };
    });

    return {
        docente,
        programas: Array.from(mapaProgramas.values()),
        asignaciones: asignacionesMigradas,
        seleccionadasResumen: Array.isArray(data.seleccionadasResumen)
            ? data.seleccionadasResumen
            : asignacionesMigradas.map((a) => a.id)
    };
}
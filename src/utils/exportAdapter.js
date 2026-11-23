/**
 * Construye el payload exacto que esperan los servicios de Excel y Word
 * a partir del estado jerárquico (docente -> programas -> asignaciones).
 */
export function construirPayloadExportacion({
    docente,
    programas = [],
    asignaciones = [],
    todasLasSesiones = [],
    seleccionadasIds = []
}) {
    const asignacionesFiltradas = asignaciones.filter((a) => seleccionadasIds.includes(a.id));
    const sesionesFiltradas = todasLasSesiones.filter((s) => seleccionadasIds.includes(s.asignacionId));

    // Agrupar asignaciones seleccionadas bajo sus programas correspondientes
    const programasConAsignaciones = programas
        .map((prog) => {
            const asigsDelPrograma = asignacionesFiltradas
                .filter((a) => a.programaId === prog.id)
                .map((asig) => {
                    const sesionesAsig = sesionesFiltradas.filter((s) => s.activa && s.asignacionId === asig.id);
                    const cantidadHoras = sesionesAsig.reduce((acc, s) => acc + s.duracionHoras, 0);

                    return {
                        asigId: asig.id,
                        cargo: asig.cargo || 'DOCENTE',
                        moduloCiclo: asig.moduloCiclo || '',
                        asignatura: asig.materia,
                        fechaInicio: asig.fechaInicio,
                        fechaFin: asig.fechaFin,
                        alumnosInscritos: Number(prog.alumnosInscritos) || 0,
                        factorSobrecupo: Number(prog.factorSobrecupo) || 1,
                        calificacionDocente: docente.calificacionDocente || 'F1',
                        pagoPorHora: Number(docente.pagoPorHora) || 0,
                        cantidadHoras
                    };
                });

            if (asigsDelPrograma.length === 0) return null;

            return {
                id: prog.id,
                codigo: prog.codigo || '',
                nombre: prog.nombre || '',
                tipo: prog.tipoPrograma || 'DIPLOMADO',
                solicitudAprobacion: prog.numeroSolicitud || '',
                acuerdoAprobacion: prog.numeroAcuerdo || '',
                acuerdoImparticion: prog.numeroAcuerdo || '',
                edicionCohorte: prog.edicionCohorte || '',
                coordinador: prog.coordinador || '',
                clasificacionProyecto: prog.clasificacionProyecto || 'A',
                alumnosInscritos: Number(prog.alumnosInscritos) || 0,
                factorSobrecupo: Number(prog.factorSobrecupo) || 1,
                asignaciones: asigsDelPrograma
            };
        })
        .filter(Boolean);

    // Enriquecer asignaciones planas para la Hoja 2 (Horarios)
    const mapaProgramas = new Map(programas.map((p) => [p.id, p]));
    const asignacionesHorarios = asignacionesFiltradas.map((a) => {
        const prog = mapaProgramas.get(a.programaId);
        return {
            ...a,
            programaNombre: prog?.nombre || '',
            programaTipo: prog?.tipoPrograma || 'DIPLOMADO'
        };
    });

    return {
        docenteInfo: {
            nombreCompleto: docente.nombreCompleto || '',
            profesion: docente.profesion || '',
            nacionalidad: docente.nacionalidad || 'SALVADOREÑA',
            correo: docente.correo || '',
            tipoContrato: docente.tipoContrato || 'SERVICIOS PROFESIONALES NO PERSONALES',
            tipoContratacion: docente.tipoContratacion || 'TIEMPO NORMAL',
            modalidadServicio: docente.modalidadServicio || 'EN LINEA',
            calificacionDocente: docente.calificacionDocente || 'F1',
            pagoPorHora: Number(docente.pagoPorHora) || 0,
            sueldoNominal: Number(docente.sueldoNominal) || 0,
            porcentajePago: Number(docente.porcentajePago) || 13,
            cantidadMeses: Number(docente.cantidadMeses) || 1
        },
        programas: programasConAsignaciones,
        asignacionesHorarios,
        sesionesHorarios: sesionesFiltradas
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
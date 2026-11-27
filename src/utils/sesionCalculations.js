import { ASUETOS_BASE, DIAS_SEMANA } from '../const/academico';
import { timeToMinutes, formatDateIso, getMondayIso } from './dateUtils';

const TEXTO_COORDINACION =
    'Liderar la gestión estratégica y operativa de la maestría mediante la planificación, rendición de cuentas y coordinación de recursos logísticos.';
const TARIFA_COORDINADOR_EC = 12.50;
const MONTO_ASESOR_TESIS = 500.00;

export function esProgramaEC(programa) {
    if (!programa) return false;
    if (programa.unidad) return String(programa.unidad).toUpperCase() === 'EC';
    const tipo = String(programa.tipoPrograma || programa.tipo || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();
    return tipo !== 'MAESTRIA' && tipo !== 'DOCTORADO';
}

export function obtenerEtiquetaAsignacion(asig, programa) {
    if (!asig) return '';
    if (esProgramaEC(programa)) {
        return (asig.moduloCiclo || asig.materia || '').trim();
    }
    return (asig.materia || asig.moduloCiclo || '').trim();
}

/**
 * Calcula las horas semanales base configuradas en la cuadrícula semanal (dias)
 */
export function calcularHorasSemanalesBase(diasConfig = {}) {
    return Object.values(diasConfig || {}).reduce((acc, cfg) => {
        if (!cfg?.activo || !cfg.horaInicio || !cfg.horaFin) return acc;
        const diff = (timeToMinutes(cfg.horaFin) - timeToMinutes(cfg.horaInicio)) / 60;
        return diff > 0 ? acc + diff : acc;
    }, 0);
}

/**
 * Evalúa qué meses cumplen la condición de "mes completo" para Tiempo Integral:
 * mínimo 5 horas semanales asignadas O mínimo 20 horas mensuales.
 */
export function evaluarMesesTiempoIntegral({
    sesionesAsig = [],
    horasSemanalesBase = 0,
    valorPorMes = 0
}) {
    const horasPorMes = {};

    sesionesAsig
        .filter((s) => s.activa)
        .forEach((s) => {
            const mesKey = s.fecha.slice(0, 7); // 'YYYY-MM'
            const dur = Number(s.duracionHoras ?? s.horas) || 0;
            horasPorMes[mesKey] = (horasPorMes[mesKey] || 0) + dur;
        });

    const detalleMeses = Object.entries(horasPorMes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mes, horasMes]) => {
            const cumpleMensual = horasMes >= 20;
            const cumpleSemanal = horasSemanalesBase >= 5 && horasMes > 0;
            const esMesCompleto = cumpleMensual || cumpleSemanal;

            return {
                mes,
                horasMes: Math.round(horasMes * 100) / 100,
                horasSemanalesBase: Math.round(horasSemanalesBase * 100) / 100,
                cumpleMensual,
                cumpleSemanal,
                esMesCompleto,
                montoMes: esMesCompleto ? Math.round(valorPorMes * 100) / 100 : 0
            };
        });

    const mesesCompletos = detalleMeses.filter((m) => m.esMesCompleto).length;
    const mesesIncompletos = detalleMeses.filter((m) => !m.esMesCompleto).length;
    const montoTotal = Math.round(mesesCompletos * valorPorMes * 100) / 100;

    return {
        mesesCompletos,
        mesesIncompletos,
        totalMesesEvaluados: detalleMeses.length,
        detalleMeses,
        montoTotal
    };
}

const normalizarTexto = (texto = '') =>
    String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase();

export function calcularPagoAsignacion({
    asig,
    programa,
    docenteInfo = {},
    horasBase = 0,
    sesionesAsig = []
}) {
    const tipoContrato = (docenteInfo.tipoContrato || '').toUpperCase();
    const tipoContratacion = (docenteInfo.tipoContratacion || 'TIEMPO NORMAL').toUpperCase();

    const esServiciosPersonales =
        tipoContrato === 'SERVICIOS PERSONALES' ||
        tipoContratacion === 'TIEMPO ADICIONAL' ||
        tipoContratacion === 'TIEMPO INTEGRAL';

    const esEC = esProgramaEC(programa);
    const cargoUpper = (asig.cargo || '').toUpperCase();
    const esCoordinador = cargoUpper.includes('COORDINAD');
    const esAsesorTesis = cargoUpper.includes('ASESOR') || cargoUpper.includes('TESIS');

    // =========================================================================
    // REGLA 1: SERVICIOS PERSONALES (Se impone sin importar el tipo de programa)
    // =========================================================================
    if (esServiciosPersonales) {
        if (tipoContratacion === 'TIEMPO INTEGRAL') {
            const salarioMensual = Number(docenteInfo.salarioMensual ?? docenteInfo.sueldoNominal) || 0;
            const porcentajePago = Number(docenteInfo.porcentajePago) || 13;
            const valorPorMes =
                Number(docenteInfo.valorPorMes) ||
                Math.round(salarioMensual * (porcentajePago / 100) * 100) / 100;

            const horasSemanalesBase = calcularHorasSemanalesBase(asig.dias);
            const evalIntegral = evaluarMesesTiempoIntegral({
                sesionesAsig,
                horasSemanalesBase,
                valorPorMes
            });

            return {
                modalidadCalculo: 'TIEMPO_INTEGRAL',
                factorSobrecupo: 1.0,
                horasPAE: Math.round(horasBase * 100) / 100,
                horasSobrecupo: 0,
                horasFacturables: Math.round(horasBase * 100) / 100,
                tarifaAplicada: 0,
                valorPorMes,
                horasSemanalesBase,
                mesesCompletos: evalIntegral.mesesCompletos,
                mesesIncompletos: evalIntegral.mesesIncompletos,
                totalMesesEvaluados: evalIntegral.totalMesesEvaluados,
                detalleMesesIntegral: evalIntegral.detalleMeses,
                subtotal: evalIntegral.montoTotal
            };
        }

        // SERVICIOS PERSONALES - TIEMPO ADICIONAL (75% salario/160, máx 40h/mes)
        // Se impone la tarifa ajustada incluso si es Coordinador o Maestría
        const salario = Number(docenteInfo.salario) || 0;
        const porcentajePago = Number(docenteInfo.porcentajePago) || 75;
        const valorHoraBase = salario > 0 ? Math.round((salario / 160) * 100) / 100 : 0;
        const tarifaAjustada =
            Number(docenteInfo.valorAjustadoHora) ||
            Math.round(valorHoraBase * (porcentajePago / 100) * 100) / 100 ||
            Number(docenteInfo.pagoPorHora) ||
            0;

        const horasAsignadas = Math.round(horasBase * 100) / 100;
        const subtotal = Math.round(horasAsignadas * tarifaAjustada * 100) / 100;

        return {
            modalidadCalculo: 'TIEMPO_ADICIONAL',
            factorSobrecupo: 1.0,
            horasPAE: horasAsignadas,
            horasSobrecupo: 0,
            horasFacturables: horasAsignadas,
            tarifaAplicada: tarifaAjustada,
            valorPorMes: 0,
            horasSemanalesBase: calcularHorasSemanalesBase(asig.dias),
            mesesCompletos: 0,
            mesesIncompletos: 0,
            totalMesesEvaluados: 0,
            detalleMesesIntegral: [],
            subtotal
        };
    }

    // =========================================================================
    // REGLA 2: SERVICIOS PROFESIONALES - TIEMPO NORMAL (Depende del programa)
    // =========================================================================
    // =========================================================================
    // REGLA 2: SERVICIOS PROFESIONALES - TIEMPO NORMAL
    // =========================================================================
    const aplicaSobrecupo = esEC && !esCoordinador;
    const factorSobrecupo = aplicaSobrecupo ? Number(programa?.factorSobrecupo) || 1.0 : 1.0;

    const horasAsignadas = Math.round(horasBase * 100) / 100;
    const horasPAE = aplicaSobrecupo
        ? Math.round((horasAsignadas / factorSobrecupo) * 100) / 100
        : horasAsignadas;
    const horasSobrecupo = aplicaSobrecupo ? horasAsignadas : 0;

    // Caso 2.1: Coordinador (Aplica $12.50/h tanto en EC como en MAYDOC)
    if (esCoordinador) {
        const tieneTarifaManual =
            asig.pagoPorHora !== undefined &&
            asig.pagoPorHora !== null &&
            String(asig.pagoPorHora).trim() !== '' &&
            !Number.isNaN(Number(asig.pagoPorHora));

        const tarifaCoord = tieneTarifaManual
            ? Number(asig.pagoPorHora)
            : TARIFA_COORDINADOR_SP; // $12.50 por hora

        const subtotalCoord = Math.round(horasPAE * tarifaCoord * 100) / 100;

        return {
            modalidadCalculo: esEC ? 'TIEMPO_NORMAL_EC_COORD' : 'TIEMPO_NORMAL_POSGRADO_COORD',
            factorSobrecupo: 1.0,
            horasPAE,
            horasSobrecupo: 0,
            horasFacturables: horasPAE,
            tarifaAplicada: tarifaCoord,
            valorPorMes: 0,
            horasSemanalesBase: calcularHorasSemanalesBase(asig.dias),
            mesesCompletos: 0,
            mesesIncompletos: 0,
            totalMesesEvaluados: 0,
            detalleMesesIntegral: [],
            subtotal: subtotalCoord
        };
    }

    // Caso 2.2: Docente en Educación Continua (Clasificación F1-F9 + Sobrecupo)
    if (esEC) {
        const tarifaEC = Number(docenteInfo.pagoPorHoraEC ?? docenteInfo.pagoPorHora) || 0;
        const subtotalEC = Math.round(horasAsignadas * tarifaEC * 100) / 100;

        return {
            modalidadCalculo: 'TIEMPO_NORMAL_EC',
            factorSobrecupo,
            horasPAE,
            horasSobrecupo,
            horasFacturables: horasAsignadas,
            tarifaAplicada: tarifaEC,
            valorPorMes: 0,
            horasSemanalesBase: calcularHorasSemanalesBase(asig.dias),
            mesesCompletos: 0,
            mesesIncompletos: 0,
            totalMesesEvaluados: 0,
            detalleMesesIntegral: [],
            subtotal: subtotalEC
        };
    }

    // Caso 2.3: Maestrías y Doctorados (Docente o Asesor de Tesis: grado académico y nacionalidad)
    const tarifaPosgrado =
        Number(asig.pagoPorHora) ||
        Number(docenteInfo.pagoPorHoraPosgrado ?? docenteInfo.pagoPorHora) ||
        0;

    if (esAsesorTesis) {
        const montoFijo = Number(asig.montoFijo) || MONTO_ASESOR_TESIS;
        const horasCalculadasTesis =
            tarifaPosgrado > 0 ? Math.round((montoFijo / tarifaPosgrado) * 100) / 100 : 0;

        return {
            modalidadCalculo: 'ASESOR_TESIS',
            factorSobrecupo: 1.0,
            horasPAE: horasCalculadasTesis,
            horasSobrecupo: 0,
            horasFacturables: horasCalculadasTesis,
            tarifaAplicada: tarifaPosgrado,
            valorPorMes: 0,
            horasSemanalesBase: 0,
            mesesCompletos: 0,
            mesesIncompletos: 0,
            totalMesesEvaluados: 0,
            detalleMesesIntegral: [],
            subtotal: montoFijo
        };
    }

    const subtotalPosgrado = Math.round(horasPAE * tarifaPosgrado * 100) / 100;

    return {
        modalidadCalculo: 'TIEMPO_NORMAL_POSGRADO',
        factorSobrecupo: 1.0,
        horasPAE,
        horasSobrecupo: 0,
        horasFacturables: horasPAE,
        tarifaAplicada: tarifaPosgrado,
        valorPorMes: 0,
        horasSemanalesBase: calcularHorasSemanalesBase(asig.dias),
        mesesCompletos: 0,
        mesesIncompletos: 0,
        totalMesesEvaluados: 0,
        detalleMesesIntegral: [],
        subtotal: subtotalPosgrado
    };
}
/**
 * Genera el listado completo día por día de todas las asignaciones,
 * aplicando horario base, asuetos UES y excepciones puntuales.
 */
export function generarTodasLasSesiones(asignaciones = [], programas = []) {
    const sesiones = [];
    const mapaProgramas = new Map(programas.map((p) => [p.id, p]));

    asignaciones.forEach((asig) => {
        if (!asig.fechaInicio || !asig.fechaFin) return;

        const programa = mapaProgramas.get(asig.programaId) || null;
        const programaNombre = programa?.nombre || asig.programaNombre || '';
        const programaTipo = programa?.tipoPrograma || asig.programaTipo || 'DIPLOMADO';
        const tituloVisible = obtenerEtiquetaAsignacion(asig, programa);

        const [startYear, startMonth, startDay] = asig.fechaInicio.split('-').map(Number);
        const [endYear, endMonth, endDay] = asig.fechaFin.split('-').map(Number);

        const current = new Date(startYear, startMonth - 1, startDay);
        const end = new Date(endYear, endMonth - 1, endDay);

        while (current <= end) {
            const fechaStr = formatDateIso(current);
            const dayOfWeek = current.getDay();
            const asuetoNombre = ASUETOS_BASE[fechaStr];
            const configDia = asig.dias?.[dayOfWeek];
            const excepcion = asig.excepciones?.[fechaStr] || null;

            let sesionValida = false;
            let hInicio = '';
            let hFin = '';
            let duracionHoras = 0;
            const esAsueto = Boolean(asuetoNombre);
            let estado = 'REGULAR';

            if (excepcion) {
                if (excepcion.tipo === 'CANCELAR') {
                    estado = 'CANCELADO';
                } else if (excepcion.tipo === 'MODIFICAR') {
                    sesionValida = true;
                    estado = 'MODIFICADO';
                    hInicio = excepcion.horaInicio;
                    hFin = excepcion.horaFin;
                }
            } else if (configDia && configDia.activo && !esAsueto) {
                sesionValida = true;
                hInicio = configDia.horaInicio;
                hFin = configDia.horaFin;
            }

            if (sesionValida && hInicio && hFin) {
                const minutos = timeToMinutes(hFin) - timeToMinutes(hInicio);
                duracionHoras = Math.max(0, minutos / 60);
            }

            const activa = sesionValida && !esAsueto;

            sesiones.push({
                id: `${asig.id}_${fechaStr}`,
                asignacionId: asig.id,
                programaId: asig.programaId,
                programaNombre,
                programaTipo,
                moduloCiclo: asig.moduloCiclo || '',
                materia: asig.materia,
                tituloVisible,
                fecha: fechaStr,
                diaSemanaId: dayOfWeek,
                nombreDia: DIAS_SEMANA.find((d) => d.id === dayOfWeek)?.nombre || '',
                esAsueto,
                asuetoNombre,
                estado,
                excepcion,
                horaInicio: hInicio,
                horaFin: hFin,
                duracionHoras,
                horas: duracionHoras,
                activa
            });

            current.setDate(current.getDate() + 1);
        }
    });

    return sesiones;
}

/**
 * Detecta traslapes horarios entre cualquier par de asignaciones activas del docente.
 */
export function detectarChoques(todasLasSesiones = []) {
    const choques = {};
    const porFecha = {};

    todasLasSesiones
        .filter((s) => s.activa)
        .forEach((s) => {
            if (!porFecha[s.fecha]) porFecha[s.fecha] = [];
            porFecha[s.fecha].push(s);
        });

    Object.values(porFecha).forEach((sesList) => {
        if (sesList.length <= 1) return;

        for (let i = 0; i < sesList.length; i++) {
            for (let j = i + 1; j < sesList.length; j++) {
                const s1 = sesList[i];
                const s2 = sesList[j];

                const start1 = timeToMinutes(s1.horaInicio);
                const end1 = timeToMinutes(s1.horaFin);
                const start2 = timeToMinutes(s2.horaInicio);
                const end2 = timeToMinutes(s2.horaFin);

                if (Math.max(start1, start2) < Math.min(end1, end2)) {
                    if (!choques[s1.id]) choques[s1.id] = [];
                    if (!choques[s2.id]) choques[s2.id] = [];

                    choques[s1.id].push({
                        contra: s2.tituloVisible || s2.materia,
                        rango: `${s2.horaInicio} - ${s2.horaFin}`
                    });
                    choques[s2.id].push({
                        contra: s1.tituloVisible || s1.materia,
                        rango: `${s1.horaInicio} - ${s1.horaFin}`
                    });
                }
            }
        }
    });

    return choques;
}

/**
 * Calcula horas totales, sesiones efectivas, factor de sobrecupo y monto por asignación.
 */
export function calcularResumenPorAsignacion(
    asignaciones = [],
    programas = [],
    todasLasSesiones = [],
    docenteInfo = {}
) {
    const mapaProgramas = new Map(programas.map((p) => [p.id, p]));

    return asignaciones.map((asig) => {
        const programa = mapaProgramas.get(asig.programaId) || null;
        const sesionesAsig = todasLasSesiones.filter((s) => s.activa && s.asignacionId === asig.id);
        const totalSesiones = sesionesAsig.length;
        const totalHoras = sesionesAsig.reduce((acc, curr) => acc + (Number(curr.duracionHoras) || 0), 0);
        const esEC = esProgramaEC(programa);
        const esMAYDOC = !esEC;
        const esCoordinador = (asig.cargo || '').toUpperCase().includes('COORDINAD');
        const ocultarFactorYAsignadas = (esCoordinador && esEC) || esMAYDOC;
        const pago = calcularPagoAsignacion({
            asig,
            programa,
            docenteInfo,
            horasBase: totalHoras,
            sesionesAsig
        });


        return {
            id: asig.id,
            programaId: asig.programaId,
            programaNombre: programa?.nombre || 'Sin programa',
            programaTipo: programa?.tipoPrograma || 'DIPLOMADO',
            cargo: asig.cargo || 'DOCENTE',
            esEC,
            esMAYDOC,
            ocultarFactorYAsignadas,
            funciones: asig.funciones || (esCoordinador ? TEXTO_COORDINACION : ''),
            moduloCiclo: asig.moduloCiclo || '',
            materia: asig.materia,
            tituloVisible: obtenerEtiquetaAsignacion(asig, programa),
            fechaInicio: asig.fechaInicio,
            fechaFin: asig.fechaFin,
            totalSesiones,
            totalHoras,
            factorSobrecupo: pago.factorSobrecupo,
            horasPAE: pago.horasPAE,
            horasSobrecupo: pago.horasSobrecupo,
            horasConSobrecupo: pago.horasFacturables,
            tarifaAplicada: pago.tarifaAplicada,
            valorPorMes: pago.valorPorMes,
            mesesCompletos: pago.mesesCompletos,
            mesesIncompletos: pago.mesesIncompletos,
            totalMesesEvaluados: pago.totalMesesEvaluados,
            detalleMesesIntegral: pago.detalleMesesIntegral,
            subtotal: pago.subtotal
        };
    });
}

/**
 * Calcula métricas mensuales y semanales para la asignación activa.
 */
export function calcularMetricasAsignacion(todasLasSesiones = [], asignacionId) {
    let totalHoras = 0;
    let totalSesiones = 0;
    const porMes = {};
    const porSemana = {};

    if (!asignacionId) return { totalHoras, totalSesiones, porMes, porSemana };

    todasLasSesiones
        .filter((s) => s.activa && s.asignacionId === asignacionId)
        .forEach((s) => {
            const dur = Number(s.duracionHoras) || 0;
            totalHoras += dur;
            totalSesiones += 1;

            const mesKey = s.fecha.substring(0, 7);
            porMes[mesKey] = (porMes[mesKey] || 0) + dur;

            const semanaKey = getMondayIso(s.fecha);
            porSemana[semanaKey] = (porSemana[semanaKey] || 0) + dur;
        });

    return { totalHoras, totalSesiones, porMes, porSemana };
}

/**
 * Agrupa las sesiones de una asignación en meses con celdas de lunes a domingo
 * para renderizar la cuadrícula mensual en CalendarioGrid.jsx.
 */
export function agruparMesesCalendario(sesionesAsignacion = []) {
    if (!Array.isArray(sesionesAsignacion) || !sesionesAsignacion.length) return [];

    const porMes = new Map();
    sesionesAsignacion.forEach((s) => {
        if (!s?.fecha) return;
        const mesKey = s.fecha.substring(0, 7); // YYYY-MM
        if (!porMes.has(mesKey)) porMes.set(mesKey, new Map());
        porMes.get(mesKey).set(s.fecha, s);
    });

    const mesesOrdenados = Array.from(porMes.keys()).sort();

    return mesesOrdenados.map((mesKey) => {
        const [year, month] = mesKey.split('-').map(Number);
        const primerDia = new Date(year, month - 1, 1);
        const ultimoDia = new Date(year, month, 0);
        const mapaSesiones = porMes.get(mesKey);

        // Ajuste para que Lunes = 0 ... Domingo = 6
        const offsetInicio = (primerDia.getDay() + 6) % 7;
        const celdas = [];

        for (let i = 0; i < offsetInicio; i++) {
            celdas.push(null);
        }

        for (let d = 1; d <= ultimoDia.getDate(); d++) {
            const fechaIso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            celdas.push({
                dia: d,
                fecha: fechaIso,
                sesion: mapaSesiones.get(fechaIso) || null
            });
        }

        const nombreMes = primerDia.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        return {
            mesKey,
            titulo: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
            celdas
        };
    });
}
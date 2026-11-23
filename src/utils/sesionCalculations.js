import { ASUETOS_BASE, DIAS_SEMANA } from '../const/academico';
import { timeToMinutes, formatDateIso, getMondayIso } from './dateUtils';


export function esProgramaEC(programa) {
    if (!programa) return false;
    if (programa.unidad) return String(programa.unidad).toUpperCase() === 'EC';
    const tipo = String(programa.tipoPrograma || '')
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
 * Genera el listado completo día por día de todas las asignaciones,
 * aplicando horario base, asuetos UES y excepciones puntuales.
 */
export function generarTodasLasSesiones(asignaciones = [], programas = []) {
    const sesiones = [];
    const mapaProgramas = new Map(programas.map((p) => [p.id, p]));

    asignaciones.forEach((asig) => {
        if (!asig.fechaInicio || !asig.fechaFin) return;

        const programa = mapaProgramas.get(asig.programaId);
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

            sesiones.push({
                id: `${asig.id}_${fechaStr}`,
                asignacionId: asig.id,
                programaId: asig.programaId,
                programaNombre,
                programaTipo,
                tituloVisible,
                moduloCiclo: asig.moduloCiclo || '',
                materia: asig.materia,
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
                activa: sesionValida && !esAsueto
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
                    choques[s1.id].push({ contra: s2.tituloVisible, rango: `${s2.horaInicio} - ${s2.horaFin}` });
                    choques[s2.id].push({ contra: s1.tituloVisible, rango: `${s1.horaInicio} - ${s1.horaFin}` });
                }
            }
        }});

    return choques;
}

/**
 * Calcula horas totales, sesiones efectivas y horas con factor de sobrecupo por asignación.
 */
export function calcularResumenPorAsignacion(asignaciones = [], programas = [], todasLasSesiones = []) {
    const mapaProgramas = new Map(programas.map((p) => [p.id, p]));

    return asignaciones.map((asig) => {
        const programa = mapaProgramas.get(asig.programaId);
        const sesionesAsig = todasLasSesiones.filter((s) => s.activa && s.asignacionId === asig.id);
        const totalHoras = sesionesAsig.reduce((acc, curr) => acc + curr.duracionHoras, 0);
        const factorSobrecupo = Number(programa?.factorSobrecupo) || 1;
        const horasConSobrecupo = totalHoras * factorSobrecupo;

        return {
            id: asig.id,
            programaId: asig.programaId,
            programaNombre: programa?.nombre || 'Sin programa',
            programaTipo: programa?.tipoPrograma || 'DIPLOMADO',
            cargo: asig.cargo || 'DOCENTE',
            moduloCiclo: asig.moduloCiclo || '',
            materia: asig.materia,
            fechaInicio: asig.fechaInicio,
            fechaFin: asig.fechaFin,
            factorSobrecupo,
            totalSesiones: sesionesAsig.length,
            totalHoras,
            horasConSobrecupo,
            tituloVisible: obtenerEtiquetaAsignacion(asig, programa)
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
            totalHoras += s.duracionHoras;
            totalSesiones += 1;

            const mesKey = s.fecha.substring(0, 7);
            porMes[mesKey] = (porMes[mesKey] || 0) + s.duracionHoras;

            const semanaKey = getMondayIso(s.fecha);
            porSemana[semanaKey] = (porSemana[semanaKey] || 0) + s.duracionHoras;
        });

    return { totalHoras, totalSesiones, porMes, porSemana };
}

/**
 * Agrupa las sesiones de una asignación en meses con celdas de lunes a domingo
 * para renderizar la cuadrícula mensual.
 */
export function agruparMesesCalendario(sesionesAsignacion = []) {
    if (!sesionesAsignacion.length) return [];

    const porMes = new Map();
    sesionesAsignacion.forEach((s) => {
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
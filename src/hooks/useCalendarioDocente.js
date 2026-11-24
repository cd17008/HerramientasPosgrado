import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
    generarTodasLasSesiones,
    detectarChoques,
    calcularResumenPorAsignacion,
    calcularMetricasAsignacion,
    agruparMesesCalendario,
    obtenerEtiquetaAsignacion
} from '../utils/sesionCalculations';
import {
    construirPayloadExportacion,
    descargarRespaldoJSON,
    parsearRespaldoJSON
} from '../utils/exportAdapter';
import { generarExpedienteCompletoExcel } from '../services/excel/excelExport';
import { generarCorreoWord } from '../services/word/buildCorreoWordService';
import { generarInformeMaestriasWord } from '../services/word/informe/buildInformeMaestrias';


export const DOCENTE_INICIAL = {
    registrado: false,
    nombreCompleto: '',
    profesion: '',
    nacionalidad: 'SALVADOREÑA',
    correo: '',
    tipoContrato: 'SERVICIOS PROFESIONALES NO PERSONALES',
    tipoContratacion: 'TIEMPO NORMAL',
    modalidadServicio: 'EN LINEA',
    calificacionDocente: 'F1',
    pagoPorHora: 18.75,
    sueldoNominal: 0,
    porcentajePago: 13,
    cantidadMeses: 1
};

export function useCalendarioDocente() {
    // 1. Estado jerárquico principal
    const [docente, setDocente] = useState(DOCENTE_INICIAL);
    const [programas, setProgramas] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);

    // 2. Navegación y selección
    const [asignacionSeleccionadaId, setAsignacionSeleccionadaId] = useState(null);
    const [seleccionadasResumen, setSeleccionadasResumen] = useState([]);
    const [activeTab, setActiveTab] = useState('calendario');
    const [vistaSesiones, setVistaSesiones] = useState('cuadricula');

    // 3. Estados de modales
    const [modalDocenteAbierto, setModalDocenteAbierto] = useState(false);
    const [modalPrograma, setModalPrograma] = useState({ abierto: false, modo: 'crear', datos: null });
    const [modalAsignacion, setModalAsignacion] = useState({
        abierto: false,
        modo: 'crear',
        datos: null,
        programaIdPreseleccionado: null
    });
    const [modalExcepcion, setModalExcepcion] = useState(null);
    const [modalCargarAbierto, setModalCargarAbierto] = useState(false);
    const [modalConfirmacion, setModalConfirmacion] = useState({
        abierto: false,
        titulo: '',
        mensaje: '',
        onConfirmar: null
    });
    const [modalExportarAbierto, setModalExportarAbierto] = useState(false);

    // 4. Cálculos memoizados
    const todasLasSesiones = useMemo(
        () => generarTodasLasSesiones(asignaciones, programas),
        [asignaciones, programas]
    );

    const mapaDeChoques = useMemo(
        () => detectarChoques(todasLasSesiones),
        [todasLasSesiones]
    );

    const resumenAsignaciones = useMemo(
        () => calcularResumenPorAsignacion(asignaciones, programas, todasLasSesiones, docente),
        [asignaciones, programas, todasLasSesiones, docente]
    );

    const currentAsig = useMemo(
        () => asignaciones.find((a) => a.id === asignacionSeleccionadaId) || asignaciones[0] || null,
        [asignaciones, asignacionSeleccionadaId]
    );

    const currentPrograma = useMemo(
        () => programas.find((p) => p.id === currentAsig?.programaId) || null,
        [programas, currentAsig]
    );

    const metricasActuales = useMemo(
        () => calcularMetricasAsignacion(todasLasSesiones, currentAsig?.id),
        [todasLasSesiones, currentAsig]
    );

    const mesesCalendario = useMemo(() => {
        if (!currentAsig) return [];
        const sesionesAsig = todasLasSesiones.filter((s) => s.asignacionId === currentAsig.id);
        return agruparMesesCalendario(sesionesAsig);
    }, [todasLasSesiones, currentAsig]);

    // 5. Acciones: Paso 1 (Docente)
    const guardarDocente = (datosDocente) => {
        setDocente({ ...datosDocente, registrado: true });
        setModalDocenteAbierto(false);
        toast.success('Información del docente guardada');
    };

    // 6. Acciones: Paso 2 (Programas)
    const guardarPrograma = (datosPrograma) => {
        if (datosPrograma.id) {
            setProgramas((prev) =>
                prev.map((p) => (p.id === datosPrograma.id ? { ...p, ...datosPrograma } : p))
            );
            toast.success('Programa actualizado');
        } else {
            const nuevoPrograma = { ...datosPrograma, id: `prog-${Date.now()}` };
            setProgramas((prev) => [...prev, nuevoPrograma]);
            toast.success('Programa agregado');
        }
        setModalPrograma({ abierto: false, modo: 'crear', datos: null });
    };

    const solicitarEliminarPrograma = (programa) => {
        const asigsAsociadas = asignaciones.filter((a) => a.programaId === programa.id);
        setModalConfirmacion({
            abierto: true,
            titulo: 'Eliminar programa',
            mensaje:
                asigsAsociadas.length > 0
                    ? `¿Eliminar "${programa.nombre}" junto con sus ${asigsAsociadas.length} asignación(es)?`
                    : `¿Eliminar el programa "${programa.nombre}"?`,
            onConfirmar: () => {
                const idsAEliminar = new Set(asigsAsociadas.map((a) => a.id));
                setProgramas((prev) => prev.filter((p) => p.id !== programa.id));
                setAsignaciones((prev) => {
                    const restantes = prev.filter((a) => a.programaId !== programa.id);
                    if (idsAEliminar.has(asignacionSeleccionadaId)) {
                        setAsignacionSeleccionadaId(restantes[0]?.id || null);
                    }
                    return restantes;
                });
                setSeleccionadasResumen((prev) => prev.filter((id) => !idsAEliminar.has(id)));
                setModalConfirmacion((prev) => ({ ...prev, abierto: false }));
                toast.success('Programa eliminado');
            }
        });
    };

    // 7. Acciones: Paso 3 (Asignaciones y Excepciones)
    const guardarAsignacion = (datosAsignacion) => {
        if (datosAsignacion.id) {
            setAsignaciones((prev) =>
                prev.map((a) => (a.id === datosAsignacion.id ? { ...a, ...datosAsignacion } : a))
            );
            toast.success('Asignación actualizada');
        } else {
            const nuevoId = `asig-${Date.now()}`;
            setAsignaciones((prev) => [...prev, { ...datosAsignacion, id: nuevoId, excepciones: {} }]);
            setAsignacionSeleccionadaId(nuevoId);
            setSeleccionadasResumen((prev) => [...prev, nuevoId]);
            toast.success('Asignación creada');
        }
        setModalAsignacion({ abierto: false, modo: 'crear', datos: null, programaIdPreseleccionado: null });
    };

    const solicitarEliminarAsignacion = (asig) => {
        const prog = programas.find((p) => p.id === asig.programaId);
        const etiqueta = obtenerEtiquetaAsignacion(asig, prog);
        setModalConfirmacion({
            abierto: true,
            titulo: 'Eliminar asignación',
            mensaje: `¿Deseas eliminar la asignación "${etiqueta}"?`,
            onConfirmar: () => {
                setAsignaciones((prev) => {
                    const restantes = prev.filter((a) => a.id !== asig.id);
                    if (asignacionSeleccionadaId === asig.id) {
                        setAsignacionSeleccionadaId(restantes[0]?.id || null);
                    }
                    return restantes;
                });
                setSeleccionadasResumen((prev) => prev.filter((id) => id !== asig.id));
                setModalConfirmacion((prev) => ({ ...prev, abierto: false }));
                toast.success('Asignación eliminada');
            }
        });
    };

    const guardarExcepcionDia = (fecha, ajuste) => {
        if (!currentAsig) return;
        setAsignaciones((prev) =>
            prev.map((a) => {
                if (a.id !== currentAsig.id) return a;
                const nuevasExcepciones = { ...(a.excepciones || {}) };
                if (ajuste === null) {
                    delete nuevasExcepciones[fecha];
                } else {
                    nuevasExcepciones[fecha] = ajuste;
                }
                return { ...a, excepciones: nuevasExcepciones };
            })
        );
        setModalExcepcion(null);
        toast.success(ajuste === null ? 'Horario original restablecido' : 'Excepción guardada');
    };

    // 8. Exportación (Excel, Word y Respaldo JSON)
    const exportarDocumentosSeleccionados = async (opciones) => {
        if (!docente.registrado) {
            toast.error('Primero registra la información del docente');
            return;
        }

        const necesitaPayload = opciones.excel || opciones.correoWord || opciones.informeWord;
        let payload = null;

        if (necesitaPayload) {
            if (seleccionadasResumen.length === 0) {
                toast.error('Selecciona al menos una asignación en el Resumen de Horas');
                return;
            }
            payload = construirPayloadExportacion({
                docente,
                programas,
                asignaciones,
                todasLasSesiones,
                seleccionadasIds: seleccionadasResumen
            });
        }

        const generados = [];

        if (opciones.excel && payload) {
            generarExpedienteCompletoExcel(payload);
            generados.push('Excel');
        }

        if (opciones.correoWord && payload) {
            await generarCorreoWord({
                docenteInfo: payload.docenteInfo,
                programas: payload.programas,
                asignaciones: payload.asignacionesHorarios
            });
            generados.push('Correo Word');
        }

        if (opciones.informeWord && payload) {
            const MESES_CORTOS = [
                'ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.',
                'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'
            ];
            const fmtCorta = (iso) => {
                if (!iso) return '';
                const [y, m, d] = iso.split('-').map(Number);
                return `${String(d).padStart(2, '0')} ${MESES_CORTOS[m - 1]} ${y}`;
            };

            const inicios = payload.asignacionesHorarios.map((a) => a.fechaInicio).filter(Boolean).sort();
            const fines = payload.asignacionesHorarios.map((a) => a.fechaFin).filter(Boolean).sort();
            const periodoTexto =
                inicios.length && fines.length
                    ? `${fmtCorta(inicios[0])} – ${fmtCorta(fines[fines.length - 1])}`
                    : '';

            const hoy = new Date();
            const fechaEmision = `${String(hoy.getDate()).padStart(2, '0')} ${MESES_CORTOS[hoy.getMonth()]} ${hoy.getFullYear()}`;
            const primerProg = payload.programas[0] || {};
            const primeraAsig = payload.asignacionesHorarios[0] || {};

            let logoBuffer = null;
            try {
                const resp = await fetch('/logo-ues.png');
                const contentType = resp.headers.get('content-type') || '';
                if (resp.ok && contentType.startsWith('image/')) {
                    logoBuffer = await resp.arrayBuffer();
                }
            } catch (_) {
                // Usa texto institucional de respaldo si no hay logo
            }

            await generarInformeMaestriasWord({
                datosInforme: {
                    refInforme: 'EP-0000-2026',
                    fechaEmision,
                    periodoTexto,
                    refSolicitud: primerProg.solicitudAprobacion || '',
                    acuerdoJD: primerProg.acuerdoImparticion || '',
                    docenteNombre: docente.nombreCompleto || 'Docente',
                    modalidadClases: docente.modalidadServicio || 'En línea',
                    modalidadContratacion: docente.tipoContrato || 'Servicios Profesionales no Personales',
                    programaNombre: primerProg.nombre || '',
                    cohorte: primerProg.edicionCohorte || '',
                    cicloPensum: primeraAsig.moduloCiclo || '',
                    estudiantesAtendidos: Number(primerProg.alumnosInscritos) || 0,
                    dificultades: 'Ninguna dificultad reportada durante el desarrollo de la asignatura.',
                    nivelDesempeno: 'Excelente',
                    comentariosDesempeno: `El docente ${docente.nombreCompleto} obtuvo un desempeño Excelente, demostrando compromiso, dominio técnico y experiencia en la impartición de la asignatura.`
                },
                asignaciones: payload.asignacionesHorarios,
                sesiones: payload.sesionesHorarios,
                logoBuffer
            });
            generados.push('Informe Word');
        }

        if (opciones.respaldoJson) {
            descargarRespaldoJSON({ docente, programas, asignaciones, seleccionadasResumen });
            generados.push('Respaldo JSON');
        }

        setModalExportarAbierto(false);
        if (generados.length > 0) {
            toast.success(`Descargado: ${generados.join(', ')}`);
        }
    };

    const cargarRespaldoDesdeArchivo = (file) => {
        if (!file) return;
        if (!file.name.endsWith('.json') && file.type !== 'application/json') {
            toast.error('Por favor selecciona un archivo .json válido');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const raw = JSON.parse(event.target.result);
                const restaurado = parsearRespaldoJSON(raw);
                setDocente(restaurado.docente);
                setProgramas(restaurado.programas);
                setAsignaciones(restaurado.asignaciones);
                setSeleccionadasResumen(restaurado.seleccionadasResumen);
                setAsignacionSeleccionadaId(restaurado.asignaciones[0]?.id || null);
                setModalCargarAbierto(false);
                toast.success('Respaldo cargado correctamente');
            } catch (err) {
                toast.error('El archivo JSON está dañado o no es compatible');
            }
        };
        reader.readAsText(file);
    };

    const solicitarLimpiarTodo = () => {
        setModalConfirmacion({
            abierto: true,
            titulo: 'Limpiar toda la sesión',
            mensaje: 'Se borrarán los datos del docente, programas y asignaciones actuales. ¿Continuar?',
            onConfirmar: () => {
                setDocente(DOCENTE_INICIAL);
                setProgramas([]);
                setAsignaciones([]);
                setAsignacionSeleccionadaId(null);
                setSeleccionadasResumen([]);
                setActiveTab('calendario');
                setModalConfirmacion((prev) => ({ ...prev, abierto: false }));
                toast.success('Sesión reiniciada');
            }
        });
    };

    return {
        // Estado
        docente,
        programas,
        asignaciones,
        currentAsig,
        currentPrograma,
        asignacionSeleccionadaId,
        setAsignacionSeleccionadaId,
        seleccionadasResumen,
        setSeleccionadasResumen,
        activeTab,
        setActiveTab,
        vistaSesiones,
        setVistaSesiones,

        // Cálculos
        todasLasSesiones,
        mapaDeChoques,
        resumenAsignaciones,
        metricasActuales,
        mesesCalendario,

        // Modales
        modalDocenteAbierto,
        setModalDocenteAbierto,
        modalPrograma,
        setModalPrograma,
        modalAsignacion,
        setModalAsignacion,
        modalExcepcion,
        setModalExcepcion,
        modalCargarAbierto,
        setModalCargarAbierto,
        modalConfirmacion,
        setModalConfirmacion,
        modalExportarAbierto,
        setModalExportarAbierto,

        // Acciones
        guardarDocente,
        guardarPrograma,
        solicitarEliminarPrograma,
        guardarAsignacion,
        solicitarEliminarAsignacion,
        guardarExcepcionDia,
        exportarDocumentosSeleccionados,
        cargarRespaldoDesdeArchivo,
        solicitarLimpiarTodo
    };
}
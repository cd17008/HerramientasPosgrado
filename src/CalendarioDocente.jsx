import { useState, useMemo, useRef, useEffect } from 'react';
import { generarExpedienteCompletoExcel } from './services/excel/excelExport';


//Import librerias, elementos visuales 
import toast, { Toaster } from 'react-hot-toast';
import {
  Calendar as IconCalendar,
  Clock as IconClock,
  Plus as IconPlus,
  Pencil as IconEdit,
  Trash2 as IconTrash,
  Download as IconDownload,
  Upload as IconUpload,
  TriangleAlert as IconAlert,
  Check as IconCheck,
  Layers as IconLayers,
  X as IconX,
  List as IconList,
} from 'lucide-react';

//Import de constantes
import {
  DIAS_SEMANA,
  FUNCION_COORDINADOR_DEFAULT,
  FUNCION_DOCENTE_DEFAULT,
  esCargoCoordinador,
  ASUETOS_BASE,
} from './const/academico';
import {
  timeToMinutes,
  formatTime12h,
  formatDateIso,
  formatDateDDMMYYYY,
  getMondayIso,
  formatearRangoFechasTexto
} from './utils/dateUtils';



//Import de servicios propios
import {
  getProgramas,
  getDocentes,
  getDocentePorNombre,
  getAsignaturasPorPrograma,
  getGrados,
  getNacionalidades,
  getTiposContratoEP,
  getCategoriasDocente,
  getEdiciones,
  getCohortesPorPrograma
} from './services/catalogService';
import { generarCorreoWord } from './services/word/buildCorreoWordService';
import { generarInformeMaestriasWord } from './services/word/informe/buildInformeMaestrias';



export default function DocenteScheduleTool() {

  //Estado inicial DEMO
  const [docenteNombre, setDocenteNombre] = useState('LEONARDO JAVIER MENDOZA BLANCO');
  const [asignaciones, setAsignaciones] = useState([
    {
      id: 'asig-1',
      programaNombre: 'MAESTRÍA EN ENERGÍAS RENOVABLES Y MEDIO AMBIENTE',
      programaTipo: 'MAESTRIA',
      materia: 'CELDAS DE COMBUSTIBLE Y PILAS DE HIDROGENO',
      cargo: 'DOCENTE DE MAESTRIA',
      fechaInicio: '2026-10-19',
      fechaFin: '2026-11-16',
      dias: {
        2: { activo: true, horaInicio: '18:00', horaFin: '21:00' },
        4: { activo: true, horaInicio: '18:00', horaFin: '21:00' }
      },
      excepciones: {}
    },
    {
      id: 'asig-2',
      programaNombre: 'DIPLOMADO EN POWER BI',
      programaTipo: 'DIPLOMADO',
      materia: 'MODULO II',
      cargo: 'DOCENTE DE DIPLOMADO',
      fechaInicio: '2026-11-03',
      fechaFin: '2026-12-12',
      dias: {
        6: { activo: true, horaInicio: '08:00', horaFin: '12:00' }
      },
      excepciones: {}
    }
  ]);
  const [activeTab, setActiveTab] = useState('calendario');
  const [asignacionSeleccionadaId, setAsignacionSeleccionadaId] = useState('asig-1');
  const [seleccionadasResumen, setSeleccionadasResumen] = useState(['asig-1', 'asig-2']);
  const [diasFiltro, setDiasFiltro] = useState([]);
  const currentAsig = asignaciones.find((a) => a.id === asignacionSeleccionadaId) || asignaciones[0] || null;
  const DIAS_CABECERA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const programasCatalogo = getProgramas();
  const docentesCatalogo = getDocentes();
  const opcionesCargo = ['DOCENTE DE MAESTRIA', 'DOCENTE DE DIPLOMADO', 'COORDINADOR DE MAESTRIA', 'COORDINADOR DE DIPLOMADO'];
  const ciclosCatalogo = ['I', 'II', 'III', 'IV'];
  const renderInputConSugerencias = (id, value, options, onChange, className, props = {}) => (
    <>
      <input {...props} type="text" list={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={className} />
      <datalist id={id}>
        {options.filter(Boolean).map((opcion) => {
          const valor = typeof opcion === 'string' ? opcion : opcion.value;
          const etiqueta = typeof opcion === 'string' ? opcion : opcion.label;
          return <option key={valor} value={valor}>{etiqueta !== valor ? etiqueta : undefined}</option>;
        })}
      </datalist>
    </>
  );

  const actualizarDocenteSeleccionado = (nombreCompleto) => {
    const docente = getDocentePorNombre(nombreCompleto);
    setDocenteNombre(nombreCompleto);
    if (!docente) return;
    setRequerimientoForm((prev) => prev ? ({
      ...prev,
      docenteInfo: {
        ...prev.docenteInfo,
        nombreCompleto,
        profesion: docente.profesion || prev.docenteInfo.profesion,
        nacionalidad: docente.nacionalidad || prev.docenteInfo.nacionalidad,
        correo: docente.correo || prev.docenteInfo.correo,
        calificacionDocente: docente.categoria || prev.docenteInfo.calificacionDocente,
        pagoPorHora: docente.tasaHora || prev.docenteInfo.pagoPorHora
      }
    }) : prev);
  };


  useEffect(() => {
    if (currentAsig?.dias) {
      const diasActivos = DIAS_SEMANA
        .filter((d) => currentAsig.dias[d.id]?.activo)
        .map((d) => d.id);
      setDiasFiltro(diasActivos);
    }
  }, [currentAsig?.id]);

  // Modales
  const [modalAsignacionAbierto, setModalAsignacionAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [modalConfirmacion, setModalConfirmacion] = useState({
    abierto: false,
    titulo: '',
    mensaje: '',
    textoBoton: 'Confirmar',
    tipo: 'peligro',
    onConfirmar: () => { },
    tipo: 'peligro', // 'peligro' | 'info'
    onConfirmar: () => { }
  });

  const abrirConfirmacion = ({ titulo, mensaje, textoBoton = 'Confirmar', tipo = 'peligro', onConfirmar }) => {
    setModalConfirmacion({
      abierto: true,
      titulo,
      mensaje,
      textoBoton,
      tipo,
      onConfirmar: () => {
        onConfirmar();
        setModalConfirmacion((prev) => ({ ...prev, abierto: false }));
      }
    });
  };
  const [formAsignacion, setFormAsignacion] = useState({
    id: '',
    programaNombre: '',
    programaTipo: 'MAESTRIA',
    cargo: 'DOCENTE DE MAESTRIA',
    materia: '',
    fechaInicio: '2026-10-19',
    fechaFin: '2026-11-16',
    dias: {
      1: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
      2: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
      3: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
      4: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
      5: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
      6: { activo: false, horaInicio: '08:00', horaFin: '12:00' },
      0: { activo: false, horaInicio: '08:00', horaFin: '12:00' }
    }
  });

  const [modalExcepcion, setModalExcepcion] = useState(null);
  const [excepForm, setExcepForm] = useState({
    fecha: '',
    tipo: 'MODIFICAR',
    horaInicio: '18:00',
    horaFin: '21:00',
    motivo: ''
  });

  // Modal Requerimiento
  const [modalRequerimientoAbierto, setModalRequerimientoAbierto] = useState(false);
  const [requerimientoForm, setRequerimientoForm] = useState(null);
  const [modalCargarAbierto, setModalCargarAbierto] = useState(false);
  const [estaArrastrando, setEstaArrastrando] = useState(false);
  const [vistaSesiones, setVistaSesiones] = useState('cuadricula');

  // Referencia de archivo para importar JSON
  const fileInputRef = useRef(null);

  // Cómputo de Sesiones
  const todasLasSesiones = useMemo(() => {
    const sesiones = [];

    asignaciones.forEach((asig) => {
      if (!asig.fechaInicio || !asig.fechaFin) return;

      const [startYear, startMonth, startDay] = asig.fechaInicio.split('-').map(Number);
      const [endYear, endMonth, endDay] = asig.fechaFin.split('-').map(Number);

      let current = new Date(startYear, startMonth - 1, startDay);
      const end = new Date(endYear, endMonth - 1, endDay);

      while (current <= end) {
        const fechaStr = formatDateIso(current);
        const dayOfWeek = current.getDay();
        const asuetoNombre = ASUETOS_BASE[fechaStr];
        const configDia = asig.dias[dayOfWeek];
        const excepcion = asig.excepciones ? asig.excepciones[fechaStr] : null;

        let sesionValida = false;
        let hInicio = '';
        let hFin = '';
        let duracionHoras = 0;
        let esAsueto = Boolean(asuetoNombre);
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
          programaNombre: asig.programaNombre,
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
  }, [asignaciones]);

  // Auditoría de Choques
  //Choques unicos
  const { mapaDeChoques, listaChoquesUnicos } = useMemo(() => {
    const mapa = {};
    const unicos = [];
    const paresVistos = new Set();

    const sesionesActivas = todasLasSesiones.filter((s) => s.activa && !s.esAsueto);

    for (let i = 0; i < sesionesActivas.length; i++) {
      const s1 = sesionesActivas[i];

      for (let j = i + 1; j < sesionesActivas.length; j++) {
        const s2 = sesionesActivas[j];

        // Solo comparar sesiones del mismo día y de asignaciones distintas
        if (s1.fecha !== s2.fecha || s1.asignacionId === s2.asignacionId) continue;

        // Verificar solapamiento de horas (en minutos o cadenas HH:MM)
        const haySolapamiento = s1.horaInicio < s2.horaFin && s2.horaInicio < s1.horaFin;
        if (!haySolapamiento) continue;

        // 1. Mantener el mapa bidireccional para colorear ambas tarjetas/celdas en el calendario
        if (!mapa[s1.id]) mapa[s1.id] = [];
        mapa[s1.id].push({
          contra: s2.materia,
          rango: `${s2.horaInicio} - ${s2.horaFin}`
        });

        if (!mapa[s2.id]) mapa[s2.id] = [];
        mapa[s2.id].push({
          contra: s1.materia,
          rango: `${s1.horaInicio} - ${s1.horaFin}`
        });

        // 2. Registrar el choque UNA SOLA VEZ para el reporte de Auditoría
        const clavePar = [s1.id, s2.id].sort().join('__');
        if (!paresVistos.has(clavePar)) {
          paresVistos.add(clavePar);
          unicos.push({
            id: clavePar,
            fecha: s1.fecha,
            nombreDia: s1.nombreDia,
            asignacionA: {
              id: s1.asignacionId,
              materia: s1.materia,
              programa: s1.programaNombre || '',
              horario: `${s1.horaInicio} - ${s1.horaFin}`
            },
            asignacionB: {
              id: s2.asignacionId,
              materia: s2.materia,
              programa: s2.programaNombre || '',
              horario: `${s2.horaInicio} - ${s2.horaFin}`
            }
          });
        }
      }
    }

    // Ordenar cronológicamente
    unicos.sort((a, b) => a.fecha.localeCompare(b.fecha));

    return { mapaDeChoques: mapa, listaChoquesUnicos: unicos };
  }, [todasLasSesiones]);

  // Resumen de Asignaciones
  const resumenPorAsignacion = useMemo(() => {
    return asignaciones.map((asig) => {
      const sesionesAsig = todasLasSesiones.filter((s) => s.activa && s.asignacionId === asig.id);
      const totalHoras = sesionesAsig.reduce((acc, curr) => acc + curr.duracionHoras, 0);
      return {
        id: asig.id,
        programaNombre: asig.programaNombre,
        programaTipo: asig.programaTipo,
        cargo: asig.cargo,
        materia: asig.materia,
        fechaInicio: asig.fechaInicio,
        fechaFin: asig.fechaFin,
        totalHoras,
        totalSesiones: sesionesAsig.length
      };
    });
  }, [asignaciones, todasLasSesiones]);

  const totalesSeleccionados = useMemo(() => {
    const filtradas = resumenPorAsignacion.filter((a) => seleccionadasResumen.includes(a.id));
    const totalHoras = filtradas.reduce((acc, curr) => acc + curr.totalHoras, 0);
    const totalSesiones = filtradas.reduce((acc, curr) => acc + curr.totalSesiones, 0);
    return { totalHoras, totalSesiones };
  }, [resumenPorAsignacion, seleccionadasResumen]);

  const metricasAsigActiva = useMemo(() => {
    let totalHoras = 0;
    let totalSesiones = 0;
    const porMes = {};
    const porSemana = {};

    todasLasSesiones
      .filter((s) => s.activa && s.asignacionId === asignacionSeleccionadaId)
      .forEach((s) => {
        totalHoras += s.duracionHoras;
        totalSesiones += 1;
        const mesKey = s.fecha.substring(0, 7);
        porMes[mesKey] = (porMes[mesKey] || 0) + s.duracionHoras;

        const semanaKey = getMondayIso(s.fecha);
        porSemana[semanaKey] = (porSemana[semanaKey] || 0) + s.duracionHoras;
      });

    return { totalHoras, totalSesiones, porMes, porSemana };
  }, [todasLasSesiones, asignacionSeleccionadaId]);

  // Manejadores de Estado y Modales
  const handleLimpiarTodo = () => {
    abrirConfirmacion({
      titulo: '¿Limpiar todos los datos?',
      mensaje: 'Esta acción eliminará todas las asignaciones registradas y limpiará la información del docente. No se puede deshacer.',
      textoBoton: 'Sí, limpiar todo',
      tipo: 'peligro',
      onConfirmar: () => {
        setDocenteNombre('');
        setAsignaciones([]);
        setAsignacionSeleccionadaId(null);
        setSeleccionadasResumen([]);
        setRequerimientoForm(null);
        toast.success('Se han limpiado todas las asignaciones.');
      }
    });
  };

  const handleDescargarInformePrueba = async () => {
    const asignacionesFiltradas = asignaciones.filter((a) => seleccionadasResumen.includes(a.id));

    if (asignacionesFiltradas.length === 0) {
      alert('Por favor selecciona al menos una asignación mediante los checkboxes para generar el informe.');
      return;
    }

    const sesionesFiltradas = todasLasSesiones.filter((s) => seleccionadasResumen.includes(s.asignacionId));

    // 1. Calcular el periodo global (fecha más temprana a la más tardía) y fecha de emisión
    const MESES_CORTOS = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
    const formatearFechaCorta = (isoStr) => {
      if (!isoStr) return '';
      const [y, m, d] = isoStr.split('-').map(Number);
      return `${String(d).padStart(2, '0')} ${MESES_CORTOS[m - 1]} ${y}`;
    };

    const fechasInicio = asignacionesFiltradas.map((a) => a.fechaInicio).filter(Boolean).sort();
    const fechasFin = asignacionesFiltradas.map((a) => a.fechaFin).filter(Boolean).sort();
    const periodoTexto =
      fechasInicio.length && fechasFin.length
        ? `${formatearFechaCorta(fechasInicio[0])} – ${formatearFechaCorta(fechasFin[fechasFin.length - 1])}`
        : '';

    const hoy = new Date();
    const fechaEmision = `${String(hoy.getDate()).padStart(2, '0')} ${MESES_CORTOS[hoy.getMonth()]} ${hoy.getFullYear()}`;

    // 2. Cargar logo opcional desde /public/logo-ues.png si lo tienes en tu proyecto
    let logoBuffer = null;
    try {
      const resp = await fetch('/logo-ues.png');
      const contentType = resp.headers.get('content-type') || '';
      if (resp.ok && contentType.startsWith('image/')) {
        logoBuffer = await resp.arrayBuffer();
      }
    } catch (_) {
      // Si no existe la imagen aún, se usará el texto institucional 'UES'
    }

    // 3. Llamar al servicio generador con datos de prueba mapeados desde el estado actual
    await generarInformeMaestriasWord({
      datosInforme: {
        refInforme: 'EP-0385-2026',
        fechaEmision,
        periodoTexto,
        refSolicitud: 'EP-0319-2026',
        acuerdoJD: '',
        docenteNombre: docenteNombre || 'Docente Sin Nombre',
        modalidadClases: 'Semipresencial',
        modalidadContratacion: 'Servicios Profesionales no Personales',
        programaNombre: asignacionesFiltradas[0]?.programaNombre || '',
        cohorte: '7° Cohorte',
        cicloPensum: 'Ciclo II',
        estudiantesAtendidos: 15,
        dificultades: 'Ninguna dificultad reportada durante el desarrollo de la asignatura.',
        nivelDesempeno: 'Excelente',
        comentariosDesempeno: `El Maestro ${docenteNombre} obtuvo un desempeño Excelente, demostrando compromiso, dominio técnico y experiencia en la impartición de la asignatura.`
      },
      asignaciones: asignacionesFiltradas,
      sesiones: sesionesFiltradas,
      logoBuffer
    });
  };

  const handleAbrirCrear = () => {
    setAlertaPeriodo(null);
    setModoEdicion(false);
    setFormAsignacion({
      id: `asig-${Date.now()}`,
      programaNombre: asignaciones[0]?.programaNombre || '',
      programaTipo: asignaciones[0]?.programaTipo || 'MAESTRIA',
      cargo: 'DOCENTE DE MAESTRIA',
      materia: '',
      fechaInicio: '2026-10-19',
      fechaFin: '2026-11-16',
      dias: {
        1: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
        2: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
        3: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
        4: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
        5: { activo: false, horaInicio: '18:00', horaFin: '20:00' },
        6: { activo: false, horaInicio: '08:00', horaFin: '12:00' },
        0: { activo: false, horaInicio: '08:00', horaFin: '12:00' }
      }
    });


    setModalAsignacionAbierto(true);
  };

  const handleAbrirEditar = (asig) => {
    setAlertaPeriodo(null);
    setModoEdicion(true);
    setFormAsignacion({
      id: asig.id,
      programaNombre: asig.programaNombre || '',
      programaTipo: asig.programaTipo || 'MAESTRIA',
      cargo: asig.cargo || 'DOCENTE DE MAESTRIA',
      materia: asig.materia,
      fechaInicio: asig.fechaInicio,
      fechaFin: asig.fechaFin,
      dias: JSON.parse(JSON.stringify(asig.dias))
    });
    setModalAsignacionAbierto(true);
  };

  const handleEliminarAsignacion = (idAEliminar) => {
    abrirConfirmacion({
      titulo: '¿Eliminar asignación?',
      mensaje: 'La materia o cargo seleccionado será removido permanentemente de la programación.',
      textoBoton: 'Eliminar asignación',
      tipo: 'peligro',
      onConfirmar: () => {
        const restantes = asignaciones.filter((a) => a.id !== idAEliminar);
        setAsignaciones(restantes);
        setSeleccionadasResumen((prev) => prev.filter((id) => id !== idAEliminar));
        if (asignacionSeleccionadaId === idAEliminar) {
          setAsignacionSeleccionadaId(restantes.length > 0 ? restantes[0].id : null);
        }
        toast.success('Asignación eliminada correctamente.');
      }
    });
  };

  // Respaldo JSON (Exportar / Importar)
  const descargarRespaldoJSON = (datosPersonalizados = null) => {
    const payload = datosPersonalizados || {
      docenteNombre,
      docenteInfo: requerimientoForm?.docenteInfo || null,
      programas: requerimientoForm?.programas || [],
      requerimientoForm,
      asignaciones,
      seleccionadasResumen,
      fechaExportacion: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const sanitized = (docenteNombre || 'Docente').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.href = url;
    link.download = `Respaldo_Horarios_${sanitized}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Procesa el archivo JSON ya sea por arrastre o por selección
  const procesarArchivoJSON = (file) => {
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      toast.error('Formato no válido: selecciona un archivo .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const datos = JSON.parse(event.target.result);
        if (datos.docenteNombre !== undefined) setDocenteNombre(datos.docenteNombre);

        if (datos.requerimientoForm) {
          setRequerimientoForm(datos.requerimientoForm);
        } else if (datos.docenteInfo || Array.isArray(datos.programas)) {
          setRequerimientoForm({
            docenteInfo: datos.docenteInfo || {},
            programas: datos.programas || []
          });
        }

        if (Array.isArray(datos.asignaciones)) {
          setAsignaciones(datos.asignaciones);
          if (datos.asignaciones.length > 0) {
            setAsignacionSeleccionadaId(datos.asignaciones[0].id);
            setSeleccionadasResumen(datos.seleccionadasResumen || datos.asignaciones.map((a) => a.id));
          } else {
            setAsignacionSeleccionadaId(null);
            setSeleccionadasResumen([]);
          }
        }
        setModalCargarAbierto(false);
        toast.success('¡Respaldo JSON cargado exitosamente!');
      } catch (err) {
        toast.error('El archivo no es un JSON válido o está corrupto.');
      }
    };
    reader.readAsText(file);
  };

  const handleDropArchivo = (e) => {
    e.preventDefault();
    setEstaArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    procesarArchivoJSON(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setEstaArrastrando(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setEstaArrastrando(false);
  };

  // Apertura del Modal de Requerimiento
  const handleAbrirModalRequerimiento = () => {
    const filtradas = asignaciones.filter((a) => seleccionadasResumen.includes(a.id));
    if (filtradas.length === 0) {
      toast.error('Selecciona al menos una asignación mediante los checkboxes para exportar.');
      return;
    }

    const mapaProgramas = {};

    filtradas.forEach((asig) => {
      const pNombre = asig.programaNombre || 'Programa Sin Nombre';
      const esDip = asig.programaTipo === 'DIPLOMADO';
      const esCoord = esCargoCoordinador(asig.cargo);
      if (!mapaProgramas[pNombre]) {
        mapaProgramas[pNombre] = {
          nombre: pNombre,
          codigo: asig.programaCodigo || '',
          tipo: asig.programaTipo || (esDip ? 'DIPLOMADO' : 'MAESTRIA'),
          solicitudAprobacion: asig.numeroSolicitud || '',
          acuerdoImparticion: asig.numeroAprobacion || '',
          edicionCohorte: esDip ? 'EDICION II 2026' : '7° COHORTE',
          coordinador: '',
          clasificacionProyecto: 'A',
          alumnosInscritos: 0,
          factorSobrecupo: 1.0,
          asignaciones: []
        };
      }

      const resumen = resumenPorAsignacion.find((r) => r.id === asig.id);
      const horasCalculadas = resumen ? resumen.totalHoras : 0;

      mapaProgramas[pNombre].asignaciones.push({
        asigId: asig.id,
        asignatura: asig.materia,
        fechaInicio: asig.fechaInicio,
        fechaFin: asig.fechaFin,
        cargo: asig.cargo || (esDip ? 'DOCENTE DE DIPLOMADO' : 'DOCENTE DE MAESTRIA'),
        funciones: esCoord ? FUNCION_COORDINADOR_DEFAULT : FUNCION_DOCENTE_DEFAULT,
        moduloCiclo: 'CICLO II',
        cantidadHoras: horasCalculadas,
        pagoPorHora: esCoord ? (asig.pagoPorHora || 25.0) : '' // Tarifa propia para coordinación
      });
    });

    const prevForm = requerimientoForm;
    const prevDocente = prevForm?.docenteInfo || {};
    const prevProgramasMap = new Map(
      (prevForm?.programas || []).map((p) => [p.nombre, p])
    );

    const programasActualizados = Object.values(mapaProgramas).map((progNuevo) => {
      const progPrevio = prevProgramasMap.get(progNuevo.nombre);
      if (!progPrevio) return progNuevo;

      const prevAsigsMap = new Map(
        (progPrevio.asignaciones || []).map((a) => [a.asigId || a.id, a])
      );

      return {
        ...progNuevo,
        codigo: progPrevio.codigo ?? progNuevo.codigo,
        solicitudAprobacion: progPrevio.solicitudAprobacion ?? progNuevo.solicitudAprobacion,
        acuerdoImparticion: progPrevio.acuerdoImparticion ?? progNuevo.acuerdoImparticion,
        edicionCohorte: progPrevio.edicionCohorte ?? progNuevo.edicionCohorte,
        coordinador: progPrevio.coordinador ?? progNuevo.coordinador,
        clasificacionProyecto: progPrevio.clasificacionProyecto ?? progNuevo.clasificacionProyecto,
        alumnosInscritos: progPrevio.alumnosInscritos ?? progNuevo.alumnosInscritos,
        factorSobrecupo: progPrevio.factorSobrecupo ?? progNuevo.factorSobrecupo,
        asignaciones: progNuevo.asignaciones.map((asigNueva) => {
          const asigPrevia = prevAsigsMap.get(asigNueva.asigId || asigNueva.id);
          if (!asigPrevia) return asigNueva;
          return {
            ...asigNueva,
            cargo: asigPrevia.cargo ?? asigNueva.cargo,
            funciones: asigPrevia.funciones ?? asigNueva.funciones,
            moduloCiclo: asigPrevia.moduloCiclo ?? asigNueva.moduloCiclo,
            pagoPorHora: asigPrevia.pagoPorHora ?? asigNueva.pagoPorHora
          };
        })
      };
    });

    setRequerimientoForm({
      docenteInfo: {
        tipoContrato: 'SERVICIOS PROFESIONALES NO PERSONALES',
        tipoContratacion: 'TIEMPO NORMAL',
        profesion: '',
        nacionalidad: 'SALVADOREÑA',
        correo: '',
        modalidadServicio: 'EN LINEA',
        calificacionDocente: 'F6',
        pagoPorHora: 22.50,
        sueldoNominal: 1200.00,
        porcentajePago: 13,
        cantidadMeses: 1,
        ...prevDocente,
        nombreCompleto: docenteNombre || prevDocente.nombreCompleto || ''
      },
      programas: programasActualizados
    });
    setModalRequerimientoAbierto(true);
  };

  const handleConfirmarDescargaExcel = async (e) => {
    e.preventDefault();
    if (!requerimientoForm) return;

    const asignacionesFiltradas = asignaciones.filter((a) => seleccionadasResumen.includes(a.id));
    const sesionesFiltradas = todasLasSesiones.filter((s) => seleccionadasResumen.includes(s.asignacionId));

    // 1. Descarga del Excel con las 2 hojas (Requerimiento + Horarios)
    // Vincular el nombre del programa y módulo/ciclo editados en el modal con las asignaciones de horarios
    const mapaModalPorAsigId = new Map();
    requerimientoForm.programas.forEach((prog) => {
      (prog.asignaciones || []).forEach((aModal) => {
        mapaModalPorAsigId.set(aModal.asigId || aModal.idOriginal || aModal.id, {
          programaNombre: prog.nombre,
          codigoPrograma: prog.codigo,
          moduloCiclo: aModal.moduloCiclo
        });
      });
    });

    const asignacionesEnriquecidas = asignacionesFiltradas.map((asig) => ({
      ...asig,
      ...(mapaModalPorAsigId.get(asig.id) || {})
    }));

    generarExpedienteCompletoExcel({
      docenteInfo: requerimientoForm.docenteInfo,
      programas: requerimientoForm.programas,
      asignacionesHorarios: asignacionesEnriquecidas,
      sesionesHorarios: sesionesFiltradas
    });

    // 2. Descarga del archivo de Word (.docx) con la plantilla del correo
    await generarCorreoWord({
      docenteInfo: requerimientoForm.docenteInfo,
      programas: requerimientoForm.programas,
      asignaciones: asignacionesFiltradas
    });

    // 3. Descarga del respaldo JSON
    descargarRespaldoJSON({
      docenteNombre,
      docenteInfo: requerimientoForm.docenteInfo,
      programas: requerimientoForm.programas,
      requerimientoForm,
      asignaciones,
      seleccionadasResumen,
      fechaExportacion: new Date().toISOString()
    });

    setModalRequerimientoAbierto(false);
  };

  // 1. Validación en tiempo real para el modal de excepción diaria
  const configOriginalDiaModal = modalExcepcion
    ? currentAsig?.dias?.[modalExcepcion.diaSemanaId]
    : null;

  const rangoHorarioInvalido =
    Boolean(modalExcepcion) &&
    excepForm.tipo === 'MODIFICAR' &&
    (!excepForm.horaInicio ||
      !excepForm.horaFin ||
      timeToMinutes(excepForm.horaFin) <= timeToMinutes(excepForm.horaInicio));

  const coincideConHorarioOriginal =
    Boolean(modalExcepcion) &&
    excepForm.tipo === 'MODIFICAR' &&
    !rangoHorarioInvalido &&
    Boolean(configOriginalDiaModal?.activo) &&
    excepForm.horaInicio === configOriginalDiaModal.horaInicio &&
    excepForm.horaFin === configOriginalDiaModal.horaFin;

  // 2. Función de guardado con normalización automática
  const guardarExcepcion = () => {
    if (!excepForm.fecha || !modalExcepcion || rangoHorarioInvalido) return;

    setAsignaciones((prev) =>
      prev.map((asig) => {
        if (asig.id !== asignacionSeleccionadaId) return asig;
        const nuevasExcepciones = { ...(asig.excepciones || {}) };

        // Si elige RESET o si ingresó el mismo horario semanal original, se guarda como sesión normal
        if (excepForm.tipo === 'RESET' || coincideConHorarioOriginal) {
          delete nuevasExcepciones[excepForm.fecha];
        } else {
          nuevasExcepciones[excepForm.fecha] = {
            tipo: excepForm.tipo,
            horaInicio: excepForm.horaInicio,
            horaFin: excepForm.horaFin,
            motivo: excepForm.motivo || 'Ajuste operativo'
          };
        }
        return { ...asig, excepciones: nuevasExcepciones };
      })
    );

    setModalExcepcion(null);
  };

  const cantidadChoquesTotales = Object.keys(mapaDeChoques).length;

  const mesesCalendario = useMemo(() => {
    if (!currentAsig) return [];

    const sesionesAsig = todasLasSesiones.filter(
      (s) => s.asignacionId === currentAsig.id
    );

    // 1. Agrupar sesiones por clave 'YYYY-MM'
    const grupos = {};
    sesionesAsig.forEach((s) => {
      const mesKey = s.fecha.substring(0, 7);
      if (!grupos[mesKey]) grupos[mesKey] = [];
      grupos[mesKey].push(s);
    });

    // 2. Construir la cuadrícula de celdas para cada mes
    return Object.entries(grupos)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mesKey, sesionesMes]) => {
        const [year, month] = mesKey.split('-').map(Number);
        const primerDiaMes = new Date(year, month - 1, 1);
        const totalDiasMes = new Date(year, month, 0).getDate();

        const offsetInicio = primerDiaMes.getDay();

        // Indexar sesiones del mes por fecha 'YYYY-MM-DD' para acceso O(1)
        const mapaSesiones = {};
        sesionesMes.forEach((s) => {
          mapaSesiones[s.fecha] = s;
        });

        const celdas = [];

        // Celdas vacías antes del día 1
        for (let i = 0; i < offsetInicio; i++) {
          celdas.push({ tipo: 'vacio', key: `empty-${mesKey}-${i}` });
        }

        // Celdas de cada día del mes (1 al 28/30/31)
        for (let dia = 1; dia <= totalDiasMes; dia++) {
          const fechaIso = `${year}-${String(month).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
          const fueraDePeriodo =
            (currentAsig.fechaInicio && fechaIso < currentAsig.fechaInicio) ||
            (currentAsig.fechaFin && fechaIso > currentAsig.fechaFin);

          celdas.push({
            tipo: 'dia',
            key: fechaIso,
            numeroDia: dia,
            fechaIso,
            fueraDePeriodo,
            sesion: mapaSesiones[fechaIso] || null
          });
        }

        const nombreMes = primerDiaMes.toLocaleString('es-ES', {
          month: 'long',
          year: 'numeric'
        });

        return {
          mesKey,
          titulo: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
          celdas
        };
      });
  }, [todasLasSesiones, currentAsig]);

  const fechaTieneAsignacion = (fechaIso, diasConfig) => {
    if (!fechaIso || !diasConfig) return false;
    const [y, m, d] = fechaIso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const dayOfWeek = dt.getDay();
    return Boolean(diasConfig[dayOfWeek]?.activo);
  };

  const calcularPeriodoAjustado = (fechaInicio, fechaFin, diasConfig) => {
    if (!fechaInicio || !fechaFin || fechaInicio > fechaFin) return null;

    const [sy, sm, sd] = fechaInicio.split('-').map(Number);
    const [ey, em, ed] = fechaFin.split('-').map(Number);
    let current = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    let primeraFechaValida = null;
    let ultimaFechaValida = null;

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (diasConfig[dayOfWeek]?.activo) {
        const iso = formatDateIso(current);
        if (!primeraFechaValida) primeraFechaValida = iso;
        ultimaFechaValida = iso;
      }
      current.setDate(current.getDate() + 1);
    }

    return primeraFechaValida && ultimaFechaValida
      ? { fechaInicio: primeraFechaValida, fechaFin: ultimaFechaValida }
      : null;
  };

  const [alertaPeriodo, setAlertaPeriodo] = useState(null);

  // Función que persiste la asignación (creación o edición)
  const confirmarGuardadoAsignacion = (datosAGuardar) => {
    setAsignaciones((prev) => {
      const existe = prev.some((a) => a.id === datosAGuardar.id);
      if (existe) {
        return prev.map((a) => (a.id === datosAGuardar.id ? { ...a, ...datosAGuardar } : a));
      }
      return [...prev, { ...datosAGuardar, excepciones: {} }];
    });

    setAsignacionSeleccionadaId(datosAGuardar.id);
    setAlertaPeriodo(null);
    setModalAsignacionAbierto(false); // O el estado con el que cierras tu modal de asignación
  };

  // Validación previa al guardar
  const handleGuardarAsignacion = (e) => {
    if (e) e.preventDefault();

    const tieneAlgunDiaActivo = Object.values(formAsignacion.dias || {}).some((d) => d?.activo);
    const inicioValido = fechaTieneAsignacion(formAsignacion.fechaInicio, formAsignacion.dias);
    const finValido = fechaTieneAsignacion(formAsignacion.fechaFin, formAsignacion.dias);

    // Si hay días configurados, pero la fecha de inicio o de fin no cae en ninguno de ellos
    if (tieneAlgunDiaActivo && (!inicioValido || !finValido)) {
      const [sy, sm, sd] = formAsignacion.fechaInicio.split('-').map(Number);
      const [ey, em, ed] = formAsignacion.fechaFin.split('-').map(Number);
      const diaInicioNombre = DIAS_SEMANA.find((d) => d.id === new Date(sy, sm - 1, sd).getDay())?.nombre;
      const diaFinNombre = DIAS_SEMANA.find((d) => d.id === new Date(ey, em - 1, ed).getDay())?.nombre;

      const sugerencia = calcularPeriodoAjustado(
        formAsignacion.fechaInicio,
        formAsignacion.fechaFin,
        formAsignacion.dias
      );

      setAlertaPeriodo({
        inicioValido,
        finValido,
        diaInicioNombre,
        diaFinNombre,
        sugerencia
      });
      return;
    }

    // Si ambas fechas coinciden con días asignados, guarda directamente
    confirmarGuardadoAsignacion(formAsignacion);
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-800 font-sans flex flex-col">
      {/* ENCABEZADO */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              Escuela de Posgrado FIA-UES
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Ciclos 2026 / 2027
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Programación y Validación de Horarios Docentes
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAbrirModalRequerimiento}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            <IconDownload className="w-3.5 h-3.5" />
            Descargar Resumen Excel
          </button>
          <button
            type="button"
            onClick={() => setModalCargarAbierto(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold cursor-pointer transition-colors"
            title="Importar un archivo JSON previamente descargado"
          >
            <IconUpload className="w-3.5 h-3.5 text-slate-500" />
            Cargar Respaldo
          </button>

          <button
            type="button"
            onClick={handleLimpiarTodo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold cursor-pointer transition-colors"
          >
            <IconTrash className="w-3.5 h-3.5 text-slate-500" />
            Limpiar Todo
          </button>

          <div className="border-l border-slate-200 pl-3">
            <label className="block text-[11px] text-slate-500 font-medium">Docente Asignado</label>
            {renderInputConSugerencias('docentes-asignados', docenteNombre, docentesCatalogo.map((docente) => docente.nombre), setDocenteNombre, 'text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded px-2.5 py-1 focus:ring-1 focus:ring-slate-500 focus:outline-none w-56', { placeholder: 'Nombre del docente...' })}
          </div>

          <div className="border-l border-slate-200 pl-3">
            {cantidadChoquesTotales > 0 ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5">
                <IconAlert className="w-3.5 h-3.5 text-red-600" />
                <span>{listaChoquesUnicos.length} Choque(s)</span>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1">
                <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sin choques</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Barra Lateral Izquierda */}
        <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col p-4 space-y-4 flex-shrink-0 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-slate-800">
              <IconLayers className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Programas y Asignaciones</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {asignaciones.length} total
            </span>
          </div>

          <button
            type="button"
            onClick={handleAbrirCrear}
            className="flex-shrink-0 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer transition-colors"
          >
            <IconPlus className="w-3.5 h-3.5" />
            Nueva Asignación
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {asignaciones.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8 italic">
                No hay asignaciones registradas.
              </p>
            ) : (
              asignaciones.map((asig) => {
                const esActiva = asig.id === asignacionSeleccionadaId;
                const diasActivos = DIAS_SEMANA.filter((d) => asig.dias[d.id]?.activo);
                const esCoord = esCargoCoordinador(asig.cargo);

                return (
                  <div
                    key={asig.id}
                    onClick={() => setAsignacionSeleccionadaId(asig.id)}
                    className={`p-3 rounded border text-left cursor-pointer transition-colors ${esActiva
                      ? 'border-slate-800 bg-slate-50 text-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-200 text-slate-700">
                        {asig.programaTipo || 'PROGRAMA'}
                      </span>
                      {esCoord && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-indigo-100 text-indigo-800">
                          COORDINACIÓN
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-medium text-slate-500 truncate" title={asig.programaNombre}>
                      {asig.programaNombre}
                    </p>
                    <span className="font-bold text-xs leading-snug line-clamp-2 mt-0.5">
                      {asig.materia}
                    </span>

                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                      <IconCalendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDateDDMMYYYY(asig.fechaInicio)} al {formatDateDDMMYYYY(asig.fechaFin)}</span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <IconClock className="w-3 h-3 text-slate-400" />
                      <span>
                        {diasActivos.length > 0
                          ? diasActivos.map((d) => d.nombre.slice(0, 3)).join(', ')
                          : 'Sin horario semanal'}
                      </span>
                    </div>

                    {esActiva && (
                      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAbrirEditar(asig);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          <IconEdit className="w-3 h-3 text-slate-500" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEliminarAsignacion(asig.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          <IconTrash className="w-3 h-3 text-rose-600" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Panel Central */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          <div className="flex-shrink-0 px-6 pt-5 bg-slate-100 z-10">
            <button
              type="button"
              onClick={() => setActiveTab('calendario')}
              className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'calendario'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              Fechas y Sesiones
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('metricas')}
              className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'metricas'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              Resumen de Horas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('choques')}
              className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors inline-flex items-center gap-1.5 ${activeTab === 'choques'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
            >
              <span>Auditoría de Choques</span>
              {listaChoquesUnicos.length > 0 && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-bold">
                  {listaChoquesUnicos.length}
                </span>
              )}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5 space-y-5">


            {!currentAsig && (
              <div className="bg-white border border-dashed border-slate-300 rounded p-12 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-700">No hay materias asignadas</p>
                <button
                  type="button"
                  onClick={handleAbrirCrear}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded cursor-pointer transition-colors"
                >
                  + Crear Asignación
                </button>
              </div>
            )}

            {/* TAB 1: Fechas y Sesiones */}
            {currentAsig && activeTab === 'calendario' && (
              <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
                {currentAsig && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">

                    {/* ENCABEZADO ÚNICO: Datos de la Asignación + Leyenda + Selector Calendario/Lista */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      {/* Izquierda: Programa, Asignatura y Vigencia */}
                      <div>
                        {currentAsig.programaNombre && (
                          <span className="inline-block px-2 py-0.5 mb-1.5 rounded text-[11px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
                            {currentAsig.programaNombre}
                          </span>
                        )}
                        <h2 className="text-lg font-bold text-slate-900 uppercase">
                          {currentAsig.materia}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Vigencia: {formatDateDDMMYYYY(currentAsig.fechaInicio)} al {formatDateDDMMYYYY(currentAsig.fechaFin)}
                        </p>
                      </div>

                      {/* Derecha: Leyenda y Switcher (visible solo en la pestaña de Fechas y Sesiones) */}
                      {activeTab === 'calendario' && (
                        <div className="flex flex-wrap items-center gap-4">
                          {/* Leyenda de estados */}
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="inline-flex items-center gap-1.5 text-slate-600">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-slate-600">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Modificado
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-slate-600">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Asueto UES
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-slate-600">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Choque
                            </span>
                          </div>

                          {/* Selector Calendario / Lista con iconos Lucide */}
                          <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-medium border border-slate-200">
                            <button
                              type="button"
                              onClick={() => setVistaSesiones('cuadricula')}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${vistaSesiones === 'cuadricula'
                                ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                              <IconCalendar className="w-3.5 h-3.5" />
                              <span>Calendario</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setVistaSesiones('lista')}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${vistaSesiones === 'lista'
                                ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                              <IconList className="w-3.5 h-3.5" />
                              <span>Lista</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CONTENIDO DE FECHAS Y SESIONES */}
                    {activeTab === 'calendario' && (
                      <>
                        {vistaSesiones === 'cuadricula' ? (
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {mesesCalendario.map((mes) => (
                              <div
                                key={mes.mesKey}
                                className="border border-slate-200 rounded-lg overflow-hidden bg-white"
                              >
                                {/* Título del Mes */}
                                <div className="bg-slate-800 text-white px-4 py-2 text-sm font-semibold">
                                  {mes.titulo}
                                </div>

                                {/* Cabecera Lunes a Domingo */}
                                <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center text-[11px] font-bold text-slate-600 uppercase">
                                  {DIAS_CABECERA.map((d) => (
                                    <div
                                      key={d}
                                      className="py-1.5 border-r last:border-r-0 border-slate-200"
                                    >
                                      {d}
                                    </div>
                                  ))}
                                </div>

                                {/* Celdas de Días */}
                                <div className="grid grid-cols-7 bg-slate-200 gap-px">
                                  {mes.celdas.map((celda) => {
                                    if (celda.tipo === 'vacio') {
                                      return (
                                        <div
                                          key={celda.key}
                                          className="bg-slate-200/70 min-h-[84px]"
                                        />
                                      );
                                    }

                                    const s = celda.sesion;
                                    const conflicto = s ? mapaDeChoques[s.id] : null;
                                    const esInteractivo = !celda.fueraDePeriodo && s && !s.esAsueto;

                                    // Color base: gris más oscuro si está fuera del periodo; blanco si está dentro del periodo sin clase
                                    let cardStyle = celda.fueraDePeriodo
                                      ? 'bg-slate-200/75 text-slate-400 select-none'
                                      : 'bg-white text-slate-500';

                                    if (!celda.fueraDePeriodo && s) {
                                      if (conflicto)
                                        cardStyle = 'bg-red-50 text-red-900 hover:bg-red-100';
                                      else if (s.esAsueto)
                                        cardStyle = 'bg-blue-50/70 text-blue-800';
                                      else if (s.estado === 'MODIFICADO')
                                        cardStyle = 'bg-amber-50 text-amber-900 hover:bg-amber-100';
                                      else if (s.estado === 'CANCELADO')
                                        cardStyle = 'bg-slate-100 text-slate-400 hover:bg-slate-200/70';
                                      else if (s.activa)
                                        cardStyle = 'bg-emerald-50/60 text-slate-800 hover:bg-emerald-100/70';
                                    }

                                    return (
                                      <div
                                        key={celda.key}
                                        onClick={() => {
                                          if (!esInteractivo) return;
                                          setExcepForm({
                                            fecha: s.fecha,
                                            tipo: s.excepcion?.tipo || 'MODIFICAR',
                                            horaInicio: s.horaInicio || '18:00',
                                            horaFin: s.horaFin || '21:00',
                                            motivo: s.excepcion?.motivo || ''
                                          });
                                          setModalExcepcion(s);
                                        }}
                                        className={`min-h-[84px] p-1.5 flex flex-col justify-between transition ${cardStyle} ${esInteractivo ? 'cursor-pointer' : ''
                                          }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span
                                            className={`text-xs font-bold ${celda.fueraDePeriodo
                                              ? 'text-slate-400/90'
                                              : s?.activa
                                                ? 'text-slate-800'
                                                : 'text-slate-600'
                                              }`}
                                          >
                                            {celda.numeroDia}
                                          </span>
                                          {!celda.fueraDePeriodo && s?.activa && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-indigo-700">
                                              {s.duracionHoras}h
                                            </span>
                                          )}
                                        </div>

                                        {!celda.fueraDePeriodo && s && (
                                          <div className="mt-1 space-y-0.5 text-[10px] leading-tight">
                                            {conflicto ? (
                                              <span
                                                className="block font-bold text-red-700 truncate"
                                                title={conflicto.map((c) => c.contra).join(', ')}
                                              >
                                                Choque ({s.horaInicio}-{s.horaFin})
                                              </span>
                                            ) : s.esAsueto ? (
                                              <span
                                                className="block font-medium text-blue-700 line-clamp-2"
                                                title={s.asuetoNombre}
                                              >
                                                {s.asuetoNombre}
                                              </span>
                                            ) : s.estado === 'CANCELADO' ? (
                                              <span className="block italic text-slate-500">Cancelada</span>
                                            ) : s.activa ? (
                                              <>
                                                <span className="block font-mono font-semibold text-slate-700">
                                                  {s.horaInicio} - {s.horaFin}
                                                </span>
                                                {s.estado === 'MODIFICADO' && (
                                                  <span className="block text-[9px] font-semibold text-amber-700 truncate">
                                                    Ajustado
                                                  </span>
                                                )}
                                              </>
                                            ) : null}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* VISTA DE LISTA */
                          <div className="space-y-4">
                            {/* Barra de Filtro por Días de la Semana (solo visible en vista de Lista) */}
                            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-semibold text-slate-700 mr-1">Filtrar días:</span>
                                {DIAS_SEMANA.map((dia) => {
                                  const tieneAsignacion = Boolean(currentAsig?.dias?.[dia.id]?.activo);
                                  const estaSeleccionado = diasFiltro.includes(dia.id);

                                  return (
                                    <button
                                      key={dia.id}
                                      type="button"
                                      onClick={() => {
                                        setDiasFiltro((prev) =>
                                          prev.includes(dia.id)
                                            ? prev.filter((id) => id !== dia.id)
                                            : [...prev, dia.id]
                                        );
                                      }}
                                      className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer border transition-colors inline-flex items-center gap-1.5 ${estaSeleccionado
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                      <span>{dia.nombre}</span>
                                      {tieneAsignacion && (
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${estaSeleccionado ? 'bg-emerald-400' : 'bg-emerald-600'
                                            }`}
                                          title="Tiene horario asignado"
                                        />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="flex items-center gap-2 text-[11px]">
                                <button
                                  type="button"
                                  onClick={() => setDiasFiltro(DIAS_SEMANA.map((d) => d.id))}
                                  className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
                                >
                                  Ver todos
                                </button>
                                <span className="text-slate-300">|</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const activos = DIAS_SEMANA
                                      .filter((d) => currentAsig?.dias?.[d.id]?.activo)
                                      .map((d) => d.id);
                                    setDiasFiltro(activos);
                                  }}
                                  className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
                                >
                                  Días con asignación
                                </button>
                              </div>
                            </div>

                            {/* Tabla de Sesiones Filtradas */}
                            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-100 text-slate-600 uppercase">
                                  <tr>
                                    <th className="py-2.5 px-3">Fecha</th>
                                    <th className="py-2.5 px-3">Día</th>
                                    <th className="py-2.5 px-3">Horario Aplicado</th>
                                    <th className="py-2.5 px-3">N° Horas</th>
                                    <th className="py-2.5 px-3">Estado / Observación</th>
                                    <th className="py-2.5 px-3 text-right">Acción</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {todasLasSesiones
                                    .filter(
                                      (s) =>
                                        s.asignacionId === currentAsig.id &&
                                        diasFiltro.includes(s.diaSemanaId)
                                    )
                                    .map((s) => {
                                      const conflicto = mapaDeChoques[s.id];

                                      let filaBg = 'hover:bg-slate-50';
                                      if (s.esAsueto) filaBg = 'bg-blue-50/50 hover:bg-blue-50';
                                      else if (s.estado === 'MODIFICADO') filaBg = 'bg-amber-50/50 hover:bg-amber-50';
                                      else if (s.estado === 'CANCELADO') filaBg = 'bg-slate-100 text-slate-400';
                                      if (conflicto) filaBg = 'bg-red-50 text-red-900';

                                      return (
                                        <tr key={s.id} className={filaBg}>
                                          <td className="py-2 px-3 font-semibold">{formatDateDDMMYYYY(s.fecha)}</td>
                                          <td className="py-2 px-3">{s.nombreDia}</td>
                                          <td className="py-2 px-3 font-mono">
                                            {s.activa ? `${s.horaInicio} - ${s.horaFin}` : '—'}
                                          </td>
                                          <td className="py-2 px-3 font-bold">
                                            {s.duracionHoras > 0 ? `${s.duracionHoras.toFixed(1)} h` : '0 h'}
                                          </td>
                                          <td className="py-2 px-3">
                                            {conflicto ? (
                                              <span className="text-red-700 font-semibold">
                                                ⚠️ Choque con: {conflicto.map((c) => `${c.contra} (${c.rango})`).join(', ')}
                                              </span>
                                            ) : s.esAsueto ? (
                                              <span className="text-blue-700 font-medium bg-blue-100 px-2 py-0.5 rounded">
                                                {s.asuetoNombre}
                                              </span>
                                            ) : s.estado === 'MODIFICADO' ? (
                                              <span className="text-amber-800 font-medium bg-amber-100 px-2 py-0.5 rounded">
                                                Modificado: {s.excepcion?.motivo || 'Horario Especial'}
                                              </span>
                                            ) : s.estado === 'CANCELADO' ? (
                                              <span className="text-slate-500 italic">Cancelada</span>
                                            ) : (
                                              <span className="text-emerald-700">Programada regular</span>
                                            )}
                                          </td>
                                          <td className="py-2 px-3 text-right">
                                            {!s.esAsueto && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setExcepForm({
                                                    fecha: s.fecha,
                                                    tipo: s.excepcion?.tipo || 'MODIFICAR',
                                                    horaInicio: s.horaInicio || '18:00',
                                                    horaFin: s.horaFin || '21:00',
                                                    motivo: s.excepcion?.motivo || ''
                                                  });
                                                  setModalExcepcion(s);
                                                }}
                                                className="px-2.5 py-1 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded text-xs font-medium cursor-pointer"
                                              >
                                                {s.excepcion ? 'Editar Ajuste' : 'Cambiar Día'}
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}

                                  {/* Mensaje cuando no hay sesiones para los días seleccionados */}
                                  {todasLasSesiones.filter(
                                    (s) =>
                                      s.asignacionId === currentAsig.id &&
                                      diasFiltro.includes(s.diaSemanaId)
                                  ).length === 0 && (
                                      <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                                          No hay sesiones programadas para los días seleccionados en el filtro.
                                        </td>
                                      </tr>
                                    )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Resumen de Horas */}
            {activeTab === 'metricas' && (
              <div className="space-y-5">
                <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Recuento Consolidado por Asignación
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Selecciona las asignaciones para incluirlas en el cálculo y en el Requerimiento de Contratación.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={asignaciones.length > 0 && seleccionadasResumen.length === asignaciones.length}
                              onChange={() => {
                                if (seleccionadasResumen.length === asignaciones.length) {
                                  setSeleccionadasResumen([]);
                                } else {
                                  setSeleccionadasResumen(asignaciones.map((a) => a.id));
                                }
                              }}
                              className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                            />
                          </th>
                          <th className="py-2.5 px-3">Programa</th>
                          <th className="py-2.5 px-3">Cargo</th>
                          <th className="py-2.5 px-3">Asignación</th>
                          <th className="py-2.5 px-3">Fecha Inicio</th>
                          <th className="py-2.5 px-3">Fecha Fin</th>
                          <th className="py-2.5 px-3 text-center">Sesiones</th>
                          <th className="py-2.5 px-3 text-right">Total Horas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {resumenPorAsignacion.map((item) => {
                          const estaMarcada = seleccionadasResumen.includes(item.id);

                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors ${estaMarcada ? 'bg-slate-50/60' : 'opacity-60 bg-white'}`}
                            >
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={estaMarcada}
                                  onChange={() => {
                                    setSeleccionadasResumen((prev) =>
                                      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                                    );
                                  }}
                                  className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-3 text-slate-600">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-200 text-slate-700 mr-2">
                                  {item.programaTipo}
                                </span>
                                {item.programaNombre}
                              </td>
                              <td className="py-3 px-3 text-slate-700 font-medium">
                                {item.cargo}
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-900">
                                {item.materia}
                              </td>
                              <td className="py-3 px-3 text-slate-600 font-mono">
                                {formatDateDDMMYYYY(item.fechaInicio)}
                              </td>
                              <td className="py-3 px-3 text-slate-600 font-mono">
                                {formatDateDDMMYYYY(item.fechaFin)}
                              </td>
                              <td className="py-3 px-3 text-center font-mono text-slate-700">
                                {item.totalSesiones} clases
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-slate-900">
                                {item.totalHoras.toFixed(1)} h
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-100 text-slate-900 font-bold border-t border-slate-200">
                        <tr>
                          <td colSpan={6} className="py-2.5 px-3 text-slate-700 uppercase text-[11px]">
                            Total Asignaciones Seleccionadas ({seleccionadasResumen.length} de {asignaciones.length})
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-xs">
                            {totalesSeleccionados.totalSesiones} clases
                          </td>
                          <td className="py-2.5 px-3 text-right text-xs">
                            {totalesSeleccionados.totalHoras.toFixed(1)} h
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {currentAsig && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-white border border-slate-200 rounded p-4 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                        Distribución por Mes ({currentAsig.materia})
                      </h4>
                      <div className="divide-y divide-slate-100 text-xs">
                        {Object.entries(metricasAsigActiva.porMes).map(([mes, horas]) => (
                          <div key={mes} className="py-2 flex justify-between items-center">
                            <span className="font-medium text-slate-700">{mes}</span>
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {horas.toFixed(1)} h
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded p-4 space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                        Distribución por Semana ({currentAsig.materia})
                      </h4>
                      <div className="divide-y divide-slate-100 text-xs max-h-[220px] overflow-y-auto pr-1">
                        {Object.entries(metricasAsigActiva.porSemana).map(([semana, horas]) => (
                          <div key={semana} className="py-2 flex justify-between items-center">
                            <span className="text-slate-600">Semana del {formatDateDDMMYYYY(semana)}</span>
                            <span className="font-mono font-semibold text-slate-900">{horas.toFixed(1)} h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Auditoría de Choques */}
            {activeTab === 'choques' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Auditoría de Choques Horarios</h2>
                    <p className="text-xs text-slate-500">
                      Conflictos detectados entre asignaciones en la misma fecha y franja horaria.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {listaChoquesUnicos.length} {listaChoquesUnicos.length === 1 ? 'conflicto' : 'conflictos'}
                  </span>
                </div>

                {listaChoquesUnicos.length === 0 ? (
                  <div className="py-10 text-center text-sm text-emerald-700 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                    No se detectaron choques horarios entre las asignaciones programadas.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-600 uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Fecha</th>
                          <th className="py-2.5 px-3">Día</th>
                          <th className="py-2.5 px-3">Asignación 1</th>
                          <th className="py-2.5 px-3">Asignación 2</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {listaChoquesUnicos.map((choque) => (
                          <tr key={choque.id} className="hover:bg-red-50/40">
                            <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                              {formatDateDDMMYYYY(choque.fecha)}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{choque.nombreDia}</td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900">{choque.asignacionA.materia}</div>
                              <div className="font-mono text-[11px] text-red-700 font-semibold">
                                {choque.asignacionA.horario}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900">{choque.asignacionB.materia}</div>
                              <div className="font-mono text-[11px] text-red-700 font-semibold">
                                {choque.asignacionB.horario}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL 1: CREAR / EDITAR ASIGNACIÓN */}
      {modalAsignacionAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                {modoEdicion ? 'Editar Asignación' : 'Nueva Asignación Docente'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAsignacionAbierto(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarAsignacion} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nombre del Programa Académico</label>
                  {renderInputConSugerencias('programas-asignacion', formAsignacion.programaNombre, programasCatalogo.map((programa) => ({ value: programa.nombre, label: `${programa.nombre} (${programa.codigo})` })), (nombre) => {
                    const programa = programasCatalogo.find((p) => p.nombre === nombre);
                    setFormAsignacion({ ...formAsignacion, programaNombre: nombre, programaTipo: programa?.tipo || formAsignacion.programaTipo, materia: '' });
                  }, 'w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none', { required: true, placeholder: 'Selecciona o escribe un programa...' })}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Programa</label>
                  {renderInputConSugerencias('tipos-programa', formAsignacion.programaTipo, [{ value: 'MAESTRIA', label: 'Maestría / Doctorado' }, { value: 'DIPLOMADO', label: 'Diplomado / Curso' }], (programaTipo) => setFormAsignacion({ ...formAsignacion, programaTipo, programaNombre: '', materia: '' }), 'w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none', { placeholder: 'Tipo de programa...' })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cargo a Desempeñar</label>
                  {renderInputConSugerencias('cargos-docente', formAsignacion.cargo, opcionesCargo, (cargo) => setFormAsignacion({ ...formAsignacion, cargo }), 'w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none font-medium', { placeholder: 'Selecciona o escribe el cargo...' })}
                </div>

                {!formAsignacion.cargo?.toUpperCase().includes('COORDINAD') ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre de la Asignatura / Módulo</label>
                    {renderInputConSugerencias('asignaturas-asignacion', formAsignacion.materia, getAsignaturasPorPrograma(programasCatalogo.find((p) => p.nombre === formAsignacion.programaNombre)?.codigo).map((asignatura) => ({ value: asignatura.nombre, label: `${asignatura.nombre} (${asignatura.codigo})` })), (materia) => setFormAsignacion({ ...formAsignacion, materia }), 'w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none', { required: true, placeholder: 'Selecciona o escribe una asignatura...' })}
                  </div>
                ) : (
                  <div className="flex items-center pt-5 text-indigo-700 text-xs italic">
                    <span>* El cargo de coordinador no requiere registrar asignatura.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    required
                    value={formAsignacion.fechaInicio}
                    onChange={(e) => {
                      setAlertaPeriodo(null);
                      setFormAsignacion({ ...formAsignacion, fechaInicio: e.target.value });
                    }}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Fin</label>
                  <input
                    type="date"
                    required
                    value={formAsignacion.fechaFin}
                    onChange={(e) => {
                      setAlertaPeriodo(null);
                      setFormAsignacion({ ...formAsignacion, fechaFin: e.target.value });
                    }}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2">Horario Semanal Recurrente</label>
                <div className="space-y-2 border border-slate-200 rounded p-3 max-h-52 overflow-y-auto bg-slate-50">
                  {DIAS_SEMANA.map((dia) => {
                    const conf = formAsignacion.dias[dia.id] || { activo: false, horaInicio: '18:00', horaFin: '20:00' };

                    return (
                      <div
                        key={dia.id}
                        className={`flex items-center justify-between p-2 rounded border transition-colors ${conf.activo ? 'bg-white border-slate-300' : 'bg-slate-100/50 border-slate-200 opacity-60'
                          }`}
                      >
                        <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-slate-800 w-28">
                          <input
                            type="checkbox"
                            checked={conf.activo}
                            onChange={(e) => {
                              setAlertaPeriodo(null);
                              const checked = e.target.checked;
                              setFormAsignacion({
                                ...formAsignacion,
                                dias: { ...formAsignacion.dias, [dia.id]: { ...conf, activo: checked } }
                              });
                            }}
                            className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                          />
                          <span>{dia.nombre}</span>
                        </label>

                        {conf.activo && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">De:</span>
                            <input
                              type="time"
                              value={conf.horaInicio}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormAsignacion({
                                  ...formAsignacion,
                                  dias: { ...formAsignacion.dias, [dia.id]: { ...conf, horaInicio: val } }
                                });
                              }}
                              className="border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
                            />
                            <span className="text-[10px] text-slate-500">A:</span>
                            <input
                              type="time"
                              value={conf.horaFin}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormAsignacion({
                                  ...formAsignacion,
                                  dias: { ...formAsignacion.dias, [dia.id]: { ...conf, horaFin: val } }
                                });
                              }}
                              className="border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalAsignacionAbierto(false)}
                  className="px-3 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  {modoEdicion ? 'Actualizar Asignación' : 'Crear Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AJUSTE PUNTUAL DE FECHA */}
      {/* Modal para Modificar Día Específico o Cancelar */}

      {modalExcepcion && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 flex flex-col">

            {/* Encabezado fijo */}
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Ajuste para el {formatDateDDMMYYYY(modalExcepcion.fecha)} ({modalExcepcion.nombreDia})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configura una excepción puntual para esta fecha sin alterar el horario semanal base.
              </p>
            </div>

            {/* Cuerpo con altura mínima reservada para evitar saltos bruscos */}
            <div className="py-4 space-y-4 text-xs min-h-[320px] flex flex-col justify-between">

              {/* 1. Selector de Acción en 3 columnas horizontales */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Acción</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      valor: 'MODIFICAR',
                      titulo: 'Cambiar horario',
                      descripcion: 'Hora especial solo este día'
                    },
                    {
                      valor: 'CANCELAR',
                      titulo: 'Cancelar clase',
                      descripcion: 'Suspende y no suma horas'
                    },
                    {
                      valor: 'RESET',
                      titulo: 'Horario original',
                      descripcion: 'Mantiene horario semanal'
                    }
                  ].map((opcion) => {
                    const seleccionado = excepForm.tipo === opcion.valor;
                    return (
                      <label
                        key={opcion.valor}
                        className={`flex flex-col justify-between p-2.5 rounded-lg border cursor-pointer transition ${seleccionado
                          ? 'border-indigo-600 bg-indigo-50/60 text-slate-900 ring-1 ring-indigo-600/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span className="font-semibold text-xs leading-tight">{opcion.titulo}</span>
                          <input
                            type="radio"
                            name="tipoExcepcion"
                            value={opcion.valor}
                            checked={seleccionado}
                            onChange={(e) => setExcepForm({ ...excepForm, tipo: e.target.value })}
                            className="text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                          />
                        </div>
                        <span className="block text-[11px] text-slate-500 leading-snug">
                          {opcion.descripcion}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. Área dinámica con espacio estable */}
              <div className="flex-1 flex flex-col justify-start space-y-3">
                {excepForm.tipo === 'MODIFICAR' && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Hora Inicio</label>
                        <input
                          type="time"
                          value={excepForm.horaInicio}
                          onChange={(e) => setExcepForm({ ...excepForm, horaInicio: e.target.value })}
                          className={`w-full border rounded-lg p-2 ${rangoHorarioInvalido ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                            }`}
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Hora Fin</label>
                        <input
                          type="time"
                          value={excepForm.horaFin}
                          onChange={(e) => setExcepForm({ ...excepForm, horaFin: e.target.value })}
                          className={`w-full border rounded-lg p-2 ${rangoHorarioInvalido ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                            }`}
                        />
                      </div>
                    </div>

                    {/* Alert (Error crítico): Hora de fin inferior o igual a inicio */}
                    {rangoHorarioInvalido && (
                      <div
                        role="alert"
                        className="p-2.5 rounded-lg bg-red-50 border border-red-300 text-red-800 text-[11px] leading-snug"
                      >
                        <strong className="font-bold">Horario inválido:</strong> La hora de fin debe ser posterior a la hora de inicio.
                      </div>
                    )}

                    {/* Warning (Aviso informativo): Horario idéntico al original */}
                    {coincideConHorarioOriginal && (
                      <div
                        role="status"
                        className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] leading-snug"
                      >
                        <strong className="font-bold">Aviso:</strong> Coincide con el horario semanal original ({configOriginalDiaModal.horaInicio} - {configOriginalDiaModal.horaFin}). Se guardará como sesión regular sin marca de ajuste.
                      </div>
                    )}
                  </div>
                )}

                {/* Campo de motivo */}
                {excepForm.tipo !== 'RESET' && !coincideConHorarioOriginal && (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Motivo / Justificación</label>
                    <input
                      type="text"
                      placeholder="Ej. Reposición, ajuste institucional"
                      value={excepForm.motivo}
                      onChange={(e) => setExcepForm({ ...excepForm, motivo: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                )}

                {/* Mensaje informativo cuando se elige horario original para aprovechar el espacio sin encoger el modal */}
                {excepForm.tipo === 'RESET' && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                    Esta fecha utilizará el horario semanal recurrente configurado para los días{' '}
                    <strong className="text-slate-800">{modalExcepcion.nombreDia.toLowerCase()}</strong>
                    {configOriginalDiaModal?.activo
                      ? ` (${configOriginalDiaModal.horaInicio} - ${configOriginalDiaModal.horaFin}).`
                      : '.'}
                  </div>
                )}
              </div>
            </div>

            {/* Pie fijo con botones */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalExcepcion(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={guardarExcepcion}
                disabled={rangoHorarioInvalido}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${rangoHorarioInvalido
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  }`}
              >
                Aplicar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REQUERIMIENTO DE CONTRATACIÓN (COMPLETO) */}
      {modalRequerimientoAbierto && requerimientoForm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded-lg max-w-4xl w-full p-6 space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Requerimiento de Contratación Docente
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifica los datos generales y los parámetros por programa para emitir el requerimiento formal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalRequerimientoAbierto(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarDescargaExcel} className="flex-1 overflow-y-auto space-y-6 pr-2 text-xs">
              {/* Sección 1: Información General del Contratado */}
              <div className="border border-slate-200 rounded p-4 bg-slate-50/50 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5">
                  1. Información General del Contratado
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre Completo</label>
                    {renderInputConSugerencias('docentes-requerimiento', requerimientoForm.docenteInfo.nombreCompleto, docentesCatalogo.map((docente) => docente.nombre), actualizarDocenteSeleccionado, 'w-full border border-slate-300 rounded p-1.5 bg-white', { required: true, placeholder: 'Selecciona o escribe el nombre...' })}
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Profesión</label>
                    {renderInputConSugerencias('grados-profesion', requerimientoForm.docenteInfo.profesion, getGrados(), (profesion) => setRequerimientoForm({ ...requerimientoForm, docenteInfo: { ...requerimientoForm.docenteInfo, profesion } }), 'w-full border border-slate-300 rounded p-1.5 bg-white', { placeholder: 'Selecciona o escribe una profesión...' })}
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nacionalidad</label>
                    {renderInputConSugerencias('nacionalidades-docente', requerimientoForm.docenteInfo.nacionalidad, getNacionalidades(), (nacionalidad) => setRequerimientoForm({ ...requerimientoForm, docenteInfo: { ...requerimientoForm.docenteInfo, nacionalidad } }), 'w-full border border-slate-300 rounded p-1.5 bg-white', { placeholder: 'Selecciona o escribe una nacionalidad...' })}
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={requerimientoForm.docenteInfo.correo}
                      onChange={(e) =>
                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: { ...requerimientoForm.docenteInfo, correo: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>

                  {/* Listas Desplegables Condicionales */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Contrato</label>
                    {renderInputConSugerencias('tipos-contrato', requerimientoForm.docenteInfo.tipoContrato, [...new Set(getTiposContratoEP().map((tipo) => tipo.tipoContrato))], (nuevoContrato) => {
                      const nuevaContratacion = nuevoContrato === 'SERVICIOS PERSONALES'
                        ? 'TIEMPO ADICIONAL'
                        : 'TIEMPO NORMAL';
                      setRequerimientoForm({
                        ...requerimientoForm,
                        docenteInfo: {
                          ...requerimientoForm.docenteInfo,
                          tipoContrato: nuevoContrato,
                          tipoContratacion: nuevaContratacion
                        }
                      });
                    }, 'w-full border border-slate-300 rounded p-1.5 bg-white text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none', { placeholder: 'Selecciona o escribe tipo de contrato...' })}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Contratación</label>
                    {renderInputConSugerencias('tipos-contratacion', requerimientoForm.docenteInfo.tipoContratacion, [...new Set(getTiposContratoEP().map((tipo) => tipo.tipoContratacion))], (tipoContratacion) => setRequerimientoForm({ ...requerimientoForm, docenteInfo: { ...requerimientoForm.docenteInfo, tipoContratacion } }), 'w-full border border-slate-300 rounded p-1.5 bg-white text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none', { placeholder: 'Selecciona o escribe tipo...' })}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Modalidad de Servicio</label>
                    {renderInputConSugerencias('modalidades-servicio', requerimientoForm.docenteInfo.modalidadServicio, ['EN LINEA', 'PRESENCIAL'], (modalidadServicio) => setRequerimientoForm({ ...requerimientoForm, docenteInfo: { ...requerimientoForm.docenteInfo, modalidadServicio } }), 'w-full border border-slate-300 rounded p-1.5 bg-white', { placeholder: 'Selecciona o escribe una modalidad...' })}
                  </div>

                  {/* Si es Tiempo Integral se piden sueldo, porcentaje y meses; si no, calificación y pago por hora */}
                  {requerimientoForm.docenteInfo.tipoContratacion === 'TIEMPO INTEGRAL' ? (
                    <>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Sueldo Nominal ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={requerimientoForm.docenteInfo.sueldoNominal}
                          onChange={(e) =>
                            setRequerimientoForm({
                              ...requerimientoForm,
                              docenteInfo: { ...requerimientoForm.docenteInfo, sueldoNominal: e.target.value }
                            })
                          }
                          className="w-full border border-slate-300 rounded p-1.5 bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Porcentaje a Pagar (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={requerimientoForm.docenteInfo.porcentajePago}
                          onChange={(e) =>
                            setRequerimientoForm({
                              ...requerimientoForm,
                              docenteInfo: { ...requerimientoForm.docenteInfo, porcentajePago: e.target.value }
                            })
                          }
                          className="w-full border border-slate-300 rounded p-1.5 bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Cantidad de Meses</label>
                        <input
                          type="number"
                          value={requerimientoForm.docenteInfo.cantidadMeses}
                          onChange={(e) =>
                            setRequerimientoForm({
                              ...requerimientoForm,
                              docenteInfo: { ...requerimientoForm.docenteInfo, cantidadMeses: e.target.value }
                            })
                          }
                          className="w-full border border-slate-300 rounded p-1.5 bg-white font-bold"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Calificación Docente</label>
                        {renderInputConSugerencias('categorias-docente', requerimientoForm.docenteInfo.calificacionDocente, getCategoriasDocente().map((categoria) => categoria.id), (calificacionDocente) => setRequerimientoForm({ ...requerimientoForm, docenteInfo: { ...requerimientoForm.docenteInfo, calificacionDocente } }), 'w-full border border-slate-300 rounded p-1.5 bg-white font-bold', { placeholder: 'Categoría...' })}
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Pago por Hora ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={requerimientoForm.docenteInfo.pagoPorHora}
                          onChange={(e) =>
                            setRequerimientoForm({
                              ...requerimientoForm,
                              docenteInfo: { ...requerimientoForm.docenteInfo, pagoPorHora: e.target.value }
                            })
                          }
                          className="w-full border border-slate-300 rounded p-1.5 bg-white font-bold"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Sección 2: Programas y Asignaciones Dinámicas */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5">
                  2. Parámetros Académicos por Programa
                </h4>

                {requerimientoForm.programas.map((prog, pIdx) => {
                  const esDip = prog.tipo === 'DIPLOMADO';

                  return (
                    <div key={pIdx} className="border border-slate-300 rounded p-4 bg-white space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-bold text-slate-900 text-xs uppercase">
                          Programa {pIdx + 1}: {prog.nombre}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {prog.tipo}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-medium text-slate-600 mb-1">Edición / Cohorte</label>
                          {renderInputConSugerencias(`ediciones-cohortes-${pIdx}`, prog.edicionCohorte, esDip ? getEdiciones().map((e) => e.etiqueta) : getCohortesPorPrograma(programasCatalogo.find((p) => p.nombre === prog.nombre)?.codigo).map((n) => `${n}° COHORTE`), (val) => {
                            const nuevosProgs = [...requerimientoForm.programas];
                            nuevosProgs[pIdx].edicionCohorte = val;
                            setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                          }, 'w-full border border-slate-300 rounded p-1.5', { placeholder: 'Selecciona o escribe edición/cohorte...' })}
                        </div>
                        <div>
                          <label className="block font-medium text-slate-600 mb-1">Coordinador del Programa</label>
                          {renderInputConSugerencias(`coordinadores-${pIdx}`, prog.coordinador, docentesCatalogo.map((docente) => docente.nombre), (val) => {
                            const nuevosProgs = [...requerimientoForm.programas];
                            nuevosProgs[pIdx].coordinador = val;
                            setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                          }, 'w-full border border-slate-300 rounded p-1.5', { placeholder: 'Selecciona o escribe coordinador...' })}
                        </div>

                        {/* Alumnos y Sobrecupo a nivel de Programa */}
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Alumnos Inscritos (del Programa)</label>
                          <input
                            type="number"
                            value={prog.alumnosInscritos}
                            onChange={(e) => {
                              const val = e.target.value;
                              const nuevosProgs = [...requerimientoForm.programas];
                              nuevosProgs[pIdx].alumnosInscritos = val;
                              setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                            }}
                            className="w-full border border-slate-300 rounded p-1.5 font-bold"
                          />
                        </div>

                        {esDip && (
                          <>
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">Factor Sobrecupo (del Programa)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={prog.factorSobrecupo}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const nuevosProgs = [...requerimientoForm.programas];
                                  nuevosProgs[pIdx].factorSobrecupo = val;
                                  setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                }}
                                className="w-full border border-slate-300 rounded p-1.5 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-slate-600 mb-1">Clasificación del Proyecto</label>
                              <input
                                type="text"
                                value={prog.clasificacionProyecto}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const nuevosProgs = [...requerimientoForm.programas];
                                  nuevosProgs[pIdx].clasificacionProyecto = val;
                                  setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                }}
                                className="w-full border border-slate-300 rounded p-1.5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Código del Programa
                              </label>
                              <input
                                type="text"
                                placeholder="Ej. DLOGIS / M10502"
                                value={prog.codigo || ''}
                                onChange={(e) => {
                                  const nuevosProgs = [...requerimientoForm.programas];
                                  nuevosProgs[pIdx].codigo = e.target.value;
                                  setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                }}
                                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white uppercase focus:ring-1 focus:ring-indigo-600 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                N° de Solicitud
                              </label>
                              <input
                                type="text"
                                placeholder="Ej. SOL-045/2026"
                                value={prog.solicitudAprobacion || ''}
                                onChange={(e) => {
                                  const nuevosProgs = [...requerimientoForm.programas];
                                  nuevosProgs[pIdx].solicitudAprobacion = e.target.value;
                                  setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                }}
                                className="w-full border border-slate-300 rounded p-1.5"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                N° de Acuerdo de Impartición
                              </label>
                              <input
                                type="text"
                                placeholder="Ej. Acuerdo N° 120/2026-JD"
                                value={prog.acuerdoImparticion || ''}
                                onChange={(e) => {
                                  const nuevosProgs = [...requerimientoForm.programas];
                                  nuevosProgs[pIdx].acuerdoImparticion = e.target.value;
                                  setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                }}
                                className="w-full border border-slate-300 rounded p-1.5"
                              />
                            </div>
                            <div>
                            </div>
                          </>
                        )}

                      </div>

                      {/* Asignaciones del programa */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[11px] font-bold text-slate-700 block uppercase">
                          Asignaciones incluidas:
                        </span>

                        {prog.asignaciones.map((asig, aIdx) => {
                          const esCoord = esCargoCoordinador(asig.cargo);

                          return (
                            <div key={aIdx} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-3">
                              <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                                <span>
                                  Asignación {aIdx + 1}: {esCoord ? 'COORDINACIÓN ACADÉMICA' : asig.asignatura}
                                </span>
                                <span className="text-slate-500 font-normal">
                                  {formatearRangoFechasTexto(asig.fechaInicio, asig.fechaFin)}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                                <div>
                                  <label className="block text-[10px] text-slate-600 mb-0.5">Cargo</label>
                                  {renderInputConSugerencias(`cargos-asignacion-${pIdx}-${aIdx}`, asig.cargo, opcionesCargo, (val) => {
                                    const nuevosProgs = [...requerimientoForm.programas];
                                    nuevosProgs[pIdx].asignaciones[aIdx].cargo = val;
                                    if (val.toUpperCase().includes('COORDINAD')) {
                                      nuevosProgs[pIdx].asignaciones[aIdx].funciones = FUNCION_COORDINADOR_DEFAULT;
                                    }
                                    setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                  }, 'w-full border border-slate-300 rounded p-1 bg-white', { placeholder: 'Selecciona o escribe cargo...' })}
                                </div>

                                {!esCoord ? (
                                  <div>
                                    <label className="block text-[10px] text-slate-600 mb-0.5">Asignatura</label>
                                    {renderInputConSugerencias(`asignaturas-requerimiento-${pIdx}-${aIdx}`, asig.asignatura, getAsignaturasPorPrograma(programasCatalogo.find((p) => p.nombre === prog.nombre)?.codigo).map((asignatura) => asignatura.nombre), (val) => {
                                      const nuevosProgs = [...requerimientoForm.programas];
                                      nuevosProgs[pIdx].asignaciones[aIdx].asignatura = val;
                                      setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                    }, 'w-full border border-slate-300 rounded p-1 bg-white', { placeholder: 'Selecciona o escribe asignatura...' })}
                                  </div>
                                ) : (
                                  <div className="flex items-center pt-3 text-[11px] text-indigo-700 italic">
                                    <span>* Sin asignatura asignada</span>
                                  </div>
                                )}

                                <div>
                                  <label className="block text-[10px] text-slate-600 mb-0.5">Módulo / Ciclo</label>
                                  {renderInputConSugerencias(`ciclos-requerimiento-${pIdx}-${aIdx}`, asig.moduloCiclo, ciclosCatalogo.map((ciclo) => `CICLO ${ciclo}`), (val) => {
                                    const nuevosProgs = [...requerimientoForm.programas];
                                    nuevosProgs[pIdx].asignaciones[aIdx].moduloCiclo = val;
                                    setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                  }, 'w-full border border-slate-300 rounded p-1 bg-white', { placeholder: 'Selecciona o escribe módulo/ciclo...' })}
                                </div>

                                <div>
                                  <label className="block text-[10px] text-slate-600 mb-0.5">Cantidad Horas (Calculadas)</label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={asig.cantidadHoras}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const nuevosProgs = [...requerimientoForm.programas];
                                      nuevosProgs[pIdx].asignaciones[aIdx].cantidadHoras = val;
                                      setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                    }}
                                    className="w-full border border-slate-300 rounded p-1 bg-white font-bold"
                                  />
                                </div>

                                {esCoord && (
                                  <div>
                                    <label className="block text-[10px] text-indigo-700 font-semibold mb-0.5">
                                      Valor por Hora Coordinación ($)
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={asig.pagoPorHora}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const nuevosProgs = [...requerimientoForm.programas];
                                        nuevosProgs[pIdx].asignaciones[aIdx].pagoPorHora = val;
                                        setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                      }}
                                      className="w-full border border-indigo-300 rounded p-1 bg-white font-bold text-indigo-900"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalRequerimientoAbierto(false)}
                  className="px-4 py-2 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                >
                  <IconDownload className="w-4 h-4" />
                  Generar y Descargar Excel (+ Respaldo JSON)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CARGAR RESPALDO MEDIANTE ARRASTRE (DRAG & DROP) */}
      {modalCargarAbierto && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded-lg max-w-md w-full p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Cargar Respaldo de Horarios
              </h3>
              <button
                type="button"
                onClick={() => {
                  setModalCargarAbierto(false);
                  setEstaArrastrando(false);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            {/* Input nativo oculto accesible por clic */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                procesarArchivoJSON(file);
                e.target.value = '';
              }}
              accept=".json,application/json"
              className="hidden"
            />

            {/* Zona de Arrastrar y Soltar */}
            <div
              onDrop={handleDropArchivo}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${estaArrastrando
                ? 'border-indigo-600 bg-indigo-50/60 scale-[1.01]'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className={`p-3 rounded-full ${estaArrastrando ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                  <IconUpload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {estaArrastrando ? 'Suelta el archivo JSON aquí' : 'Arrastra y suelta tu archivo JSON aquí'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    o haz clic sobre esta zona para seleccionarlo desde tu equipo
                  </p>
                </div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  Formatos aceptados: .json
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setModalCargarAbierto(false);
                  setEstaArrastrando(false);
                }}
                className="px-3 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor de notificaciones Toast en la esquina superior derecha */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1E293B',
            color: '#FFFFFF',
            fontSize: '12px',
            borderRadius: '6px',
            padding: '10px 14px'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF'
            }
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF'
            }
          }
        }}
      />

      {/* MODAL ESTILIZADO DE CONFIRMACIÓN */}
      {modalConfirmacion.abierto && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[60] backdrop-blur-[1px]">
          <div className="bg-white border border-slate-300 rounded-lg max-w-sm w-full p-5 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-full shrink-0 ${modalConfirmacion.tipo === 'peligro' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-700'
                  }`}
              >
                <IconAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">{modalConfirmacion.titulo}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{modalConfirmacion.mensaje}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalConfirmacion((prev) => ({ ...prev, abierto: false }))}
                className="px-3.5 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={modalConfirmacion.onConfirmar}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold text-white cursor-pointer transition-colors shadow-sm ${modalConfirmacion.tipo === 'peligro'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-slate-900 hover:bg-slate-800'
                  }`}
              >
                {modalConfirmacion.textoBoton}
              </button>
            </div>
          </div>
        </div>
      )}

      {alertaPeriodo && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-3 z-[70]">
          <div className="space-y-1">
            <p className="font-bold text-amber-900">
              Las fechas del periodo no coinciden con los días asignados
            </p>
            <ul className="list-disc list-inside text-amber-800 space-y-0.5">
              {!alertaPeriodo.inicioValido && (
                <li>
                  La fecha de inicio ({formatDateDDMMYYYY(formAsignacion.fechaInicio)}) cae en{' '}
                  <strong>{alertaPeriodo.diaInicioNombre}</strong>, día sin horario asignado.
                </li>
              )}
              {!alertaPeriodo.finValido && (
                <li>
                  La fecha de fin ({formatDateDDMMYYYY(formAsignacion.fechaFin)}) cae en{' '}
                  <strong>{alertaPeriodo.diaFinNombre}</strong>, día sin horario asignado.
                </li>
              )}
            </ul>
          </div>

          {alertaPeriodo.sugerencia ? (
            <p className="text-amber-900 bg-amber-100/70 px-2.5 py-1.5 rounded border border-amber-200">
              Periodo sugerido según las sesiones efectivas:{' '}
              <strong>
                {formatDateDDMMYYYY(alertaPeriodo.sugerencia.fechaInicio)} al{' '}
                {formatDateDDMMYYYY(alertaPeriodo.sugerencia.fechaFin)}
              </strong>
            </p>
          ) : (
            <p className="text-red-700 font-medium">
              No se encontró ninguna sesión válida dentro del rango de fechas seleccionado.
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => confirmarGuardadoAsignacion(formAsignacion)}
              className="px-3 py-1.5 rounded border border-amber-400 bg-white hover:bg-amber-100 text-amber-900 font-semibold cursor-pointer transition"
            >
              Mantener periodo ingresado
            </button>

            {alertaPeriodo.sugerencia && (
              <button
                type="button"
                onClick={() => {
                  const datosAjustados = {
                    ...formAsignacion,
                    fechaInicio: alertaPeriodo.sugerencia.fechaInicio,
                    fechaFin: alertaPeriodo.sugerencia.fechaFin
                  };
                  setFormAsignacion(datosAjustados);
                  confirmarGuardadoAsignacion(datosAjustados);
                }}
                className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer transition"
              >
                Ajustar al primer y último día de clase
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

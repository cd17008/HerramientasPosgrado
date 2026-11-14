import React, { useState, useMemo, useRef, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { generarExpedienteCompletoExcel } from './services/excel/excelExport';
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
  X as IconX
} from 'lucide-react';

import {
  getProgramas, getProgramaPorNombre, getAsignaturasPorPrograma,
  getDocentes, getDocentePorNombre, getCategoriasDocente, getTasaPorCategoria,
  getNacionalidades, getGrados, getClasificaciones, getEdiciones,
  getCohortesPorPrograma, sugerirFactorSobrecupo
} from './services/catalogService';

import { generarCorreoWord } from './services/word/buildCorreoWordService';


export default function DocenteScheduleTool() {
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


  useEffect(() => {
    if (currentAsig?.dias) {
      const diasActivos = DIAS_SEMANA
        .filter((d) => currentAsig.dias[d.id]?.activo)
        .map((d) => d.id);
      setDiasFiltro(diasActivos);
    }
  }, [asignacionSeleccionadaId]);

  // Modales
  const [modalAsignacionAbierto, setModalAsignacionAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  // Estado para modal de confirmación personalizado (reemplazo de window.confirm)
  const [modalConfirmacion, setModalConfirmacion] = useState({
    abierto: false,
    titulo: '',
    mensaje: '',
    textoBoton: 'Confirmar',
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
  const mapaDeChoques = useMemo(() => {
    const choques = {};
    const porFecha = {};

    todasLasSesiones
      .filter((s) => s.activa)
      .forEach((s) => {
        if (!porFecha[s.fecha]) porFecha[s.fecha] = [];
        porFecha[s.fecha].push(s);
      });

    Object.entries(porFecha).forEach(([fecha, sesList]) => {
      if (sesList.length > 1) {
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

              choques[s1.id].push({ contra: s2.materia, rango: `${s2.horaInicio} - ${s2.horaFin}` });
              choques[s2.id].push({ contra: s1.materia, rango: `${s1.horaInicio} - ${s1.horaFin}` });
            }
          }
        }
      }
    });

    return choques;
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

  const handleAbrirCrear = () => {
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

  const handleGuardarAsignacion = (e) => {
    e.preventDefault();
    const esCoord = esCargoCoordinador(formAsignacion.cargo);
    if (!formAsignacion.programaNombre.trim() || (!esCoord && !formAsignacion.materia.trim())) {
      toast.error('Por favor completa los campos requeridos de la asignación.');
      return;
    }

    const payload = {
      ...formAsignacion,
      materia: esCoord ? `Coordinación Académica - ${formAsignacion.programaNombre}` : formAsignacion.materia
    };

    if (modoEdicion) {
      setAsignaciones((prev) => prev.map((a) => (a.id === payload.id ? { ...a, ...payload } : a)));
    } else {
      const nueva = { ...payload, excepciones: {} };
      setAsignaciones((prev) => [...prev, nueva]);
      setAsignacionSeleccionadaId(nueva.id);
      setSeleccionadasResumen((prev) => [...prev, nueva.id]);
    }
    toast.success(modoEdicion ? 'Asignación actualizada' : 'Asignación creada exitosamente');
    setModalAsignacionAbierto(false);
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

  const guardarExcepcion = () => {
    if (!excepForm.fecha) return;

    setAsignaciones((prev) =>
      prev.map((asig) => {
        if (asig.id !== asignacionSeleccionadaId) return asig;
        const nuevasExcepciones = { ...(asig.excepciones || {}) };

        if (excepForm.tipo === 'RESET') {
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      {/* ENCABEZADO */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        <div className="flex items-center gap-2.5">
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
            <input
              type="text"
              placeholder="Nombre del docente..."
              value={docenteNombre}
              onChange={(e) => setDocenteNombre(e.target.value)}
              className="text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded px-2.5 py-1 focus:ring-1 focus:ring-slate-500 focus:outline-none w-56"
            />
          </div>

          <div className="border-l border-slate-200 pl-3">
            {cantidadChoquesTotales > 0 ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5">
                <IconAlert className="w-3.5 h-3.5 text-red-600" />
                <span>{cantidadChoquesTotales} Choque(s)</span>
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
        <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col p-4 space-y-4 flex-shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
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
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer transition-colors"
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
        <main className="flex-1 p-6 overflow-y-auto space-y-5">
          <div className="flex border-b border-slate-200">
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
              {cantidadChoquesTotales > 0 && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-bold">
                  {cantidadChoquesTotales}
                </span>
              )}
            </button>
          </div>

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    {currentAsig.programaTipo}: {currentAsig.programaNombre}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {currentAsig.materia}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Vigencia: {formatDateDDMMYYYY(currentAsig.fechaInicio)} al {formatDateDDMMYYYY(currentAsig.fechaFin)}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> Normal
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> Modificado
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Asueto UES
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span> Choque
                  </span>
                </div>
              </div>

              {/* Barra de Filtro por Días de la Semana */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs">
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

              <div className="overflow-x-auto border border-slate-200 rounded max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Día</th>
                      <th className="py-2.5 px-3">Horario</th>
                      <th className="py-2.5 px-3 text-center">N° Horas</th>
                      <th className="py-2.5 px-3">Estado / Observación</th>
                      <th className="py-2.5 px-3 text-right">Ajuste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todasLasSesiones
                      .filter((s) => s.asignacionId === currentAsig.id && diasFiltro.includes(s.diaSemanaId))
                      .map((s) => {
                        const conflicto = mapaDeChoques[s.id];
                        let filaBg = 'hover:bg-slate-50';
                        if (s.esAsueto) filaBg = 'bg-blue-50/40 hover:bg-blue-50';
                        else if (s.estado === 'MODIFICADO') filaBg = 'bg-amber-50/50 hover:bg-amber-50';
                        else if (s.estado === 'CANCELADO') filaBg = 'bg-slate-100 text-slate-400';
                        if (conflicto) filaBg = 'bg-red-50 text-red-900';

                        return (
                          <tr key={s.id} className={filaBg}>
                            <td className="py-2 px-3 font-semibold text-slate-900">{formatDateDDMMYYYY(s.fecha)}</td>
                            <td className="py-2 px-3 text-slate-600">{s.nombreDia}</td>
                            <td className="py-2 px-3 font-mono text-slate-800">
                              {s.activa ? `${formatTime12h(s.horaInicio)} a ${formatTime12h(s.horaFin)}` : '—'}
                            </td>
                            <td className="py-2 px-3 font-bold text-center text-slate-900">
                              {s.duracionHoras > 0 ? `${s.duracionHoras.toFixed(1)} h` : '0 h'}
                            </td>
                            <td className="py-2 px-3">
                              {conflicto ? (
                                <span className="text-red-700 font-semibold flex items-center gap-1">
                                  <IconAlert className="w-3.5 h-3.5 text-red-600" />
                                  Choque con: {conflicto.map((c) => `${c.contra} (${c.rango})`).join(', ')}
                                </span>
                              ) : s.esAsueto ? (
                                <span className="text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[11px] font-medium">
                                  {s.asuetoNombre}
                                </span>
                              ) : s.estado === 'MODIFICADO' ? (
                                <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] font-medium">
                                  Modificado: {s.excepcion?.motivo || 'Ajuste horario'}
                                </span>
                              ) : s.estado === 'CANCELADO' ? (
                                <span className="text-slate-500 italic">Clase cancelada</span>
                              ) : (
                                <span className="text-emerald-700 font-medium">Clase regular</span>
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
                                  className="px-2 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[11px] font-semibold cursor-pointer transition-colors"
                                >
                                  {s.excepcion ? 'Editar Ajuste' : 'Cambiar Día'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    {todasLasSesiones.filter(
                      (s) => s.asignacionId === currentAsig.id && diasFiltro.includes(s.diaSemanaId)
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
            <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Auditoría Cruzada de Choques Horarios
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verificación de compatibilidad entre todas las asignaciones programadas para {docenteNombre || 'el docente'}.
                </p>
              </div>

              {cantidadChoquesTotales === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded">
                  <IconCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">Horarios compatibles y verificados</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    No se detectaron choques de horario en ninguna fecha del ciclo.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {Object.entries(mapaDeChoques).map(([sesionId, conflictos]) => {
                    const sesion = todasLasSesiones.find((s) => s.id === sesionId);
                    if (!sesion) return null;

                    return (
                      <div
                        key={sesionId}
                        className="p-3 rounded border border-red-200 bg-red-50 text-xs text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold block text-sm">
                            {formatDateDDMMYYYY(sesion.fecha)} ({sesion.nombreDia})
                          </span>
                          <span className="text-red-700">
                            {sesion.materia}: {formatTime12h(sesion.horaInicio)} a {formatTime12h(sesion.horaFin)}
                          </span>
                        </div>
                        <div className="sm:text-right">
                          <span className="font-bold text-red-800 block">Conflicto con:</span>
                          {conflictos.map((c, i) => (
                            <span key={i} className="block text-red-700">
                              {c.contra} ({c.rango})
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
                  <input
                    type="text"
                    required
                    placeholder="Ej. MAESTRÍA EN ENERGÍAS RENOVABLES"
                    value={formAsignacion.programaNombre}
                    onChange={(e) => setFormAsignacion({ ...formAsignacion, programaNombre: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Programa</label>
                  <select
                    value={formAsignacion.programaTipo}
                    onChange={(e) => setFormAsignacion({ ...formAsignacion, programaTipo: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="MAESTRIA">Maestría / Doctorado</option>
                    <option value="DIPLOMADO">Diplomado / Curso</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cargo a Desempeñar</label>
                  <select
                    value={formAsignacion.cargo}
                    onChange={(e) => setFormAsignacion({ ...formAsignacion, cargo: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="DOCENTE DE MAESTRIA">DOCENTE DE MAESTRÍA</option>
                    <option value="DOCENTE DE DIPLOMADO">DOCENTE DE DIPLOMADO</option>
                    <option value="COORDINADOR DE MAESTRIA">COORDINADOR DE MAESTRÍA</option>
                    <option value="COORDINADOR DE DIPLOMADO">COORDINADOR DE DIPLOMADO</option>
                  </select>
                </div>

                {!formAsignacion.cargo?.toUpperCase().includes('COORDINAD') ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre de la Asignatura / Módulo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Celdas de Combustible"
                      value={formAsignacion.materia}
                      onChange={(e) => setFormAsignacion({ ...formAsignacion, materia: e.target.value })}
                      className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                    />
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
                    onChange={(e) => setFormAsignacion({ ...formAsignacion, fechaInicio: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Fin</label>
                  <input
                    type="date"
                    required
                    value={formAsignacion.fechaFin}
                    onChange={(e) => setFormAsignacion({ ...formAsignacion, fechaFin: e.target.value })}
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
      {modalExcepcion && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Ajuste para el {formatDateDDMMYYYY(modalExcepcion.fecha)} ({modalExcepcion.nombreDia})
              </h3>
              <button
                type="button"
                onClick={() => setModalExcepcion(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Acción a realizar</label>
                <select
                  value={excepForm.tipo}
                  onChange={(e) => setExcepForm({ ...excepForm, tipo: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="MODIFICAR">Cambiar horario para esta fecha puntual</option>
                  <option value="CANCELAR">Cancelar clase en esta fecha</option>
                  <option value="RESET">Restablecer a horario regular</option>
                </select>
              </div>

              {excepForm.tipo === 'MODIFICAR' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Hora Inicio</label>
                    <input
                      type="time"
                      value={excepForm.horaInicio}
                      onChange={(e) => setExcepForm({ ...excepForm, horaInicio: e.target.value })}
                      className="w-full border border-slate-300 rounded p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Hora Fin</label>
                    <input
                      type="time"
                      value={excepForm.horaFin}
                      onChange={(e) => setExcepForm({ ...excepForm, horaFin: e.target.value })}
                      className="w-full border border-slate-300 rounded p-1.5"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 mb-1">Motivo / Justificación</label>
                <input
                  type="text"
                  placeholder="Ej. Reposición, ajuste operativo..."
                  value={excepForm.motivo}
                  onChange={(e) => setExcepForm({ ...excepForm, motivo: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalExcepcion(null)}
                className="px-3 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={guardarExcepcion}
                className="px-4 py-1.5 rounded text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
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
                    <input
                      type="text"
                      required
                      value={requerimientoForm.docenteInfo.nombreCompleto}
                      onChange={(e) =>
                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: { ...requerimientoForm.docenteInfo, nombreCompleto: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Profesión</label>
                    <input
                      type="text"
                      value={requerimientoForm.docenteInfo.profesion}
                      onChange={(e) =>
                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: { ...requerimientoForm.docenteInfo, profesion: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nacionalidad</label>
                    <input
                      type="text"
                      value={requerimientoForm.docenteInfo.nacionalidad}
                      onChange={(e) =>
                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: { ...requerimientoForm.docenteInfo, nacionalidad: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
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
                    <select
                      value={requerimientoForm.docenteInfo.tipoContrato}
                      onChange={(e) => {
                        const nuevoContrato = e.target.value;
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
                      }}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs cursor-pointer focus:ring-1 focus:ring-slate-800 focus:outline-none"
                    >
                      <option value="SERVICIOS PROFESIONALES NO PERSONALES">SERVICIOS PROFESIONALES NO PERSONALES</option>
                      <option value="SERVICIOS PERSONALES">SERVICIOS PERSONALES</option>
                      <option value="AD HONOREM">AD HONOREM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tipo de Contratación</label>
                    <select
                      value={requerimientoForm.docenteInfo.tipoContratacion}
                      onChange={(e) =>
                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: { ...requerimientoForm.docenteInfo, tipoContratacion: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs cursor-pointer focus:ring-1 focus:ring-slate-800 focus:outline-none"
                    >
                      {requerimientoForm.docenteInfo.tipoContrato === 'SERVICIOS PERSONALES' ? (
                        <>
                          <option value="TIEMPO ADICIONAL">TIEMPO ADICIONAL</option>
                          <option value="TIEMPO INTEGRAL">TIEMPO INTEGRAL</option>
                        </>
                      ) : (
                        <option value="TIEMPO NORMAL">TIEMPO NORMAL</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Modalidad de Servicio</label>
                    <input
                      type="text"
                      value={requerimientoForm.docenteInfo.modalidadServicio}
                      onChange={(e) =>
                        setRequerimientoForm({
                          ...requerimientoForm,
                          docenteInfo: { ...requerimientoForm.docenteInfo, modalidadServicio: e.target.value }
                        })
                      }
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
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
                        <select
                          value={requerimientoForm.docenteInfo.calificacionDocente}
                          onChange={(e) =>
                            setRequerimientoForm({
                              ...requerimientoForm,
                              docenteInfo: { ...requerimientoForm.docenteInfo, calificacionDocente: e.target.value }
                            })
                          }
                          className="w-full border border-slate-300 rounded p-1.5 bg-white cursor-pointer font-bold"
                        >
                          {['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'].map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
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
                          <input
                            type="text"
                            value={prog.edicionCohorte}
                            onChange={(e) => {
                              const val = e.target.value;
                              const nuevosProgs = [...requerimientoForm.programas];
                              nuevosProgs[pIdx].edicionCohorte = val;
                              setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                            }}
                            className="w-full border border-slate-300 rounded p-1.5"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-600 mb-1">Coordinador del Programa</label>
                          <input
                            type="text"
                            value={prog.coordinador}
                            onChange={(e) => {
                              const val = e.target.value;
                              const nuevosProgs = [...requerimientoForm.programas];
                              nuevosProgs[pIdx].coordinador = val;
                              setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                            }}
                            className="w-full border border-slate-300 rounded p-1.5"
                          />
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
                                  <input
                                    type="text"
                                    value={asig.cargo}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const nuevosProgs = [...requerimientoForm.programas];
                                      nuevosProgs[pIdx].asignaciones[aIdx].cargo = val;
                                      if (val.toUpperCase().includes('COORDINAD')) {
                                        nuevosProgs[pIdx].asignaciones[aIdx].funciones = FUNCION_COORDINADOR_DEFAULT;
                                      }
                                      setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                    }}
                                    className="w-full border border-slate-300 rounded p-1 bg-white"
                                  />
                                </div>

                                {!esCoord ? (
                                  <div>
                                    <label className="block text-[10px] text-slate-600 mb-0.5">Asignatura</label>
                                    <input
                                      type="text"
                                      value={asig.asignatura}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        const nuevosProgs = [...requerimientoForm.programas];
                                        nuevosProgs[pIdx].asignaciones[aIdx].asignatura = val;
                                        setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                      }}
                                      className="w-full border border-slate-300 rounded p-1 bg-white"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center pt-3 text-[11px] text-indigo-700 italic">
                                    <span>* Sin asignatura asignada</span>
                                  </div>
                                )}

                                <div>
                                  <label className="block text-[10px] text-slate-600 mb-0.5">Módulo / Ciclo</label>
                                  <input
                                    type="text"
                                    value={asig.moduloCiclo}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const nuevosProgs = [...requerimientoForm.programas];
                                      nuevosProgs[pIdx].asignaciones[aIdx].moduloCiclo = val;
                                      setRequerimientoForm({ ...requerimientoForm, programas: nuevosProgs });
                                    }}
                                    className="w-full border border-slate-300 rounded p-1 bg-white"
                                  />
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
    </div>
  );
}
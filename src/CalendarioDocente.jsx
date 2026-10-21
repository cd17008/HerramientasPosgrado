import React, { useState, useMemo } from 'react';
import XLSX from 'xlsx-js-style';

// ==========================================
// COMPONENTES DE ICONOS SVG ESTILIZADOS
// ==========================================
const IconCalendar = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconClock = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconPlus = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
  </svg>
);

const IconEdit = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconTrash = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconDownload = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const IconAlert = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconCheck = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const IconLayers = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const IconX = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ==========================================
// CATÁLOGO DE ASUETOS Y VACACIONES UES (2026 - 2027)
// ==========================================
const ASUETOS_BASE = {
  // 2026
  '2026-01-01': 'Año Nuevo',
  '2026-03-30': 'Semana Santa (Lunes)',
  '2026-03-31': 'Semana Santa (Martes)',
  '2026-04-01': 'Semana Santa (Miércoles)',
  '2026-04-02': 'Semana Santa (Jueves)',
  '2026-04-03': 'Semana Santa (Viernes)',
  '2026-04-04': 'Semana Santa (Sábado)',
  '2026-04-05': 'Semana Santa (Domingo)',
  '2026-05-01': 'Día del Trabajo',
  '2026-05-10': 'Día de la Madre',
  '2026-06-17': 'Día del Padre',
  '2026-08-01': 'Vacaciones Agostinas UES',
  '2026-08-02': 'Vacaciones Agostinas UES',
  '2026-08-03': 'Vacaciones Agostinas UES',
  '2026-08-04': 'Vacaciones Agostinas UES',
  '2026-08-05': 'Vacaciones Agostinas UES',
  '2026-08-06': 'Vacaciones Agostinas UES',
  '2026-08-07': 'Vacaciones Agostinas UES',
  '2026-09-15': 'Día de la Independencia',
  '2026-11-02': 'Día de los Difuntos',
  '2026-12-25': 'Navidad',

  // 2027
  '2027-01-01': 'Año Nuevo',
  '2027-03-22': 'Semana Santa (Lunes)',
  '2027-03-23': 'Semana Santa (Martes)',
  '2027-03-24': 'Semana Santa (Miércoles)',
  '2027-03-25': 'Semana Santa (Jueves)',
  '2027-03-26': 'Semana Santa (Viernes)',
  '2027-03-27': 'Semana Santa (Sábado)',
  '2027-03-28': 'Semana Santa (Domingo)',
  '2027-05-01': 'Día del Trabajo',
  '2027-05-10': 'Día de la Madre',
  '2027-06-17': 'Día del Padre',
  '2027-08-01': 'Vacaciones Agostinas UES',
  '2027-08-02': 'Vacaciones Agostinas UES',
  '2027-08-03': 'Vacaciones Agostinas UES',
  '2027-08-04': 'Vacaciones Agostinas UES',
  '2027-08-05': 'Vacaciones Agostinas UES',
  '2027-08-06': 'Vacaciones Agostinas UES',
  '2027-08-07': 'Vacaciones Agostinas UES',
  '2027-09-15': 'Día de la Independencia',
  '2027-11-02': 'Día de los Difuntos',
  '2027-12-25': 'Navidad',
};

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
  { id: 0, nombre: 'Domingo' }
];

// ==========================================
// FUNCIONES DE FECHA Y HORA
// ==========================================
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const formatTime12h = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')}${ampm}`;
};

const formatDateIso = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDateDDMMYYYY = (isoStr) => {
  if (!isoStr) return '';
  const [y, m, d] = isoStr.split('-');
  return `${d}/${m}/${y}`;
};

const getMondayIso = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(dt.setDate(diff));
  return formatDateIso(monday);
};

export default function DocenteScheduleTool() {
  const [docenteNombre, setDocenteNombre] = useState('Ing. Manuel Rodríguez');

  const [asignaciones, setAsignaciones] = useState([
    {
      id: 'asig-1',
      materia: 'Materia I - Arquitectura de Software',
      fechaInicio: '2026-03-01',
      fechaFin: '2026-06-30',
      dias: {
        2: { activo: true, horaInicio: '19:00', horaFin: '21:00' }, // Martes
        4: { activo: true, horaInicio: '19:00', horaFin: '21:00' }  // Jueves
      },
      excepciones: {
        '2026-04-14': { tipo: 'MODIFICAR', horaInicio: '18:00', horaFin: '21:00', motivo: 'Recuperación de sesión' }
      }
    },
    {
      id: 'asig-2',
      materia: 'Materia II - Seguridad Informática',
      fechaInicio: '2026-08-15',
      fechaFin: '2026-11-30',
      dias: {
        6: { activo: true, horaInicio: '08:00', horaFin: '12:00' } // Sábado
      },
      excepciones: {}
    }
  ]);

  const [activeTab, setActiveTab] = useState('calendario'); // 'calendario', 'metricas', 'choques'
  const [asignacionSeleccionadaId, setAsignacionSeleccionadaId] = useState('asig-1');

  // Asignaciones seleccionadas para el resumen y reporte
  const [seleccionadasResumen, setSeleccionadasResumen] = useState(['asig-1', 'asig-2']);

  // Modal para Crear / Editar Asignación
  const [modalAsignacionAbierto, setModalAsignacionAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formAsignacion, setFormAsignacion] = useState({
    id: '',
    materia: '',
    fechaInicio: '2026-03-01',
    fechaFin: '2026-06-30',
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

  // Modal para Excepción Puntual por Día
  const [modalExcepcion, setModalExcepcion] = useState(null);
  const [excepForm, setExcepForm] = useState({
    fecha: '',
    tipo: 'MODIFICAR',
    horaInicio: '18:00',
    horaFin: '21:00',
    motivo: ''
  });

  // Limpiar todo el estado
  const handleLimpiarTodo = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar todas las asignaciones y limpiar el nombre del docente?')) {
      setDocenteNombre('');
      setAsignaciones([]);
      setAsignacionSeleccionadaId(null);
      setSeleccionadasResumen([]);
    }
  };

  // Abrir modal de creación
  const handleAbrirCrear = () => {
    setModoEdicion(false);
    setFormAsignacion({
      id: `asig-${Date.now()}`,
      materia: '',
      fechaInicio: '2026-03-01',
      fechaFin: '2026-06-30',
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

  // Abrir modal de edición con los datos de la asignación seleccionada
  const handleAbrirEditar = (asig) => {
    setModoEdicion(true);
    setFormAsignacion({
      id: asig.id,
      materia: asig.materia,
      fechaInicio: asig.fechaInicio,
      fechaFin: asig.fechaFin,
      dias: JSON.parse(JSON.stringify(asig.dias))
    });
    setModalAsignacionAbierto(true);
  };

  // Guardar asignación (nueva o editada)
  const handleGuardarAsignacion = (e) => {
    e.preventDefault();
    if (!formAsignacion.materia.trim()) {
      alert('Por favor ingrese el nombre de la asignación.');
      return;
    }

    if (modoEdicion) {
      setAsignaciones((prev) =>
        prev.map((a) => (a.id === formAsignacion.id ? { ...a, ...formAsignacion } : a))
      );
    } else {
      const nueva = {
        ...formAsignacion,
        excepciones: {}
      };
      setAsignaciones((prev) => [...prev, nueva]);
      setAsignacionSeleccionadaId(nueva.id);
      setSeleccionadasResumen((prev) => [...prev, nueva.id]);
    }

    setModalAsignacionAbierto(false);
  };

  // Eliminar asignación individual
  const handleEliminarAsignacion = (idAEliminar) => {
    if (window.confirm('¿Deseas eliminar permanentemente esta asignación?')) {
      const restantes = asignaciones.filter((a) => a.id !== idAEliminar);
      setAsignaciones(restantes);
      setSeleccionadasResumen((prev) => prev.filter((id) => id !== idAEliminar));
      if (asignacionSeleccionadaId === idAEliminar) {
        setAsignacionSeleccionadaId(restantes.length > 0 ? restantes[0].id : null);
      }
    }
  };

  // Generador de sesiones de clase
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

  // Auditoría de choques
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

  // Resumen consolidado de horas por asignación
  const resumenPorAsignacion = useMemo(() => {
    return asignaciones.map((asig) => {
      const sesionesAsig = todasLasSesiones.filter((s) => s.activa && s.asignacionId === asig.id);
      const totalHoras = sesionesAsig.reduce((acc, curr) => acc + curr.duracionHoras, 0);
      return {
        id: asig.id,
        materia: asig.materia,
        fechaInicio: asig.fechaInicio,
        fechaFin: asig.fechaFin,
        totalHoras,
        totalSesiones: sesionesAsig.length
      };
    });
  }, [asignaciones, todasLasSesiones]);

  // Total de horas y sesiones de las asignaciones seleccionadas con checkbox
  const totalesSeleccionados = useMemo(() => {
    const asignacionesFiltradas = resumenPorAsignacion.filter((a) => seleccionadasResumen.includes(a.id));
    const totalHoras = asignacionesFiltradas.reduce((acc, curr) => acc + curr.totalHoras, 0);
    const totalSesiones = asignacionesFiltradas.reduce((acc, curr) => acc + curr.totalSesiones, 0);
    return { totalHoras, totalSesiones };
  }, [resumenPorAsignacion, seleccionadasResumen]);

  // Métricas mensuales y semanales de la asignación actualmente seleccionada
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

  // Manejo de Checkboxes de Resumen
  const handleToggleSeleccionTodas = () => {
    if (seleccionadasResumen.length === asignaciones.length) {
      setSeleccionadasResumen([]);
    } else {
      setSeleccionadasResumen(asignaciones.map((a) => a.id));
    }
  };

  const handleToggleSeleccionAsig = (id) => {
    setSeleccionadasResumen((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Exportación a Excel con asignaciones filtradas y ajustes manuales desglosados
  const descargarExcelResumen = () => {
    const asignacionesFiltradas = asignaciones.filter((a) => seleccionadasResumen.includes(a.id));

    if (asignacionesFiltradas.length === 0) {
      alert('Por favor seleccione al menos una asignación mediante los checkboxes para exportar.');
      return;
    }

    // 1. Tabla Izquierda: Detalle de Sesiones
    const leftRows = [
      ['Día', 'Fecha', 'N° Horas', 'Mes', 'Asignación']
    ];

    const sesionesEfectivas = todasLasSesiones
      .filter((s) => s.activa && seleccionadasResumen.includes(s.asignacionId))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    let sumaTotalHorasDetalle = 0;

    sesionesEfectivas.forEach((s) => {
      sumaTotalHorasDetalle += s.duracionHoras;

      const [year, month, day] = s.fecha.split('-');
      const numeroDia = parseInt(day, 10); // Únicamente número de día

      const fechaObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const mesStr = fechaObj.toLocaleString('es-ES', { month: 'long' });
      const mesLimpio = mesStr.charAt(0).toUpperCase() + mesStr.slice(1);

      leftRows.push([
        s.nombreDia,
        numeroDia,
        s.duracionHoras,
        mesLimpio,
        s.materia
      ]);
    });

    // Fila final de TOTAL requerida
    leftRows.push([
      '',
      'TOTAL',
      sumaTotalHorasDetalle,
      'horas',
      ''
    ]);

    // 2. Tabla Derecha: Horarios Semanales y Ajustes Manuales por Fecha
    const rightRows = [];
    const rightMeta = [];

    asignacionesFiltradas.forEach((asig, index) => {
      if (index > 0) {
        rightRows.push(['', '']);
        rightMeta.push('empty');
      }

      // Nombre de la Asignación encima de su horario
      rightRows.push([asig.materia, '']);
      rightMeta.push('title');

      // Encabezado
      rightRows.push(['Día', 'Horario']);
      rightMeta.push('header');

      // Horario semanal recurrente
      const diasActivos = DIAS_SEMANA.filter((d) => asig.dias[d.id]?.activo);
      if (diasActivos.length === 0) {
        rightRows.push(['Sin horario semanal', 'No configurado']);
        rightMeta.push('data');
      } else {
        diasActivos.forEach((d) => {
          const c = asig.dias[d.id];
          const rangoFormateado = `${formatTime12h(c.horaInicio)} a ${formatTime12h(c.horaFin)}`;
          rightRows.push([d.nombre, rangoFormateado]);
          rightMeta.push('data');
        });
      }

      // Ajustes manuales por fecha puntual (excepciones)
      if (asig.excepciones && Object.keys(asig.excepciones).length > 0) {
        const fechasExcepcion = Object.keys(asig.excepciones).sort();

        fechasExcepcion.forEach((fStr) => {
          const ex = asig.excepciones[fStr];
          const [y, m, d] = fStr.split('-').map(Number);
          const dt = new Date(y, m - 1, d);
          const nombreDia = DIAS_SEMANA.find((dia) => dia.id === dt.getDay())?.nombre.toLowerCase() || '';
          const nombreMes = dt.toLocaleString('es-ES', { month: 'long' });

          const etiquetaFecha = `${nombreDia} ${dt.getDate()} de ${nombreMes}`;
          let rangoAjuste = '';

          if (ex.tipo === 'MODIFICAR') {
            rangoAjuste = `${formatTime12h(ex.horaInicio)} a ${formatTime12h(ex.horaFin)}`;
          } else if (ex.tipo === 'CANCELAR') {
            rangoAjuste = 'Clase cancelada';
          }

          rightRows.push([etiquetaFecha, rangoAjuste]);
          rightMeta.push('data-exception');
        });
      }
    });

    // 3. Fusión en matriz 2D
    const totalFilas = Math.max(leftRows.length, rightRows.length);
    const matrizFinal = [];

    for (let i = 0; i < totalFilas; i++) {
      const left = leftRows[i] || ['', '', '', '', ''];
      const columnaVacia = '';
      const right = rightRows[i] || ['', ''];

      matrizFinal.push([...left, columnaVacia, ...right]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(matrizFinal);

    // 4. Estilos sobrios y bordes de celda
    const borderStyle = {
      top: { style: 'thin', color: { rgb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } }
    };

    const headerLeftStyle = {
      fill: { fgColor: { rgb: '1E293B' } },
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderStyle
    };

    const totalRowStyle = (align = 'center') => ({
      fill: { fgColor: { rgb: 'F1F5F9' } },
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '0F172A' } },
      alignment: { horizontal: align, vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: '94A3B8' } },
        bottom: { style: 'medium', color: { rgb: '94A3B8' } },
        left: { style: 'thin', color: { rgb: 'CBD5E1' } },
        right: { style: 'thin', color: { rgb: 'CBD5E1' } }
      }
    });

    const titleRightStyle = {
      fill: { fgColor: { rgb: '334155' } },
      font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: borderStyle
    };

    const headerRightStyle = {
      fill: { fgColor: { rgb: 'E2E8F0' } },
      font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '1E293B' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: borderStyle
    };

    const dataCellStyle = (align = 'left') => ({
      font: { name: 'Calibri', sz: 10 },
      alignment: { horizontal: align, vertical: 'center' },
      border: borderStyle
    });

    // 5. Asignar estilos por celda
    const indiceFilaTotal = leftRows.length - 1;

    for (let r = 0; r < leftRows.length; r++) {
      for (let c = 0; c < 5; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };

        if (r === 0) {
          worksheet[cellRef].s = headerLeftStyle;
        } else if (r === indiceFilaTotal) {
          const align = c === 1 || c === 2 || c === 3 ? 'center' : 'left';
          worksheet[cellRef].s = totalRowStyle(align);
        } else {
          const align = c === 1 || c === 2 || c === 3 ? 'center' : 'left';
          worksheet[cellRef].s = dataCellStyle(align);
        }
      }
    }

    for (let r = 0; r < rightRows.length; r++) {
      const tipoFila = rightMeta[r];
      if (tipoFila === 'empty') continue;

      for (let c = 6; c <= 7; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!worksheet[cellRef]) worksheet[cellRef] = { t: 's', v: '' };

        if (tipoFila === 'title') {
          worksheet[cellRef].s = titleRightStyle;
        } else if (tipoFila === 'header') {
          worksheet[cellRef].s = headerRightStyle;
        } else {
          worksheet[cellRef].s = dataCellStyle(c === 6 ? 'left' : 'center');
        }
      }
    }

    worksheet['!cols'] = [
      { wch: 14 }, // A: Día
      { wch: 10 }, // B: Fecha (Número de día)
      { wch: 14 }, // C: N° Horas
      { wch: 16 }, // D: Mes
      { wch: 38 }, // E: Asignación
      { wch: 6 },  // F: Vacía
      { wch: 28 }, // G: Día / Ajuste de fecha
      { wch: 28 }  // H: Horario
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asignaciones y Horarios');

    const sanitizedDocente = docenteNombre.trim() ? docenteNombre.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Docente';
    XLSX.writeFile(workbook, `Horarios_${sanitizedDocente}.xlsx`);
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

  const currentAsig = asignaciones.find((a) => a.id === asignacionSeleccionadaId) || asignaciones[0] || null;
  const cantidadChoquesTotales = Object.keys(mapaDeChoques).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      
      {/* BARRA SUPERIOR SOBRIA */}
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLimpiarTodo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold cursor-pointer transition-colors"
            title="Borrar todas las asignaciones y limpiar el formulario"
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

      {/* CONTENEDOR PRINCIPAL: SIDEBAR + PANEL DE TRABAJO */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* BARRA LATERAL IZQUIERDA: ASIGNACIONES */}
        <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col p-4 space-y-4 flex-shrink-0">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-800">
              <IconLayers className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Asignaciones</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {asignaciones.length} total
            </span>
          </div>

          {/* Botón para abrir modal de agregar */}
          <button
            type="button"
            onClick={handleAbrirCrear}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer transition-colors"
          >
            <IconPlus className="w-3.5 h-3.5" />
            Nueva Asignación
          </button>

          {/* Lista de asignaciones creadas */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {asignaciones.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8 italic">
                No hay asignaciones registradas.
              </p>
            ) : (
              asignaciones.map((asig) => {
                const esActiva = asig.id === asignacionSeleccionadaId;
                const diasActivos = DIAS_SEMANA.filter((d) => asig.dias[d.id]?.activo);

                return (
                  <div
                    key={asig.id}
                    onClick={() => setAsignacionSeleccionadaId(asig.id)}
                    className={`p-3 rounded border text-left cursor-pointer transition-colors ${
                      esActiva
                        ? 'border-slate-800 bg-slate-50 text-slate-900'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-xs leading-snug line-clamp-2">
                        {asig.materia}
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                      <IconCalendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDateDDMMYYYY(asig.fechaInicio)} al {formatDateDDMMYYYY(asig.fechaFin)}</span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <IconClock className="w-3 h-3 text-slate-400" />
                      <span>
                        {diasActivos.length > 0
                          ? diasActivos.map((d) => d.nombre.slice(0, 3)).join(', ')
                          : 'Sin días asignados'}
                      </span>
                    </div>

                    {/* Botones de acción desplegados debajo de la asignación seleccionada */}
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

        {/* PANEL PRINCIPAL */}
        <main className="flex-1 p-6 overflow-y-auto space-y-5">
          
          {/* PESTAÑAS PRINCIPALES */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('calendario')}
              className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                activeTab === 'calendario'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Fechas y Sesiones
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('metricas')}
              className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                activeTab === 'metricas'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Resumen de Horas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('choques')}
              className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors inline-flex items-center gap-1.5 ${
                activeTab === 'choques'
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

          {/* ESTADO VACÍO SI NO HAY ASIGNACIÓN SELECCIONADA */}
          {!currentAsig && (
            <div className="bg-white border border-dashed border-slate-300 rounded p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-700">No hay materias asignadas</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Crea una nueva asignación desde la barra lateral izquierda para comenzar a proyectar el calendario de clases.
              </p>
              <button
                type="button"
                onClick={handleAbrirCrear}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded cursor-pointer transition-colors"
              >
                + Crear Asignación
              </button>
            </div>
          )}

          {/* TAB 1: FECHAS Y SESIONES */}
          {currentAsig && activeTab === 'calendario' && (
            <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
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
                      .filter((s) => s.asignacionId === currentAsig.id)
                      .map((s) => {
                        const conflicto = mapaDeChoques[s.id];

                        let filaBg = 'hover:bg-slate-50';
                        if (s.esAsueto) filaBg = 'bg-blue-50/40 hover:bg-blue-50';
                        else if (s.estado === 'MODIFICADO') filaBg = 'bg-amber-50/50 hover:bg-amber-50';
                        else if (s.estado === 'CANCELADO') filaBg = 'bg-slate-100 text-slate-400';
                        if (conflicto) filaBg = 'bg-red-50 text-red-900';

                        return (
                          <tr key={s.id} className={filaBg}>
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {formatDateDDMMYYYY(s.fecha)}
                            </td>
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
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: RESUMEN DE HORAS (TABLA CON CHECKBOXES Y DESCARGA EXCEL) */}
          {activeTab === 'metricas' && (
            <div className="space-y-5">
              
              {/* TABLA PRINCIPAL DE RECUENTO POR ASIGNACIÓN CON CHECKBOXES */}
              <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Recuento Consolidado por Asignación
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Selecciona mediante los checkboxes las asignaciones a incluir en el cómputo y en el reporte en Excel.
                    </p>
                  </div>

                  {/* ÚNICO BOTÓN DE DESCARGA EXCEL */}
                  <button
                    type="button"
                    onClick={descargarExcelResumen}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                    title="Exportar las asignaciones seleccionadas a Excel"
                  >
                    <IconDownload className="w-3.5 h-3.5" />
                    Descargar Resumen Excel
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={asignaciones.length > 0 && seleccionadasResumen.length === asignaciones.length}
                            onChange={handleToggleSeleccionTodas}
                            className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                            title="Seleccionar o deseleccionar todas"
                          />
                        </th>
                        <th className="py-2.5 px-3">Materia / Asignación</th>
                        <th className="py-2.5 px-3">Fecha Inicio</th>
                        <th className="py-2.5 px-3">Fecha Fin</th>
                        <th className="py-2.5 px-3 text-center">Sesiones</th>
                        <th className="py-2.5 px-3 text-right">Total Horas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resumenPorAsignacion.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                            No hay asignaciones cargadas en este momento.
                          </td>
                        </tr>
                      ) : (
                        resumenPorAsignacion.map((item) => {
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
                                  onChange={() => handleToggleSeleccionAsig(item.id)}
                                  className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                                />
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-900">
                                {item.materia}
                                {item.id === asignacionSeleccionadaId && (
                                  <span className="ml-2 text-[10px] text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded font-normal">
                                    En pantalla
                                  </span>
                                )}
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
                        })
                      )}
                    </tbody>
                    {resumenPorAsignacion.length > 0 && (
                      <tfoot className="bg-slate-100 text-slate-900 font-bold border-t border-slate-200">
                        <tr>
                          <td colSpan={4} className="py-2.5 px-3 text-slate-700 uppercase text-[11px]">
                            Total de Asignaciones Seleccionadas ({seleccionadasResumen.length} de {asignaciones.length})
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-xs">
                            {totalesSeleccionados.totalSesiones} clases
                          </td>
                          <td className="py-2.5 px-3 text-right text-xs">
                            {totalesSeleccionados.totalHoras.toFixed(1)} h
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* BLOQUES MENSUALES Y SEMANALES DE LA MATERIA EN PANTALLA */}
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

          {/* TAB 3: AUDITORÍA DE CHOQUES */}
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

      {/* ==========================================
          MODAL: CREAR / EDITAR ASIGNACIÓN
         ========================================== */}
      {modalAsignacionAbierto && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 rounded max-w-xl w-full p-6 space-y-4">
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
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre de la Materia o Módulo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Materia I - Arquitectura de Software"
                  value={formAsignacion.materia}
                  onChange={(e) => setFormAsignacion({ ...formAsignacion, materia: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={formAsignacion.fechaInicio}
                    onChange={(e) => setFormAsignacion({ ...formAsignacion, fechaInicio: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fecha de Fin
                  </label>
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
                <label className="block font-semibold text-slate-700 mb-2">
                  Horario Semanal Recurrente
                </label>
                <div className="space-y-2 border border-slate-200 rounded p-3 max-h-52 overflow-y-auto bg-slate-50">
                  {DIAS_SEMANA.map((dia) => {
                    const conf = formAsignacion.dias[dia.id] || { activo: false, horaInicio: '18:00', horaFin: '20:00' };

                    return (
                      <div
                        key={dia.id}
                        className={`flex items-center justify-between p-2 rounded border transition-colors ${
                          conf.activo ? 'bg-white border-slate-300' : 'bg-slate-100/50 border-slate-200 opacity-60'
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
                                dias: {
                                  ...formAsignacion.dias,
                                  [dia.id]: { ...conf, activo: checked }
                                }
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
                                  dias: {
                                    ...formAsignacion.dias,
                                    [dia.id]: { ...conf, horaInicio: val }
                                  }
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
                                  dias: {
                                    ...formAsignacion.dias,
                                    [dia.id]: { ...conf, horaFin: val }
                                  }
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
                  className="px-3 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer transition-colors"
                >
                  {modoEdicion ? 'Actualizar Asignación' : 'Crear Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: EXCEPCIÓN PUNTUAL POR DÍA
         ========================================== */}
      {modalExcepcion && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
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
                  className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                >
                  <option value="MODIFICAR">Cambiar horario para esta fecha puntual</option>
                  <option value="CANCELAR">Cancelar clase en esta fecha</option>
                  <option value="RESET">Restablecer a horario semanal regular</option>
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
                      className="w-full border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Hora Fin</label>
                    <input
                      type="time"
                      value={excepForm.horaFin}
                      onChange={(e) => setExcepForm({ ...excepForm, horaFin: e.target.value })}
                      className="w-full border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 mb-1">Motivo / Justificación</label>
                <input
                  type="text"
                  placeholder="Ej. Reposición, ajuste operativo, etc."
                  value={excepForm.motivo}
                  onChange={(e) => setExcepForm({ ...excepForm, motivo: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalExcepcion(null)}
                className="px-3 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={guardarExcepcion}
                className="px-4 py-1.5 rounded text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer transition-colors"
              >
                Aplicar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
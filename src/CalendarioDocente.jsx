import React, { useState, useMemo } from 'react';
import XLSX from 'xlsx-js-style';

// Catálogo de asuetos nacionales y semanas completas institucionales UES (2026 - 2027)
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
        2: { activo: true, horaInicio: '19:00', horaFin: '21:00' },
        4: { activo: true, horaInicio: '19:00', horaFin: '21:00' }
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
        6: { activo: true, horaInicio: '08:00', horaFin: '12:00' }
      },
      excepciones: {}
    }
  ]);

  const [activeTab, setActiveTab] = useState('calendario');
  const [asignacionSeleccionadaId, setAsignacionSeleccionadaId] = useState('asig-1');

  const [modalExcepcion, setModalExcepcion] = useState(null);
  const [excepForm, setExcepForm] = useState({
    fecha: '',
    tipo: 'MODIFICAR',
    horaInicio: '18:00',
    horaFin: '21:00',
    motivo: ''
  });

  const handleLimpiarTodo = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar todas las asignaciones y limpiar el nombre del docente?')) {
      setDocenteNombre('');
      setAsignaciones([]);
      setAsignacionSeleccionadaId(null);
    }
  };

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
          nombreDia: DIAS_SEMANA.find(d => d.id === dayOfWeek)?.nombre || '',
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

  const metricas = useMemo(() => {
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

  const descargarExcelResumen = () => {
    if (asignaciones.length === 0) {
      alert('No hay asignaciones para exportar.');
      return;
    }

    const leftRows = [
      ['Día', 'Fecha', 'N° Horas', 'Mes', 'Asignación']
    ];

    const sesionesEfectivas = todasLasSesiones
      .filter((s) => s.activa)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    let sumaTotalHorasDetalle = 0;

    sesionesEfectivas.forEach((s) => {
      sumaTotalHorasDetalle += s.duracionHoras;

      const [year, month, day] = s.fecha.split('-');
      const numeroDia = parseInt(day, 10); // Solo el número de día

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

    leftRows.push([
      '',
      'TOTAL',
      sumaTotalHorasDetalle,
      'horas',
      ''
    ]);

    const rightRows = [];
    const rightMeta = [];

    asignaciones.forEach((asig, index) => {
      if (index > 0) {
        rightRows.push(['', '']);
        rightMeta.push('empty');
      }

      rightRows.push([asig.materia, '']);
      rightMeta.push('title');

      rightRows.push(['Día', 'Horario']);
      rightMeta.push('header');

      const diasActivos = DIAS_SEMANA.filter((d) => asig.dias[d.id]?.activo);

      if (diasActivos.length === 0) {
        rightRows.push(['Sin horario', 'No configurado']);
        rightMeta.push('data');
      } else {
        diasActivos.forEach((d) => {
          const c = asig.dias[d.id];
          const rangoFormateado = `${formatTime12h(c.horaInicio)} a ${formatTime12h(c.horaFin)}`;
          rightRows.push([d.nombre, rangoFormateado]);
          rightMeta.push('data');
        });
      }
    });

    const totalFilas = Math.max(leftRows.length, rightRows.length);
    const matrizFinal = [];

    for (let i = 0; i < totalFilas; i++) {
      const left = leftRows[i] || ['', '', '', '', ''];
      const columnaVacia = '';
      const right = rightRows[i] || ['', ''];

      matrizFinal.push([...left, columnaVacia, ...right]);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(matrizFinal);

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
      border: {
        top: { style: 'thin', color: { rgb: '0F172A' } },
        bottom: { style: 'thin', color: { rgb: '0F172A' } },
        left: { style: 'thin', color: { rgb: '0F172A' } },
        right: { style: 'thin', color: { rgb: '0F172A' } }
      }
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
      fill: { fgColor: { rgb: '3730A3' } },
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

    const indiceFilaTotal = leftRows.length - 1;

    for (let r = 0; r < leftRows.length; r++) {
      for (let c = 0; c < 5; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { t: 's', v: '' };
        }

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
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { t: 's', v: '' };
        }

        if (tipoFila === 'title') {
          worksheet[cellRef].s = titleRightStyle;
        } else if (tipoFila === 'header') {
          worksheet[cellRef].s = headerRightStyle;
        } else if (tipoFila === 'data') {
          worksheet[cellRef].s = dataCellStyle(c === 6 ? 'left' : 'center');
        }
      }
    }

    worksheet['!cols'] = [
      { wch: 14 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 38 },
      { wch: 6 },
      { wch: 22 },
      { wch: 28 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asignaciones y Horarios');

    const sanitizedDocente = docenteNombre.trim() ? docenteNombre.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Docente';
    XLSX.writeFile(workbook, `Horarios_${sanitizedDocente}.xlsx`);
  };

  const agregarAsignacion = () => {
    const nuevoId = `asig-${Date.now()}`;
    const nueva = {
      id: nuevoId,
      materia: `Nueva Asignación ${asignaciones.length + 1}`,
      fechaInicio: '2026-08-15',
      fechaFin: '2026-11-30',
      dias: {
        6: { activo: true, horaInicio: '08:00', horaFin: '12:00' }
      },
      excepciones: {}
    };
    setAsignaciones([...asignaciones, nueva]);
    setAsignacionSeleccionadaId(nuevoId);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Encabezado */}
        <header className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
                Escuela de Posgrado FIA-UES
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                Ciclos 2026 / 2027
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
              Generador y Validador de Horarios Docentes
            </h1>
            <p className="text-sm text-slate-500">
              Cálculo con exclusión de asuetos nacionales, Semana Santa y vacaciones agostinas completas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <button
              onClick={handleLimpiarTodo}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition cursor-pointer"
              title="Borrar todas las asignaciones y limpiar el nombre"
            >
              <span>🗑️</span>
              Limpiar Todo
            </button>

            <button
              onClick={descargarExcelResumen}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
              title="Descargar tabla con estilos y bordes en Excel"
            >
              <span>📊</span>
              Descargar Resumen Excel
            </button>

            <div className="text-right">
              <label className="text-xs text-slate-500 font-medium">Docente Asignado</label>
              <input
                type="text"
                placeholder="Nombre del docente..."
                value={docenteNombre}
                onChange={(e) => setDocenteNombre(e.target.value)}
                className="block text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {cantidadChoquesTotales > 0 ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <span>⚠️ {cantidadChoquesTotales} Choque(s)</span>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg text-xs font-semibold">
                ✓ Sin choques
              </div>
            )}
          </div>
        </header>

        {/* Pestañas y selector de asignaciones */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap gap-2">
            {asignaciones.map((asig) => (
              <button
                key={asig.id}
                onClick={() => setAsignacionSeleccionadaId(asig.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  asig.id === asignacionSeleccionadaId
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {asig.materia}
              </button>
            ))}
            <button
              onClick={agregarAsignacion}
              className="px-3 py-2 rounded-lg text-sm font-medium border border-dashed border-indigo-400 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
            >
              + Añadir otra asignación
            </button>
          </div>

          <div className="inline-flex rounded-lg bg-slate-200 p-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('calendario')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${activeTab === 'calendario' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Fechas y Sesiones
            </button>
            <button
              onClick={() => setActiveTab('configuracion')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${activeTab === 'configuracion' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Horario Semanal Base
            </button>
            <button
              onClick={() => setActiveTab('metricas')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${activeTab === 'metricas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Resumen de Horas
            </button>
            <button
              onClick={() => setActiveTab('choques')}
              className={`px-3 py-1.5 rounded-md transition relative cursor-pointer ${activeTab === 'choques' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Auditoría de Choques
              {cantidadChoquesTotales > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px]">
                  {cantidadChoquesTotales}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Estado Vacío */}
        {!currentAsig && (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <p className="text-base font-semibold text-slate-700">No hay asignaciones registradas</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Haz clic en el botón de abajo para dar de alta una materia o módulo e iniciar la programación.
            </p>
            <button
              onClick={agregarAsignacion}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
            >
              + Crear Asignación
            </button>
          </div>
        )}

        {/* TAB 1: CALENDARIO DE SESIONES DETALLADO */}
        {currentAsig && activeTab === 'calendario' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Desglose de Sesiones: {currentAsig.materia}
                </h2>
                <p className="text-xs text-slate-500">
                  Rango programado: {formatDateDDMMYYYY(currentAsig.fechaInicio)} al {formatDateDDMMYYYY(currentAsig.fechaFin)}.
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Modificado
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Asueto UES
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Choque
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 sticky top-0 z-10 text-slate-600 uppercase">
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
                    .filter((s) => s.asignacionId === currentAsig.id)
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
                                ⚠️ Choque con: {conflicto.map(c => `${c.contra} (${c.rango})`).join(', ')}
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
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CONFIGURACIÓN BASE DE LA ASIGNACIÓN */}
        {currentAsig && activeTab === 'configuracion' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Parámetros de la Asignación: {currentAsig.materia}
              </h2>
              <p className="text-xs text-slate-500">
                Define el nombre, el rango de fechas activas y el horario semanal recurrente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de la Materia / Módulo</label>
                <input
                  type="text"
                  value={currentAsig.materia}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAsignaciones(prev => prev.map(a => a.id === currentAsig.id ? { ...a, materia: val } : a));
                  }}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={currentAsig.fechaInicio}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAsignaciones(prev => prev.map(a => a.id === currentAsig.id ? { ...a, fechaInicio: val } : a));
                  }}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Fin</label>
                <input
                  type="date"
                  value={currentAsig.fechaFin}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAsignaciones(prev => prev.map(a => a.id === currentAsig.id ? { ...a, fechaFin: val } : a));
                  }}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Horario Recurrente Semanal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DIAS_SEMANA.map((dia) => {
                  const conf = currentAsig.dias[dia.id] || { activo: false, horaInicio: '18:00', horaFin: '21:00' };

                  return (
                    <div
                      key={dia.id}
                      className={`p-3 rounded-lg border transition ${
                        conf.activo ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{dia.nombre}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={conf.activo}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setAsignaciones(prev =>
                                prev.map(a => {
                                  if (a.id !== currentAsig.id) return a;
                                  return {
                                    ...a,
                                    dias: {
                                      ...a.dias,
                                      [dia.id]: { ...conf, activo: checked }
                                    }
                                  };
                                })
                              );
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      {conf.activo && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500">Desde</span>
                            <input
                              type="time"
                              value={conf.horaInicio}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAsignaciones(prev =>
                                  prev.map(a => {
                                    if (a.id !== currentAsig.id) return a;
                                    return {
                                      ...a,
                                      dias: {
                                        ...a.dias,
                                        [dia.id]: { ...conf, horaInicio: val }
                                      }
                                    };
                                  })
                                );
                              }}
                              className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500">Hasta</span>
                            <input
                              type="time"
                              value={conf.horaFin}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAsignaciones(prev =>
                                  prev.map(a => {
                                    if (a.id !== currentAsig.id) return a;
                                    return {
                                      ...a,
                                      dias: {
                                        ...a.dias,
                                        [dia.id]: { ...conf, horaFin: val }
                                      }
                                    };
                                  })
                                );
                              }}
                              className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RESUMEN DE HORAS */}
        {activeTab === 'metricas' && (
          <div className="space-y-6">
            
            {/* Recuento por Asignación */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Recuento Consolidado por Asignación
                  </h3>
                  <p className="text-xs text-slate-500">
                    Horas efectivas totales impartidas por módulo/materia para {docenteNombre || 'el docente'}.
                  </p>
                </div>
                <button
                  onClick={descargarExcelResumen}
                  className="self-start sm:self-auto px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📥</span> Descargar Tabla Excel
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Materia / Asignación</th>
                      <th className="py-2.5 px-3">Vigencia</th>
                      <th className="py-2.5 px-3 text-center">Sesiones Efectivas</th>
                      <th className="py-2.5 px-3 text-right">Total Horas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resumenPorAsignacion.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                          No hay asignaciones cargadas en este momento.
                        </td>
                      </tr>
                    ) : (
                      resumenPorAsignacion.map((item) => (
                        <tr
                          key={item.id}
                          className={item.id === asignacionSeleccionadaId ? 'bg-indigo-50/40 font-medium' : 'hover:bg-slate-50'}
                        >
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {item.materia}
                            {item.id === asignacionSeleccionadaId && (
                              <span className="ml-2 text-[10px] text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                                Seleccionada
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {formatDateDDMMYYYY(item.fechaInicio)} al {formatDateDDMMYYYY(item.fechaFin)}
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            {item.totalSesiones} clases
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-indigo-600 text-sm">
                            {item.totalHoras.toFixed(1)} h
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {resumenPorAsignacion.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-100/70 font-bold border-t border-slate-200">
                        <td colSpan={3} className="py-2.5 px-3 text-slate-700 uppercase text-[11px]">
                          Total Acumulado del Docente
                        </td>
                        <td className="py-2.5 px-3 text-right text-indigo-700 text-sm">
                          {resumenPorAsignacion.reduce((acc, curr) => acc + curr.totalHoras, 0).toFixed(1)} h
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Tarjetas resumen de la asignación seleccionada */}
            {currentAsig && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Horas de la Asignación Activa</span>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-2">{metricas.totalHoras.toFixed(1)} h</p>
                    <p className="text-xs text-slate-400 mt-1">{currentAsig.materia}</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Sesiones de Clase</span>
                    <p className="text-3xl font-extrabold text-slate-800 mt-2">{metricas.totalSesiones}</p>
                    <p className="text-xs text-slate-400 mt-1">Días efectivos de cátedra</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Promedio Semanal</span>
                    <p className="text-3xl font-extrabold text-slate-800 mt-2">
                      {Object.keys(metricas.porSemana).length > 0
                        ? (metricas.totalHoras / Object.keys(metricas.porSemana).length).toFixed(1)
                        : 0}{' '}
                      h
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Horas / semana activa</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-sm text-slate-800 mb-3">Recuento de Horas por Mes ({currentAsig.materia})</h3>
                    <div className="divide-y divide-slate-100 text-xs">
                      {Object.entries(metricas.porMes).map(([mes, horas]) => (
                        <div key={mes} className="py-2.5 flex justify-between items-center">
                          <span className="font-medium text-slate-700">{mes}</span>
                          <span className="font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                            {horas.toFixed(1)} horas
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-sm text-slate-800 mb-3">Recuento de Horas por Semana ({currentAsig.materia})</h3>
                    <div className="divide-y divide-slate-100 text-xs max-h-[300px] overflow-y-auto">
                      {Object.entries(metricas.porSemana).map(([semana, horas]) => (
                        <div key={semana} className="py-2 flex justify-between items-center">
                          <span className="text-slate-600">Semana del {formatDateDDMMYYYY(semana)}</span>
                          <span className="font-semibold text-slate-900">{horas.toFixed(1)} h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        {/* TAB 4: AUDITORÍA DE CHOQUES */}
        {activeTab === 'choques' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Auditoría de Conflictos y Choques Horarios
              </h2>
              <p className="text-xs text-slate-500">
                Revisión cruzada entre todas las asignaciones activas de {docenteNombre || 'el docente'}.
              </p>
            </div>

            {cantidadChoquesTotales === 0 ? (
              <div className="text-center py-12 bg-emerald-50/50 rounded-lg border border-dashed border-emerald-200">
                <p className="text-emerald-800 font-bold text-base">¡Horarios limpios y compatibles!</p>
                <p className="text-xs text-emerald-600 mt-1">
                  No se identificaron traslapes de horario en ninguna fecha programada.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(mapaDeChoques).map(([sesionId, conflictos]) => {
                  const sesion = todasLasSesiones.find(s => s.id === sesionId);
                  if (!sesion) return null;

                  return (
                    <div key={sesionId} className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900 flex justify-between items-center">
                      <div>
                        <span className="font-bold block text-sm">
                          {formatDateDDMMYYYY(sesion.fecha)} ({sesion.nombreDia})
                        </span>
                        <span className="text-red-700">
                          {sesion.materia} asignada de {sesion.horaInicio} a {sesion.horaFin}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-red-800 block">Conflicto con:</span>
                        {conflictos.map((c, i) => (
                          <span key={i} className="block text-red-600">
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

      </div>

      {/* Modal para Ajustar Día Específico o Cancelar */}
      {modalExcepcion && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Ajuste para el {formatDateDDMMYYYY(modalExcepcion.fecha)} ({modalExcepcion.nombreDia})
            </h3>
            <p className="text-xs text-slate-500">
              Modifica las horas de este día sin alterar las demás semanas, o márcalo como cancelado.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Acción</label>
                <select
                  value={excepForm.tipo}
                  onChange={(e) => setExcepForm({ ...excepForm, tipo: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                >
                  <option value="MODIFICAR">Cambiar horario este día</option>
                  <option value="CANCELAR">Cancelar clase en este día</option>
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
                  placeholder="Ej. Reposición, ajuste, etc."
                  value={excepForm.motivo}
                  onChange={(e) => setExcepForm({ ...excepForm, motivo: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setModalExcepcion(null)}
                className="px-3 py-1.5 rounded text-xs text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={guardarExcepcion}
                className="px-4 py-1.5 rounded text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
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
import React from 'react';
import { DIAS_SEMANA } from '../../const/academico';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import {obtenerEtiquetaAsignacion} from '../../utils/sesionCalculations';

export default function Sidebar({
    docente,
    programas,
    asignaciones,
    asignacionSeleccionadaId,
    onSeleccionarAsignacion,
    onAbrirModalDocente,
    onAbrirCrearPrograma,
    onAbrirEditarPrograma,
    onEliminarPrograma,
    onAbrirCrearAsignacion,
    onAbrirEditarAsignacion,
    onEliminarAsignacion
}) {
    return (
        <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 overflow-hidden">
            {/* BLOQUE 1: INFORMACIÓN DEL DOCENTE */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-2.5 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        1. Docente
                    </span>
                    {docente.registrado && (
                        <button
                            type="button"
                            onClick={onAbrirModalDocente}
                            className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 underline cursor-pointer"
                        >
                            Editar
                        </button>
                    )}
                </div>

                {docente.registrado ? (
                    <div className="p-2.5 bg-white border border-slate-200 rounded space-y-1">
                        <p className="text-xs font-bold text-slate-900 leading-snug">
                            {docente.nombreCompleto}
                        </p>
                        <p className="text-[11px] text-slate-600 truncate" title={docente.profesion}>
                            {docente.profesion || 'Sin profesión registrada'}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {docente.tipoContratacion}
                            </span>
                            {docente.tipoContratacion !== 'TIEMPO INTEGRAL' && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    ${Number(docente.pagoPorHora || 0).toFixed(2)}/h
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onAbrirModalDocente}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Ingresar Datos del Docente
                    </button>
                )}
            </div>

            {/* BLOQUE 2 Y 3: PROGRAMAS Y SUS ASIGNACIONES */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        2. Programas y Asignaciones
                    </h2>
                    <p className="text-[11px] text-slate-500">
                        {programas.length} programa(s) · {asignaciones.length} asignación(es)
                    </p>
                </div>
                <button
                    type="button"
                    disabled={!docente.registrado}
                    onClick={onAbrirCrearPrograma}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded text-[11px] font-semibold cursor-pointer transition-colors"
                    title={docente.registrado ? 'Agregar nuevo programa' : 'Primero ingresa los datos del docente'}
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Programa
                </button>
            </div>

            {/* LISTA SCROLLABLE DE PROGRAMAS CON ASIGNACIONES ANIDADAS */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {!docente.registrado ? (
                    <div className="text-center py-8 px-3 border border-dashed border-slate-200 rounded bg-slate-50/50">
                        <p className="text-xs text-slate-500">
                            Registra primero la información del docente para habilitar la creación de programas y asignaciones.
                        </p>
                    </div>
                ) : programas.length === 0 ? (
                    <div className="text-center py-8 px-3 border border-dashed border-slate-200 rounded bg-slate-50/50 space-y-2">
                        <p className="text-xs text-slate-500">No hay programas registrados.</p>
                        <button
                            type="button"
                            onClick={onAbrirCrearPrograma}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded text-xs font-semibold cursor-pointer"
                        >
                            + Agregar Primer Programa
                        </button>
                    </div>
                ) : (
                    programas.map((prog) => {
                        const asigsDelProg = asignaciones.filter((a) => a.programaId === prog.id);

                        return (
                            <div key={prog.id} className="border border-slate-200 rounded bg-slate-50/40 overflow-hidden">
                                {/* Cabecera del Programa */}
                                <div className="p-2.5 bg-slate-100/80 border-b border-slate-200 space-y-1.5">
                                    <div className="flex items-start justify-between gap-1.5">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-slate-800 text-white">
                                                    {prog.tipoPrograma}
                                                </span>
                                                {prog.codigo && (
                                                    <span className="text-[10px] font-mono font-semibold text-slate-600">
                                                        {prog.codigo}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-slate-900 leading-snug mt-1" title={prog.nombre}>
                                                {prog.nombre}
                                            </p>
                                            {prog.edicionCohorte && (
                                                <p className="text-[11px] text-slate-500 truncate">{prog.edicionCohorte}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => onAbrirEditarPrograma(prog)}
                                                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded cursor-pointer"
                                                title="Editar programa"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onEliminarPrograma(prog)}
                                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded cursor-pointer"
                                                title="Eliminar programa"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => onAbrirCrearAsignacion(prog.id)}
                                        className="w-full inline-flex items-center justify-center gap-1 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-[11px] font-semibold cursor-pointer transition-colors"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Nueva Asignación
                                    </button>
                                </div>

                                {/* Lista de Asignaciones del Programa */}
                                <div className="p-2 space-y-2">
                                    {asigsDelProg.length === 0 ? (
                                        <p className="text-[11px] text-slate-400 text-center py-2 italic">
                                            Sin asignaciones en este programa.
                                        </p>
                                    ) : (
                                        asigsDelProg.map((asig) => {
                                            const esActiva = asig.id === asignacionSeleccionadaId;
                                            const diasActivos = DIAS_SEMANA.filter((d) => asig.dias?.[d.id]?.activo);

                                            return (
                                                <div
                                                    key={asig.id}
                                                    onClick={() => onSeleccionarAsignacion(asig.id)}
                                                    className={`p-2.5 rounded border text-left cursor-pointer transition-colors ${esActiva
                                                            ? 'border-slate-800 bg-white text-slate-900'
                                                            : 'border-slate-200 bg-white/70 hover:border-slate-300 text-slate-700'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                                                            {asig.cargo}
                                                        </span>
                                                        {asig.moduloCiclo && (
                                                            <span className="text-[10px] font-mono text-slate-500">
                                                                {asig.moduloCiclo}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="font-bold text-xs leading-snug line-clamp-2">
                                                        {obtenerEtiquetaAsignacion(asig, prog)}
                                                    </p>

                                                    <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
                                                        <span>
                                                            {formatDateDDMMYYYY(asig.fechaInicio)} al {formatDateDDMMYYYY(asig.fechaFin)}
                                                        </span>
                                                    </div>

                                                    <div className="mt-0.5 text-[11px] text-slate-500 font-mono">
                                                        {diasActivos.length > 0
                                                            ? diasActivos.map((d) => d.nombre.slice(0, 3)).join(', ')
                                                            : 'Sin días asignados'}
                                                    </div>

                                                    {esActiva && (
                                                        <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onAbrirEditarAsignacion(asig);
                                                                }}
                                                                className="px-2 py-1 text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold cursor-pointer"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onEliminarAsignacion(asig);
                                                                }}
                                                                className="px-2 py-1 text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded text-[11px] font-semibold cursor-pointer"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
}
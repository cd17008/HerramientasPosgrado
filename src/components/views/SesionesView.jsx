import React from 'react';
import { Calendar, List } from 'lucide-react';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';
import CalendarioGrid from './CalendarioGrid';
import SesionesList from './SesionesList';
import {obtenerEtiquetaAsignacion} from '../../utils/sesionCalculations';

export default function SesionesView({
    currentAsig,
    currentPrograma,
    metricasActuales,
    mesesCalendario,
    todasLasSesiones,
    mapaDeChoques,
    vistaSesiones,
    setVistaSesiones,
    onClickSesion
}) {
    if (!currentAsig) {
        return (
            <div className="bg-white border border-slate-200 rounded p-10 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                    No hay ninguna asignación seleccionada
                </p>
                <p className="text-xs text-slate-500">
                    Registra los datos del docente, agrega un programa y crea una asignación desde el panel izquierdo para visualizar su calendario.
                </p>
            </div>
        );
    }

    const sesionesAsignacion = todasLasSesiones.filter((s) => s.asignacionId === currentAsig.id);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Encabezado unificado: Asignación + Leyenda de colores + Selector Calendario/Lista */}
            <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {currentPrograma?.tipoPrograma || 'PROGRAMA'}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                            {currentPrograma?.nombre}
                        </span>
                        {currentPrograma?.edicionCohorte && (
                            <span className="text-xs text-slate-400">· {currentPrograma.edicionCohorte}</span>
                        )}
                    </div>

                    <h2 className="text-base font-bold text-slate-900 uppercase">
                        {obtenerEtiquetaAsignacion(currentAsig, currentPrograma)}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>
                            <strong>Vigencia:</strong> {formatDateDDMMYYYY(currentAsig.fechaInicio)} al{' '}
                            {formatDateDDMMYYYY(currentAsig.fechaFin)}
                        </span>
                        <span>·</span>
                        <span>
                            <strong>Sesiones:</strong> {metricasActuales.totalSesiones}
                        </span>
                        <span>·</span>
                        <span>
                            <strong>Total:</strong>{' '}
                            <span className="font-mono font-semibold text-slate-800">
                                {metricasActuales.totalHoras.toFixed(2)}h
                            </span>
                        </span>
                    </div>
                </div>

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

                    {/* Selector Calendario / Lista */}
                    <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-medium border border-slate-200">
                        <button
                            type="button"
                            onClick={() => setVistaSesiones('cuadricula')}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${vistaSesiones === 'cuadricula'
                                    ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <Calendar className="w-3.5 h-3.5" />
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
                            <List className="w-3.5 h-3.5" />
                            <span>Lista</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Cuerpo: Cuadrícula o Lista */}
            <div className="p-5">
                {vistaSesiones === 'cuadricula' ? (
                    <CalendarioGrid
                        mesesCalendario={mesesCalendario}
                        mapaDeChoques={mapaDeChoques}
                        onClickSesion={onClickSesion}
                    />
                ) : (
                    <SesionesList
                        sesiones={sesionesAsignacion}
                        mapaDeChoques={mapaDeChoques}
                        onClickSesion={onClickSesion}
                    />
                )}
            </div>
        </div>
    );
}
import React from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function HeaderBar({
    docente,
    cantidadChoques,
    onAbrirCargarRespaldo,
    onAbrirModalExportar,
    onLimpiarTodo
}) {
    return (
        <header className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        Escuela de Posgrado FIA-UES
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                        Ciclos 2026 / 2027
                    </span>
                </div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 mt-0.5">
                    Programación y Validación de Horarios Docentes
                </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
                <button
                    type="button"
                    onClick={onAbrirCargarRespaldo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-xs font-semibold cursor-pointer transition-colors"
                    title="Importar un archivo JSON previamente descargado"
                >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    Cargar Respaldo
                </button>

                <button
                    type="button"
                    onClick={onAbrirModalExportar}
                    disabled={!docente.registrado}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                    title={
                        docente.registrado
                            ? 'Seleccionar y descargar documentos (Excel, Word, JSON)'
                            : 'Primero ingresa los datos del docente'
                    }
                >
                    <Download className="w-3.5 h-3.5" />
                    Descargar Documentos
                </button>

                <button
                    type="button"
                    onClick={onLimpiarTodo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-200 rounded text-xs font-semibold cursor-pointer transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                    Limpiar Todo
                </button>

                <div className="border-l border-slate-200 pl-3">
                    {cantidadChoques > 0 ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5">
                            <span>{cantidadChoques} Choque(s)</span>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1">
                            <span>Sin choques</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
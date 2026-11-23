import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileJson, X } from 'lucide-react';

const OPCIONES_DOCUMENTOS = [
    {
        key: 'excel',
        titulo: 'Expediente Excel (.xlsx)',
        descripcion: 'Incluye Hoja 1 (Requerimiento de Contratación) y Hoja 2 (Detalle de Horarios).',
        requiereAsignaciones: true,
        icon: FileSpreadsheet,
        colorIcon: 'text-emerald-600'
    },
    {
        key: 'correoWord',
        titulo: 'Correo Institucional (.docx)',
        descripcion: 'Plantilla de correo con el resumen del requerimiento lista para enviar.',
        requiereAsignaciones: true,
        icon: FileText,
        colorIcon: 'text-blue-600'
    },
    {
        key: 'informeWord',
        titulo: 'Informe de Actividades (.docx)',
        descripcion: 'Formato institucional de informe de actividades con Anexo 1 de horarios.',
        requiereAsignaciones: true,
        icon: FileText,
        colorIcon: 'text-indigo-600'
    },
    {
        key: 'respaldoJson',
        titulo: 'Respaldo de Sesión (.json)',
        descripcion: 'Archivo portátil para volver a cargar y editar esta programación más adelante.',
        requiereAsignaciones: false,
        icon: FileJson,
        colorIcon: 'text-amber-600'
    }
];

export default function ModalExportarDocumentos({
    cantidadSeleccionadas,
    totalAsignaciones,
    onConfirmarDescarga,
    onCerrar
}) {
    const [seleccion, setSeleccion] = useState({
        excel: true,
        correoWord: true,
        informeWord: false,
        respaldoJson: true
    });
    const [descargando, setDescargando] = useState(false);

    const toggleOpcion = (key) => {
        setSeleccion((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const hayAlgoSeleccionado = Object.values(seleccion).some(Boolean);
    const requiereAsigs =
        (seleccion.excel || seleccion.correoWord || seleccion.informeWord) &&
        cantidadSeleccionadas === 0;

    const handleDescargar = async () => {
        if (!hayAlgoSeleccionado || requiereAsigs) return;
        setDescargando(true);
        try {
            await onConfirmarDescarga(seleccion);
        } finally {
            setDescargando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-lg w-full max-w-lg overflow-hidden">
                {/* Cabecera */}
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Descargar Documentos</h3>
                        <p className="text-[11px] text-slate-500">
                            Selecciona los archivos que deseas generar con la sesión actual.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Cuerpo */}
                <div className="p-5 space-y-3 text-xs">
                    <div className="px-3 py-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                        <span>Asignaciones marcadas en Resumen de Horas:</span>
                        <span className="font-bold text-slate-900 font-mono">
                            {cantidadSeleccionadas} de {totalAsignaciones}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {OPCIONES_DOCUMENTOS.map((op) => {
                            const Icono = op.icon;
                            const checked = seleccion[op.key];
                            const deshabilitado = op.requiereAsignaciones && cantidadSeleccionadas === 0;

                            return (
                                <label
                                    key={op.key}
                                    className={`flex items-start gap-3 p-3 rounded border transition-colors ${deshabilitado
                                            ? 'border-slate-200 bg-slate-50/70 opacity-60 cursor-not-allowed'
                                            : checked
                                                ? 'border-slate-800 bg-slate-50 cursor-pointer'
                                                : 'border-slate-200 bg-white hover:bg-slate-50 cursor-pointer'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked && !deshabilitado}
                                        disabled={deshabilitado}
                                        onChange={() => toggleOpcion(op.key)}
                                        className="mt-0.5 rounded border-slate-300 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <Icono className={`w-4 h-4 mt-0.5 shrink-0 ${op.colorIcon}`} />
                                    <div className="min-w-0">
                                        <span className="block font-bold text-slate-900">{op.titulo}</span>
                                        <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">
                                            {op.descripcion}
                                        </span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    {requiereAsigs && (
                        <div className="p-2.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-[11px]">
                            Para descargar Excel o Word debes marcar al menos una asignación en la pestaña{' '}
                            <strong>Resumen de Horas</strong>.
                        </div>
                    )}
                </div>

                {/* Pie */}
                <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="px-3.5 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        disabled={!hayAlgoSeleccionado || requiereAsigs || descargando}
                        onClick={handleDescargar}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white cursor-pointer transition-colors"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>{descargando ? 'Generando...' : 'Descargar Seleccionados'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import { formatDateDDMMYYYY, timeToMinutes } from '../../utils/dateUtils';

export default function ModalExcepcion({ sesion, configOriginalDia, onGuardar, onCerrar }) {
    const [form, setForm] = useState({
        tipo: sesion.excepcion?.tipo || 'MODIFICAR',
        horaInicio: sesion.horaInicio || configOriginalDia?.horaInicio || '18:00',
        horaFin: sesion.horaFin || configOriginalDia?.horaFin || '21:00',
        motivo: sesion.excepcion?.motivo || ''
    });

    const rangoHorarioInvalido =
        form.tipo === 'MODIFICAR' &&
        (!form.horaInicio ||
            !form.horaFin ||
            timeToMinutes(form.horaFin) <= timeToMinutes(form.horaInicio));

    const coincideConHorarioOriginal =
        form.tipo === 'MODIFICAR' &&
        !rangoHorarioInvalido &&
        Boolean(configOriginalDia?.activo) &&
        form.horaInicio === configOriginalDia.horaInicio &&
        form.horaFin === configOriginalDia.horaFin;

    const handleAplicar = () => {
        if (rangoHorarioInvalido) return;
        if (form.tipo === 'RESET' || coincideConHorarioOriginal) {
            onGuardar(sesion.fecha, null);
        } else {
            onGuardar(sesion.fecha, {
                tipo: form.tipo,
                horaInicio: form.horaInicio,
                horaFin: form.horaFin,
                motivo: form.motivo.trim() || 'Ajuste operativo'
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded border border-slate-200 max-w-md w-full p-5 space-y-4">
                <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                        Ajuste para el {formatDateDDMMYYYY(sesion.fecha)} ({sesion.nombreDia})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Modifica las horas de este día sin alterar las demás semanas, o márcalo como cancelado.
                    </p>
                </div>

                <div className="space-y-3 text-xs">
                    <div className="space-y-2">
                        {[
                            {
                                valor: 'MODIFICAR',
                                titulo: 'Cambiar horario de este día',
                                descripcion: 'Define una hora de inicio y fin especial solo para esta fecha.'
                            },
                            {
                                valor: 'CANCELAR',
                                titulo: 'Cancelar la asignación este día',
                                descripcion: 'Suspende la sesión y no suma horas en el cálculo.'
                            },
                            {
                                valor: 'RESET',
                                titulo: 'Mantener la asignación original',
                                descripcion: 'Conserva o restablece el horario semanal base programado.'
                            }
                        ].map((opcion) => {
                            const seleccionado = form.tipo === opcion.valor;
                            return (
                                <label
                                    key={opcion.valor}
                                    className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition ${seleccionado
                                            ? 'border-slate-800 bg-slate-50 text-slate-900'
                                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="tipoExcepcion"
                                        value={opcion.valor}
                                        checked={seleccionado}
                                        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                                        className="mt-0.5 cursor-pointer"
                                    />
                                    <div>
                                        <span className="block font-semibold">{opcion.titulo}</span>
                                        <span className="block text-[11px] text-slate-500 mt-0.5">
                                            {opcion.descripcion}
                                        </span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    {form.tipo === 'MODIFICAR' && (
                        <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-slate-600 mb-1 font-semibold">Hora Inicio</label>
                                    <input
                                        type="time"
                                        value={form.horaInicio}
                                        onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                                        className={`w-full border rounded p-1.5 font-mono ${rangoHorarioInvalido ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-600 mb-1 font-semibold">Hora Fin</label>
                                    <input
                                        type="time"
                                        value={form.horaFin}
                                        onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                                        className={`w-full border rounded p-1.5 font-mono ${rangoHorarioInvalido ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                                            }`}
                                    />
                                </div>
                            </div>

                            {rangoHorarioInvalido && (
                                <div
                                    role="alert"
                                    className="p-2.5 rounded bg-red-50 border border-red-300 text-red-800 text-[11px] leading-snug"
                                >
                                    <strong>Horario inválido:</strong> La hora de fin debe ser posterior a la hora de inicio.
                                </div>
                            )}

                            {coincideConHorarioOriginal && (
                                <div
                                    role="status"
                                    className="p-2.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-[11px] leading-snug"
                                >
                                    <strong>Aviso:</strong> Este horario coincide con el horario semanal original (
                                    {configOriginalDia.horaInicio} - {configOriginalDia.horaFin}). Se guardará como sesión regular.
                                </div>
                            )}
                        </div>
                    )}

                    {form.tipo !== 'RESET' && !coincideConHorarioOriginal && (
                        <div>
                            <label className="block text-slate-600 mb-1 font-semibold">
                                Motivo / Justificación
                            </label>
                            <input
                                type="text"
                                placeholder="Ej. Reposición, ajuste institucional"
                                value={form.motivo}
                                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                                className="w-full border border-slate-300 rounded p-2"
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="px-3 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer"
                    >
                        Cerrar
                    </button>
                    <button
                        type="button"
                        onClick={handleAplicar}
                        disabled={rangoHorarioInvalido}
                        className={`px-4 py-1.5 rounded text-xs font-semibold transition ${rangoHorarioInvalido
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                            }`}
                    >
                        Aplicar Ajuste
                    </button>
                </div>
            </div>
        </div>
    );
}
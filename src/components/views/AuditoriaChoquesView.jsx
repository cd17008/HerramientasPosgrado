import React from 'react';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

export default function AuditoriaChoquesView({ todasLasSesiones, mapaDeChoques }) {
    const sesionesConChoque = todasLasSesiones.filter((s) => Boolean(mapaDeChoques[s.id]));

    return (
        <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-900">
                    Auditoría de Choques de Horario
                </h2>
                <p className="text-xs text-slate-500">
                    Valida traslapes entre todas las asignaciones activas del docente sin importar el programa.
                </p>
            </div>

            {sesionesConChoque.length === 0 ? (
                <div className="p-10 text-center space-y-1.5">
                    <p className="text-sm font-semibold text-emerald-700">
                        No se detectaron choques de horario
                    </p>
                    <p className="text-xs text-slate-500">
                        Todas las sesiones activas están libres de traslapes.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-red-50/70 border-b border-red-200 text-red-900">
                                <th className="py-2.5 px-3 font-semibold">Fecha</th>
                                <th className="py-2.5 px-3 font-semibold">Asignación</th>
                                <th className="py-2.5 px-3 font-semibold">Horario</th>
                                <th className="py-2.5 px-3 font-semibold">Traslape con</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {sesionesConChoque.map((s) => (
                                <tr key={s.id} className="hover:bg-red-50/30">
                                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                                        {formatDateDDMMYYYY(s.fecha)} ({s.nombreDia})
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <p className="font-bold text-slate-900">{s.materia}</p>
                                        <p className="text-[11px] text-slate-500">{s.programaNombre}</p>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-red-700 font-semibold">
                                        {s.horaInicio} - {s.horaFin}
                                    </td>
                                    <td className="py-2.5 px-3 space-y-1">
                                        {mapaDeChoques[s.id].map((c, idx) => (
                                            <div key={idx} className="text-red-700">
                                                <strong>{c.contra}</strong>{' '}
                                                <span className="font-mono text-[11px]">({c.rango})</span>
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
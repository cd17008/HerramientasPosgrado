import React, { useState, useMemo } from 'react';
import { DIAS_SEMANA } from '../../const/academico';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

export default function SesionesList({ sesiones, mapaDeChoques, onClickSesion }) {
    const [diasFiltrados, setDiasFiltrados] = useState([]);

    const toggleDia = (diaId) => {
        setDiasFiltrados((prev) =>
            prev.includes(diaId) ? prev.filter((id) => id !== diaId) : [...prev, diaId]
        );
    };

    const sesionesVisibles = useMemo(() => {
        return sesiones.filter((s) => {
            const relevante = s.activa || s.esAsueto || s.estado === 'CANCELADO';
            if (!relevante) return false;
            if (diasFiltrados.length > 0 && !diasFiltrados.includes(s.diaSemanaId)) return false;
            return true;
        });
    }, [sesiones, diasFiltrados]);

    return (
        <div className="space-y-4">
            {/* Barra de filtro por día */}
            <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="font-semibold text-slate-700 mr-1">Filtrar días:</span>
                {DIAS_SEMANA.map((d) => {
                    const activo = diasFiltrados.includes(d.id);
                    return (
                        <button
                            key={d.id}
                            type="button"
                            onClick={() => toggleDia(d.id)}
                            className={`px-2.5 py-1 rounded text-xs font-medium border cursor-pointer transition-colors ${activo
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                }`}
                        >
                            {d.nombre}
                        </button>
                    );
                })}
                {diasFiltrados.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setDiasFiltrados([])}
                        className="text-[11px] text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
                    >
                        Ver todos
                    </button>
                )}
            </div>

            {/* Tabla de sesiones */}
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase">
                        <tr>
                            <th className="py-2.5 px-3 font-semibold">Fecha</th>
                            <th className="py-2.5 px-3 font-semibold">Día</th>
                            <th className="py-2.5 px-3 font-semibold">Horario Aplicado</th>
                            <th className="py-2.5 px-3 font-semibold">N° Horas</th>
                            <th className="py-2.5 px-3 font-semibold">Estado / Observación</th>
                            <th className="py-2.5 px-3 font-semibold text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sesionesVisibles.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                                    No hay sesiones que coincidan con el filtro seleccionado.
                                </td>
                            </tr>
                        ) : (
                            sesionesVisibles.map((s) => {
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
                                                    Choque con: {conflicto.map((c) => `${c.contra} (${c.rango})`).join(', ')}
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
                                                    onClick={() => onClickSesion(s)}
                                                    className="px-2.5 py-1 text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded text-xs font-medium cursor-pointer"
                                                >
                                                    {s.excepcion ? 'Editar Ajuste' : 'Cambiar Día'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
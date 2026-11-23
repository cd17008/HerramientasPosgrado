import React from 'react';

const CABECERAS_DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function CalendarioGrid({ mesesCalendario, mapaDeChoques, onClickSesion }) {
    if (!mesesCalendario.length) {
        return (
            <p className="text-xs text-slate-500 text-center py-8">
                No hay fechas dentro del rango configurado.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {mesesCalendario.map((mes) => (
                <div
                    key={mes.mesKey}
                    className="border border-slate-200 rounded-lg overflow-hidden bg-white"
                >
                    {/* Título del Mes */}
                    <div className="bg-slate-800 text-white px-4 py-2 text-sm font-semibold">
                        {mes.titulo}
                    </div>

                    {/* Cabecera Lunes a Domingo */}
                    <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center text-[11px] font-bold text-slate-600 uppercase">
                        {CABECERAS_DIAS.map((dia) => (
                            <div
                                key={dia}
                                className="py-1.5 border-r last:border-r-0 border-slate-200"
                            >
                                {dia}
                            </div>
                        ))}
                    </div>

                    {/* Celdas de Días */}
                    <div className="grid grid-cols-7 bg-slate-200 gap-px">
                        {mes.celdas.map((celda, idx) => {
                            if (!celda) {
                                return (
                                    <div
                                        key={`empty-${mes.mesKey}-${idx}`}
                                        className="bg-slate-200/70 min-h-[84px]"
                                    />
                                );
                            }

                            const { dia, sesion } = celda;
                            const fueraDePeriodo = !sesion;
                            const conflicto = sesion ? mapaDeChoques[sesion.id] : null;
                            const esInteractivo = !fueraDePeriodo && sesion && !sesion.esAsueto;

                            let cardStyle = fueraDePeriodo
                                ? 'bg-slate-200/75 text-slate-400 select-none'
                                : 'bg-white text-slate-500';

                            if (!fueraDePeriodo && sesion) {
                                if (conflicto)
                                    cardStyle = 'bg-red-50 text-red-900 hover:bg-red-100';
                                else if (sesion.esAsueto)
                                    cardStyle = 'bg-blue-50/70 text-blue-800';
                                else if (sesion.estado === 'MODIFICADO')
                                    cardStyle = 'bg-amber-50 text-amber-900 hover:bg-amber-100';
                                else if (sesion.estado === 'CANCELADO')
                                    cardStyle = 'bg-slate-100 text-slate-400 hover:bg-slate-200/70';
                                else if (sesion.activa)
                                    cardStyle = 'bg-emerald-50/60 text-slate-800 hover:bg-emerald-100/70';
                            }

                            return (
                                <div
                                    key={celda.fecha}
                                    onClick={() => esInteractivo && onClickSesion(sesion)}
                                    className={`min-h-[84px] p-1.5 flex flex-col justify-between transition ${cardStyle} ${esInteractivo ? 'cursor-pointer' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`text-xs font-bold ${fueraDePeriodo
                                                    ? 'text-slate-400/90'
                                                    : sesion?.activa
                                                        ? 'text-slate-800'
                                                        : 'text-slate-600'
                                                }`}
                                        >
                                            {dia}
                                        </span>
                                        {!fueraDePeriodo && sesion?.activa && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-indigo-700">
                                                {sesion.duracionHoras}h
                                            </span>
                                        )}
                                    </div>

                                    {!fueraDePeriodo && sesion && (
                                        <div className="mt-1 space-y-0.5 text-[10px] leading-tight">
                                            {conflicto ? (
                                                <span
                                                    className="block font-bold text-red-700 truncate"
                                                    title={conflicto.map((c) => c.contra).join(', ')}
                                                >
                                                    Choque ({sesion.horaInicio}-{sesion.horaFin})
                                                </span>
                                            ) : sesion.esAsueto ? (
                                                <span
                                                    className="block font-medium text-blue-700 line-clamp-2"
                                                    title={sesion.asuetoNombre}
                                                >
                                                    {sesion.asuetoNombre}
                                                </span>
                                            ) : sesion.estado === 'CANCELADO' ? (
                                                <span className="block italic text-slate-500">Cancelada</span>
                                            ) : sesion.activa ? (
                                                <>
                                                    <span className="block font-mono font-semibold text-slate-700">
                                                        {sesion.horaInicio} - {sesion.horaFin}
                                                    </span>
                                                    {sesion.estado === 'MODIFICADO' && (
                                                        <span className="block text-[9px] font-semibold text-amber-700 truncate">
                                                            Ajustado
                                                        </span>
                                                    )}
                                                </>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
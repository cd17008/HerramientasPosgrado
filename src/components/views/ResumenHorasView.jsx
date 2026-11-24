import React from 'react';
import { formatDateDDMMYYYY } from '../../utils/dateUtils';

const formatearMesAnio = (mesKey) => {
    if (!mesKey) return '';
    const [year, month] = mesKey.split('-').map(Number);
    const fecha = new Date(year, month - 1, 1);
    const texto = fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
};

export default function ResumenHorasView({
    resumenAsignaciones,
    seleccionadasResumen,
    setSeleccionadasResumen,
    currentAsig,
    metricasActuales,
    docente
}) {
    const esTiempoIntegral = docente?.tipoContratacion === 'TIEMPO INTEGRAL';

    const todasSeleccionadas =
        resumenAsignaciones.length > 0 &&
        seleccionadasResumen.length === resumenAsignaciones.length;

    const toggleTodas = () => {
        if (todasSeleccionadas) {
            setSeleccionadasResumen([]);
        } else {
            setSeleccionadasResumen(resumenAsignaciones.map((r) => r.id));
        }
    };

    const toggleUna = (id) => {
        setSeleccionadasResumen((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const filasSeleccionadas = resumenAsignaciones.filter((r) =>
        seleccionadasResumen.includes(r.id)
    );
    const totalHoras = filasSeleccionadas.reduce((acc, r) => acc + r.totalHoras, 0);
    const totalHorasSobrecupo = filasSeleccionadas.reduce(
        (acc, r) => acc + r.horasConSobrecupo,
        0
    );

    const mesesOrdenados = Object.entries(metricasActuales?.porMes || {}).sort(([a], [b]) =>
        a.localeCompare(b)
    );
    const semanasOrdenadas = Object.entries(metricasActuales?.porSemana || {}).sort(([a], [b]) =>
        a.localeCompare(b)
    );
    const promedioSemanal =
        semanasOrdenadas.length > 0
            ? (metricasActuales.totalHoras / semanasOrdenadas.length).toFixed(1)
            : '0.0';

    const resumenActivo = resumenAsignaciones.find((r) => r.id === currentAsig?.id);
    const tituloActivo = resumenActivo?.tituloVisible || currentAsig?.materia || '';

    const mapaDetalleIntegralMes = new Map(
        (resumenActivo?.detalleMesesIntegral || []).map((d) => [d.mes, d])
    );

    const totalSesiones = filasSeleccionadas.reduce((acc, r) => acc + r.totalSesiones, 0);
    const totalHorasAsignadas = filasSeleccionadas.reduce(
        (acc, r) => acc + (Number(r.horasConSobrecupo ?? r.totalHoras) || 0),
        0
    );
    const totalHorasPAE = filasSeleccionadas.reduce(
        (acc, r) => acc + (Number(r.horasPAE ?? r.totalHoras) || 0),
        0
    );
    const totalMonto = filasSeleccionadas.reduce(
        (acc, r) => acc + (Number(r.subtotal) || 0),
        0
    );

    return (
        <div className="space-y-5">
            {/* 1. TABLA CONSOLIDADA POR ASIGNACIÓN */}
            <div className="bg-white border border-slate-200 rounded overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                    <h2 className="text-sm font-bold text-slate-900">
                        Resumen Consolidado de Horas por Asignación
                    </h2>
                    <p className="text-xs text-slate-500">
                        Marca las asignaciones que deseas incluir al usar el botón &laquo;Descargar Documentos&raquo; del encabezado.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                <th className="py-2.5 px-3 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={todasSeleccionadas}
                                        onChange={toggleTodas}
                                        className="rounded border-slate-300 cursor-pointer"
                                    />
                                </th>
                                <th className="py-2.5 px-3 font-semibold">Programa / Asignatura</th>
                                <th className="py-2.5 px-3 font-semibold">Cargo</th>
                                <th className="py-2.5 px-3 font-semibold">Fecha Inicio</th>
                                <th className="py-2.5 px-3 font-semibold">Fecha Fin</th>
                                <th className="py-2.5 px-3 font-semibold text-right">Sesiones</th>
                                <th className="py-2.5 px-3 font-semibold text-right">Horas Asignadas</th>
                                <th className="py-2.5 px-3 font-semibold text-right">Factor</th>
                                <th className="py-2.5 px-3 font-semibold text-right">Horas PAE</th>
                                <th className="py-2.5 px-3 font-semibold text-right">Monto ($)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {resumenAsignaciones.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-8 text-center text-slate-500">
                                        No hay asignaciones registradas todavía.
                                    </td>
                                </tr>
                            ) : (
                                resumenAsignaciones.map((item) => {
                                    const checked = seleccionadasResumen.includes(item.id);
                                    const esActiva = item.id === currentAsig?.id;

                                    return (
                                        <tr
                                            key={item.id}
                                            className={
                                                checked
                                                    ? esActiva
                                                        ? 'bg-indigo-50/40 hover:bg-indigo-50/60'
                                                        : 'bg-white hover:bg-slate-50'
                                                    : 'bg-slate-50/40 text-slate-400'
                                            }
                                        >
                                            <td className="py-2.5 px-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleUna(item.id)}
                                                    className="rounded border-slate-300 cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-900">
                                                        {item.tituloVisible || item.materia}
                                                    </p>
                                                    {esActiva && (
                                                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                                                            Activa
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500">{item.programaNombre}</p>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-700">{item.cargo}</td>
                                            <td className="py-2.5 px-3 font-mono">
                                                {formatDateDDMMYYYY(item.fechaInicio)}
                                            </td>
                                            <td className="py-2.5 px-3 font-mono">
                                                {formatDateDDMMYYYY(item.fechaFin)}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono">{item.totalSesiones}</td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                                <div>
                                                    {(Number(item.horasConSobrecupo ?? item.totalHoras) || 0).toFixed(2)}h
                                                </div>
                                                {item.horasSobrecupo > 0 && item.factorSobrecupo > 1 && (
                                                    <div className="text-[10px] font-normal text-slate-500">
                                                        Con sobrecupo
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono">
                                                {item.factorSobrecupo.toFixed(2)}x
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-indigo-700">
                                                {(Number(item.horasPAE ?? item.totalHoras) || 0).toFixed(2)}h
                                            </td>
                                            <td
                                                className={`py-2.5 px-3 text-right font-mono font-bold ${checked ? 'text-emerald-700' : 'text-slate-400'
                                                    }`}
                                            >
                                                <div>${(Number(item.subtotal) || 0).toFixed(2)}</div>
                                                {esTiempoIntegral && (
                                                    <div className="text-[10px] font-normal text-slate-500">
                                                        {item.mesesCompletos} / {item.totalMesesEvaluados} meses
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        {resumenAsignaciones.length > 0 && (
                            <tfoot>
                                <tr className="bg-slate-100 border-t border-slate-200 font-bold text-slate-900">
                                    <td colSpan={5} className="py-2.5 px-3 text-right">
                                        Total Seleccionado ({filasSeleccionadas.length}):
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono">{totalSesiones}</td>
                                    <td className="py-2.5 px-3 text-right font-mono">
                                        {totalHorasAsignadas.toFixed(2)}h
                                    </td>
                                    <td className="py-2.5 px-3 text-right">—</td>
                                    <td className="py-2.5 px-3 text-right font-mono text-indigo-700">
                                        {totalHorasPAE.toFixed(2)}h
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                                        ${totalMonto.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* 2. RESUMEN DETALLADO DE LA ASIGNACIÓN ACTIVA (TARJETAS + MES + SEMANA) */}
            {currentAsig && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded border border-slate-200">
                            <span className="text-[11px] text-slate-500 uppercase font-semibold">
                                Horas de la Asignación Activa
                            </span>
                            <p className="text-2xl font-extrabold text-indigo-600 mt-1 font-mono">
                                {metricasActuales.totalHoras.toFixed(1)} h
                            </p>
                            <p className="text-xs text-slate-400 mt-1 truncate" title={tituloActivo}>
                                {tituloActivo}
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded border border-slate-200">
                            <span className="text-[11px] text-slate-500 uppercase font-semibold">
                                Sesiones de Clase
                            </span>
                            <p className="text-2xl font-extrabold text-slate-800 mt-1 font-mono">
                                {metricasActuales.totalSesiones}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Días efectivos de cátedra</p>
                        </div>

                        <div className="bg-white p-4 rounded border border-slate-200">
                            <span className="text-[11px] text-slate-500 uppercase font-semibold">
                                Promedio Semanal
                            </span>
                            <p className="text-2xl font-extrabold text-slate-800 mt-1 font-mono">
                                {promedioSemanal} h
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Horas / semana activa</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Recuento de Horas por Mes */}
                        <div className="bg-white p-4 rounded border border-slate-200">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 pb-2.5 border-b border-slate-200">
                                Recuento de Horas por Mes ({tituloActivo})
                            </h3>
                            <div className="divide-y divide-slate-100 text-xs mt-1">
                                {mesesOrdenados.length === 0 ? (
                                    <p className="py-6 text-center text-slate-400 italic">
                                        Sin horas registradas.
                                    </p>
                                ) : (
                                    mesesOrdenados.map(([mes, horas]) => {
                                        const infoIntegral = esTiempoIntegral
                                            ? mapaDetalleIntegralMes.get(mes)
                                            : null;

                                        return (
                                            <div key={mes} className="py-2.5 flex justify-between items-center gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-slate-700">
                                                        {formatearMesAnio(mes)}
                                                    </span>
                                                    {infoIntegral &&
                                                        (infoIntegral.esMesCompleto ? (
                                                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                                                                Mes completo ({infoIntegral.cumpleMensual ? '≥20h/mes' : '≥5h/sem'})
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                                                                Incompleto (&lt;20h/mes y &lt;5h/sem)
                                                            </span>
                                                        ))}
                                                </div>
                                                <span className="font-bold font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded shrink-0">
                                                    {horas.toFixed(1)} horas
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Recuento de Horas por Semana */}
                        <div className="bg-white p-4 rounded border border-slate-200">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 pb-2.5 border-b border-slate-200">
                                Recuento de Horas por Semana ({tituloActivo})
                            </h3>
                            <div className="divide-y divide-slate-100 text-xs max-h-[300px] overflow-y-auto mt-1">
                                {semanasOrdenadas.length === 0 ? (
                                    <p className="py-6 text-center text-slate-400 italic">
                                        Sin horas registradas.
                                    </p>
                                ) : (
                                    semanasOrdenadas.map(([semana, horas]) => (
                                        <div key={semana} className="py-2 flex justify-between items-center pr-1">
                                            <span className="text-slate-600">
                                                Semana del {formatDateDDMMYYYY(semana)}
                                            </span>
                                            <span className="font-semibold font-mono text-slate-900">
                                                {horas.toFixed(1)} h
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
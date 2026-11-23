import React, { useState, useMemo } from 'react';
import { DIAS_SEMANA } from '../../const/academico';
import { getCatalogos, getAsignaturasPorPrograma } from '../../services/catalogService';

const INPUT_CLASS =
    'w-full border border-slate-300 rounded p-2 text-xs bg-white text-slate-900 focus:ring-1 focus:ring-slate-800 focus:outline-none';

const crearDiasPorDefecto = () => {
    const dias = {};
    DIAS_SEMANA.forEach((d) => {
        dias[d.id] = { activo: false, horaInicio: '18:00', horaFin: '21:00' };
    });
    return dias;
};

const normalizarTexto = (texto = '') =>
    String(texto)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase();

const esProgramaEC = (prog) => {
    if (!prog) return true;
    if (prog.unidad) return normalizarTexto(prog.unidad) === 'EC';
    const tipo = normalizarTexto(prog.tipoPrograma || '');
    return tipo !== 'MAESTRIA' && tipo !== 'DOCTORADO';
};

const filtrarCargosPorUnidad = (cargos = [], esEC) => {
    if (!esEC) return cargos;
    return cargos.filter((c) => {
        const norm = normalizarTexto(c);
        return !norm.includes('ASESOR') && !norm.includes('TESIS');
    });
};

export default function ModalAsignacion({
    modo,
    datosIniciales,
    programas,
    programaIdPreseleccionado,
    onGuardar,
    onCerrar
}) {
    const catalogos = getCatalogos();

    const programaIdInicial =
        datosIniciales?.programaId || programaIdPreseleccionado || programas[0]?.id || '';
    const programaInicial = programas.find((p) => p.id === programaIdInicial) || null;
    const esECInicial = esProgramaEC(programaInicial);

    const moduloCompletoInicial = Boolean(
        esECInicial &&
        (datosIniciales?.moduloCompleto ||
            normalizarTexto(datosIniciales?.materia) === 'MODULO COMPLETO')
    );

    // Al editar, retiramos el prefijo "PART. " para mostrar el módulo limpio y evitar duplicarlo al guardar
    const moduloInicialLimpio = (datosIniciales?.moduloCiclo || '').replace(/^PART\.\s*/i, '');
    const cargosIniciales = filtrarCargosPorUnidad(catalogos.cargos, esECInicial);
    const cargoInicial = cargosIniciales.includes(datosIniciales?.cargo)
        ? datosIniciales.cargo
        : cargosIniciales[0] || 'DOCENTE';

    const [form, setForm] = useState({
        id: datosIniciales?.id || null,
        programaId: programaIdInicial,
        cargo: cargoInicial,
        materia: moduloCompletoInicial ? '' : datosIniciales?.materia || '',
        moduloCiclo: moduloInicialLimpio,
        moduloCompleto: moduloCompletoInicial,
        fechaInicio: datosIniciales?.fechaInicio || '',
        fechaFin: datosIniciales?.fechaFin || '',
        dias: datosIniciales?.dias
            ? JSON.parse(JSON.stringify(datosIniciales.dias))
            : crearDiasPorDefecto()
    });

    const programaActual = useMemo(
        () => programas.find((p) => p.id === form.programaId) || null,
        [programas, form.programaId]
    );

    const esEC = useMemo(() => esProgramaEC(programaActual), [programaActual]);

    const cargosDisponibles = useMemo(
        () => filtrarCargosPorUnidad(catalogos.cargos, esEC),
        [catalogos.cargos, esEC]
    );

    const asignaturasSugeridas = useMemo(
        () => getAsignaturasPorPrograma(programaActual?.codigo || ''),
        [programaActual]
    );

    const handleProgramaChange = (nuevoProgramaId) => {
        const nuevoProg = programas.find((p) => p.id === nuevoProgramaId) || null;
        const nuevoEsEC = esProgramaEC(nuevoProg);
        const nuevosCargos = filtrarCargosPorUnidad(catalogos.cargos, nuevoEsEC);

        setForm((prev) => ({
            ...prev,
            programaId: nuevoProgramaId,
            cargo: nuevosCargos.includes(prev.cargo) ? prev.cargo : nuevosCargos[0] || 'DOCENTE',
            moduloCompleto: nuevoEsEC ? prev.moduloCompleto : false
        }));
    };

    const toggleDia = (diaId) => {
        setForm((prev) => ({
            ...prev,
            dias: {
                ...prev.dias,
                [diaId]: {
                    ...prev.dias[diaId],
                    activo: !prev.dias[diaId]?.activo
                }
            }
        }));
    };

    const updateHoraDia = (diaId, campo, valor) => {
        setForm((prev) => ({
            ...prev,
            dias: {
                ...prev.dias,
                [diaId]: {
                    ...prev.dias[diaId],
                    [campo]: valor
                }
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const ocultarAsignatura = esEC && form.moduloCompleto;

        if (!form.programaId || !form.fechaInicio || !form.fechaFin) return;
        if (!ocultarAsignatura && !form.materia.trim()) return;

        const moduloLimpio = form.moduloCiclo.trim().replace(/^PART\.\s*/i, '');
        let materiaFinal = form.materia.trim();
        let moduloFinal = moduloLimpio;

        if (esEC) {
            if (form.moduloCompleto) {
                materiaFinal = 'MODULO COMPLETO';
            } else if (materiaFinal && moduloLimpio) {
                moduloFinal = `PART. ${moduloLimpio}`;
            }
        }

        onGuardar({
            ...form,
            materia: materiaFinal,
            moduloCiclo: moduloFinal,
            moduloCompleto: esEC ? form.moduloCompleto : false
        });
    };

    const mostrarCampoAsignatura = !(esEC && form.moduloCompleto);
    const moduloLimpioVista = form.moduloCiclo.trim().replace(/^PART\.\s*/i, '');

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            {modo === 'editar' ? 'Editar Asignación' : 'Paso 3: Nueva Asignación'}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            Define el cargo, asignatura, vigencia y el horario semanal recurrente.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="md:col-span-2">
                            <label className="block font-semibold text-slate-700 mb-1">Programa *</label>
                            <select
                                required
                                value={form.programaId}
                                onChange={(e) => handleProgramaChange(e.target.value)}
                                className={INPUT_CLASS}
                            >
                                {programas.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.codigo ? `[${p.codigo}] ` : ''}
                                        {p.nombre} {p.edicionCohorte ? `(${p.edicionCohorte})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Cargo</label>
                            <select
                                value={form.cargo}
                                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                                className={INPUT_CLASS}
                            >
                                {cargosDisponibles.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <label className="block font-semibold text-slate-700">
                                    {esEC ? 'Módulo' : 'Ciclo'}
                                </label>
                                {esEC && (
                                    <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={form.moduloCompleto}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    moduloCompleto: e.target.checked
                                                }))
                                            }
                                            className="rounded border-slate-300 cursor-pointer"
                                        />
                                        <span>Módulo completo</span>
                                    </label>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder={esEC ? 'Ej. MODULO II' : 'Ej. CICLO I-2026'}
                                value={form.moduloCiclo}
                                onChange={(e) => setForm({ ...form, moduloCiclo: e.target.value })}
                                className={INPUT_CLASS}
                            />
                            {esEC && !form.moduloCompleto && form.materia.trim() && moduloLimpioVista && (
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Se guardará como:{' '}
                                    <strong className="text-slate-700">PART. {moduloLimpioVista}</strong>
                                </p>
                            )}
                        </div>

                        {mostrarCampoAsignatura && (
                            <div className="md:col-span-2">
                                <label className="block font-semibold text-slate-700 mb-1">
                                    Nombre de Asignatura *
                                </label>
                                <input
                                    type="text"
                                    required
                                    list="catalogo-asignaturas-list"
                                    placeholder="Escribe o selecciona una asignatura del programa"
                                    value={form.materia}
                                    onChange={(e) => setForm({ ...form, materia: e.target.value })}
                                    className={INPUT_CLASS}
                                />
                                <datalist id="catalogo-asignaturas-list">
                                    {asignaturasSugeridas.map((a, idx) => (
                                        <option key={idx} value={a.nombre || a.asignatura} />
                                    ))}
                                </datalist>
                            </div>
                        )}

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Fecha de Inicio *</label>
                            <input
                                type="date"
                                required
                                value={form.fechaInicio}
                                onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Fecha de Fin *</label>
                            <input
                                type="date"
                                required
                                min={form.fechaInicio || undefined}
                                value={form.fechaFin}
                                onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                                className={INPUT_CLASS}
                            />
                        </div>
                    </div>

                    {/* Cuadrícula de Horario Semanal */}
                    <div className="border border-slate-200 rounded overflow-hidden">
                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                                Horario Semanal Recurrente
                            </span>
                        </div>
                        <div className="divide-y divide-slate-200">
                            {DIAS_SEMANA.map((dia) => {
                                const cfg = form.dias[dia.id] || {
                                    activo: false,
                                    horaInicio: '18:00',
                                    horaFin: '21:00'
                                };
                                return (
                                    <div
                                        key={dia.id}
                                        className={`px-3 py-2 flex flex-wrap items-center justify-between gap-2 ${cfg.activo ? 'bg-white' : 'bg-slate-50/50 text-slate-400'
                                            }`}
                                    >
                                        <label className="inline-flex items-center gap-2 font-semibold cursor-pointer min-w-[110px]">
                                            <input
                                                type="checkbox"
                                                checked={cfg.activo}
                                                onChange={() => toggleDia(dia.id)}
                                                className="rounded border-slate-300 cursor-pointer"
                                            />
                                            <span className={cfg.activo ? 'text-slate-900' : 'text-slate-500'}>
                                                {dia.nombre}
                                            </span>
                                        </label>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                disabled={!cfg.activo}
                                                value={cfg.horaInicio}
                                                onChange={(e) => updateHoraDia(dia.id, 'horaInicio', e.target.value)}
                                                className="border border-slate-300 rounded px-2 py-1 text-xs font-mono disabled:opacity-40"
                                            />
                                            <span className="text-slate-400">a</span>
                                            <input
                                                type="time"
                                                disabled={!cfg.activo}
                                                value={cfg.horaFin}
                                                onChange={(e) => updateHoraDia(dia.id, 'horaFin', e.target.value)}
                                                className="border border-slate-300 rounded px-2 py-1 text-xs font-mono disabled:opacity-40"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCerrar}
                            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded font-semibold cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold cursor-pointer"
                        >
                            {modo === 'editar' ? 'Guardar Cambios' : 'Crear Asignación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
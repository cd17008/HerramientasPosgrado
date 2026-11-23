import React, { useState, useMemo } from 'react';
import {
    getProgramasPorCategoria,
    getCatalogos,
    buscarProgramaMaestro,
    calcularFactorSobrecupo
} from '../../services/catalogService';

const INPUT_CLASS =
    'w-full border border-slate-300 rounded p-2 text-xs bg-white text-slate-900 focus:ring-1 focus:ring-slate-800 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500';

const FACTORES_SOBRECUPO = [1.0, 1.25, 1.5, 2.0];

const normalizarFactor = (valor) => {
    const num = Number(valor);
    return FACTORES_SOBRECUPO.includes(num) ? num : 1.0;
};

const inferirUnidadPorTipo = (tipoPrograma = '') => {
    const norm = String(tipoPrograma)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase();
    if (norm === 'MAESTRIA' || norm === 'DOCTORADO') return 'MAYDOC';
    return 'EC';
};

export default function ModalPrograma({
    modo,
    datosIniciales,
    docenteNombre = '',
    onGuardar,
    onCerrar
}) {
    const catalogos = getCatalogos();

    const coordinadorEsDocenteInicial = Boolean(
        docenteNombre.trim() &&
        datosIniciales?.coordinador &&
        datosIniciales.coordinador.trim().toUpperCase() === docenteNombre.trim().toUpperCase()
    );

    const [esMismoCoordinador, setEsMismoCoordinador] = useState(coordinadorEsDocenteInicial);

    const tipoInicial = datosIniciales?.tipoPrograma || 'DIPLOMADO';
    const unidadInicial = (
        datosIniciales?.unidad || inferirUnidadPorTipo(tipoInicial)
    ).toUpperCase();

    const [form, setForm] = useState({
        id: datosIniciales?.id || null,
        unidad: unidadInicial,
        tipoPrograma: tipoInicial,
        nombre: datosIniciales?.nombre || '',
        codigo: datosIniciales?.codigo || '',
        edicionCohorte: datosIniciales?.edicionCohorte || '',
        coordinador: datosIniciales?.coordinador || '',
        alumnosInscritos: datosIniciales?.alumnosInscritos ?? 0,
        factorSobrecupo:
            unidadInicial === 'EC' ? normalizarFactor(datosIniciales?.factorSobrecupo ?? 1.0) : 1.0,
        clasificacionProyecto: datosIniciales?.clasificacionProyecto || 'A',
        numeroSolicitud: datosIniciales?.numeroSolicitud || '',
        numeroAcuerdo: datosIniciales?.numeroAcuerdo || ''
    });

    const esEducacionContinua = form.unidad === 'EC';

    // Programas filtrados por la propiedad "categoria" según el tipo seleccionado
    const programasFiltrados = useMemo(
        () => getProgramasPorCategoria(form.tipoPrograma),
        [form.tipoPrograma]
    );

    const handleTipoProgramaChange = (nuevoTipo) => {
        const nuevaUnidad = inferirUnidadPorTipo(nuevoTipo);
        setForm((prev) => ({
            ...prev,
            tipoPrograma: nuevoTipo,
            unidad: nuevaUnidad,
            factorSobrecupo:
                nuevaUnidad === 'EC'
                    ? normalizarFactor(
                        calcularFactorSobrecupo(prev.clasificacionProyecto || 'A', prev.alumnosInscritos)
                    )
                    : 1.0
        }));
    };

    const handleNombreOCodigoChange = (campo, valor) => {
        const maestro = buscarProgramaMaestro(valor);
        if (maestro) {
            const nuevoTipo = (
                maestro.categoria ||
                maestro.tipo ||
                maestro.tipoPrograma ||
                form.tipoPrograma
            ).toUpperCase();
            const nuevaUnidad = (maestro.unidad || inferirUnidadPorTipo(nuevoTipo)).toUpperCase();
            const nuevaClasif =
                maestro.clasificacion || maestro.clasificacionProyecto || form.clasificacionProyecto || 'A';

            setForm((prev) => ({
                ...prev,
                nombre: maestro.nombre || prev.nombre,
                codigo: maestro.codigo || prev.codigo,
                tipoPrograma: nuevoTipo,
                unidad: nuevaUnidad,
                clasificacionProyecto: nuevaUnidad === 'EC' ? nuevaClasif : '',
                factorSobrecupo:
                    nuevaUnidad === 'EC'
                        ? normalizarFactor(calcularFactorSobrecupo(nuevaClasif, prev.alumnosInscritos))
                        : 1.0
            }));
        } else {
            setForm((prev) => ({ ...prev, [campo]: valor }));
        }
    };

    const handleAlumnosChange = (valor) => {
        const alumnos = Number(valor) || 0;
        setForm((prev) => ({
            ...prev,
            alumnosInscritos: valor,
            factorSobrecupo:
                prev.unidad === 'EC'
                    ? normalizarFactor(calcularFactorSobrecupo(prev.clasificacionProyecto || 'A', alumnos))
                    : 1.0
        }));
    };

    const handleClasificacionChange = (nuevaClasif) => {
        setForm((prev) => ({
            ...prev,
            clasificacionProyecto: nuevaClasif,
            factorSobrecupo:
                prev.unidad === 'EC'
                    ? normalizarFactor(calcularFactorSobrecupo(nuevaClasif, prev.alumnosInscritos))
                    : 1.0
        }));
    };

    const handleToggleMismoCoordinador = (checked) => {
        setEsMismoCoordinador(checked);
        setForm((prev) => ({
            ...prev,
            coordinador: checked ? docenteNombre : ''
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.nombre.trim()) return;

        onGuardar({
            ...form,
            unidad: form.unidad,
            nombre: form.nombre.trim(),
            codigo: form.codigo.trim().toUpperCase(),
            edicionCohorte: form.edicionCohorte.trim(),
            coordinador: (esMismoCoordinador ? docenteNombre : form.coordinador).trim(),
            alumnosInscritos: Number(form.alumnosInscritos) || 0,
            clasificacionProyecto: esEducacionContinua ? form.clasificacionProyecto || 'A' : '',
            factorSobrecupo: esEducacionContinua ? normalizarFactor(form.factorSobrecupo) : 1.0,
            numeroSolicitud: form.numeroSolicitud.trim(),
            numeroAcuerdo: form.numeroAcuerdo.trim()
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            {modo === 'editar' ? 'Editar Programa' : 'Paso 2: Agregar Programa'}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            Autocompleta el programa base y registra los datos operativos de esta{' '}
                            {esEducacionContinua ? 'edición' : 'cohorte'}.
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Tipo de Programa</label>
                            <select
                                value={form.tipoPrograma}
                                onChange={(e) => handleTipoProgramaChange(e.target.value)}
                                className={INPUT_CLASS}
                            >
                                {catalogos.tiposPrograma.map((tp) => (
                                    <option key={tp} value={tp}>
                                        {tp}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-semibold text-slate-700 mb-1">
                                Nombre del Programa *
                            </label>
                            <input
                                type="text"
                                required
                                list="catalogo-programas-list"
                                placeholder="Selecciona o escribe el nombre del programa"
                                value={form.nombre}
                                onChange={(e) => handleNombreOCodigoChange('nombre', e.target.value)}
                                className={INPUT_CLASS}
                            />
                            <datalist id="catalogo-programas-list">
                                {programasFiltrados.map((p, idx) => (
                                    <option key={p.codigo || idx} value={p.nombre} />
                                ))}
                            </datalist>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Código</label>
                            <input
                                type="text"
                                placeholder={esEducacionContinua ? 'Ej. DLOGIS' : 'Ej. MINGES'}
                                value={form.codigo}
                                onChange={(e) => handleNombreOCodigoChange('codigo', e.target.value)}
                                className={`${INPUT_CLASS} uppercase font-mono`}
                            />
                        </div>

                        <div className={esEducacionContinua ? '' : 'md:col-span-2'}>
                            <label className="block font-semibold text-slate-700 mb-1">
                                {esEducacionContinua ? 'Edición' : 'Cohorte'}
                            </label>
                            <input
                                type="text"
                                placeholder={esEducacionContinua ? 'Ej. EDICIÓN IV 2026' : 'Ej. 8° COHORTE'}
                                value={form.edicionCohorte}
                                onChange={(e) => setForm({ ...form, edicionCohorte: e.target.value })}
                                className={INPUT_CLASS}
                            />
                        </div>

                        {esEducacionContinua && (
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    Clasificación del Proyecto
                                </label>
                                <select
                                    value={form.clasificacionProyecto || 'A'}
                                    onChange={(e) => handleClasificacionChange(e.target.value)}
                                    className={INPUT_CLASS}
                                >
                                    {catalogos.clasificacionesProyecto.map((c) => (
                                        <option key={c} value={c}>
                                            Categoría {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="md:col-span-3 space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <label className="font-semibold text-slate-700">
                                    Coordinador del Programa
                                </label>
                                {docenteNombre.trim() && (
                                    <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={esMismoCoordinador}
                                            onChange={(e) => handleToggleMismoCoordinador(e.target.checked)}
                                            className="rounded border-slate-300 cursor-pointer"
                                        />
                                        <span>El docente ingresado es el coordinador</span>
                                    </label>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Nombre completo del coordinador"
                                disabled={esMismoCoordinador}
                                value={esMismoCoordinador ? docenteNombre : form.coordinador}
                                onChange={(e) => setForm({ ...form, coordinador: e.target.value })}
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Alumnos Inscritos</label>
                            <input
                                type="number"
                                min="0"
                                value={form.alumnosInscritos}
                                onChange={(e) => handleAlumnosChange(e.target.value)}
                                className={`${INPUT_CLASS} font-mono`}
                            />
                        </div>

                        {esEducacionContinua && (
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    Factor de Sobrecupo
                                </label>
                                <select
                                    value={form.factorSobrecupo}
                                    onChange={(e) =>
                                        setForm({ ...form, factorSobrecupo: normalizarFactor(e.target.value) })
                                    }
                                    className={`${INPUT_CLASS} font-mono cursor-pointer`}
                                >
                                    {FACTORES_SOBRECUPO.map((factor) => (
                                        <option key={factor} value={factor}>
                                            {factor.toFixed(2).replace(/\.00$/, '.0').replace(/(\.\d)0$/, '$1')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className={esEducacionContinua ? '' : 'md:col-span-2'}>
                            <label className="block font-semibold text-slate-700 mb-1">N° de Solicitud</label>
                            <input
                                type="text"
                                placeholder="Ej. SOL-045/2026"
                                value={form.numeroSolicitud}
                                onChange={(e) => setForm({ ...form, numeroSolicitud: e.target.value })}
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div className="md:col-span-3">
                            <label className="block font-semibold text-slate-700 mb-1">
                                N° de Acuerdo de Impartición
                            </label>
                            <input
                                type="text"
                                placeholder="Ej. Acuerdo N° 120/2026-JD"
                                value={form.numeroAcuerdo}
                                onChange={(e) => setForm({ ...form, numeroAcuerdo: e.target.value })}
                                className={INPUT_CLASS}
                            />
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
                            {modo === 'editar' ? 'Guardar Cambios' : 'Agregar Programa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
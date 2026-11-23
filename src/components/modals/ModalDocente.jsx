import React, { useState } from 'react';
import {
    getDocentes,
    getCatalogos,
    getOpcionesContratacion,
    buscarDocentePorNombre,
    getTarifaPorCalificacion
} from '../../services/catalogService';

const INPUT_CLASS =
    'w-full border border-slate-300 rounded p-2 text-xs bg-white text-slate-900 focus:ring-1 focus:ring-slate-800 focus:outline-none';

export default function ModalDocente({ docenteInicial, onGuardar, onCerrar }) {
    const catalogos = getCatalogos();
    const listaDocentes = getDocentes();

    const [form, setForm] = useState({
        nombreCompleto: docenteInicial?.nombreCompleto || '',
        profesion: docenteInicial?.profesion || '',
        nacionalidad: docenteInicial?.nacionalidad || 'SALVADOREÑA',
        correo: docenteInicial?.correo || '',
        tipoContrato: docenteInicial?.tipoContrato || 'SERVICIOS PROFESIONALES NO PERSONALES',
        tipoContratacion: docenteInicial?.tipoContratacion || 'TIEMPO NORMAL',
        modalidadServicio: docenteInicial?.modalidadServicio || 'EN LINEA',
        calificacionDocente: docenteInicial?.calificacionDocente || 'F1',
        pagoPorHora: docenteInicial?.pagoPorHora ?? 18.75,
        sueldoNominal: docenteInicial?.sueldoNominal ?? 0,
        porcentajePago: docenteInicial?.porcentajePago ?? 13,
        cantidadMeses: docenteInicial?.cantidadMeses ?? 1
    });

    const opcionesContratacion = getOpcionesContratacion(form.tipoContrato);
    const esTiempoIntegral = form.tipoContratacion === 'TIEMPO INTEGRAL';

    const handleNombreChange = (valor) => {
        const encontrado = buscarDocentePorNombre(valor);
        if (encontrado) {
            const cal = encontrado.calificacionDocente || encontrado.calificacion || form.calificacionDocente;
            setForm((prev) => ({
                ...prev,
                nombreCompleto: valor,
                profesion: encontrado.profesion || prev.profesion,
                nacionalidad: encontrado.nacionalidad || prev.nacionalidad,
                correo: encontrado.correo || encontrado.email || prev.correo,
                calificacionDocente: cal,
                pagoPorHora: getTarifaPorCalificacion(cal)
            }));
        } else {
            setForm((prev) => ({ ...prev, nombreCompleto: valor }));
        }
    };

    const handleTipoContratoChange = (nuevoContrato) => {
        const opciones = getOpcionesContratacion(nuevoContrato);
        const nuevaContratacion = opciones.includes(form.tipoContratacion)
            ? form.tipoContratacion
            : opciones[0];

        setForm((prev) => ({
            ...prev,
            tipoContrato: nuevoContrato,
            tipoContratacion: nuevaContratacion
        }));
    };

    const handleCalificacionChange = (nuevaCal) => {
        setForm((prev) => ({
            ...prev,
            calificacionDocente: nuevaCal,
            pagoPorHora: getTarifaPorCalificacion(nuevaCal)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.nombreCompleto.trim()) return;
        onGuardar({
            ...form,
            nombreCompleto: form.nombreCompleto.trim(),
            profesion: form.profesion.trim(),
            nacionalidad: form.nacionalidad.trim(),
            correo: form.correo.trim(),
            pagoPorHora: Number(form.pagoPorHora) || 0,
            sueldoNominal: Number(form.sueldoNominal) || 0,
            porcentajePago: Number(form.porcentajePago) || 13,
            cantidadMeses: Number(form.cantidadMeses) || 1
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Paso 1: Información del Docente
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            Selecciona un docente del catálogo o ingresa los datos manualmente.
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
                            <label className="block font-semibold text-slate-700 mb-1">
                                Nombre Completo *
                            </label>
                            <input
                                type="text"
                                required
                                list="catalogo-docentes-list"
                                placeholder="Ej. ING. JUAN CARLOS PÉREZ"
                                value={form.nombreCompleto}
                                onChange={(e) => handleNombreChange(e.target.value)}
                                className={INPUT_CLASS}
                            />
                            <datalist id="catalogo-docentes-list">
                                {listaDocentes.map((d, idx) => (
                                    <option key={idx} value={d.nombreCompleto || d.nombre} />
                                ))}
                            </datalist>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Profesión</label>
                            <input
                                type="text"
                                placeholder="Ej. INGENIERO EN SISTEMAS"
                                value={form.profesion}
                                onChange={(e) => setForm({ ...form, profesion: e.target.value })}
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Nacionalidad</label>
                            <input
                                type="text"
                                placeholder="Ej. SALVADOREÑA"
                                value={form.nacionalidad}
                                onChange={(e) => setForm({ ...form, nacionalidad: e.target.value })}
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                            <input
                                type="email"
                                placeholder="docente@ues.edu.sv"
                                value={form.correo}
                                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                                className={INPUT_CLASS}
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Modalidad de Servicio</label>
                            <select
                                value={form.modalidadServicio}
                                onChange={(e) => setForm({ ...form, modalidadServicio: e.target.value })}
                                className={INPUT_CLASS}
                            >
                                {catalogos.modalidadesServicio.map((mod) => (
                                    <option key={mod} value={mod}>
                                        {mod}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Tipo de Contrato</label>
                            <select
                                value={form.tipoContrato}
                                onChange={(e) => handleTipoContratoChange(e.target.value)}
                                className={INPUT_CLASS}
                            >
                                {catalogos.tiposContrato.map((tc) => (
                                    <option key={tc} value={tc}>
                                        {tc}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Tipo de Contratación</label>
                            <select
                                value={form.tipoContratacion}
                                onChange={(e) => setForm({ ...form, tipoContratacion: e.target.value })}
                                className={INPUT_CLASS}
                            >
                                {opcionesContratacion.map((op) => (
                                    <option key={op} value={op}>
                                        {op}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {!esTiempoIntegral ? (
                            <>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Calificación Docente
                                    </label>
                                    <select
                                        value={form.calificacionDocente}
                                        onChange={(e) => handleCalificacionChange(e.target.value)}
                                        className={INPUT_CLASS}
                                    >
                                        {catalogos.calificacionesDocente.map((cal) => (
                                            <option key={cal} value={cal}>
                                                {cal}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Pago por Hora ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.pagoPorHora}
                                        onChange={(e) => setForm({ ...form, pagoPorHora: e.target.value })}
                                        className={`${INPUT_CLASS} font-mono`}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Sueldo Nominal ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.sueldoNominal}
                                        onChange={(e) => setForm({ ...form, sueldoNominal: e.target.value })}
                                        className={`${INPUT_CLASS} font-mono`}
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Porcentaje a Pagar (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={form.porcentajePago}
                                        onChange={(e) => setForm({ ...form, porcentajePago: e.target.value })}
                                        className={`${INPUT_CLASS} font-mono`}
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Cantidad de Meses
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.cantidadMeses}
                                        onChange={(e) => setForm({ ...form, cantidadMeses: e.target.value })}
                                        className={`${INPUT_CLASS} font-mono`}
                                    />
                                </div>
                            </div>
                        )}
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
                            Guardar Docente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
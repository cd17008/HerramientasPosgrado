import React, { useState, useRef } from 'react';

export default function ModalCargarRespaldo({ onCargarArchivo, onCerrar }) {
    const [estaArrastrando, setEstaArrastrando] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrop = (e) => {
        e.preventDefault();
        setEstaArrastrando(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onCargarArchivo(file);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded max-w-md w-full p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900 text-sm">Cargar Respaldo de Horarios</h3>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
                    >
                        &times;
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onCargarArchivo(file);
                        e.target.value = '';
                    }}
                    accept=".json,application/json"
                    className="hidden"
                />

                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setEstaArrastrando(true);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        setEstaArrastrando(false);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${estaArrastrando
                            ? 'border-slate-800 bg-slate-100'
                            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                        }`}
                >
                    <p className="text-xs font-bold text-slate-800">
                        {estaArrastrando
                            ? 'Suelta el archivo JSON aquí'
                            : 'Arrastra y suelta tu archivo JSON aquí'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                        o haz clic sobre esta zona para seleccionarlo desde tu equipo
                    </p>
                    <span className="inline-block mt-3 text-[10px] uppercase font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        Formato aceptado: .json
                    </span>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="px-3.5 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
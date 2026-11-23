import React from 'react';

export default function ModalConfirmacion({ abierto, titulo, mensaje, onConfirmar, onCerrar }) {
    if (!abierto) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white border border-slate-200 rounded max-w-sm w-full p-5 space-y-4">
                <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm">{titulo}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{mensaje}</p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="px-3.5 py-1.5 rounded text-xs text-slate-700 hover:bg-slate-100 border border-slate-300 font-semibold cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirmar}
                        className="px-3.5 py-1.5 rounded text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
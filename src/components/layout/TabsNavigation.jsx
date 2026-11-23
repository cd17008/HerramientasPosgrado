import React from 'react';

export default function TabsNavigation({ activeTab, setActiveTab, cantidadChoques }) {
    return (
        <div className="flex-shrink-0 px-6 pt-4 bg-slate-100 border-b border-slate-200">
            <div className="flex gap-1">
                <button
                    type="button"
                    onClick={() => setActiveTab('calendario')}
                    className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'calendario'
                            ? 'border-slate-900 text-slate-900'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    Fechas y Sesiones
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('metricas')}
                    className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${activeTab === 'metricas'
                            ? 'border-slate-900 text-slate-900'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    Resumen de Horas
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('choques')}
                    className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors inline-flex items-center gap-1.5 ${activeTab === 'choques'
                            ? 'border-slate-900 text-slate-900'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <span>Auditoría de Choques</span>
                    {cantidadChoques > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-bold leading-none">
                            {cantidadChoques}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
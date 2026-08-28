'use client'

import { useState } from 'react'

interface TabsNavigationProps {
  monthlyBudgetView: React.ReactNode
  globalDebtsView: React.ReactNode
  annualSummaryView: React.ReactNode
}

export default function TabsNavigation({
  monthlyBudgetView,
  globalDebtsView,
  annualSummaryView,
}: TabsNavigationProps) {
  const [activeTab, setActiveTab] = useState<'budget' | 'debts' | 'annual'>('budget')

  return (
    <div className="space-y-6">
      {/* Barra de Navegación de Pestañas */}
      <div className="flex border-b border-slate-800 space-x-2 sm:space-x-4 overflow-x-auto pb-[1px]">
        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'budget'
              ? 'border-emerald-400 text-emerald-400 bg-slate-800/40 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          📊 Presupuesto Mensual
        </button>

        <button
          onClick={() => setActiveTab('debts')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'debts'
              ? 'border-indigo-400 text-indigo-400 bg-slate-800/40 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          🏛️ Deudas Globales (Hoja 1)
        </button>

        <button
          onClick={() => setActiveTab('annual')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'annual'
              ? 'border-cyan-400 text-cyan-400 bg-slate-800/40 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          📈 Resumen Anual
        </button>
      </div>

      {/* Contenido Dinámico según la Pestaña Seleccionada */}
      <div>
        {activeTab === 'budget' && monthlyBudgetView}
        {activeTab === 'debts' && globalDebtsView}
        {activeTab === 'annual' && annualSummaryView}
      </div>
    </div>
  )
}

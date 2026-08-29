'use client'

import { useState } from 'react'

interface TabsNavigationProps {
  dashboardView: React.ReactNode
  estimatedBudgetView: React.ReactNode
  transactionsView: React.ReactNode
  globalDebtsView: React.ReactNode
  annualSummaryView: React.ReactNode
}

export default function TabsNavigation({
  dashboardView,
  estimatedBudgetView,
  transactionsView,
  globalDebtsView,
  annualSummaryView,
}: TabsNavigationProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'estimated' | 'txs' | 'debts' | 'annual'>('dashboard')

  return (
    <div className="space-y-6">
      {/* Barra Superior de Módulos */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-2 overflow-x-auto pb-[1px]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-emerald-400 text-emerald-400 bg-slate-800/40 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          📊 Dashboard
        </button>

        <button
          onClick={() => setActiveTab('estimated')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'estimated'
              ? 'border-cyan-400 text-cyan-400 bg-slate-800/40 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          📝 Presupuesto Estimado
        </button>

        <button
          onClick={() => setActiveTab('txs')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'txs'
              ? 'border-amber-400 text-amber-400 bg-slate-800/40 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          💸 Movimientos Reales
        </button>

        <button
          onClick={() => setActiveTab('debts')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'debts'
              ? 'border-indigo-400 text-indigo-400 bg-slate-800/40 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          🏛️ Deudas Globales
        </button>

        <button
          onClick={() => setActiveTab('annual')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition whitespace-nowrap ${
            activeTab === 'annual'
              ? 'border-purple-400 text-purple-400 bg-slate-800/40 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          📈 Resumen Anual
        </button>
      </div>

      {/* Contenido por Módulo */}
      <div>
        {activeTab === 'dashboard' && dashboardView}
        {activeTab === 'estimated' && estimatedBudgetView}
        {activeTab === 'txs' && transactionsView}
        {activeTab === 'debts' && globalDebtsView}
        {activeTab === 'annual' && annualSummaryView}
      </div>
    </div>
  )
}

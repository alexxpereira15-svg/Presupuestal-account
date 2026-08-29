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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', color: 'emerald' },
    { id: 'estimated', label: 'Presupuesto Estimado', icon: '📝', color: 'cyan' },
    { id: 'txs', label: 'Movimientos Reales', icon: '💸', color: 'amber' },
    { id: 'debts', label: 'Deudas Globales', icon: '🏛️', color: 'indigo' },
    { id: 'annual', label: 'Resumen Anual', icon: '📈', color: 'purple' },
  ]

  return (
    <div className="space-y-6">
      {/* Barra Navegadora Estilo Tab Pills */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto gap-1 backdrop-blur-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-white shadow-lg border border-slate-700/80 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Contenido con Desvanecimiento */}
      <div className="transition-all duration-300">
        {activeTab === 'dashboard' && dashboardView}
        {activeTab === 'estimated' && estimatedBudgetView}
        {activeTab === 'txs' && transactionsView}
        {activeTab === 'debts' && globalDebtsView}
        {activeTab === 'annual' && annualSummaryView}
      </div>
    </div>
  )
}

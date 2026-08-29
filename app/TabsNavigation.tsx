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
    { id: 'dashboard', label: 'Dashboard', icon: '📊', activeGradient: 'from-emerald-500 to-teal-600', textActive: 'text-emerald-400' },
    { id: 'estimated', label: 'Presupuesto Estimado', icon: '📝', activeGradient: 'from-cyan-500 to-blue-600', textActive: 'text-cyan-400' },
    { id: 'txs', label: 'Movimientos Reales', icon: '💸', activeGradient: 'from-amber-500 to-orange-600', textActive: 'text-amber-400' },
    { id: 'debts', label: 'Deudas Globales', icon: '🏛️', activeGradient: 'from-indigo-500 to-violet-600', textActive: 'text-indigo-400' },
    { id: 'annual', label: 'Resumen Anual', icon: '📈', activeGradient: 'from-purple-500 to-pink-600', textActive: 'text-purple-400' },
  ]

  return (
    <div className="space-y-6">
      {/* Botones de Navegación Estilo App Shell */}
      <div className="bg-slate-900/90 p-2 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl sticky top-20 z-40 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-xs transition-all duration-300 active:scale-95 cursor-pointer ${
                  isActive
                    ? `bg-gradient-to-r ${tab.activeGradient} text-slate-950 shadow-lg shadow-black/40 font-extrabold scale-[1.02]`
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/40'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Contenedor Principal de Modulos */}
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

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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'estimated', label: 'Presupuesto', icon: '📝' },
    { id: 'txs', label: 'Movimientos', icon: '💸' },
    { id: 'debts', label: 'Deudas', icon: '💳' },
    { id: 'savingGoals', label: '🚀 Metas de Ahorro', icon: '🎯' }
    { id: 'annual', label: 'Resumen Anual', icon: '📊' },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0B0F19]">
      {/* Menú Lateral (Sidebar) */}
      <aside className="w-full md:w-64 bg-[#111827] border-r border-slate-800 flex flex-col md:min-h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            P
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Presupuestal</h1>
            <p className="text-xs text-slate-400">Sistema Financiero</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-x-auto md:overflow-visible flex md:flex-col">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left whitespace-nowrap md:whitespace-normal ${
                  isActive
                    ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-900/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && dashboardView}
          {activeTab === 'estimated' && estimatedBudgetView}
          {activeTab === 'txs' && transactionsView}
          {activeTab === 'debts' && globalDebtsView}
          {activeTab === 'annual' && annualSummaryView}
        </div>
      </main>
    </div>
  )
}

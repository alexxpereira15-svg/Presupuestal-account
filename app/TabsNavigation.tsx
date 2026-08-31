'use client'

import { useState } from 'react'

interface TabsNavigationProps {
  dashboardView: React.ReactNode
  estimatedBudgetView: React.ReactNode
  transactionsView: React.ReactNode
  globalDebtsView: React.ReactNode
  savingGoalsView: React.ReactNode
  annualSummaryView: React.ReactNode
}

export default function TabsNavigation({
  dashboardView,
  estimatedBudgetView,
  transactionsView,
  globalDebtsView,
  savingGoalsView,
  annualSummaryView,
}: TabsNavigationProps) {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'estimated', label: 'Presupuesto Estimado', icon: '📝' },
    { id: 'transactions', label: 'Movimientos Reales', icon: '💸' },
    { id: 'debts', label: 'Deudas Globales', icon: '🏛️' },
    { id: 'goals', label: 'Metas de Ahorro', icon: '🚀' },
    { id: 'annual', label: 'Resumen Anual', icon: '📅' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 scrollbar-none shadow-xl backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'dashboard' && dashboardView}
        {activeTab === 'estimated' && estimatedBudgetView}
        {activeTab === 'transactions' && transactionsView}
        {activeTab === 'debts' && globalDebtsView}
        {activeTab === 'goals' && savingGoalsView}
        {activeTab === 'annual' && annualSummaryView}
      </div>
    </div>
  )
}

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'estimated', label: 'Presupuesto Estimado', icon: '📝' },
    { id: 'transactions', label: 'Movimientos Reales', icon: '💸' },
    { id: 'debts', label: 'Deudas Globales', icon: '🏛️' },
    { id: 'goals', label: 'Metas de Ahorro', icon: '🚀' },
    { id: 'annual', label: 'Resumen Anual', icon: '📅' },
  ]

  return (
    <div className="relative flex flex-col md:flex-row gap-6 min-h-[600px]">
      {/* Botón Flotante para Ocultar / Mostrar Sidebar */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 active:scale-90 flex items-center justify-center border border-indigo-400/30 cursor-pointer"
        title={isSidebarOpen ? 'Ocultar Menú Lateral' : 'Mostrar Menú Lateral'}
      >
        <span className="text-xl leading-none">{isSidebarOpen ? '✕' : '☰'}</span>
      </button>

      {/* Sidebar Lateral */}
      <aside
        className={`transition-all duration-300 ease-in-out shrink-0 ${
          isSidebarOpen ? 'w-full md:w-64 opacity-100' : 'w-0 hidden md:hidden opacity-0 overflow-hidden'
        }`}
      >
        <div className="sticky top-6 bg-slate-900/90 p-3 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-2">
          <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Navegación</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-500 hover:text-white text-xs font-bold md:block hidden cursor-pointer"
              title="Ocultar"
            >
              ◀ Ocultar
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20 translate-x-1'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Área Principal de Contenido */}
      <main className="flex-1 min-w-0 transition-all duration-300">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mb-4 hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <span>▶</span> Mostrar Menú Lateral
          </button>
        )}

        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && dashboardView}
          {activeTab === 'estimated' && estimatedBudgetView}
          {activeTab === 'transactions' && transactionsView}
          {activeTab === 'debts' && globalDebtsView}
          {activeTab === 'goals' && savingGoalsView}
          {activeTab === 'annual' && annualSummaryView}
        </div>
      </main>
    </div>
  )
}

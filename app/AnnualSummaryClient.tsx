'use client'

import { useState } from 'react'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function AnnualSummaryClient({ summary }: { summary: any }) {
  const [isOpen, setIsOpen] = useState(false)

  const netBalanceReal = summary.totalIncomeReal - summary.totalExpenseReal - summary.totalSavingsReal

  return (
    <div className="bg-slate-800/30 rounded-2xl border border-slate-800 p-6 space-y-6">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            📈 Resumen Anual Total ({summary.year})
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">Consolidado general de metas y resultados de los 12 meses</p>
        </div>
        <button className="bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700">
          {isOpen ? 'Ocultar Resumen ▲' : 'Mostrar Resumen ▼'}
        </button>
      </div>

      {/* Tarjetas KPI de Resumen Anual */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Ingresos Anuales</span>
          <p className="text-lg font-bold text-emerald-400 mt-1">
            ${summary.totalIncomeReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500">
            Est: ${summary.totalIncomeEstimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Gastos Anuales</span>
          <p className="text-lg font-bold text-rose-400 mt-1">
            ${summary.totalExpenseReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500">
            Est: ${summary.totalExpenseEstimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Ahorro / Inversión Total</span>
          <p className="text-lg font-bold text-cyan-400 mt-1">
            ${summary.totalSavingsReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500">
            Est: ${summary.totalSavingsEstimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs block">Balance Neto Acumulado</span>
          <p className={`text-lg font-bold mt-1 ${netBalanceReal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${netBalanceReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500">Superávit / Déficit</span>
        </div>
      </div>

      {/* Tabla Desglosada Mes a Mes */}
      {isOpen && (
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/80 text-slate-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Mes</th>
                <th className="px-4 py-3 text-right">Ingresos (Real)</th>
                <th className="px-4 py-3 text-right">Gastos (Real)</th>
                <th className="px-4 py-3 text-right">Ahorro (Real)</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {summary.monthlyBreakdown.map((m: any) => {
                const diff = m.incReal - m.expReal - m.savReal
                return (
                  <tr key={m.month} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{MONTH_NAMES[m.month - 1]}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">
                      ${m.incReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-rose-400">
                      ${m.expReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-cyan-400">
                      ${m.savReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${diff.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

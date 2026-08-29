'use client'

import { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function AnnualSummaryClient({ summary }: { summary: any }) {
  // Selector entre 'real' y 'budget' (Igual a tu imagen de referencia)
  const [viewMode, setViewMode] = useState<'real' | 'budget'>('real')

  const isReal = viewMode === 'real'

  // Importes calculados según modo
  const fixedTotal = isReal ? summary.totalFixedReal : summary.totalFixedEstimated
  const debtsTotal = isReal ? summary.totalDebtsReal : summary.totalDebtsEstimated
  const variableTotal = isReal ? summary.totalVariableReal : summary.totalVariableEstimated
  const incomeTotal = isReal ? summary.totalIncomeReal : summary.totalIncomeEstimated
  const savingsTotal = isReal ? summary.totalSavingsReal : summary.totalSavingsEstimated

  // Datos para Gráfica de Pastel (Distribución)
  const pieData = [
    { name: 'Gastos Fijos y Facturas', value: fixedTotal, color: '#f43f5e' },
    { name: 'Deudas', value: debtsTotal, color: '#eab308' },
    { name: 'Gastos Variables', value: variableTotal, color: '#f97316' },
    { name: 'Ahorros e Inversiones', value: savingsTotal, color: '#10b981' },
  ].filter((item) => item.value > 0)

  // Datos para Gráfica de Barras Horizontales
  const barData = [
    { category: 'Ingresos', Monto: incomeTotal, fill: '#3b82f6' },
    { category: 'Gastos Fijos', Monto: fixedTotal, fill: '#f43f5e' },
    { category: 'Deudas', Monto: debtsTotal, fill: '#eab308' },
    { category: 'Gastos Variables', Monto: variableTotal, fill: '#f97316' },
    { category: 'Ahorros e Inversiones', Monto: savingsTotal, fill: '#10b981' },
  ]

  return (
    <div className="space-y-8 bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
      {/* Encabezado con Interruptor "¿Qué deseas visualizar?" */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white">Resumen Anual Total ({summary.year})</h2>
          <p className="text-slate-400 text-xs">Consolidado general de todo el año por módulos</p>
        </div>

        {/* Toggle Bar Estilo Excel */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setViewMode('budget')}
            className={`px-5 py-2.5 rounded-xl transition-all ${
              !isReal
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Presupuesto
          </button>
          <button
            onClick={() => setViewMode('real')}
            className={`px-5 py-2.5 rounded-xl transition-all ${
              isReal
                ? 'bg-emerald-500 text-slate-950 shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Importes Reales
          </button>
        </div>
      </div>

      {/* Fila de Tarjetas por Módulo (Similares a tu imagen) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-rose-950/30 p-4 rounded-2xl border border-rose-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">Gastos Fijos</span>
          <p className="text-lg font-black text-white font-mono mt-1">
            ${fixedTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-amber-950/30 p-4 rounded-2xl border border-amber-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Deudas</span>
          <p className="text-lg font-black text-white font-mono mt-1">
            ${debtsTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-orange-950/30 p-4 rounded-2xl border border-orange-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-orange-400 block tracking-wider">Gastos Variables</span>
          <p className="text-lg font-black text-white font-mono mt-1">
            ${variableTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-blue-950/30 p-4 rounded-2xl border border-blue-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">Ingresos</span>
          <p className="text-lg font-black text-white font-mono mt-1">
            ${incomeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/20 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Ahorros / Inversiones</span>
          <p className="text-lg font-black text-white font-mono mt-1">
            ${savingsTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Gráficas Anuales (Distribución y Barras Horizontales) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 text-center">
            DISTRIBUCIÓN DEL DINERO ({isReal ? 'REAL' : 'PRESUPUESTO'})
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 text-center">
            TOTALES POR MÓDULO ({isReal ? 'REAL' : 'PRESUPUESTO'})
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={barData} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={11} width={110} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} />
                <Bar dataKey="Monto" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla Desglosada Mes a Mes (RESUMEN ANUAL) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">RESUMEN ANUAL (DESGLOSE MES A MES)</h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300 font-mono">
            <thead className="bg-slate-950 uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-bold">Módulo</th>
                {MONTH_NAMES.map((m) => (
                  <th key={m} className="px-3 py-3 text-right">{m.slice(0, 3)}</th>
                ))}
                <th className="px-4 py-3 text-right text-emerald-400 font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              <tr>
                <td className="px-4 py-3 font-bold text-blue-400">Ingresos</td>
                {summary.monthlyBreakdown.map((m: any) => (
                  <td key={m.month} className="px-3 py-3 text-right">
                    ${(isReal ? m.incReal : m.incEstimated).toLocaleString('es-MX')}
                  </td>
                ))}
                <td className="px-4 py-3 text-right font-bold text-blue-400">${incomeTotal.toLocaleString('es-MX')}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-emerald-400">Ahorros / Inversiones</td>
                {summary.monthlyBreakdown.map((m: any) => (
                  <td key={m.month} className="px-3 py-3 text-right">
                    ${(isReal ? m.savReal : m.savEstimated).toLocaleString('es-MX')}
                  </td>
                ))}
                <td className="px-4 py-3 text-right font-bold text-emerald-400">${savingsTotal.toLocaleString('es-MX')}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-rose-400">Gastos Fijos y Facturas</td>
                {summary.monthlyBreakdown.map((m: any) => (
                  <td key={m.month} className="px-3 py-3 text-right">
                    ${(isReal ? m.fixedReal : m.fixedEstimated).toLocaleString('es-MX')}
                  </td>
                ))}
                <td className="px-4 py-3 text-right font-bold text-rose-400">${fixedTotal.toLocaleString('es-MX')}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-orange-400">Gastos Variables</td>
                {summary.monthlyBreakdown.map((m: any) => (
                  <td key={m.month} className="px-3 py-3 text-right">
                    ${(isReal ? m.variableReal : m.variableEstimated).toLocaleString('es-MX')}
                  </td>
                ))}
                <td className="px-4 py-3 text-right font-bold text-orange-400">${variableTotal.toLocaleString('es-MX')}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-amber-400">Deudas</td>
                {summary.monthlyBreakdown.map((m: any) => (
                  <td key={m.month} className="px-3 py-3 text-right">
                    ${(isReal ? m.debtsReal : m.debtsEstimated).toLocaleString('es-MX')}
                  </td>
                ))}
                <td className="px-4 py-3 text-right font-bold text-amber-400">${debtsTotal.toLocaleString('es-MX')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

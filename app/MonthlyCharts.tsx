'use client'

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
  Legend,
  AreaChart,
  Area
} from 'recharts'

interface MonthlyChartsProps {
  incomes: any
  fixedExpenses: any
  debts: any
  variableExpenses: any
  savings: any
  transactions: any[]
}

const COLORS = {
  fixed: '#f43f5e',   // Rosa / Rojo (Gastos Fijos)
  debts: '#eab308',   // Amarillo / Oro (Deudas)
  variable: '#f97316',// Naranja (Gastos Variables)
  savings: '#10b981', // Verde Esmeralda (Ahorros)
  income: '#3b82f6',  // Azul (Ingresos)
}

export default function MonthlyCharts({
  incomes,
  fixedExpenses,
  debts,
  variableExpenses,
  savings,
  transactions,
}: MonthlyChartsProps) {
  // Datos para Gráfica de Pastel (Distribución)
  const pieData = [
    { name: 'Gastos Fijos y Facturas', value: fixedExpenses.totalReal || fixedExpenses.totalEstimated, color: COLORS.fixed },
    { name: 'Deudas', value: debts.totalReal || debts.totalEstimated, color: COLORS.debts },
    { name: 'Gastos Variables', value: variableExpenses.totalReal || variableExpenses.totalEstimated, color: COLORS.variable },
    { name: 'Ahorros e Inversiones', value: savings.totalReal || savings.totalEstimated, color: COLORS.savings },
  ].filter(item => item.value > 0)

  // Datos para Real vs Presupuesto
  const barData = [
    { category: 'Ingresos', Presupuestado: incomes.totalEstimated, Real: incomes.totalReal },
    { category: 'Gastos Fijos', Presupuestado: fixedExpenses.totalEstimated, Real: fixedExpenses.totalReal },
    { category: 'Deudas', Presupuestado: debts.totalEstimated, Real: debts.totalReal },
    { category: 'Gastos Variables', Presupuestado: variableExpenses.totalEstimated, Real: variableExpenses.totalReal },
    { category: 'Ahorros e Inversiones', Presupuestado: savings.totalEstimated, Real: savings.totalReal },
  ]

  // Agrupar movimientos reales por fecha para la línea de tiempo
  const timeDataMap: { [key: string]: number } = {}
  transactions.forEach((t) => {
    const dateStr = new Date(t.date).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })
    timeDataMap[dateStr] = (timeDataMap[dateStr] || 0) + Number(t.amount)
  })

  const timeData = Object.keys(timeDataMap).map((date) => ({
    fecha: date,
    monto: timeDataMap[date],
  }))

  return (
    <div className="space-y-6">
      {/* Fila Superior: Distribución + Presupuesto vs Real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución del Dinero */}
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-xl">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🍩</span> Distribución del Dinero
          </h4>
          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs italic">
              Sin montos registrados en el mes
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Real vs Presupuesto */}
        <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-xl">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📊</span> Presupuestado vs. Real
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={barData} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={11} width={110} />
                <Tooltip
                  formatter={(val: number) => `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Presupuestado" fill="#334155" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Real" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Fila Inferior: Gastos y Ahorros por Fecha */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-xl">
        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>📅</span> Gastos y Ahorros por Fecha
        </h4>
        {timeData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-500 text-xs italic">
            No se registraron movimientos con fecha en este mes
          </div>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData}>
                <defs>
                  <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="fecha" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val: number) => `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="monto" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorMonto)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
}

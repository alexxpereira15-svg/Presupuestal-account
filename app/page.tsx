import { getOrCreateMonthlyBudget } from './actions/budget'

export default async function HomePage() {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const budget = await getOrCreateMonthlyBudget('user_default', year, month)

  // Cálculo de totales con comprobación segura
  const totalIncomeReal = budget.transactions
    .filter(t => (t as any).budgetItem?.type === 'INCOME')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const totalExpenseReal = budget.transactions
    .filter(t => (t as any).budgetItem?.type !== 'INCOME')
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const available = Number(budget.initialBalance) + totalIncomeReal - totalExpenseReal

  return (
    <div className="space-y-8">
      {/* Encabezado de Mes */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Presupuesto {new Date(year, month - 1).toLocaleString('es-ES', { month: 'long' })} {year}
          </h2>
          <p className="text-slate-400 text-sm">Control mensual estimado vs. real</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Disponible Total</span>
          <span className={`text-3xl font-extrabold ${available >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${available.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Grid de Resumen KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
          <span className="text-slate-400 text-sm font-medium">(+) Ingresos Reales</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            ${totalIncomeReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
          <span className="text-slate-400 text-sm font-medium">(-) Gastos Reales Total</span>
          <p className="text-2xl font-bold text-rose-400 mt-1">
            ${totalExpenseReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50">
          <span className="text-slate-400 text-sm font-medium">Saldo Inicial</span>
          <p className="text-2xl font-bold text-cyan-400 mt-1">
            ${Number(budget.initialBalance).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Tabla de Movimientos Diarios / Registro */}
      <div className="bg-slate-800/30 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Últimos Movimientos Registrados</h3>
        
        {budget.transactions.length === 0 ? (
          <p className="text-slate-500 text-sm italic py-4 text-center">No hay movimientos registrados en este mes aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Fecha</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {budget.transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      {new Date(t.date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{t.description || 'Sin descripción'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                      ${Number(t.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

import { getOrCreateMonthlyBudget } from './actions/budget'
import { getGlobalDebts } from './actions/debt'
import BudgetClient from './BudgetClient'
import MonthSelector from './MonthSelector'
import GlobalDebtsClient from './GlobalDebtsClient'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  searchParams?: {
    year?: string
    month?: string
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const currentDate = new Date()
  const year = searchParams?.year ? parseInt(searchParams.year, 10) : currentDate.getFullYear()
  const month = searchParams?.month ? parseInt(searchParams.month, 10) : currentDate.getMonth() + 1

  const userId = 'user_default'

  let budget = null
  let globalDebts: any[] = []
  let errorMessage = ''

  try {
    budget = await getOrCreateMonthlyBudget(userId, year, month)
    globalDebts = await getGlobalDebts(userId)
  } catch (error: any) {
    console.error('Error al conectar con la base de datos:', error)
    errorMessage = error?.message || 'Error de conexión con la base de datos en Neon.'
  }

  if (!budget) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-slate-800/80 border border-rose-500/50 rounded-2xl text-center space-y-4">
        <h2 className="text-xl font-bold text-rose-400">Error de conexión a la Base de Datos</h2>
        <p className="text-sm text-slate-300">
          La aplicación no pudo comunicarse con Neon PostgreSQL.
        </p>
        <div className="bg-slate-900 p-3 rounded-lg text-xs text-rose-300 font-mono text-left overflow-x-auto">
          {errorMessage}
        </div>
      </div>
    )
  }

  // Helper para filtrar rubros y calcular totales
  const items = budget.items || []
  const transactions = budget.transactions || []

  const getCategoryData = (type: string) => {
    const categoryItems = items.filter((item: any) => item.type === type)

    const itemsWithTotals = categoryItems.map((item: any) => {
      const realAmount = transactions
        .filter((t: any) => t.budgetItemId === item.id)
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

      return {
        ...item,
        estimated: Number(item.estimatedAmount),
        real: realAmount,
        diff: Number(item.estimatedAmount) - realAmount,
      }
    })

    const totalEstimated = itemsWithTotals.reduce((sum: number, i: any) => sum + i.estimated, 0)
    const totalReal = itemsWithTotals.reduce((sum: number, i: any) => sum + i.real, 0)

    return { items: itemsWithTotals, totalEstimated, totalReal }
  }

  const incomes = getCategoryData('INCOME')
  const fixedExpenses = getCategoryData('FIXED_EXPENSE')
  const debts = getCategoryData('DEBT')
  const variableExpenses = getCategoryData('VARIABLE_EXPENSE')
  const savings = getCategoryData('SAVING_INVESTMENT')

  const totalIncomeReal = incomes.totalReal
  const totalExpenseReal = fixedExpenses.totalReal + debts.totalReal + variableExpenses.totalReal + savings.totalReal
  const available = Number(budget.initialBalance || 0) + totalIncomeReal - totalExpenseReal

  return (
    <div className="space-y-8">
      {/* Encabezado de Mes y Navegador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white capitalize">
              Presupuesto {new Date(year, month - 1).toLocaleString('es-ES', { month: 'long' })} {year}
            </h2>
          </div>
          <p className="text-slate-400 text-sm">Control mensual estimado vs. real</p>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <MonthSelector currentYear={year} currentMonth={month} />

          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mr-2">Disponible:</span>
            <span className={`text-2xl font-extrabold ${available >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${available.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
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
            ${Number(budget.initialBalance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Botones de Acción / Modales */}
      <BudgetClient budget={budget} />

      {/* SECCIÓN DE TABLAS COMPARATIVAS POR CATEGORÍA */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-2">
          Desglose: Presupuestado vs. Real
        </h3>

        <CategoryTable title="💵 Ingresos" data={incomes} isIncome />
        <CategoryTable title="📌 Gastos Fijos y Facturas" data={fixedExpenses} />
        <CategoryTable title="💳 Deudas y Créditos del Mes" data={debts} />
        <CategoryTable title="🛒 Gastos Variables" data={variableExpenses} />
        <CategoryTable title="📈 Ahorros e Inversiones" data={savings} />
      </div>

      {/* MÓDULO DE CONTROL DE DEUDAS GLOBALES (HOJA 1) */}
      <GlobalDebtsClient debts={globalDebts} userId={userId} />

      {/* Tabla de Movimientos Diarios */}
      <div className="bg-slate-800/30 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Registro General de Movimientos Diarios</h3>
        
        {(!transactions || transactions.length === 0) ? (
          <p className="text-slate-500 text-sm italic py-4 text-center">No hay movimientos registrados en este mes aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Fecha</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Rubro Asignado</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Monto Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                      {new Date(t.date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{t.description || 'Sin descripción'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {t.budgetItem ? t.budgetItem.name : <span className="italic text-slate-600">General</span>}
                    </td>
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

function CategoryTable({ title, data, isIncome = false }: { title: string; data: any; isIncome?: boolean }) {
  return (
    <div className="bg-slate-800/40 rounded-xl border border-slate-800 overflow-hidden">
      <div className="bg-slate-800/80 px-5 py-3 flex justify-between items-center border-b border-slate-700/50">
        <h4 className="font-semibold text-white text-base">{title}</h4>
        <div className="text-xs space-x-4 text-slate-300 font-mono">
          <span>Est: <b className="text-slate-100">${data.totalEstimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</b></span>
          <span>Real: <b className={isIncome ? 'text-emerald-400' : 'text-rose-400'}>${data.totalReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</b></span>
        </div>
      </div>

      {data.items.length === 0 ? (
        <p className="text-xs text-slate-500 italic p-4 text-center">No hay rubros agregados a esta categoría.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-900/40 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-2">Rubro</th>
                <th className="px-5 py-2 text-right">Presupuestado</th>
                <th className="px-5 py-2 text-right">Real (Pagado/Recibido)</th>
                <th className="px-5 py-2 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.items.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-800/20">
                  <td className="px-5 py-2.5 font-medium text-white">{item.name}</td>
                  <td className="px-5 py-2.5 text-right font-mono">${item.estimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-2.5 text-right font-mono font-semibold text-slate-100">
                    ${item.real.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-5 py-2.5 text-right font-mono text-xs ${item.diff < 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    ${item.diff.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { getOrCreateMonthlyBudget } from './actions/budget'
import { getGlobalDebts } from './actions/debt'
import { getAnnualSummary } from './actions/annual'
import { EstimatedBudgetActions, RealTransactionActions } from './BudgetClient'
import MonthSelector from './MonthSelector'
import GlobalDebtsClient from './GlobalDebtsClient'
import AnnualSummaryClient from './AnnualSummaryClient'
import TabsNavigation from './TabsNavigation'

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
  let annualSummary = null
  let errorMessage = ''

  try {
    budget = await getOrCreateMonthlyBudget(userId, year, month)
    globalDebts = await getGlobalDebts(userId)
    annualSummary = await getAnnualSummary(userId, year)
  } catch (error: any) {
    console.error('Error al conectar con la base de datos:', error)
    errorMessage = error?.message || 'Error de conexión con la base de datos en Neon.'
  }

  if (!budget) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-slate-900/90 border border-rose-500/30 rounded-3xl text-center space-y-4 shadow-2xl backdrop-blur-xl">
        <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-xl">⚠️</div>
        <h2 className="text-xl font-bold text-rose-400">Error de conexión a la Base de Datos</h2>
        <p className="text-sm text-slate-300">La aplicación no pudo comunicarse con Neon PostgreSQL.</p>
        <div className="bg-slate-950 p-4 rounded-xl text-xs text-rose-300 font-mono text-left overflow-x-auto border border-slate-800">
          {errorMessage}
        </div>
      </div>
    )
  }

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

  // 1. Vista Dashboard
  const dashboardView = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 hover:border-emerald-500/30 transition-all duration-300 shadow-xl backdrop-blur-xl group">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>(+) Ingresos Reales</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm group-hover:scale-110 transition-transform">💵</span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-3">
            ${totalIncomeReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Est: ${incomes.totalEstimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 hover:border-rose-500/30 transition-all duration-300 shadow-xl backdrop-blur-xl group">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>(-) Gastos Reales Total</span>
            <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg text-sm group-hover:scale-110 transition-transform">💸</span>
          </div>
          <p className="text-3xl font-extrabold text-rose-400 font-mono mt-3">
            ${totalExpenseReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">
            Est: ${(fixedExpenses.totalEstimated + debts.totalEstimated + variableExpenses.totalEstimated).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-all duration-300 shadow-xl backdrop-blur-xl group">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Saldo Inicial del Mes</span>
            <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm group-hover:scale-110 transition-transform">🏦</span>
          </div>
          <p className="text-3xl font-extrabold text-cyan-400 font-mono mt-3">
            ${Number(budget.initialBalance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-2">Traspaso automático del mes anterior</p>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🎯</span> Resumen de Rubros: Presupuestado vs. Real
        </h3>
        <CategoryTable title="💵 Ingresos" data={incomes} isIncome />
        <CategoryTable title="📌 Gastos Fijos y Facturas" data={fixedExpenses} />
        <CategoryTable title="💳 Deudas y Créditos del Mes" data={debts} />
        <CategoryTable title="🛒 Gastos Variables" data={variableExpenses} />
        <CategoryTable title="📈 Ahorros e Inversiones" data={savings} />
      </div>
    </div>
  )

  // 2. Vista Presupuesto Estimado
  const estimatedBudgetView = (
    <div className="space-y-6">
      <EstimatedBudgetActions budget={budget} />
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📝</span> Definición de Rubros Estimados
        </h3>
        <CategoryTable title="💵 Ingresos Estimados" data={incomes} isIncome />
        <CategoryTable title="📌 Gastos Fijos Estimados" data={fixedExpenses} />
        <CategoryTable title="💳 Deudas Estimadas del Mes" data={debts} />
        <CategoryTable title="🛒 Gastos Variables Estimados" data={variableExpenses} />
        <CategoryTable title="📈 Ahorros Estimados" data={savings} />
      </div>
    </div>
  )

  // 3. Vista Movimientos Reales
  const transactionsView = (
    <div className="space-y-6">
      <RealTransactionActions budget={budget} />
      <div className="bg-slate-900/60 rounded-3xl border border-slate-800/80 p-6 space-y-4 shadow-xl backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📋</span> Bitácora Diaria de Movimientos
        </h3>
        {(!transactions || transactions.length === 0) ? (
          <div className="py-12 text-center space-y-2">
            <span className="text-3xl block">🍃</span>
            <p className="text-slate-500 text-sm italic">No hay movimientos registrados en este mes aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider bg-slate-800/60 text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3 rounded-l-xl">Fecha</th>
                  <th className="px-5 py-3">Descripción</th>
                  <th className="px-5 py-3">Rubro Asignado</th>
                  <th className="px-5 py-3 text-right rounded-r-xl">Monto Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 font-mono text-xs">
                      {new Date(t.date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-5 py-3.5 text-white">{t.description || 'Sin descripción'}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {t.budgetItem ? (
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300">
                          {t.budgetItem.name}
                        </span>
                      ) : (
                        <span className="italic text-slate-600">General</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold font-mono text-emerald-400">
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

  // 4. Vista Deudas Globales
  const globalDebtsView = <GlobalDebtsClient debts={globalDebts} userId={userId} />

  // 5. Vista Resumen Anual
  const annualSummaryView = annualSummary ? <AnnualSummaryClient summary={annualSummary} /> : null

  return (
    <div className="space-y-6">
      {/* Targeta Principal: Selector de Mes Global y Balance */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 z-10">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block">Período Seleccionado</span>
          <h2 className="text-3xl font-extrabold text-white capitalize tracking-tight">
            {new Date(year, month - 1).toLocaleString('es-ES', { month: 'long' })} {year}
          </h2>
          <p className="text-slate-400 text-xs">Filtra toda la información de la app seleccionando el mes</p>
        </div>

        <div className="flex flex-col sm:items-end gap-3 z-10 w-full sm:w-auto">
          <MonthSelector currentYear={year} currentMonth={month} />
          <div className="bg-slate-950/60 px-4 py-2 rounded-2xl border border-slate-800/80 flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Disponible del Mes:</span>
            <span className={`text-2xl font-black font-mono ${available >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${available.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Navegación por Módulos */}
      <TabsNavigation
        dashboardView={dashboardView}
        estimatedBudgetView={estimatedBudgetView}
        transactionsView={transactionsView}
        globalDebtsView={globalDebtsView}
        annualSummaryView={annualSummaryView}
      />
    </div>
  )
}

function CategoryTable({ title, data, isIncome = false }: { title: string; data: any; isIncome?: boolean }) {
  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg backdrop-blur-xl">
      <div className="bg-slate-800/50 px-5 py-3.5 flex justify-between items-center border-b border-slate-800">
        <h4 className="font-bold text-white text-sm">{title}</h4>
        <div className="text-xs space-x-4 text-slate-300 font-mono">
          <span>Est: <b className="text-slate-200">${data.totalEstimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</b></span>
          <span>Real: <b className={isIncome ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>${data.totalReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</b></span>
        </div>
      </div>

      {data.items.length === 0 ? (
        <p className="text-xs text-slate-500 italic p-4 text-center">No hay rubros agregados a esta categoría.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-[10px] uppercase tracking-wider bg-slate-950/40 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="px-5 py-2.5">Rubro</th>
                <th className="px-5 py-2.5 text-right">Presupuestado</th>
                <th className="px-5 py-2.5 text-right">Real</th>
                <th className="px-5 py-2.5 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs font-medium">
              {data.items.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-3 font-semibold text-white">{item.name}</td>
                  <td className="px-5 py-3 text-right font-mono text-slate-300">${item.estimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-slate-100">
                    ${item.real.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-5 py-3 text-right font-mono font-bold ${item.diff < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
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

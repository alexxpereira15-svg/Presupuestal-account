import { getOrCreateMonthlyBudget } from './actions/budget'
import { getGlobalDebts } from './actions/debt'
import { getAnnualSummary } from './actions/annual'
import { EstimatedBudgetActions, RealTransactionActions } from './BudgetClient'
import MonthSelector from './MonthSelector'
import GlobalDebtsClient from './GlobalDebtsClient'
import AnnualSummaryClient from './AnnualSummaryClient'
import TabsNavigation from './TabsNavigation'
import MonthlyCharts from './MonthlyCharts'

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
      <div className="max-w-xl mx-auto mt-12 p-8 bg-slate-900/90 border border-rose-500/30 rounded-3xl text-center space-y-4 shadow-2xl backdrop-blur-xl">
        <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">⚠️</div>
        <h2 className="text-xl font-black text-rose-400">Error de conexión a la Base de Datos</h2>
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

  // 1. Vista Dashboard con Gráficas Mensuales
  const dashboardView = (
    <div className="space-y-8">
      {/* Tarjetas KPI Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 p-6 rounded-3xl border border-emerald-500/20 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex justify-between items-center text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span>(+) Ingresos Reales</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-base">💵</span>
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-4">
            ${totalIncomeReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between text-xs font-mono text-slate-400">
            <span>Meta Est:</span>
            <span className="font-bold text-slate-200">${incomes.totalEstimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 p-6 rounded-3xl border border-rose-500/20 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex justify-between items-center text-rose-400 text-xs font-bold uppercase tracking-wider">
            <span>(-) Gastos Reales Total</span>
            <span className="p-2 bg-rose-500/10 text-rose-400 rounded-xl text-base">💸</span>
          </div>
          <p className="text-3xl font-black text-rose-400 font-mono mt-4">
            ${totalExpenseReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between text-xs font-mono text-slate-400">
            <span>Presupuestado:</span>
            <span className="font-bold text-slate-200">${(fixedExpenses.totalEstimated + debts.totalEstimated + variableExpenses.totalEstimated).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 p-6 rounded-3xl border border-cyan-500/20 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex justify-between items-center text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <span>Saldo Inicial</span>
            <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl text-base">🏦</span>
          </div>
          <p className="text-3xl font-black text-cyan-400 font-mono mt-4">
            ${Number(budget.initialBalance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between text-xs text-slate-400">
            <span>Traspaso automatizado</span>
            <span className="font-bold text-emerald-400">Activo</span>
          </div>
        </div>
      </div>

      {/* Gráficas Visuales del Mes */}
      <MonthlyCharts
        incomes={incomes}
        fixedExpenses={fixedExpenses}
        debts={debts}
        variableExpenses={variableExpenses}
        savings={savings}
        transactions={transactions}
      />

      {/* Desglose por Categorías */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <span>🎯</span> Resumen por Categoría (Presupuestado vs Real)
        </h3>
        <CategoryCard title="💵 Ingresos" data={incomes} badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" isIncome />
        <CategoryCard title="📌 Gastos Fijos y Facturas" data={fixedExpenses} badgeColor="bg-rose-500/10 text-rose-400 border-rose-500/20" />
        <CategoryCard title="💳 Deudas y Créditos del Mes" data={debts} badgeColor="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
        <CategoryCard title="🛒 Gastos Variables" data={variableExpenses} badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/20" />
        <CategoryCard title="📈 Ahorros e Inversiones" data={savings} badgeColor="bg-purple-500/10 text-purple-400 border-purple-500/20" />
      </div>
    </div>
  )

  // 2. Vista Presupuesto Estimado
  const estimatedBudgetView = (
    <div className="space-y-6">
      <EstimatedBudgetActions budget={budget} />
      <div className="space-y-4 pt-2">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <span>📝</span> Configuración de Rubros Estimados
        </h3>
        <CategoryCard title="💵 Ingresos Estimados" data={incomes} badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" isIncome />
        <CategoryCard title="📌 Gastos Fijos Estimados" data={fixedExpenses} badgeColor="bg-rose-500/10 text-rose-400 border-rose-500/20" />
        <CategoryCard title="💳 Deudas Estimadas del Mes" data={debts} badgeColor="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" />
        <CategoryCard title="🛒 Gastos Variables Estimados" data={variableExpenses} badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/20" />
        <CategoryCard title="📈 Ahorros Estimados" data={savings} badgeColor="bg-purple-500/10 text-purple-400 border-purple-500/20" />
      </div>
    </div>
  )

  // 3. Vista Movimientos Reales
  const transactionsView = (
    <div className="space-y-6">
      <RealTransactionActions budget={budget} />
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <span>📋</span> Bitácora Diaria de Movimientos
        </h3>
        {(!transactions || transactions.length === 0) ? (
          <div className="py-12 text-center space-y-3">
            <span className="text-4xl block">🍃</span>
            <p className="text-slate-500 font-medium">No hay movimientos registrados en este mes aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider bg-slate-950/60 text-slate-400 font-bold">
                <tr>
                  <th className="px-5 py-3.5 rounded-l-2xl">Fecha</th>
                  <th className="px-5 py-3.5">Descripción</th>
                  <th className="px-5 py-3.5">Rubro Asignado</th>
                  <th className="px-5 py-3.5 text-right rounded-r-2xl">Monto Real</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-semibold">
                {transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-slate-400 font-mono text-xs">
                      {new Date(t.date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-5 py-4 text-white font-bold">{t.description || 'Sin descripción'}</td>
                    <td className="px-5 py-4 text-xs">
                      {t.budgetItem ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                          {t.budgetItem.name}
                        </span>
                      ) : (
                        <span className="italic text-slate-600">General</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-black font-mono text-amber-400 text-base">
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
      {/* Header Principal con Selección de Mes */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 z-10">
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">Período Actual</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white capitalize tracking-tight">
            {new Date(year, month - 1).toLocaleString('es-ES', { month: 'long' })} {year}
          </h2>
          <p className="text-slate-400 text-xs font-medium">Selecciona el mes global para sincronizar tus módulos</p>
        </div>

        <div className="flex flex-col sm:items-end gap-3 z-10 w-full md:w-auto">
          <MonthSelector currentYear={year} currentMonth={month} />
          <div className="bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800 flex items-center justify-between sm:justify-end gap-4 w-full md:w-auto shadow-inner">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Disponible:</span>
            <span className={`text-2xl sm:text-3xl font-black font-mono ${available >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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

function CategoryCard({ title, data, badgeColor, isIncome = false }: { title: string; data: any; badgeColor: string; isIncome?: boolean }) {
  return (
    <div className="bg-slate-900/70 rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl backdrop-blur-xl">
      <div className="bg-slate-800/40 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
            {title}
          </span>
        </div>
        <div className="text-xs space-x-4 text-slate-400 font-mono">
          <span>Est: <b className="text-slate-200">${data.totalEstimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</b></span>
          <span>Real: <b className={isIncome ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>${data.totalReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</b></span>
        </div>
      </div>

      {data.items.length === 0 ? (
        <p className="text-xs text-slate-500 italic p-6 text-center font-medium">No hay rubros agregados a esta categoría.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-[10px] uppercase tracking-wider bg-slate-950/40 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="px-6 py-3">Rubro</th>
                <th className="px-6 py-3 text-right">Presupuestado</th>
                <th className="px-6 py-3 text-right">Real</th>
                <th className="px-6 py-3 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs font-semibold">
              {data.items.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-white">{item.name}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-slate-300">${item.estimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-3.5 text-right font-mono font-black text-slate-100">
                    ${item.real.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-6 py-3.5 text-right font-mono font-bold ${item.diff < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
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

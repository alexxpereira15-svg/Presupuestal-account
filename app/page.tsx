import { auth, signOut } from '../auth'
import { redirect } from 'next/navigation'
import { getOrCreateMonthlyBudget } from './actions/budget'
import { getGlobalDebts } from './actions/debt'
import { getAnnualSummary } from './actions/annual'
import { getSavingGoals } from './actions/goal'
import { EstimatedBudgetActions, RealTransactionActions, ItemRowActions, TransactionRowActions } from './BudgetClient'
import MonthSelector from './MonthSelector'
import GlobalDebtsClient from './GlobalDebtsClient'
import AnnualSummaryClient from './AnnualSummaryClient'
import TabsNavigation from './TabsNavigation'
import MonthlyCharts from './MonthlyCharts'
import SavingGoalsClient from './SavingGoalsClient'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  searchParams?: {
    year?: string
    month?: string
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Verificación de Autenticación
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id
  const userName = session.user.name || session.user.email

  const currentDate = new Date()
  const year = searchParams?.year ? parseInt(searchParams.year, 10) : currentDate.getFullYear()
  const month = searchParams?.month ? parseInt(searchParams.month, 10) : currentDate.getMonth() + 1

  let budget = null
  let globalDebts: any[] = []
  let savingGoals: any[] = []
  let annualSummary = null
  let errorMessage = ''

  try {
    budget = await getOrCreateMonthlyBudget(userId, year, month)
    globalDebts = await getGlobalDebts(userId)
    savingGoals = await getSavingGoals(userId)
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

  // 1. Vista Dashboard
  const dashboardView = (
    <div className="space-y-8">
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

      <MonthlyCharts
        incomes={incomes}
        fixedExpenses={fixedExpenses}
        debts={debts}
        variableExpenses={variableExpenses}
        savings={savings}
        transactions={transactions}
      />

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
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-cyan-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl backdrop-blur-xl">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Configuración Base</span>
          <h3 className="text-xl font-black text-white mt-1">Saldo Inicial del Mes</h3>
          <p className="text-slate-400 text-xs">Monto acumulado o disponible al inicio del período</p>
        </div>
        <div className="bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800 text-right">
          <span className="text-3xl font-black font-mono text-cyan-400">
            ${Number(budget.initialBalance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <EstimatedBudgetActions budget={budget} />

      <div className="space-y-4 pt-2">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <span>📝</span> Configuración de Rubros Estimados
        </h3>
        <CategoryCard title="💵 Ingresos Estimados" data={incomes} badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" editable isIncome />
        <CategoryCard title="📌 Gastos Fijos Estimados" data={fixedExpenses} badgeColor="bg-rose-500/10 text-rose-400 border-rose-500/20" editable />
        <CategoryCard title="💳 Deudas Estimadas del Mes" data={debts} badgeColor="bg-indigo-500/10 text-indigo-400 border-indigo-500/20" editable />
        <CategoryCard title="🛒 Gastos Variables Estimados" data={variableExpenses} badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/20" editable />
        <CategoryCard title="📈 Ahorros Estimados" data={savings} badgeColor="bg-purple-500/10 text-purple-400 border-purple-500/20" editable />
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
                  <th className="px-5 py-3.5 text-right">Monto Real</th>
                  <th className="px-5 py-3.5 text-right rounded-r-2xl">Acciones</th>
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
                    <td className="px-5 py-4 text-right">
                      <TransactionRowActions transaction={t} budgetItems={items} />
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
  const globalDebtsView = (
    <GlobalDebtsClient
      debts={globalDebts}
      userId={userId}
      currentBudgetId={budget.id}
      currentYear={year}
      currentMonth={month}
    />
  )

  // 5. Vista Metas de Ahorro
  const savingGoalsView = (
    <SavingGoalsClient
      goals={savingGoals}
      userId={userId}
      currentBudgetId={budget.id}
      currentYear={year}
      currentMonth={month}
    />
  )

  const annualSummaryView = annualSummary ? <AnnualSummaryClient summary={annualSummary} /> : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 z-10">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">Período Actual</span>
            <span className="text-slate-600">•</span>
            <form action={async () => {
              'use server'
              await signOut()
            }}>
              <button type="submit" className="text-xs text-rose-400 font-bold hover:underline cursor-pointer">
                Cerrar Sesión ({userName})
              </button>
            </form>
          </div>
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

      <TabsNavigation
        dashboardView={dashboardView}
        estimatedBudgetView={estimatedBudgetView}
        transactionsView={transactionsView}
        globalDebtsView={globalDebtsView}
        savingGoalsView={savingGoalsView}
        annualSummaryView={annualSummaryView}
      />
    </div>
  )
}

function CategoryCard({
  title,
  data,
  badgeColor,
  editable = false,
  isIncome = false,
}: {
  title: string
  data: any
  badgeColor: string
  editable?: boolean
  isIncome?: boolean
}) {
  const diffTotal = isIncome
    ? data.totalReal - data.totalEstimated
    : data.totalEstimated - data.totalReal

  const isOverBudget = !isIncome && diffTotal < 0
  const isIncomeBehind = isIncome && diffTotal < 0

  return (
    <div className="bg-slate-900/70 rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl backdrop-blur-xl">
      <div className="bg-slate-800/40 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
            {title}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="text-slate-400">
            Est: <b className="text-slate-200">${data.totalEstimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</b>
          </span>
          <span className="text-slate-400">
            Real: <b className={isIncome ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>${data.totalReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</b>
          </span>

          <span
            className={`px-3 py-1 rounded-xl text-[11px] font-black border ${
              isIncome
                ? isIncomeBehind
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : isOverBudget
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-mono animate-pulse'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isIncome
              ? isIncomeBehind
                ? `Faltan $${Math.abs(diffTotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                : `+ $${diffTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} Extra`
              : isOverBudget
              ? `Excedido por $${Math.abs(diffTotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
              : `Disponible: $${diffTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          </span>
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
                <th className="px-6 py-3 text-right">Estado / Diferencia</th>
                {editable && <th className="px-6 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs font-semibold">
              {data.items.map((item: any) => {
                const itemDiff = isIncome
                  ? item.real - item.estimated
                  : item.estimated - item.real

                const isItemOver = !isIncome && itemDiff < 0
                const isItemShort = isIncome && itemDiff < 0

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-white">{item.name}</td>
                    <td className="px-6 py-3.5 text-right font-mono text-slate-300">
                      ${item.estimated.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-black text-slate-100">
                      ${item.real.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-bold">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[11px] ${
                          isIncome
                            ? isItemShort
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-emerald-400 bg-emerald-500/10'
                            : isItemOver
                            ? 'text-rose-400 bg-rose-500/10'
                            : 'text-emerald-400 bg-emerald-500/10'
                        }`}
                      >
                        {isIncome
                          ? isItemShort
                            ? `-$${Math.abs(itemDiff).toLocaleString('es-MX', { minimumFractionDigits: 2 })} (Faltante)`
                            : `+$${itemDiff.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (Meta alcanzada)`
                          : isItemOver
                          ? `-$${Math.abs(itemDiff).toLocaleString('es-MX', { minimumFractionDigits: 2 })} (Excedido)`
                          : `+$${itemDiff.toLocaleString('es-MX', { minimumFractionDigits: 2 })} (Disponible)`}
                      </span>
                    </td>
                    {editable && (
                      <td className="px-6 py-3.5 text-right">
                        <ItemRowActions item={item} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

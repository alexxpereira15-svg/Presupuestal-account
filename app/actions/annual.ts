'use server'

import { prisma } from '../../lib/prisma'

export async function getAnnualSummary(userId: string, year: number) {
  // Obtiene todos los presupuestos del año especificado
  const budgets = await prisma.monthlyBudget.findMany({
    where: {
      userId,
      year,
    },
    include: {
      items: true,
      transactions: true,
    },
    orderBy: { month: 'asc' },
  })

  let totalIncomeEstimated = 0
  let totalIncomeReal = 0
  let totalExpenseEstimated = 0
  let totalExpenseReal = 0
  let totalSavingsEstimated = 0
  let totalSavingsReal = 0

  const monthlyBreakdown = budgets.map((b) => {
    const items = b.items || []
    const transactions = b.transactions || []

    // Ingresos
    const incEstimated = items
      .filter((i) => i.type === 'INCOME')
      .reduce((sum, i) => sum + Number(i.estimatedAmount), 0)
    
    const incReal = transactions
      .filter((t) => items.find((i) => i.id === t.budgetItemId)?.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Gastos
    const expEstimated = items
      .filter((i) => i.type !== 'INCOME' && i.type !== 'SAVING_INVESTMENT')
      .reduce((sum, i) => sum + Number(i.estimatedAmount), 0)
    
    const expReal = transactions
      .filter((t) => {
        const itemType = items.find((i) => i.id === t.budgetItemId)?.type
        return itemType !== 'INCOME' && itemType !== 'SAVING_INVESTMENT'
      })
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Ahorros
    const savEstimated = items
      .filter((i) => i.type === 'SAVING_INVESTMENT')
      .reduce((sum, i) => sum + Number(i.estimatedAmount), 0)
    
    const savReal = transactions
      .filter((t) => items.find((i) => i.id === t.budgetItemId)?.type === 'SAVING_INVESTMENT')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Acumular a totales anuales
    totalIncomeEstimated += incEstimated
    totalIncomeReal += incReal
    totalExpenseEstimated += expEstimated
    totalExpenseReal += expReal
    totalSavingsEstimated += savEstimated
    totalSavingsReal += savReal

    return {
      month: b.month,
      incEstimated,
      incReal,
      expEstimated,
      expReal,
      savEstimated,
      savReal,
    }
  })

  return {
    year,
    totalIncomeEstimated,
    totalIncomeReal,
    totalExpenseEstimated,
    totalExpenseReal,
    totalSavingsEstimated,
    totalSavingsReal,
    monthlyBreakdown,
  }
}

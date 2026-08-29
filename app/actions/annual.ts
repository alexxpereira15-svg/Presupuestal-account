'use server'

import { prisma } from '../../lib/prisma'

export async function getAnnualSummary(userId: string, year: number) {
  const budgets = await prisma.monthlyBudget.findMany({
    where: { userId, year },
    include: {
      items: true,
      transactions: true,
    },
    orderBy: { month: 'asc' },
  })

  let totalIncomeEstimated = 0
  let totalIncomeReal = 0

  let totalFixedEstimated = 0
  let totalFixedReal = 0

  let totalDebtsEstimated = 0
  let totalDebtsReal = 0

  let totalVariableEstimated = 0
  let totalVariableReal = 0

  let totalSavingsEstimated = 0
  let totalSavingsReal = 0

  // Asegurar los 12 meses
  const monthlyMap: { [key: number]: any } = {}

  budgets.forEach((b) => {
    const items = b.items || []
    const transactions = b.transactions || []

    const incEst = items.filter((i) => i.type === 'INCOME').reduce((s, i) => s + Number(i.estimatedAmount), 0)
    const incReal = transactions.filter((t) => items.find((i) => i.id === t.budgetItemId)?.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)

    const fixedEst = items.filter((i) => i.type === 'FIXED_EXPENSE').reduce((s, i) => s + Number(i.estimatedAmount), 0)
    const fixedReal = transactions.filter((t) => items.find((i) => i.id === t.budgetItemId)?.type === 'FIXED_EXPENSE').reduce((s, t) => s + Number(t.amount), 0)

    const debtsEst = items.filter((i) => i.type === 'DEBT').reduce((s, i) => s + Number(i.estimatedAmount), 0)
    const debtsReal = transactions.filter((t) => items.find((i) => i.id === t.budgetItemId)?.type === 'DEBT').reduce((s, t) => s + Number(t.amount), 0)

    const varEst = items.filter((i) => i.type === 'VARIABLE_EXPENSE').reduce((s, i) => s + Number(i.estimatedAmount), 0)
    const varReal = transactions.filter((t) => items.find((i) => i.id === t.budgetItemId)?.type === 'VARIABLE_EXPENSE').reduce((s, t) => s + Number(t.amount), 0)

    const savEst = items.filter((i) => i.type === 'SAVING_INVESTMENT').reduce((s, i) => s + Number(i.estimatedAmount), 0)
    const savReal = transactions.filter((t) => items.find((i) => i.id === t.budgetItemId)?.type === 'SAVING_INVESTMENT').reduce((s, t) => s + Number(t.amount), 0)

    totalIncomeEstimated += incEst
    totalIncomeReal += incReal

    totalFixedEstimated += fixedEst
    totalFixedReal += fixedReal

    totalDebtsEstimated += debtsEst
    totalDebtsReal += debtsReal

    totalVariableEstimated += varEst
    totalVariableReal += varReal

    totalSavingsEstimated += savEst
    totalSavingsReal += savReal

    monthlyMap[b.month] = {
      month: b.month,
      incEstimated: incEst,
      incReal,
      fixedEstimated: fixedEst,
      fixedReal,
      debtsEstimated: debtsEst,
      debtsReal,
      variableEstimated: varEst,
      variableReal: varReal,
      savEstimated: savEst,
      savReal,
    }
  })

  const monthlyBreakdown = Array.from({ length: 12 }, (_, index) => {
    const m = index + 1
    return (
      monthlyMap[m] || {
        month: m,
        incEstimated: 0,
        incReal: 0,
        fixedEstimated: 0,
        fixedReal: 0,
        debtsEstimated: 0,
        debtsReal: 0,
        variableEstimated: 0,
        variableReal: 0,
        savEstimated: 0,
        savReal: 0,
      }
    )
  })

  return {
    year,
    totalIncomeEstimated,
    totalIncomeReal,
    totalFixedEstimated,
    totalFixedReal,
    totalDebtsEstimated,
    totalDebtsReal,
    totalVariableEstimated,
    totalVariableReal,
    totalSavingsEstimated,
    totalSavingsReal,
    monthlyBreakdown,
  }
}

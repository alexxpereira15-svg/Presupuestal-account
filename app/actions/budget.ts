'use server'

import { prisma } from '../../lib/prisma'
import { CategoryType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getOrCreateMonthlyBudget(userId: string, year: number, month: number) {
  let budget = await prisma.monthlyBudget.findUnique({
    where: {
      userId_year_month: { userId, year, month },
    },
    include: {
      items: true,
      transactions: {
        include: { budgetItem: true },
        orderBy: { date: 'desc' },
      },
    },
  })

  // Si el presupuesto del mes no existe, lo creamos
  if (!budget) {
    let prevMonth = month - 1
    let prevYear = year
    if (prevMonth < 1) {
      prevMonth = 12
      prevYear -= 1
    }

    const prevBudget = await prisma.monthlyBudget.findUnique({
      where: {
        userId_year_month: { userId, year: prevYear, month: prevMonth },
      },
      include: {
        items: true,
        transactions: { include: { budgetItem: true } },
      },
    })

    let calculatedInitialBalance = 0

    if (prevBudget) {
      const prevTxs = prevBudget.transactions || []

      const prevIncome = prevTxs
        .filter((t: any) => t.budgetItem?.type === 'INCOME')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

      const prevExpense = prevTxs
        .filter((t: any) => t.budgetItem?.type !== 'INCOME')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0)

      calculatedInitialBalance = Number(prevBudget.initialBalance || 0) + prevIncome - prevExpense
    }

    budget = await prisma.monthlyBudget.create({
      data: {
        userId,
        year,
        month,
        initialBalance: calculatedInitialBalance,
        currency: 'MXN',
      },
      include: {
        items: true,
        transactions: { include: { budgetItem: true } },
      },
    })
  }

  // --- 1. CLONADO AUTOMÁTICO DE DEUDAS FIJAS VIGENTES ---
  const activeDebts = await prisma.globalDebt.findMany({
    where: { userId },
  })

  for (const debt of activeDebts) {
    const remaining = Number(debt.totalAmount) - Number(debt.paidAmount)
    const monthlyPayment = Number(debt.monthlyPayment)

    if (remaining > 0 && monthlyPayment > 0) {
      const existingItem = budget.items.find((item) => item.name === debt.creditorName && item.type === 'DEBT')

      if (!existingItem) {
        const newItem = await prisma.budgetItem.create({
          data: {
            budgetId: budget.id,
            name: debt.creditorName,
            type: 'DEBT',
            estimatedAmount: monthlyPayment,
          },
        })
        budget.items.push(newItem)
      }
    }
  }

  // --- 2. CLONADO AUTOMÁTICO DE METAS DE AHORRO VIGENTES ---
  const activeGoals = await prisma.savingGoal.findMany({
    where: { userId },
  })

  for (const goal of activeGoals) {
    const remaining = Number(goal.targetAmount) - Number(goal.savedAmount)
    let monthlyEstimate = Number(goal.periodAmount)
    if (goal.frequency === 'FORTNIGHTLY') monthlyEstimate = monthlyEstimate * 2
    if (goal.frequency === 'WEEKLY') monthlyEstimate = monthlyEstimate * 4

    if (remaining > 0 && monthlyEstimate > 0) {
      const existingItem = budget.items.find((item) => item.name === goal.title && item.type === 'SAVING_INVESTMENT')

      if (!existingItem) {
        const newItem = await prisma.budgetItem.create({
          data: {
            budgetId: budget.id,
            name: goal.title,
            type: 'SAVING_INVESTMENT',
            estimatedAmount: monthlyEstimate,
          },
        })
        budget.items.push(newItem)
      }
    }
  }

  return budget
}

export async function addBudgetItem(data: {
  budgetId: string
  name: string
  type: CategoryType
  estimatedAmount: number
}) {
  const item = await prisma.budgetItem.create({
    data: {
      budgetId: data.budgetId,
      name: data.name,
      type: data.type,
      estimatedAmount: data.estimatedAmount,
    },
  })
  revalidatePath('/')
  return item
}

export async function updateBudgetItem(id: string, data: { name: string; type: CategoryType; estimatedAmount: number }) {
  const updated = await prisma.budgetItem.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      estimatedAmount: data.estimatedAmount,
    },
  })
  revalidatePath('/')
  return updated
}

export async function deleteBudgetItem(id: string) {
  const deleted = await prisma.budgetItem.delete({
    where: { id },
  })
  revalidatePath('/')
  return deleted
}

export async function updateInitialBalance(budgetId: string, amount: number) {
  const updated = await prisma.monthlyBudget.update({
    where: { id: budgetId },
    data: { initialBalance: amount },
  })
  revalidatePath('/')
  return updated
}

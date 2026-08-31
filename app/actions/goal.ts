'use server'

import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSavingGoals(userId: string) {
  return await prisma.savingGoal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createSavingGoal(data: {
  userId: string
  title: string
  targetAmount: number
  savedAmount?: number
  periodAmount: number
  frequency: 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY'
  currentBudgetId?: string
}) {
  const goal = await prisma.savingGoal.create({
    data: {
      userId: data.userId,
      title: data.title,
      targetAmount: data.targetAmount,
      savedAmount: data.savedAmount || 0,
      periodAmount: data.periodAmount,
      frequency: data.frequency,
    },
  })

  // Calcular impacto mensual estimado según frecuencia
  let monthlyEstimate = data.periodAmount
  if (data.frequency === 'FORTNIGHTLY') monthlyEstimate = data.periodAmount * 2
  if (data.frequency === 'WEEKLY') monthlyEstimate = data.periodAmount * 4

  // Si tenemos el presupuesto abierto, sincronizamos con la categoría SAVING_INVESTMENT
  if (data.currentBudgetId && monthlyEstimate > 0) {
    const existingItem = await prisma.budgetItem.findFirst({
      where: {
        budgetId: data.currentBudgetId,
        name: data.title,
        type: 'SAVING_INVESTMENT',
      },
    })

    if (!existingItem) {
      await prisma.budgetItem.create({
        data: {
          budgetId: data.currentBudgetId,
          name: data.title,
          type: 'SAVING_INVESTMENT',
          estimatedAmount: monthlyEstimate,
        },
      })
    }
  }

  revalidatePath('/')
  return goal
}

export async function updateSavingGoal(id: string, data: {
  title: string
  targetAmount: number
  savedAmount: number
  periodAmount: number
  frequency: 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY'
}) {
  const updated = await prisma.savingGoal.update({
    where: { id },
    data: {
      title: data.title,
      targetAmount: data.targetAmount,
      savedAmount: data.savedAmount,
      periodAmount: data.periodAmount,
      frequency: data.frequency,
    },
  })
  revalidatePath('/')
  return updated
}

export async function addContributionToGoal(goalId: string, amount: number, budgetId?: string) {
  const goal = await prisma.savingGoal.findUnique({ where: { id: goalId } })
  if (!goal) throw new Error('Meta no encontrada')

  const newSavedAmount = Number(goal.savedAmount) + amount

  const updatedGoal = await prisma.savingGoal.update({
    where: { id: goalId },
    data: { savedAmount: newSavedAmount },
  })

  // Vincular con la bitácora de movimientos reales en la categoría de Ahorro / Inversión
  if (budgetId) {
    const budgetItem = await prisma.budgetItem.findFirst({
      where: {
        budgetId,
        name: goal.title,
        type: 'SAVING_INVESTMENT',
      },
    })

    await prisma.transaction.create({
      data: {
        budgetId,
        budgetItemId: budgetItem ? budgetItem.id : null,
        amount,
        description: `Abono a Meta: ${goal.title}`,
        date: new Date(),
      },
    })
  }

  revalidatePath('/')
  return updatedGoal
}

export async function deleteSavingGoal(id: string) {
  const deleted = await prisma.savingGoal.delete({
    where: { id },
  })
  revalidatePath('/')
  return deleted
}

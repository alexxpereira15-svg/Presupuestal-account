'use server'

import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getGlobalDebts(userId: string) {
  return await prisma.globalDebt.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createGlobalDebt(data: {
  userId: string
  creditorName: string
  totalAmount: number
  paidAmount?: number
  monthlyPayment: number
  paymentType: 'FIXED' | 'VARIABLE'
  currentBudgetId?: string
}) {
  const debt = await prisma.globalDebt.create({
    data: {
      userId: data.userId,
      creditorName: data.creditorName,
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount || 0,
      monthlyPayment: data.monthlyPayment,
      paymentType: data.paymentType,
    },
  })

  // Sincronizar con el presupuesto mensual si está abierto
  if (data.currentBudgetId && data.monthlyPayment > 0) {
    const existingItem = await prisma.budgetItem.findFirst({
      where: {
        budgetId: data.currentBudgetId,
        name: data.creditorName,
        type: 'DEBT',
      },
    })

    if (!existingItem) {
      await prisma.budgetItem.create({
        data: {
          budgetId: data.currentBudgetId,
          name: data.creditorName,
          type: 'DEBT',
          estimatedAmount: data.monthlyPayment,
        },
      })
    }
  }

  revalidatePath('/')
  return debt
}

// Editar Deuda Global
export async function updateGlobalDebt(id: string, data: {
  creditorName: string
  totalAmount: number
  paidAmount: number
  monthlyPayment: number
  paymentType: 'FIXED' | 'VARIABLE'
}) {
  const updated = await prisma.globalDebt.update({
    where: { id },
    data: {
      creditorName: data.creditorName,
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount,
      monthlyPayment: data.monthlyPayment,
      paymentType: data.paymentType,
    },
  })
  revalidatePath('/')
  return updated
}

export async function addPaymentToDebt(debtId: string, amount: number, budgetId?: string) {
  const debt = await prisma.globalDebt.findUnique({ where: { id: debtId } })
  if (!debt) throw new Error('Deuda no encontrada')

  const newPaidAmount = Number(debt.paidAmount) + amount

  const updatedDebt = await prisma.globalDebt.update({
    where: { id: debtId },
    data: { paidAmount: newPaidAmount },
  })

  if (budgetId) {
    const budgetItem = await prisma.budgetItem.findFirst({
      where: {
        budgetId,
        name: debt.creditorName,
        type: 'DEBT',
      },
    })

    await prisma.transaction.create({
      data: {
        budgetId,
        budgetItemId: budgetItem ? budgetItem.id : null,
        amount,
        description: `Abono a Deuda: ${debt.creditorName}`,
        date: new Date(),
      },
    })
  }

  revalidatePath('/')
  return updatedDebt
}

export async function deleteGlobalDebt(id: string) {
  const deleted = await prisma.globalDebt.delete({
    where: { id },
  })
  revalidatePath('/')
  return deleted
}

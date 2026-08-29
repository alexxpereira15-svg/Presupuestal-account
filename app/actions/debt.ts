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
}) {
  const debt = await prisma.globalDebt.create({
    data: {
      userId: data.userId,
      creditorName: data.creditorName,
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount || 0,
    },
  })
  revalidatePath('/')
  return debt
}

export async function addPaymentToDebt(debtId: string, amount: number, budgetId?: string) {
  const debt = await prisma.globalDebt.findUnique({ where: { id: debtId } })
  if (!debt) throw new Error('Deuda no encontrada')

  const newPaidAmount = Number(debt.paidAmount) + amount

  const updatedDebt = await prisma.globalDebt.update({
    where: { id: debtId },
    data: { paidAmount: newPaidAmount },
  })

  // Si se proporciona el presupuesto mensual, vinculamos el abono a la bitácora de movimientos reales
  if (budgetId) {
    await prisma.transaction.create({
      data: {
        budgetId,
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

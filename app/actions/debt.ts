'use server'

import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

// Obtiene todas las deudas globales del usuario
export async function getGlobalDebts(userId: string) {
  return await prisma.globalDebt.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

// Crea una nueva deuda global
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

// Registra un abono/pago a una deuda global existente
export async function addPaymentToDebt(id: string, paymentAmount: number) {
  const debt = await prisma.globalDebt.findUnique({ where: { id } })
  if (!debt) throw new Error('Deuda no encontrada')

  const newPaidAmount = Number(debt.paidAmount) + paymentAmount

  const updated = await prisma.globalDebt.update({
    where: { id },
    data: { paidAmount: newPaidAmount },
  })
  revalidatePath('/')
  return updated
}

// Elimina un registro de deuda global
export async function deleteGlobalDebt(id: string) {
  const deleted = await prisma.globalDebt.delete({ where: { id } })
  revalidatePath('/')
  return deleted
}

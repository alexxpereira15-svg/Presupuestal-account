'use server'

import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

// Registra una transacción (gasto o ingreso real)
export async function createTransaction(data: {
  budgetId: string
  budgetItemId?: string
  amount: number
  description?: string
  date?: Date
}) {
  const transaction = await prisma.transaction.create({
    data: {
      budgetId: data.budgetId,
      budgetItemId: data.budgetItemId || null,
      amount: data.amount,
      description: data.description || '',
      date: data.date || new Date(),
    },
  })

  revalidatePath('/')
  return transaction
}

// Elimina una transacción grabada
export async function deleteTransaction(id: string) {
  const deleted = await prisma.transaction.delete({
    where: { id },
  })
  revalidatePath('/')
  return deleted
}

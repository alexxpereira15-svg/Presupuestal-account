'use server'

import { prisma } from '../../lib/prisma'
import { CategoryType } from '@prisma/client'

// Obtiene o crea un presupuesto mensual para el usuario
export async function getOrCreateMonthlyBudget(userId: string, year: number, month: number) {
  let budget = await prisma.monthlyBudget.findUnique({
    where: {
      userId_year_month: { userId, year, month },
    },
    include: {
      items: true,
      transactions: {
        include: {
          budgetItem: true,
        },
        orderBy: { date: 'desc' },
      },
    },
  })

  // Si el presupuesto del mes no existe, lo inicializamos
  if (!budget) {
    budget = await prisma.monthlyBudget.create({
      data: {
        userId,
        year,
        month,
        initialBalance: 0,
        currency: 'MXN',
      },
      include: {
        items: true,
        transactions: {
          include: {
            budgetItem: true,
          },
        },
      },
    })
  }

  return budget
}

// Agrega un nuevo rubro estimado (ej. Sueldo, Renta, Liverpool)
export async function addBudgetItem(data: {
  budgetId: string
  name: string
  type: CategoryType
  estimatedAmount: number
}) {
  return await prisma.budgetItem.create({
    data: {
      budgetId: data.budgetId,
      name: data.name,
      type: data.type,
      estimatedAmount: data.estimatedAmount,
    },
  })
}

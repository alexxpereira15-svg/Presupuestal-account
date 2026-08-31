'use server'

import { prisma } from '../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function registerUser(data: { name: string; email: string; password: string }) {
  if (!data.email || !data.password) {
    throw new Error('Correo y contraseña requeridos')
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado')
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  })

  return { id: user.id, email: user.email }
}

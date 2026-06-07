import { prisma } from '../../config/prisma.js'

export async function findAll() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
}
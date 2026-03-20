import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, status: true, paymentMethod: true, paymentStatus: true }
  })
  console.log(orders)
}
main().finally(() => prisma.$disconnect())

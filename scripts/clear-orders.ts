import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Delete all orders. Since OrderItem has onDelete: Cascade, they will be deleted as well.
  // But just to be exceptionally safe and clean, we execute deleteMany on both.
  const deletedItems = await prisma.orderItem.deleteMany({});
  const deletedOrders = await prisma.order.deleteMany({});
  
  console.log(`Successfully deleted ${deletedItems.count} order items and ${deletedOrders.count} orders from the database!`);
}

main()
  .catch(e => {
    console.error("Failed to clear orders:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

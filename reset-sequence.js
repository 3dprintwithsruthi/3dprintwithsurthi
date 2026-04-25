const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    // Find the sequence name for orderNumber column
    const seqResult = await prisma.$queryRawUnsafe(
      `SELECT pg_get_serial_sequence('orders', '"orderNumber"') as seq`
    );
    console.log("Sequence info:", seqResult);
    
    // Reset sequence so next value = 1 (first order gets orderNumber=1 → displays as 3DPS1001)
    await prisma.$queryRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('orders', '"orderNumber"'), 1, false)`
    );
    console.log("✅ Sequence reset! First new order will show as 3DPS1001");
  } catch (e) {
    console.error("Sequence reset failed (non-critical):", e.message);
    console.log("Existing orders will continue from where they are — new orders will get sequential numbers.");
  } finally {
    await prisma.$disconnect();
  }
}

main();

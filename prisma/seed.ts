/**
 * Seed script – Admin and User + sample product
 * Passwords stored directly (no hashing)
 * Run: npx tsx prisma/seed.ts or npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ----------------------------------------
  // Admin user
  // ----------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: "admin@3dprint.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@3dprint.com",
      password: "Admin@123",
      role: "ADMIN",
    },
  });
  console.log("Admin seeded:", admin.email);

  // ----------------------------------------
  // Regular user
  // ----------------------------------------
  const user = await prisma.user.upsert({
    where: { email: "user@3dprint.com" },
    update: {},
    create: {
      name: "Test User",
      email: "user@3dprint.com",
      password: "User@123",
      role: "USER",
    },
  });
  console.log("User seeded:", user.email);

  // ----------------------------------------
  // Sample product with custom fields (e.g. Couple Name Keychain)
  // ----------------------------------------
  const sampleProduct = await prisma.product.upsert({
    where: { id: "seed-product-keychain" },
    update: {},
    create: {
      id: "seed-product-keychain",
      name: "Couple Name Keychain",
      description:
        "Custom 3D printed keychain with two names. Perfect gift for couples.",
      price: 299,
      stock: 50,
      images: [
        "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400",
      ],
      videoUrl: null,
      customFields: [
        { key: "name1", label: "Name 1", type: "text", required: true },
        { key: "name2", label: "Name 2", type: "text", required: true },
        { key: "customMessage", label: "Custom Message (optional)", type: "textarea", required: false },
      ],
    },
  });
  console.log("Sample product seeded:", sampleProduct.name);

  // One more generic product
  await prisma.product.upsert({
    where: { id: "seed-product-coaster" },
    update: {},
    create: {
      id: "seed-product-coaster",
      name: "Custom Name Coaster",
      description: "Personalised coaster with your name.",
      price: 199,
      stock: 100,
      images: [
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400",
      ],
      customFields: [
        { key: "name", label: "Your Name", type: "text", required: true },
      ],
    },
  });
  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

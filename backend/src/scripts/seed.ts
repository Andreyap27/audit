import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../config/database";

async function seed() {
  console.log("🌱 Seeding database...");

  // Admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@company.com" },
    create: {
      username: "admin",
      email: "admin@company.com",
      password: passwordHash,
      role: "ADMIN",
    },
    update: {},
  });
  console.log(`✅ Admin user: ${admin.email}`);
  console.log("\n🎉 Seed complete!");
  console.log("   Login: admin@company.com / admin123");
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

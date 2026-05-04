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

  // Unit types
  await prisma.unitType.upsert({
    where: { code: "NB" },
    create: { code: "NB", name: "Notebook" },
    update: { name: "Notebook" },
  });
  await prisma.unitType.upsert({
    where: { code: "WS" },
    create: { code: "WS", name: "Workstation" },
    update: { name: "Workstation" },
  });
  console.log("✅ Unit types seeded");

  // Departments
  const depts = [
    { code: "IT", name: "Information Technology" },
    { code: "FIN", name: "Finance & Accounting" },
    { code: "HR", name: "Human Resources" },
    { code: "MKT", name: "Marketing" },
    { code: "SAL", name: "Sales" },
    { code: "OPS", name: "Operations" },
    { code: "LEG", name: "Legal" },
    { code: "RND", name: "Research & Development" },
  ];
  for (const dept of depts) {
    await prisma.department.upsert({
      where: { code: dept.code },
      create: dept,
      update: {},
    });
  }
  console.log("✅ Departments seeded");

  // Operating Systems
  await prisma.operatingSystem.createMany({
    data: [
      { name: "Windows 11 OEM", version: "Windows 11", licenseType: "OEM" },
      { name: "Windows 11 OLP", version: "Windows 11", licenseType: "OLP" },
      { name: "Windows 10 OEM", version: "Windows 10", licenseType: "OEM" },
      { name: "Windows 10 OLP", version: "Windows 10", licenseType: "OLP" },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Operating systems seeded");

  // Microsoft Software
  await prisma.microsoftSoftware.createMany({
    data: [
      { type: "OFFICE", version: "2021", licenseType: "OLP" },
      { type: "OFFICE", version: "2019", licenseType: "OLP" },
      { type: "OFFICE", version: "2016", licenseType: "OLP" },
      { type: "OFFICE", version: "365", licenseType: "SUBSCRIPTION" },
      { type: "VISIO", version: "2021", licenseType: "OLP" },
      { type: "VISIO", version: "2019", licenseType: "OLP" },
      { type: "PROJECT", version: "2021", licenseType: "OLP" },
      { type: "PROJECT", version: "2019", licenseType: "OLP" },
      { type: "ACCESS", version: "2021", licenseType: "OLP" },
      { type: "ACCESS", version: "2019", licenseType: "OLP" },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Microsoft software seeded");

  console.log("\n🎉 Seed complete!");
  console.log("   Login: admin@company.com / admin123");
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

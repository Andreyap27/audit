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
    update: {},
  });
  await prisma.unitType.upsert({
    where: { code: "WS" },
    create: { code: "WS", name: "Workstation" },
    update: {},
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
  const osList = [
    { name: "Windows 11 OEM", version: "11", licenseType: "OEM" },
    { name: "Windows 11 OLP", version: "11", licenseType: "OLP" },
    { name: "Windows 10 OEM", version: "10", licenseType: "OEM" },
    { name: "Windows 10 OLP", version: "10", licenseType: "OLP" },
  ];
  for (const os of osList) {
    await prisma.operatingSystem.upsert({
      where: { name: os.name },
      create: os,
      update: {},
    });
  }
  console.log("✅ Operating systems seeded");

  // Microsoft Software
  const msSoftware = [
    { type: "OFFICE" as const, version: "2021", licenseType: "OLP" },
    { type: "OFFICE" as const, version: "2019", licenseType: "OLP" },
    { type: "OFFICE" as const, version: "2016", licenseType: "OLP" },
    { type: "OFFICE" as const, version: "365", licenseType: "Subscription" },
    { type: "VISIO" as const, version: "2021", licenseType: "OLP" },
    { type: "VISIO" as const, version: "2019", licenseType: "OLP" },
    { type: "PROJECT" as const, version: "2021", licenseType: "OLP" },
    { type: "PROJECT" as const, version: "2019", licenseType: "OLP" },
    { type: "ACCESS" as const, version: "2021", licenseType: "OLP" },
    { type: "ACCESS" as const, version: "2019", licenseType: "OLP" },
  ];
  for (const ms of msSoftware) {
    await prisma.microsoftSoftware.upsert({
      where: { type_version_licenseType: ms },
      create: ms,
      update: {},
    });
  }
  console.log("✅ Microsoft software seeded");

  console.log("\n🎉 Seed complete!");
  console.log("   Login: admin@company.com / admin123");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

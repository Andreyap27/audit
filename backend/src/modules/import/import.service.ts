import ExcelJS from "exceljs";
import prisma from "../../config/database";

interface ImportResults {
  success: number;
  failed: number;
  errors: string[];
}

const parseLicense = (
  raw: string | undefined,
): { licenseType: string; version: string } | null => {
  if (!raw || raw.trim() === "" || raw.trim() === "-") return null;
  // Format: "OEM (11)" or "OLP (2013)" or "OEM(10)"
  const match = raw.trim().match(/^(\w+)\s*\(([^)]+)\)$/);
  if (!match) return null;
  return { licenseType: match[1].toUpperCase(), version: match[2].trim() };
};

const getMicrosoftId = async (
  type: "OFFICE" | "VISIO" | "PROJECT" | "ACCESS",
  raw: string | undefined,
) => {
  const parsed = parseLicense(raw);
  if (!parsed) return undefined;

  const ms = await prisma.microsoftSoftware.upsert({
    where: {
      type_version_licenseType: {
        type,
        version: parsed.version,
        licenseType: parsed.licenseType,
      },
    },
    create: { type, version: parsed.version, licenseType: parsed.licenseType },
    update: {},
  });
  return ms.id;
};

const getOsId = async (raw: string | undefined) => {
  const parsed = parseLicense(raw);
  if (!parsed) return undefined;

  const name = `Windows ${parsed.version} ${parsed.licenseType}`;
  const os = await prisma.operatingSystem.upsert({
    where: { name },
    create: { name, version: parsed.version, licenseType: parsed.licenseType },
    update: {},
  });
  return os.id;
};

export const importFromExcel = async (
  buffer: Buffer,
  userId: string,
): Promise<ImportResults> => {
  const workbook = new ExcelJS.Workbook();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);

  const results: ImportResults = { success: 0, failed: 0, errors: [] };

  for (const worksheet of workbook.worksheets) {
    const deptCode = worksheet.name.trim().toUpperCase();
    if (!deptCode) continue;

    let dept = await prisma.department.findFirst({ where: { code: deptCode } });
    if (!dept) {
      dept = await prisma.department.create({
        data: { code: deptCode, name: deptCode },
      });
    }

    const rows: ExcelJS.Row[] = [];
    worksheet.eachRow((row, rowNum) => {
      if (rowNum > 1) rows.push(row);
    });

    for (const row of rows) {
      const serialNumber = row.getCell(2).text?.trim();
      if (!serialNumber) continue;

      const unitTypeCode = row.getCell(3).text?.trim().toUpperCase() || "NB";
      const userName = row.getCell(4).text?.trim() || undefined;
      const windowsRaw = row.getCell(6).text?.trim() || undefined;
      const officeRaw = row.getCell(7).text?.trim() || undefined;
      const visioRaw = row.getCell(8).text?.trim() || undefined;
      const projectRaw = row.getCell(9).text?.trim() || undefined;
      const accessRaw = row.getCell(10).text?.trim() || undefined;

      try {
        let unitType = await prisma.unitType.findFirst({
          where: { code: unitTypeCode },
        });
        if (!unitType) {
          const name =
            unitTypeCode === "NB"
              ? "Notebook"
              : unitTypeCode === "WS"
                ? "Workstation"
                : unitTypeCode;
          unitType = await prisma.unitType.create({
            data: { code: unitTypeCode, name },
          });
        }

        const [osId, officeId, visioId, projectId, accessId] =
          await Promise.all([
            getOsId(windowsRaw),
            getMicrosoftId("OFFICE", officeRaw),
            getMicrosoftId("VISIO", visioRaw),
            getMicrosoftId("PROJECT", projectRaw),
            getMicrosoftId("ACCESS", accessRaw),
          ]);

        await prisma.device.upsert({
          where: { serialNumber },
          create: {
            serialNumber,
            userName,
            departmentId: dept.id,
            unitTypeId: unitType.id,
            operatingSystemId: osId,
            officeId,
            visioId,
            projectId,
            accessId,
          },
          update: {
            userName,
            departmentId: dept.id,
            unitTypeId: unitType.id,
            operatingSystemId: osId,
            officeId,
            visioId,
            projectId,
            accessId,
          },
        });

        await prisma.auditLog.create({
          data: {
            action: "IMPORT",
            tableName: "devices",
            newData: { serialNumber, deptCode },
            userId,
          },
        });

        results.success++;
      } catch (err: unknown) {
        results.failed++;
        const message = err instanceof Error ? err.message : String(err);
        results.errors.push(`${serialNumber}: ${message}`);
      }
    }
  }

  return results;
};

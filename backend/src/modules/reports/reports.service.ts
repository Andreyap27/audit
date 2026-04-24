import prisma from "../../config/database";
import ExcelJS from "exceljs";

export const getSummaryStats = async () => {
  const [
    totalDevices,
    totalNB,
    totalWS,
    byDepartment,
    byOffice,
    byOs,
    recentActivity,
  ] = await Promise.all([
    prisma.device.count({ where: { isActive: true } }),
    prisma.device.count({
      where: { isActive: true, unitType: { code: "NB" } },
    }),
    prisma.device.count({
      where: { isActive: true, unitType: { code: "WS" } },
    }),
    prisma.department.findMany({
      include: { _count: { select: { devices: true } } },
      orderBy: { code: "asc" },
    }),
    prisma.microsoftSoftware.findMany({
      where: { type: "OFFICE", isActive: true },
      include: { _count: { select: { officeDevices: true } } },
    }),
    prisma.operatingSystem.findMany({
      where: { isActive: true },
      include: { _count: { select: { devices: true } } },
    }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true } } },
    }),
  ]);

  return {
    totalDevices,
    totalNB,
    totalWS,
    byDepartment: byDepartment.map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      count: d._count.devices,
    })),
    byOffice: byOffice.map((o) => ({
      id: o.id,
      version: o.version,
      licenseType: o.licenseType,
      count: o._count.officeDevices,
    })),
    byOs: byOs.map((o) => ({
      id: o.id,
      name: o.name,
      version: o.version,
      licenseType: o.licenseType,
      count: o._count.devices,
    })),
    recentActivity,
  };
};

export const getDepartmentReport = async () => {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });

  const rows = await Promise.all(
    departments.map(async (dept) => {
      const [total, nb, ws, office, visio, project, access] = await Promise.all(
        [
          prisma.device.count({
            where: { isActive: true, departmentId: dept.id },
          }),
          prisma.device.count({
            where: {
              isActive: true,
              departmentId: dept.id,
              unitType: { code: "NB" },
            },
          }),
          prisma.device.count({
            where: {
              isActive: true,
              departmentId: dept.id,
              unitType: { code: "WS" },
            },
          }),
          prisma.device.count({
            where: {
              isActive: true,
              departmentId: dept.id,
              officeId: { not: null },
            },
          }),
          prisma.device.count({
            where: {
              isActive: true,
              departmentId: dept.id,
              visioId: { not: null },
            },
          }),
          prisma.device.count({
            where: {
              isActive: true,
              departmentId: dept.id,
              projectId: { not: null },
            },
          }),
          prisma.device.count({
            where: {
              isActive: true,
              departmentId: dept.id,
              accessId: { not: null },
            },
          }),
        ],
      );
      return {
        dept: dept.code,
        deptName: dept.name,
        total,
        nb,
        ws,
        office,
        visio,
        project,
        access,
      };
    }),
  );

  return rows;
};

export const getSoftwareReport = async (
  type: "OFFICE" | "VISIO" | "PROJECT" | "ACCESS" | "OS",
) => {
  if (type === "OS") {
    return prisma.operatingSystem.findMany({
      where: { isActive: true },
      include: { _count: { select: { devices: true } } },
      orderBy: [{ version: "desc" }, { licenseType: "asc" }],
    });
  }

  const typeMap = {
    OFFICE: { rel: "officeDevices" as const, field: "officeId" },
    VISIO: { rel: "visioDevices" as const, field: "visioId" },
    PROJECT: { rel: "projectDevices" as const, field: "projectId" },
    ACCESS: { rel: "accessDevices" as const, field: "accessId" },
  };

  const { rel } = typeMap[type];

  return prisma.microsoftSoftware.findMany({
    where: { type, isActive: true },
    include: { _count: { select: { [rel]: true } } },
    orderBy: [{ version: "desc" }, { licenseType: "asc" }],
  });
};

export const getAuditLog = async (params: {
  action?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
}) => {
  const { action, userId, dateFrom, dateTo, page, limit } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    };
  }

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, username: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const exportToExcel = async (filters: { departmentId?: string }) => {
  const where: Record<string, unknown> = { isActive: true };
  if (filters.departmentId) where.departmentId = filters.departmentId;

  const devices = await prisma.device.findMany({
    where,
    include: {
      department: true,
      unitType: true,
      operatingSystem: true,
      office: true,
      visio: true,
      project: true,
      access: true,
    },
    orderBy: [{ department: { code: "asc" } }, { serialNumber: "asc" }],
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "IT Audit System";
  workbook.created = new Date();

  // Group devices by department
  const byDept = new Map<string, typeof devices>();
  for (const device of devices) {
    const code = device.department.code;
    if (!byDept.has(code)) byDept.set(code, []);
    byDept.get(code)!.push(device);
  }

  for (const [deptCode, deptDevices] of byDept) {
    const sheet = workbook.addWorksheet(deptCode);

    sheet.columns = [
      { header: "No.", key: "no", width: 5 },
      { header: "Serial Number", key: "serial", width: 22 },
      { header: "NB/WS", key: "type", width: 8 },
      { header: "User", key: "user", width: 28 },
      { header: "Dept.", key: "dept", width: 10 },
      { header: "Windows", key: "windows", width: 18 },
      { header: "Office", key: "office", width: 18 },
      { header: "Visio", key: "visio", width: 18 },
      { header: "Project", key: "project", width: 18 },
      { header: "Access", key: "access", width: 18 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD9E1F2" },
    };

    deptDevices.forEach((d, i) => {
      sheet.addRow({
        no: i + 1,
        serial: d.serialNumber,
        type: d.unitType.code,
        user: d.userName || "",
        dept: d.department.code,
        windows: d.operatingSystem
          ? `${d.operatingSystem.licenseType} (${d.operatingSystem.version})`
          : "",
        office: d.office ? `${d.office.licenseType} (${d.office.version})` : "",
        visio: d.visio ? `${d.visio.licenseType} (${d.visio.version})` : "",
        project: d.project
          ? `${d.project.licenseType} (${d.project.version})`
          : "",
        access: d.access ? `${d.access.licenseType} (${d.access.version})` : "",
      });
    });
  }

  return workbook.xlsx.writeBuffer();
};

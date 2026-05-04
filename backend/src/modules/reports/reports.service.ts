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
      include: {
        _count: { select: { devices: { where: { isActive: true } } } },
      },
      orderBy: { code: "asc" },
    }),
    prisma.microsoftSoftware.findMany({
      where: { type: "OFFICE", isActive: true },
      include: {
        _count: { select: { officeDevices: { where: { isActive: true } } } },
      },
    }),
    prisma.operatingSystem.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { devices: { where: { isActive: true } } } },
      },
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
    byOffice: Object.values(
      byOffice.reduce(
        (acc, o) => {
          const key = `${o.version} ${o.licenseType}`;
          if (!acc[key]) acc[key] = { version: o.version, licenseType: o.licenseType, count: 0 };
          acc[key].count += o._count.officeDevices;
          return acc;
        },
        {} as Record<string, { version: string; licenseType: string; count: number }>,
      ),
    ),
    byOs: Object.values(
      byOs.reduce(
        (acc, o) => {
          const key = `${o.version} ${o.licenseType}`;
          if (!acc[key]) acc[key] = { version: o.version, licenseType: o.licenseType, count: 0 };
          acc[key].count += o._count.devices;
          return acc;
        },
        {} as Record<string, { version: string; licenseType: string; count: number }>,
      ),
    ),
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
    const rows = await prisma.operatingSystem.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { devices: { where: { isActive: true } } } },
      },
      orderBy: [{ version: "desc" }, { licenseType: "asc" }],
    });
    const total = rows.reduce((s, r) => s + r._count.devices, 0);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      version: r.version,
      licenseType: r.licenseType,
      count: r._count.devices,
      percentage: total > 0 ? (r._count.devices / total) * 100 : 0,
    }));
  }

  const typeMap = {
    OFFICE: { rel: "officeDevices" as const },
    VISIO: { rel: "visioDevices" as const },
    PROJECT: { rel: "projectDevices" as const },
    ACCESS: { rel: "accessDevices" as const },
  };

  const { rel } = typeMap[type];

  const rows = await prisma.microsoftSoftware.findMany({
    where: { type, isActive: true },
    include: {
      _count: { select: { [rel]: { where: { isActive: true } } } },
    },
    orderBy: [{ version: "desc" }, { licenseType: "asc" }],
  });
  const total = rows.reduce((s, r) => s + (r._count as Record<string, number>)[rel], 0);
  return rows.map((r) => ({
    id: r.id,
    version: r.version,
    licenseType: r.licenseType,
    count: (r._count as Record<string, number>)[rel],
    percentage: total > 0 ? ((r._count as Record<string, number>)[rel] / total) * 100 : 0,
  }));
};

export const getLoanReport = async (params: {
  status?: "BORROWED" | "RETURNED";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page: number;
  limit: number;
}) => {
  const { status, dateFrom, dateTo, search, page, limit } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.borrowedAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) } : {}),
    };
  }
  if (search) {
    where.OR = [
      { borrowerName: { contains: search, mode: "insensitive" } },
      { device: { serialNumber: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [data, total, totalBorrowed, totalReturned] = await Promise.all([
    prisma.deviceLoan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { borrowedAt: "desc" },
      include: { device: { include: { department: true, unitType: true } } },
    }),
    prisma.deviceLoan.count({ where }),
    prisma.deviceLoan.count({ where: { ...where, status: "BORROWED" } }),
    prisma.deviceLoan.count({ where: { ...where, status: "RETURNED" } }),
  ]);

  return {
    data,
    total,
    totalBorrowed,
    totalReturned,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const exportLoanReport = async (params: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  const where: Record<string, unknown> = {};
  if (params.status && ["BORROWED", "RETURNED"].includes(params.status)) {
    where.status = params.status;
  }
  if (params.dateFrom || params.dateTo) {
    where.borrowedAt = {
      ...(params.dateFrom ? { gte: new Date(params.dateFrom) } : {}),
      ...(params.dateTo
        ? { lte: new Date(new Date(params.dateTo).setHours(23, 59, 59, 999)) }
        : {}),
    };
  }

  const loans = await prisma.deviceLoan.findMany({
    where,
    orderBy: { borrowedAt: "desc" },
    include: { device: { include: { department: true, unitType: true } } },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "IT Audit System";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Laporan Peminjaman");
  sheet.columns = [
    { header: "No.", key: "no", width: 5 },
    { header: "Serial Number", key: "serial", width: 22 },
    { header: "Jenis", key: "type", width: 8 },
    { header: "Departemen", key: "dept", width: 20 },
    { header: "Peminjam", key: "borrower", width: 28 },
    { header: "Tgl. Pinjam", key: "borrowedAt", width: 20 },
    { header: "Tgl. Kembali", key: "returnedAt", width: 20 },
    { header: "Durasi (hari)", key: "duration", width: 14 },
    { header: "Status", key: "status", width: 14 },
    { header: "Catatan", key: "note", width: 30 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9E1F2" },
  };

  loans.forEach((l, i) => {
    const duration =
      l.returnedAt
        ? Math.ceil(
            (l.returnedAt.getTime() - l.borrowedAt.getTime()) / 86_400_000,
          )
        : null;

    sheet.addRow({
      no: i + 1,
      serial: l.device?.serialNumber ?? "-",
      type: l.device?.unitType?.code ?? "-",
      dept: l.device?.department?.name ?? "-",
      borrower: l.borrowerName,
      borrowedAt: l.borrowedAt.toLocaleString("id-ID"),
      returnedAt: l.returnedAt ? l.returnedAt.toLocaleString("id-ID") : "-",
      duration: duration ?? "-",
      status: l.status === "BORROWED" ? "Dipinjam" : "Dikembalikan",
      note: l.note ?? "-",
    });
  });

  return workbook.xlsx.writeBuffer();
};

export const getAuditLog = async (params: {
  action?: string;
  userId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
}) => {
  const { action, userId, search, dateFrom, dateTo, page, limit } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (search) {
    where.OR = [
      { tableName: { contains: search, mode: "insensitive" } },
      { recordId: { contains: search, mode: "insensitive" } },
      { user: { username: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) } : {}),
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

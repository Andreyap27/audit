const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const parseOrigins = (raw: string): string[] =>
  raw.split(",").map((s) => s.trim()).filter(Boolean);

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  PORT: parseInt(process.env.PORT || "3001", 10),
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  ALLOWED_ORIGINS: parseOrigins(
    process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || "http://localhost:3000",
  ),
  NODE_ENV: process.env.NODE_ENV || "development",
};

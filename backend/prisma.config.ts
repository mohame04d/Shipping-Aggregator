import { defineConfig } from "prisma/config";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const result = dotenv.config({
  path: fileURLToPath(new URL("./src/config/.env", import.meta.url)),
});

if (result.error) {
  throw result.error;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from src/config/.env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});


import { defineConfig } from "@prisma/prisma7/config";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("./src/config/.env", import.meta.url)),
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
url: process.env.DATABASE_URL!,  },
});
import path from "node:path";
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load .env manually for Prisma CLI
config({ path: path.join(process.cwd(), ".env") });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});

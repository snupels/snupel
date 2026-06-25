import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "mysql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USERNAME ?? "snupel",
    password: process.env.DB_PASSWORD ?? "snupel",
    database: process.env.DB_DATABASE ?? process.env.MYSQL_DATABASE ?? "snupel",
  },
  strict: true,
  verbose: true,
});

import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";

import * as schema from "./schema";

const database = process.env.DB_DATABASE ?? process.env.MYSQL_DATABASE ?? "snupel";
const host = process.env.DB_HOST ?? "127.0.0.1";
const port = Number(process.env.DB_PORT ?? 3306);
const user = process.env.DB_USERNAME ?? "snupel";
const password = process.env.DB_PASSWORD ?? "snupel";

export const pool = createPool({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
});

export const db = drizzle(pool, { schema, mode: "default" });

export type Db = typeof db;

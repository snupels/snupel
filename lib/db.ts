import mysql, { type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

const {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  DB_DATABASE,
} = process.env;

const database = DB_NAME ?? DB_DATABASE;

if (!DB_HOST || !DB_PORT || !DB_USERNAME || !DB_PASSWORD || !database) {
  throw new Error(
    "Missing database environment variables. Set DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, and DB_NAME or DB_DATABASE."
  );
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  timezone: "Z",
});

export async function query<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: unknown[] = []
) {
  const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
  return rows as T[];
}

export async function execute(sql: string, params: unknown[] = []) {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
}

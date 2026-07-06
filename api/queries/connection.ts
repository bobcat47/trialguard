import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL || "mysql://root@localhost:3306/trialguard",
  connectionLimit: 10,
});

export function getDb() {
  return drizzle(pool);
}

export { pool };

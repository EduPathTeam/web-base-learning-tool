import mysql from 'mysql2/promise';
import 'dotenv/config';

// One shared connection pool for the whole server. DB_NAME is intentionally
// omitted here — createDatabaseIfMissing() (in migrate.js) needs a
// database-less connection to run CREATE DATABASE IF NOT EXISTS the first
// time the server starts on a fresh MySQL instance.
export function createPool(withDatabase = true) {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: withDatabase ? process.env.DB_NAME : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
  });
}

export const pool = createPool(true);

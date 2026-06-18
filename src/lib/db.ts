import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "monitoring.db");

let _db: Database.Database | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getDb(): Database.Database {
  if (!_db) {
    ensureDataDir();
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS monitoring_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_key TEXT NOT NULL,
      service_label TEXT NOT NULL,
      service_type TEXT NOT NULL,
      status TEXT NOT NULL,
      is_valid INTEGER NOT NULL,
      message TEXT,
      error_code TEXT,
      response_time REAL NOT NULL,
      http_code INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_logs_service ON monitoring_logs(service_key);
    CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON monitoring_logs(timestamp);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function insertLog(entry: {
  service_key: string;
  service_label: string;
  service_type: string;
  status: string;
  is_valid: boolean;
  message: string;
  error_code: string | null;
  response_time: number;
  http_code: number;
}) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO monitoring_logs (service_key, service_label, service_type, status, is_valid, message, error_code, response_time, http_code)
    VALUES (@service_key, @service_label, @service_type, @status, @is_valid, @message, @error_code, @response_time, @http_code)
  `);
  stmt.run({
    ...entry,
    is_valid: entry.is_valid ? 1 : 0,
  });
}

export function getLogs(filters?: {
  service?: string;
  start?: string;
  end?: string;
  limit?: number;
}) {
  const db = getDb();
  let query = "SELECT * FROM monitoring_logs WHERE 1=1";
  const params: Record<string, unknown> = {};

  if (filters?.service) {
    query += " AND service_key = @service";
    params.service = filters.service;
  }
  if (filters?.start) {
    query += " AND timestamp >= @start";
    params.start = filters.start;
  }
  if (filters?.end) {
    query += " AND timestamp <= @end";
    params.end = filters.end;
  }

  query += " ORDER BY timestamp DESC";

  if (filters?.limit) {
    query += " LIMIT @limit";
    params.limit = filters.limit;
  }

  return db.prepare(query).all(params);
}

export function clearLogs() {
  const db = getDb();
  db.prepare("DELETE FROM monitoring_logs").run();
}

export function getSetting(key: string): string | null {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string) {
  const db = getDb();
  db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
  ).run(key, value);
}

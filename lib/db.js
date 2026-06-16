import Database from 'better-sqlite3';
import path from 'path';
import { migrate } from './migrate';

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

migrate(db);

export default db;

import { sql } from "drizzle-orm";
import { db } from "./db";
import { chatRooms, users, sessionLogs } from "@/drizzle/schema";

async function main() {
  try {
    // Create users table
    const createUsers = sql.raw(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        device_verified INTEGER DEFAULT 0,
        orb_verified INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.run(createUsers);

    // Create chat_rooms table
    const createRooms = sql.raw(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        roomId TEXT PRIMARY KEY,
        createdBy TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        deepLink TEXT NOT NULL,
        active INTEGER DEFAULT 0
      );
    `);
    await db.run(createRooms);

    // Create session_logs table
    const createLogs = sql.raw(`
      CREATE TABLE IF NOT EXISTS session_logs (
        sessionId TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        roomId TEXT NOT NULL,
        joinTime TEXT DEFAULT CURRENT_TIMESTAMP,
        leaveTime TEXT
      );
    `);
    await db.run(createLogs);

    console.log("Database setup complete");
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exit(1);
  }
  process.exit(0);
}

main(); 
import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  device_verified: integer("device_verified", { mode: "boolean" }).default(
    false
  ),
  orb_verified: integer("orb_verified", { mode: "boolean" }).default(false),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// New ChatRoom table (persistent data in Turso)
export const chatRooms = sqliteTable("chat_rooms", {
  // roomId used as primary key; expecting a UUID string
  roomId: text("roomId").primaryKey(),
  // Room name provided by the creator
  name: text("name").notNull(),
  // References users.id from the existing table; adjust as needed for your FK logic
  createdBy: text("createdBy").notNull(),
  createdAt: text("createdAt").default(sql`CURRENT_TIMESTAMP`),
  deepLink: text("deepLink").notNull(),
  active: integer("active", { mode: "boolean" }).default(true),
});

// New SessionLog table (persistent data in Turso)
export const sessionLogs = sqliteTable("session_logs", {
  sessionId: text("sessionId").primaryKey(), // UUID for session log
  userId: text("userId").notNull(),           // References users.id
  roomId: text("roomId").notNull(),           // References chat_rooms.roomId
  joinTime: text("joinTime").default(sql`CURRENT_TIMESTAMP`),
  leaveTime: text("leaveTime"),               // Will be set when the session ends
});

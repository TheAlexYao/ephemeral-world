-- Add name column to chat_rooms table
ALTER TABLE chat_rooms ADD COLUMN name TEXT NOT NULL DEFAULT 'Untitled Room';

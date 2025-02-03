import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./db";

async function main() {
  try {
    await migrate(db, {
      migrationsFolder: "./src/drizzle/migrations",
    });
    console.log("Migration complete");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
  process.exit(0);
}

main(); 
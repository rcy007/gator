import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "src/lib/db/schema.ts",
  out: "src/lib/db",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://ahujaaa:@localhost:5432/gator?sslmode=disable",
  },
});
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

try {
  console.log("Testing database connection...");
  console.log("URL:", process.env.TURSO_DATABASE_URL);
  console.log("Token exists:", !!process.env.TURSO_AUTH_TOKEN);
  console.log("Token length:", process.env.TURSO_AUTH_TOKEN?.length);
  
  const result = await client.execute("SELECT COUNT(*) as count FROM waitlist");
  console.log("Query result:", result.rows[0]);
  
  const allRows = await client.execute("SELECT * FROM waitlist LIMIT 5");
  console.log("Sample rows:", allRows.rows);
} catch (error) {
  console.error("Error:", error.message);
  console.error("Full error:", error);
}

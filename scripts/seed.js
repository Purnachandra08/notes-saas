const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

async function main() {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",           // change if needed
    password: "Sipun@123", // change if needed
    database: "notes_saas",
  });

  // --- 1. Clear tables ---
  await conn.execute("DELETE FROM notes");
  await conn.execute("DELETE FROM users");
  await conn.execute("DELETE FROM tenants");

  // --- 2. Create tenants ---
  const acmeId = uuidv4();
  const globexId = uuidv4();

  await conn.execute(
    "INSERT INTO tenants (id, slug, name, plan) VALUES (?, ?, ?, ?)",
    [acmeId, "acme", "Acme", "free"]
  );
  await conn.execute(
    "INSERT INTO tenants (id, slug, name, plan) VALUES (?, ?, ?, ?)",
    [globexId, "globex", "Globex", "free"]
  );

  // --- 3. Hash passwords ---
  const passwordHash = await bcrypt.hash("password", 10);

  // --- 4. Create users ---
  const users = [
    { email: "admin@acme.test", role: "admin", tenantId: acmeId },
    { email: "user@acme.test", role: "member", tenantId: acmeId },
    { email: "admin@globex.test", role: "admin", tenantId: globexId },
    { email: "user@globex.test", role: "member", tenantId: globexId },
  ];

  for (const u of users) {
    await conn.execute(
      "INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES (?, ?, ?, ?, ?)",
      [uuidv4(), u.email, passwordHash, u.role, u.tenantId]
    );
  }

  console.log("✅ Seed complete!");
  await conn.end();
}

main().catch((err) => {
  console.error("Seed error:", err);
});

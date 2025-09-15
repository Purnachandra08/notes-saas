// lib/db.js
const mysql = require('mysql2/promise');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set in environment');
}

// Parse DATABASE_URL: mysql://user:password@host:port/database
const dbUrl = new URL(process.env.DATABASE_URL);

const pool = mysql.createPool({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1), // remove leading '/'
  port: dbUrl.port || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;

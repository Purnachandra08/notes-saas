// pages/api/auth/login.js
import { enableCors } from '../../../lib/cors';
const pool = require('../../../lib/db');
const bcrypt = require('bcryptjs');
const { signToken } = require('../../../lib/auth');

export default async function handler(req, res) {
  enableCors(res);

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
  if (!user.rows.length) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user.rows[0]);
  res.status(200).json({ token, user: user.rows[0] });
}

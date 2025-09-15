// pages/api/tenants/me.js
import { enableCors } from '../../../lib/cors';
const pool = require('../../../lib/db');
const { getAuthUser } = require('../../../lib/auth');

export default async function handler(req, res) {
  enableCors(res);

  const user = await getAuthUser(req, res);
  if (!user) return;

  const tenant = await pool.query('SELECT * FROM tenants WHERE id = $1', [user.tenant_id]);
  res.status(200).json(tenant.rows[0]);
}

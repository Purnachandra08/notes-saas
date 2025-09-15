// pages/api/tenants/[slug]/upgrade.js
import { enableCors } from '../../../../lib/cors';
import pool from '../../../../lib/db';
import { getAuthUser } from '../../../../lib/auth';

export default async function handler(req, res) {
  enableCors(res); // <--- call CORS

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'Only admins can upgrade' });

  const { slug } = req.query;
  const [rows] = await pool.query('SELECT id FROM tenants WHERE slug = ?', [slug]);
  const tenant = rows[0];
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  if (tenant.id !== user.tenant_id) return res.status(403).json({ error: 'Cannot upgrade another tenant' });

  await pool.query('UPDATE tenants SET plan = ? WHERE id = ?', ['pro', tenant.id]);
  res.json({ success: true, plan: 'pro' });
}

import { enableCors } from '../../../lib/cors';
const pool = require('../../../lib/db');
const { getAuthUser } = require('../../../lib/auth');

export default async function handler(req, res) {
  enableCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req, res);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  try {
    // Using MySQL placeholders
    await pool.query('UPDATE tenants SET plan = ? WHERE id = ?', ['pro', user.tenant_id]);
    res.status(200).json({ message: 'Upgraded to Pro' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
}

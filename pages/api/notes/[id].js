// pages/api/notes/[id].js
import { enableCors } from '../../../lib/cors';
const pool = require('../../../lib/db');
const { getAuthUser } = require('../../../lib/auth');

export default async function handler(req, res) {
  enableCors(res);

  const user = await getAuthUser(req, res);
  if (!user) return;

  const { id } = req.query;

  if (req.method === 'DELETE') {
    await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [id, user.id]);
    res.status(200).json({ message: 'Deleted' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

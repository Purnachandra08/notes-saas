// pages/api/health.js
import { enableCors } from '../../lib/cors';

export default function handler(req, res) {
  enableCors(res);
  res.status(200).json({ status: 'ok' });
}

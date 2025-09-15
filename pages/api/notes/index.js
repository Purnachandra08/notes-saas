// pages/api/notes/index.js
import { enableCors } from '../../../lib/cors';
const pool = require('../../../lib/db');
const { getAuthUser } = require('../../../lib/auth');
const { v4: uuidv4 } = require('uuid');

export default async function handler(req, res) {
  enableCors(res);

  const user = await getAuthUser(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    const notes = await pool.query('SELECT * FROM notes WHERE user_id = $1', [user.id]);
    res.status(200).json(notes.rows);
  } else if (req.method === 'POST') {
    const { title, content } = req.body;
    const newNote = {
      id: uuidv4(),
      user_id: user.id,
      title,
      content,
      created_at: new Date(),
    };
    await pool.query(
      'INSERT INTO notes(id, user_id, title, content, created_at) VALUES($1,$2,$3,$4,$5)',
      [newNote.id, newNote.user_id, newNote.title, newNote.content, newNote.created_at]
    );
    res.status(201).json(newNote);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

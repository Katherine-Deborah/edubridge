// pages/api/student/start-session.js
import pool from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/auth';

export const POST = withAuth(async (req, user) => {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (user.role !== 'student') {
      return new Response(JSON.stringify({ message: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!sessionId) {
      return new Response(JSON.stringify({ message: 'Session ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if session exists
    const sessionCheck = await pool.query('SELECT id FROM sessions WHERE id = $1', [sessionId]);
    if (sessionCheck.rowCount === 0) {
      return new Response(JSON.stringify({ message: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Upsert user session progress
    const upsertQuery = `
      INSERT INTO user_session_progress (user_id, session_id, status, last_accessed)
      VALUES ($1, $2, 'in_progress', NOW())
      ON CONFLICT (user_id, session_id)
      DO UPDATE SET
        status = CASE 
          WHEN user_session_progress.status = 'completed' THEN 'completed'
          ELSE 'in_progress'
        END,
        last_accessed = NOW()
      RETURNING *
    `;

    const result = await pool.query(upsertQuery, [user.userId, sessionId]);

    return new Response(JSON.stringify({
      message: 'Session started successfully',
      progress: result.rows[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Start session API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
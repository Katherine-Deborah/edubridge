// pages/api/student/dashboard.js
import pool from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/auth';

export const GET = withAuth(async (req, user) => {
  try {
    const userId = user.userId;

    // Ensure user is a student
    if (user.role !== 'student') {
      return Response.json({ message: 'Access denied' }, { status: 403 });
    }

    // Get all sessions and user progress
    const sessionsQuery = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.created_at,
        COALESCE(usp.status, 'not_started') as status,
        usp.reflection_text,
        usp.last_accessed,
        usp.completed_at
      FROM sessions s
      LEFT JOIN user_session_progress usp ON s.id = usp.session_id AND usp.user_id = $1
      ORDER BY s.created_at ASC
    `;
    const sessionsResult = await pool.query(sessionsQuery, [userId]);

    // Get reflection history (completed sessions only)
    const reflectionQuery = `
      SELECT 
        s.title,
        usp.reflection_text,
        usp.completed_at,
        LENGTH(usp.reflection_text) as reflection_length
      FROM user_session_progress usp
      JOIN sessions s ON usp.session_id = s.id
      WHERE usp.user_id = $1 AND usp.status = 'completed'
      ORDER BY usp.completed_at DESC
    `;
    const reflectionResult = await pool.query(reflectionQuery, [userId]);

    const allSessions = sessionsResult.rows;
    const missedSessions = allSessions.filter(session =>
      session.status === 'not_started' || session.status === 'in_progress'
    );
    const completedSessions = allSessions.filter(session =>
      session.status === 'completed'
    );

    return Response.json({
      missedSessions,
      completedSessions,
      reflectionHistory: reflectionResult.rows,
      totalSessions: allSessions.length,
      completedCount: completedSessions.length
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
});
// src/app/api/teacher/dashboard/route.js
import pool from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/auth';

export const GET = withAuth(async (req, user) => {
  try {
    if (user.role !== 'teacher') {
      return Response.json({ message: 'Access denied' }, { status: 403 });
    }

    // Fetch all students
    const studentsQuery = `
      SELECT 
  u.id, 
  u.first_name || ' ' || u.last_name AS name, 
  u.email,
  MAX(usp.last_accessed) AS lastSeen,
  BOOL_OR(usp.status = 'completed') AS hasSubmitted,
  MAX(CASE WHEN usp.status = 'in_progress' THEN s.title END) AS currentSession,
  MAX(usp.status) AS status
FROM users u
LEFT JOIN user_session_progress usp ON u.id = usp.user_id
LEFT JOIN sessions s ON usp.session_id = s.id
WHERE u.role = 'student'
GROUP BY u.id, u.first_name, u.last_name, u.email
ORDER BY u.first_name ASC

    `;
    const studentsResult = await pool.query(studentsQuery);

    const students = studentsResult.rows.map((row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  lastSeen: row.lastseen,
  hasSubmitted: row.hassubmitted,
  currentSession: row.currentsession || 'N/A',
  status: row.status || 'not_started'
}));


    // Session completion rates
    const sessionStatsQuery = `
      SELECT s.id, s.title,
             ROUND(COUNT(CASE WHEN usp.status = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(DISTINCT usp.user_id), 0), 1) AS completionRate
      FROM sessions s
      LEFT JOIN user_session_progress usp ON s.id = usp.session_id
      GROUP BY s.id, s.title
      ORDER BY s.id ASC
    `;
    const statsResult = await pool.query(sessionStatsQuery);

    const sessionStats = statsResult.rows.map(row => ({
      title: row.title,
      completionRate: parseFloat(row.completionrate || 0)
    }));

    // Average journal length
    const avgLengthResult = await pool.query(`
      SELECT AVG(LENGTH(reflection_text)) as avgLength
      FROM user_session_progress
      WHERE reflection_text IS NOT NULL
    `);

    const avgJournalLength = Math.round(avgLengthResult.rows[0].avglength || 0);

    // Most missed session
    const missedQuery = await pool.query(`
      SELECT s.title, COUNT(*) as missedCount
      FROM sessions s
      LEFT JOIN user_session_progress usp ON s.id = usp.session_id
      WHERE usp.status IS NULL OR usp.status != 'completed'
      GROUP BY s.title
      ORDER BY missedCount DESC
      LIMIT 1
    `);

    const mostMissedSession = missedQuery.rows[0]?.title || 'N/A';
    const missedCount = parseInt(missedQuery.rows[0]?.missedcount || 0);

    // Count of active students (last accessed within last 7 days)
    const activeResult = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as active
      FROM user_session_progress
      WHERE last_accessed >= NOW() - INTERVAL '7 days'
    `);
    const activeStudents = parseInt(activeResult.rows[0].active || 0);

    // Total students
    const totalResult = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'student'`);
    const totalStudents = parseInt(totalResult.rows[0].count);

    return Response.json({
      students,
      sessionStats,
      avgJournalLength,
      mostMissedSession,
      missedCount,
      activeStudents,
      totalStudents
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
});
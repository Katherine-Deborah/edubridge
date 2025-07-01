// src/app/api/teacher/student/[id]/route.js
import pool from '../../../../../../lib/db';
import { withAuth } from '../../../../../../lib/auth';


export const GET = withAuth(async (req, user, context) => {
  try {
    const studentId = context?.params?.id;

    if (!studentId) {
      return new Response(JSON.stringify({ message: 'Missing student ID' }), { status: 400 });
    }

    if (user.role !== 'teacher') {
      return new Response(JSON.stringify({ message: 'Access denied' }), { status: 403 });
    }

    // Get student info
    const studentQuery = `
      SELECT id, first_name, last_name, email, created_at AS enrolled_at
      FROM users
      WHERE id = $1 AND role = 'student'
    `;
    const studentResult = await pool.query(studentQuery, [studentId]);

    if (studentResult.rows.length === 0) {
      return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
    }

    const student = studentResult.rows[0];

    // Get session progress for the student
    const sessionsQuery = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.created_at,
        COALESCE(usp.status, 'not_started') AS status,
        usp.reflection_text,
        usp.last_accessed,
        usp.completed_at
      FROM sessions s
      LEFT JOIN user_session_progress usp 
        ON s.id = usp.session_id AND usp.user_id = $1
      ORDER BY s.created_at ASC
    `;
    const sessionsResult = await pool.query(sessionsQuery, [studentId]);

    return new Response(
      JSON.stringify({
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        email: student.email,
        enrolledAt: student.enrolled_at,
        sessions: sessionsResult.rows
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Student detail API error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
});
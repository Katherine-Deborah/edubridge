import pool from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/auth';

export const GET = withAuth(async (req, user) => {
  try {
    if (user.role !== 'teacher') {
      return new Response('Forbidden', { status: 403 });
    }

    const query = `
      SELECT 
        u.id, 
        u.first_name || ' ' || u.last_name AS name, 
        u.email,
        MAX(s.title) AS current_session,
        MAX(usp.status) AS status,
        MAX(usp.last_accessed) AS last_seen,
        BOOL_OR(usp.status = 'completed') AS has_submitted
      FROM users u
      LEFT JOIN user_session_progress usp ON u.id = usp.user_id
      LEFT JOIN sessions s ON usp.session_id = s.id
      WHERE u.role = 'student'
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY u.first_name ASC
    `;
    
    const result = await pool.query(query);
    const students = result.rows;

    // Generate CSV string
    const headers = ['ID', 'Name', 'Email', 'Current Session', 'Status', 'Submitted?', 'Last Seen'];
    const csvRows = [
      headers.join(','),
      ...students.map(s => [
        s.id,
        `"${s.name}"`,
        s.email,
        `"${s.current_session || 'N/A'}"`,
        s.status || 'not_started',
        s.has_submitted ? 'Yes' : 'No',
        s.last_seen ? new Date(s.last_seen).toISOString() : 'Never'
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');

    return new Response(csvString, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="student-progress-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('CSV Export Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});

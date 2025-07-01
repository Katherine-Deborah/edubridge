import pool from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/auth';

export const POST = withAuth(async (req, user) => {
  try {
    if (user.role !== 'teacher') {
      return new Response(JSON.stringify({ message: 'Access denied' }), { status: 403 });
    }

    const { studentIds } = await req.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return new Response(JSON.stringify({ message: 'No students selected' }), { status: 400 });
    }

    // You can log or track reminders here, e.g. update a table
    // For this example, we'll just simulate sending reminders
    console.log(`📧 Sending reminders to students: ${studentIds.join(', ')}`);

    // Optionally insert reminder record (for future tracking)
    // await pool.query(`
    //   INSERT INTO reminders (student_id, teacher_id, sent_at)
    //   VALUES ${studentIds.map(id => `(${id}, ${user.userId}, NOW())`).join(',')}
    // `);

    return new Response(JSON.stringify({ message: 'Reminder sent successfully' }), { status: 200 });
  } catch (error) {
    console.error('Send Reminder Error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
});

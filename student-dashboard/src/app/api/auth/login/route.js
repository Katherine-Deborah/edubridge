// src/app/api/auth/login/route.js
import pool from '../../../../../lib/db';
import { verifyPassword, generateToken } from '../../../../../lib/auth';
import { cookies } from 'next/headers'; // Used to set the cookie in App Router

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, isTeacher } = body;

    if (!email || !password) {
      return Response.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return Response.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = result.rows[0];

    const expectedRole = isTeacher ? 'teacher' : 'student';
    if (user.role !== expectedRole) {
      return Response.json(
        { message: `Invalid credentials for ${expectedRole} login` },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return Response.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(user);

    // Set the cookie using Next.js App Router's `cookies()` API
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'strict'
    });


    return Response.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}

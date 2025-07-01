import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
// Hash password
export async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
}
// JWT verify
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware for App Router
export function withAuth(handler) {
  return async (req) => {
    try {
      const cookieStore = await cookies(); // ✅ Must be awaited
      const token = cookieStore.get('token')?.value;

      if (!token) {
        return new Response(JSON.stringify({ message: 'No token provided' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return new Response(JSON.stringify({ message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Pass decoded user info to the handler
      return handler(req, decoded);
    } catch (error) {
      console.error('Auth error:', error);
      return new Response(JSON.stringify({ message: 'Authentication failed' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}

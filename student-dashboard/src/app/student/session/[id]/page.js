'use client'; // Mark this as a Client Component

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function SessionViewer() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const id = params.id;
  useEffect(() => {
    if (!id) return;

    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/login';
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'student') {
      window.location.href = '/login';
      return;
    }

    setUser(parsedUser);

    if (id) {
      fetchSessionData();
    }
  }, [id]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);

      const mockSession = {
        id,
        title: `Growth Mindset: Week ${id}`,
        description: 'Learn about developing a growth mindset and overcoming challenges.',
        status: 'in_progress',
      };

      setSession(mockSession);
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };
  console.log(user)
  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <div>
      <nav>
        <Link href="/student/dashboard">← Back to Dashboard</Link>
        <h1>{session?.title || 'Session'}</h1>
      </nav>

      <div>
        <p>{session.description}</p>
        <p>Status: {session.status}</p>
        <p>Session ID: {session.id}</p>
      </div>
    </div>
  );
}

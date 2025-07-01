// pages/student/dashboard.js
"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'student') {
      router.push('/login');
      return;
    }
    
    setUser(parsedUser);
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      setError('Network error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (sessionId) => {
    try {
      const response = await fetch('/api/student/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        // Redirect to session viewer (we'll create this next)
        router.push(`/student/session/${sessionId}`);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to start session');
      }
    } catch (error) {
      setError('Network error starting session');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'not_started': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800'
    };
    
    const labels = {
      'not_started': 'Not Started',
      'in_progress': 'In Progress',
      'completed': 'Completed'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReflectionScore = (length) => {
    if (length < 50) return 'Brief';
    if (length < 200) return 'Good';
    return 'Detailed';
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Student Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {dashboardData && (
                <div className="text-sm text-gray-600">
                  Progress: {dashboardData.completedCount}/{dashboardData.totalSessions} sessions
                </div>
              )}
              <span className="text-gray-700">Welcome, {user.firstName}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.firstName}!</h2>
            <p className="mt-1 text-sm text-gray-600">
              Continue your learning journey or catch up on missed sessions.
            </p>
          </div>

          {dashboardData && (
            <div className="space-y-8">
              {/* Missed Sessions Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Missed Sessions</h3>
                {dashboardData.missedSessions.length === 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Great job! You're all caught up with your sessions.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {dashboardData.missedSessions.map((session) => (
                      <div key={session.id} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {session.title}
                            </h4>
                            {getStatusBadge(session.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {session.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {session.last_accessed ? `Last accessed: ${formatDate(session.last_accessed)}` : 'Never accessed'}
                            </span>
                            <button
                              onClick={() => handleStartSession(session.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm"
                            >
                              {session.status === 'not_started' ? 'Start Session' : 'Continue'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reflection History Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reflection History</h3>
                {dashboardData.reflectionHistory.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-sm text-gray-600">
                      No reflections yet. Complete a session to start building your reflection history.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {dashboardData.reflectionHistory.map((reflection, index) => (
                        <li key={index} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-indigo-600 truncate">
                                  {reflection.title}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {getReflectionScore(reflection.reflection_length)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {reflection.reflection_length} chars
                                  </span>
                                </div>
                              </div>
                              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                {reflection.reflection_text}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Completed on {formatDate(reflection.completed_at)}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
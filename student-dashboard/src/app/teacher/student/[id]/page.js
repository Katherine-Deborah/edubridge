"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function StudentDetailView() {
  const [user, setUser] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const router = useRouter();
  const params = useParams();
  const studentId = params.id;

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'teacher') {
      router.push('/login');
      return;
    }
    
    setUser(parsedUser);
    if (studentId) {
      fetchStudentData();
    }
  }, [router, studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/student/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentData(data);
      } else {
        setError('Failed to load student data');
      }
    } catch (error) {
      setError('Network error loading student data');
    } finally {
      setLoading(false);
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

  const getReflectionQuality = (reflection) => {
    if (!reflection || reflection.length < 50) {
      return { label: 'Brief', color: 'text-red-600 bg-red-50' };
    } else if (reflection.length < 200) {
      return { label: 'Good', color: 'text-yellow-600 bg-yellow-50' };
    } else {
      return { label: 'Detailed', color: 'text-green-600 bg-green-50' };
    }
  };

  const handleViewReflection = (session) => {
    setSelectedSession(session);
    setShowReflectionModal(true);
  };

  const handleSendIndividualReminder = async () => {
    try {
      const response = await fetch('/api/teacher/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: [studentId] })
      });
      
      if (response.ok) {
        alert('Reminder sent successfully!');
      } else {
        setError('Failed to send reminder');
      }
    } catch (error) {
      setError('Network error sending reminder');
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => router.push('/teacher/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
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
                Teacher Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
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
          {/* Breadcrumbs */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button
                  onClick={() => router.push('/teacher/dashboard')}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Students</span>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{studentData?.name || 'Student Detail'}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Student Info */}
          <section className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Student Information</h2>
            <p><strong>Name:</strong> {studentData?.name}</p>
            <p><strong>Email:</strong> {studentData?.email}</p>
            <p><strong>Enrolled On:</strong> {formatDate(studentData?.enrolledAt)}</p>
            <button
              onClick={handleSendIndividualReminder}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              Send Reminder
            </button>
          </section>

          {/* Sessions List */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Session Progress</h2>
            {studentData?.sessions?.length ? (
              <ul className="divide-y divide-gray-200">
                {studentData.sessions.map((session) => {
                  const reflectionQuality = getReflectionQuality(session.reflection_text);
                  return (
                    <li key={session.id} className="py-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-md font-medium text-gray-900">{session.title}</h3>
                        <p className="text-sm text-gray-500">{session.description}</p>
                        <p className="text-sm text-gray-500">Last Accessed: {formatDate(session.last_accessed)}</p>
                        <div className="mt-1">{getStatusBadge(session.status)}</div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <button
                          onClick={() => handleViewReflection(session)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          View Reflection
                        </button>
                        {session.reflection_text && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reflectionQuality.color}`}>
                            {reflectionQuality.label}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No session data available.</p>
            )}
          </section>
        </div>
      </main>

      {/* Reflection Modal */}
      {showReflectionModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Reflection for: {selectedSession.title}</h3>
            <p className="whitespace-pre-wrap mb-6">{selectedSession.reflection_text || 'No reflection provided.'}</p>
            <button
              onClick={() => setShowReflectionModal(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

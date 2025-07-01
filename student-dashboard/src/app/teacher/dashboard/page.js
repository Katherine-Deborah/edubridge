// pages/teacher/dashboard.js
"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showReminder, setShowReminder] = useState(false);
  const router = useRouter();

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
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teacher/dashboard');
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStudentClick = (studentId) => {
    router.push(`/teacher/student/${studentId}`);
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/teacher/exportcsv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-progress-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to export CSV');
    }
  };

  const handleSendReminder = async () => {
    try {
      const response = await fetch('/api/teacher/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudents })
      });
      
      if (response.ok) {
        setShowReminder(false);
        setSelectedStudents([]);
        // Show success message
        alert('Reminders sent successfully!');
      } else {
        setError('Failed to send reminders');
      }
    } catch (error) {
      setError('Network error sending reminders');
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

  const filteredAndSortedStudents = dashboardData?.students
    ?.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    ?.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'lastSeen') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

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
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome, {user.firstName}!</h2>
            <p className="mt-1 text-sm text-gray-600">
              Monitor your students' progress and engagement with their learning sessions.
            </p>
          </div>

          {dashboardData && (
            <div className="space-y-8">
              {/* Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Completion Rates Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Session Completion Rates</h3>
                  <div className="space-y-3">
                    {dashboardData.sessionStats.map((session, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{session.title}</span>
                            <span className="text-sm text-gray-500">{session.completionRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${session.completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-4">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500">Average Journal Length</h4>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.avgJournalLength} words</p>
                    <p className="text-sm text-green-600">↑ 12% from last week</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500">Most Missed Session</h4>
                    <p className="text-lg font-semibold text-gray-900">{dashboardData.mostMissedSession}</p>
                    <p className="text-sm text-red-600">{dashboardData.missedCount} students behind</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-sm font-medium text-gray-500">Active Students</h4>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.activeStudents}</p>
                    <p className="text-sm text-gray-600">out of {dashboardData.totalStudents}</p>
                  </div>
                </div>
              </div>

              {/* Student Progress Table */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Student Progress</h3>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleExportCSV}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Export CSV
                      </button>
                      <button
                        onClick={() => setShowReminder(true)}
                        disabled={selectedStudents.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Send Reminder ({selectedStudents.length})
                      </button>
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div className="mt-4 flex space-x-4">
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents(filteredAndSortedStudents.map(s => s.id));
                              } else {
                                setSelectedStudents([]);
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('name')}
                        >
                          Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('currentSession')}
                        >
                          Current Session {sortField === 'currentSession' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('status')}
                        >
                          Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted?
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('lastSeen')}
                        >
                          Last Seen {sortField === 'lastSeen' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedStudents?.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudents([...selectedStudents, student.id]);
                                } else {
                                  setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-700">
                                  {student.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.currentSession}</div>
                            <div className="text-sm text-gray-500">{student.progress}% complete</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(student.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {student.hasSubmitted ? (
                                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(student.lastSeen)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleStudentClick(student.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reminder Modal */}
      {showReminder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">Send Reminder</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Send a reminder to {selectedStudents.length} selected student(s) about their pending sessions?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={handleSendReminder}
                  className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 mr-2"
                >
                  Send Reminder
                </button>
                <button
                  onClick={() => setShowReminder(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
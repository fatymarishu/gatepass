import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  LogOut, 
  XCircle,
  X
} from 'lucide-react';
import { receptionistAPI } from '../services/api';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    todayVisitors: 0,
    visitedCount: 0,
    pendingCount: 0,
    activeSessions: 0
  });
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [updateData, setUpdateData] = useState({
    visitStatus: '',
    arrivedAt: '',
    checkedOutAt: '',
    punctuality: ''
  });

  useEffect(() => {
    fetchTodaysVisitors();
  }, []);

  const fetchTodaysVisitors = async () => {
    try {
      const data = await receptionistAPI.getTodayVisitors();
      setVisitors(data);
      
      // Calculate stats
      const visited = data.filter(r => r.visitStatus === 'visited').length;
      const pending = data.filter(r => r.visitStatus === 'pending').length;
      const activeSessions = data.filter(r => r.arrivedAt && !r.checkedOutAt).length;

      setStats({
        todayVisitors: data.length,
        visitedCount: visited,
        pendingCount: pending,
        activeSessions: activeSessions
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const openUpdateModal = (visitor) => {
    setSelectedVisitor(visitor);
    setUpdateData({
      visitStatus: visitor.visitStatus || 'pending',
      arrivedAt: visitor.arrivedAt ? new Date(visitor.arrivedAt).toTimeString().slice(0, 5) : '',
      checkedOutAt: visitor.checkedOutAt ? new Date(visitor.checkedOutAt).toTimeString().slice(0, 5) : '',
      punctuality: visitor.punctuality || ''
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      await receptionistAPI.updateVisitorStatus(selectedVisitor.id, updateData);
      setShowModal(false);
      fetchTodaysVisitors();
      alert('Visitor status updated successfully');
    } catch (error) {
      console.error('Error updating visitor:', error);
      alert(error.message || 'Failed to update visitor status');
    }
  };

  const getStatusColor = (visitStatus) => {
    switch (visitStatus) {
      case 'visited':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'no_show':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPunctualityColor = (punctuality) => {
    switch (punctuality) {
      case 'on_time':
        return 'bg-green-100 text-green-700';
      case 'late':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">✱ logo</h1>
          <p className="text-gray-600 mt-1">Receptionist Dashboard</p>
        </div>

        <nav className="flex-1 p-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 ${
              activeTab === 'dashboard' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar size={20} />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('visitors')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 ${
              activeTab === 'visitors' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users size={20} />
            <span>Today's Visitors</span>
          </button>
        </nav>

        <div className="p-4 border-t">
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Calendar className="text-blue-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-600 text-sm mb-1">Total Visitors</p>
                      <h3 className="text-3xl font-bold text-gray-800">{stats.todayVisitors}</h3>
                      <p className="text-gray-500 text-xs mt-1">Scheduled for today</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <Clock className="text-yellow-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-600 text-sm mb-1">Pending Requests</p>
                      <h3 className="text-3xl font-bold text-gray-800">{stats.pendingCount}</h3>
                      <p className="text-gray-500 text-xs mt-1">Awaiting arrival</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CheckCircle className="text-green-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-600 text-sm mb-1">Processed Today</p>
                      <h3 className="text-3xl font-bold text-gray-800">{stats.visitedCount}</h3>
                      <p className="text-gray-500 text-xs mt-1">Completed visits</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Users className="text-purple-600" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-600 text-sm mb-1">Active Sessions</p>
                      <h3 className="text-3xl font-bold text-gray-800">{stats.activeSessions}</h3>
                      <p className="text-gray-500 text-xs mt-1">Currently in building</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Visitor Requests */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Recent Visitor Requests</h2>
                  <button
                    onClick={() => setActiveTab('visitors')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Slot</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {visitors.slice(0, 5).map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-500">{request.id.substring(0, 8)}...</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{request.visitorTypeName}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{request.warehouseName}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(request.date)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatTime(request.from)} - {formatTime(request.to)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.visitStatus)}`}>
                              {request.visitStatus === 'visited' ? 'Visited' : request.visitStatus === 'no_show' ? 'No Show' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {visitors.length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No visitor requests for today</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'visitors' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Today's Visitors</h2>
                <p className="text-gray-600 text-sm mt-1">Manage visitor check-ins and check-outs</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitor Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Slot</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrived At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checked Out</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Punctuality</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visitors.map((visitor) => (
                      <tr key={visitor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">{visitor.trackingCode}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{visitor.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{visitor.phone}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{visitor.visitorTypeName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatTime(visitor.from)} - {formatTime(visitor.to)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(visitor.arrivedAt)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(visitor.checkedOutAt)}</td>
                        <td className="px-6 py-4">
                          {visitor.punctuality ? (
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPunctualityColor(visitor.punctuality)}`}>
                              {visitor.punctuality === 'on_time' ? 'On Time' : 'Late'}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(visitor.visitStatus)}`}>
                            {visitor.visitStatus === 'visited' ? 'Visited' : visitor.visitStatus === 'no_show' ? 'No Show' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openUpdateModal(visitor)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                    {visitors.length === 0 && (
                      <tr>
                        <td colSpan="10" className="px-6 py-4 text-center text-gray-500">No visitors scheduled for today</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Update Visitor Status</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Name</label>
                <input
                  type="text"
                  value={selectedVisitor?.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visit Status</label>
                <select
                  value={updateData.visitStatus}
                  onChange={(e) => setUpdateData({ ...updateData, visitStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="visited">Visited</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arrived At (Time)</label>
                <input
                  type="time"
                  value={updateData.arrivedAt}
                  onChange={(e) => setUpdateData({ ...updateData, arrivedAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Checked Out At (Time)</label>
                <input
                  type="time"
                  value={updateData.checkedOutAt}
                  onChange={(e) => setUpdateData({ ...updateData, checkedOutAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Punctuality</label>
                <select
                  value={updateData.punctuality}
                  onChange={(e) => setUpdateData({ ...updateData, punctuality: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="on_time">On Time</option>
                  <option value="late">Late</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdate}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
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
};

export default ReceptionistDashboard;
import React, { useState, useEffect } from 'react';
import { Building2, Clock, CheckCircle, XCircle, FileText, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { approverAPI } from '../services/api';

const ApproverDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalCount: 0
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState({
    pending: 1,
    approved: 1,
    rejected: 1
  });
  const itemsPerPage = 50;

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

const fetchDashboardData = async () => {
  setLoading(true);
  try {
    const [pending, approved, rejected] = await Promise.all([
      approverAPI.getPendingRequests(userId),
      approverAPI.getApprovedRequests(userId),
      approverAPI.getRejectedRequests(userId)
    ]);

    setPendingRequests(pending);
    setApprovedRequests(approved);
    setRejectedRequests(rejected);

    // Get recent requests (sorted by action date, not visit date)
    const allRequests = [...pending, ...approved, ...rejected]
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || a.date || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || b.date || 0);
        return dateB - dateA;
      })
      .slice(0, 4);

    setRecentRequests(allRequests);

    setStats({
      pendingCount: pending.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      totalCount: pending.length + approved.length + rejected.length
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    setLoading(false);
  }
};

  const handleApprove = async (requestId) => {
    try {
      await approverAPI.approveRequest(requestId);
      await fetchDashboardData();
      alert('Request approved successfully');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await approverAPI.rejectRequest(requestId);
      await fetchDashboardData();
      alert('Request rejected successfully');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTimeSlot = (from, to) => {
    if (!from || !to) return 'N/A';
    return `${from} - ${to}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const Pagination = ({ currentPage, totalItems, onPageChange, tabName }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          pages.push(currentPage - 1);
          pages.push(currentPage);
          pages.push(currentPage + 1);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="px-6 py-4 border-t bg-white">
        <div className="flex items-center justify-between">
          {/* Status Text - Left Aligned */}
          <div className="text-sm text-gray-600">
            Showing {startItem} to {endItem} of {totalItems} entries
          </div>

          {/* Pagination Controls - Right Aligned */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                currentPage === 1
                  ? 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={`min-w-[36px] px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border border-blue-600'
                    : page === '...'
                    ? 'bg-white text-gray-400 cursor-default border border-transparent'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                currentPage === totalPages || totalPages === 0
                  ? 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
              <p className="text-3xl font-semibold text-gray-900">{stats.pendingCount}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Approved</p>
              <p className="text-3xl font-semibold text-gray-900">{stats.approvedCount}</p>
              <p className="text-xs text-gray-500 mt-1">Successfully processed</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Rejected</p>
              <p className="text-3xl font-semibold text-gray-900">{stats.rejectedCount}</p>
              <p className="text-xs text-gray-500 mt-1">Declined requests</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Requests</p>
              <p className="text-3xl font-semibold text-gray-900">{stats.totalCount}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Visitor Requests</h2>
          <button 
            onClick={() => setActiveTab('pending')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warehouse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Slot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No recent requests
                  </td>
                </tr>
              ) : (
                recentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.id?.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.visitorTypeName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.warehouseName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(request.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatTimeSlot(request.from, request.to)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRequestTable = (requests, showActions = false, tabName = '') => {
    const startIndex = (currentPage[tabName] - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRequests = requests.slice(startIndex, endIndex);

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warehouse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Slot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {showActions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? "10" : "9"} className="px-6 py-8 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.id?.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.visitorTypeName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.warehouseName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(request.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatTimeSlot(request.from, request.to)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    {showActions && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage[tabName]}
          totalItems={requests.length}
          onPageChange={(page) => setCurrentPage(prev => ({ ...prev, [tabName]: page }))}
          tabName={tabName}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'pending':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Pending Approvals</h2>
            {renderRequestTable(pendingRequests, true, 'pending')}
          </div>
        );
      case 'approved':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Approved Requests</h2>
            {renderRequestTable(approvedRequests, false, 'approved')}
          </div>
        );
      case 'rejected':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Rejected Requests</h2>
            {renderRequestTable(rejectedRequests, false, 'rejected')}
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">✱</span>
            </div>
            <span className="text-xl font-bold text-gray-900">logo</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mt-4">Approver Dashboard</h1>
        </div>

        <nav className="flex-1 p-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          

          <button
            onClick={() => setActiveTab('pending')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              activeTab === 'pending'
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Pending</span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              activeTab === 'approved'
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Approved</span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              activeTab === 'rejected'
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <XCircle className="w-5 h-5" />
            <span>Rejected</span>
          </button>
        </nav>

        <div className="p-4 border-t">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ApproverDashboard;
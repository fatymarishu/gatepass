import React, { useState, useEffect } from 'react';
import { Building2, Users, Tag, Workflow, FileText, Shield, Settings, LogOut, BarChart3, Clock, CheckCircle, UserCheck } from 'lucide-react';

// API configuration
const BASE_URL = 'https://wkj7m8ft-5000.inc1.devtunnels.ms/api';

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // First check localStorage for the token (LoginPage uses 'token')
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') ||
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('authToken');
    
    console.log('Token found:', token ? 'Yes' : 'No', token ? `(${token.substring(0, 20)}...)` : '');
    return token;
  }
  return null;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const visitorAPI = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/getall`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        // Just log the error without throwing authentication errors
        console.error('Failed to fetch users:', response.status);
        return [];
      }

      const data = await response.json();
      console.log('Fetched users:', data);

      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      console.log('Creating user:', userData);

      const response = await fetch(`${BASE_URL}/users/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to create user: ${response.status}`);
      }

      const data = await response.json();
      console.log('User created:', data);

      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      console.log('Updating user:', userId, userData);

      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to update user: ${response.status}`);
      }

      const data = await response.json();
      console.log('User updated:', data);

      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      console.log('Deleting user:', userId);

      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Failed to delete user: ${response.status}`);
      }

      const data = await response.json();
      console.log('User deleted:', data);

      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [stats, setStats] = useState({
    totalWarehouses: 12,
    pendingRequests: 7,
    approvedToday: 3,
    activeUsers: 0
  });

  // User form state
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    designation: '',
    role: '',
    warehouseId: '',
    isActive: true
  });

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    // Calculate active users count
    const activeCount = users.filter(user => user.isActive).length;
    setStats(prev => ({ ...prev, activeUsers: activeCount }));
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const userData = await visitorAPI.getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingUser) {
        await visitorAPI.updateUser(editingUser.id, userForm);
        await fetchUsers();
      } else {
        await visitorAPI.createUser(userForm);
        await fetchUsers();
      }
      setShowUserModal(false);
      setEditingUser(null);
      resetUserForm();
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Failed to save user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      designation: user.designation,
      role: user.role,
      warehouseId: user.warehouseId || '',
      isActive: user.isActive
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await visitorAPI.deleteUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const updatedData = { ...user, isActive: !user.isActive };
      await visitorAPI.updateUser(user.id, updatedData);
      await fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Failed to update user status. Please try again.');
    }
  };

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      designation: '',
      role: '',
      warehouseId: '',
      isActive: true
    });
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    resetUserForm();
  };

  // Sidebar items
  const sidebarItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'warehouses', name: 'Warehouses', icon: Building2 },
    { id: 'departments', name: 'Departments', icon: Building2 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'visitor-types', name: 'Visitor Types', icon: Tag },
    { id: 'workflows', name: 'Workflows', icon: Workflow },
    { id: 'requests', name: 'Requests', icon: FileText },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  // Dummy visitor requests data
  const dummyVisitorRequests = [
    { id: 'REQ001', visitorName: 'Alice Smith', visitorType: 'Supplier', warehouseName: 'Main Depot A', requestedSlot: '2024-07-20 10:00 AM', status: 'approved' },
    { id: 'REQ002', visitorName: 'Bob Johnson', visitorType: 'Client', warehouseName: 'North Hub B', requestedSlot: '2024-07-20 02:30 PM', status: 'pending' },
    { id: 'REQ003', visitorName: 'Charlie Brown', visitorType: 'Contractor', warehouseName: 'South Logistics C', requestedSlot: '2024-07-19 09:00 AM', status: 'rejected' },
    { id: 'REQ004', visitorName: 'Diana Prince', visitorType: 'Auditor', warehouseName: 'Main Depot A', requestedSlot: '2024-07-21 11:00 AM', status: 'pending' },
    { id: 'REQ005', visitorName: 'Eve Adams', visitorType: 'Supplier', warehouseName: 'North Hub B', requestedSlot: '2024-07-20 04:00 PM', status: 'approved' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Warehouses</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalWarehouses}</p>
              <p className="text-sm text-gray-500">Operational across regions</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-500">Awaiting approval</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved Today</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.approvedToday}</p>
              <p className="text-sm text-gray-500">Successfully processed</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
              <p className="text-sm text-gray-500">Currently active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Visitor Requests */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Visitor Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID <span className="text-gray-400">↕</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor Name <span className="text-gray-400">↕</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor Type <span className="text-gray-400">↕</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warehouse Name <span className="text-gray-400">↕</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Slot <span className="text-gray-400">↕</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status <span className="text-gray-400">↕</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dummyVisitorRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.visitorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.visitorType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.warehouseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.requestedSlot}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Users Management</h2>
          <p className="text-gray-600">Manage user accounts, roles, and approval assignments within the portal.</p>
        </div>
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700">
            <option>All Users</option>
            <option>Active Users</option>
            <option>Inactive Users</option>
          </select>
          <button
            onClick={() => setShowUserModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <Users className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.designation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.warehouseName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-1 rounded ${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="8" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  &lt; Previous
                </button>
                <button className="bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next &gt;
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (title) => (
    <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">This module is coming soon</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="text-blue-600 text-xl font-bold">✳ logo</div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mt-4">Admin Dashboard</h1>
        </div>
        
        <nav className="mt-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-md mb-2">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </button>
          <button className="w-full flex items-center px-4 py-3 text-left text-white bg-red-500 hover:bg-red-600 rounded-md">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'warehouses' && renderPlaceholder('Warehouses Management')}
          {activeTab === 'departments' && renderPlaceholder('Departments Management')}
          {activeTab === 'visitor-types' && renderPlaceholder('Visitor Types Management')}
          {activeTab === 'workflows' && renderPlaceholder('Workflows Management')}
          {activeTab === 'requests' && renderPlaceholder('Requests Management')}
          {activeTab === 'security' && renderPlaceholder('Security Settings')}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
            </div>
            
            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
                <input
                  type="tel"
                  required
                  value={userForm.phone}
                  onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                <input
                  type="password"
                  required={!editingUser}
                  value={userForm.password}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation*</label>
                <input
                  type="text"
                  required
                  value={userForm.designation}
                  onChange={(e) => setUserForm(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role*</label>
                <select
                  required
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Approver">Approver</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse ID</label>
                <input
                  type="text"
                  value={userForm.warehouseId}
                  onChange={(e) => setUserForm(prev => ({ ...prev, warehouseId: e.target.value }))}
                  placeholder="Enter warehouse ID (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={userForm.isActive}
                  onChange={(e) => setUserForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active User
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                    loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
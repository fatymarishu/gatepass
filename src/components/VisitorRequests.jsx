import React, { useState, useEffect } from 'react';
import { Eye, Search, Plus, X, Calendar, Users as UsersIcon, Building2, Tag, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

// API Configuration
const BASE_URL = 'https://gatepass-backend-hqqs.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Enhanced API with all required endpoints
const visitorRequestAPI = {
  getAllRequests: async () => {
    const response = await fetch(`${BASE_URL}/visitors/getall`, { headers: getAuthHeaders() });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  getRequestById: async (requestId) => {
    const response = await fetch(`${BASE_URL}/visitors/${requestId}`, { headers: getAuthHeaders() });
    const data = await handleResponse(response);
    return data.data || data;
  },

  createRequest: async (requestData) => {
    const response = await fetch(`${BASE_URL}/visitors/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });
    return handleResponse(response);
  },

  updateRequest: async (requestId, requestData) => {
    const response = await fetch(`${BASE_URL}/visitors/${requestId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });
    return handleResponse(response);
  },

  getByTrackingCode: async (trackingCode) => {
    const response = await fetch(`${BASE_URL}/visitors/track/${trackingCode}`);
    const data = await handleResponse(response);
    return data.data || data;
  },
};

const masterDataAPI = {
  getVisitorTypes: async () => {
    const response = await fetch(`${BASE_URL}/visitortypes/getall`, { headers: getAuthHeaders() });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  getWarehouses: async () => {
    const response = await fetch(`${BASE_URL}/warehouse/getall`, { headers: getAuthHeaders() });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  getTimeSlots: async (warehouseId) => {
    const response = await fetch(`${BASE_URL}/warehouse-time-slots/${warehouseId}`, { headers: getAuthHeaders() });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },
};

const VisitorRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [visitorTypes, setVisitorTypes] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    visitorTypeId: '',
    warehouseId: '',
    warehouseTimeSlotId: '',
    purpose: '',
    date: '',
    accompanying: []
  });

  const [accompanyingPerson, setAccompanyingPerson] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (formData.warehouseId) {
      fetchTimeSlots(formData.warehouseId);
    }
  }, [formData.warehouseId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [requestsData, typesData, warehousesData] = await Promise.all([
        visitorRequestAPI.getAllRequests(),
        masterDataAPI.getVisitorTypes(),
        masterDataAPI.getWarehouses()
      ]);
      setRequests(requestsData);
      setVisitorTypes(typesData);
      setWarehouses(warehousesData);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (warehouseId) => {
    try {
      const slots = await masterDataAPI.getTimeSlots(warehouseId);
      setTimeSlots(slots);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setTimeSlots([]);
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^\+?[\d\s-]{10,}$/.test(phone);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Visitor name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!validateEmail(formData.email)) return 'Invalid email format';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!validatePhone(formData.phone)) return 'Invalid phone number format';
    if (!formData.visitorTypeId) return 'Visitor type is required';
    if (!formData.warehouseId) return 'Warehouse is required';
    if (!formData.warehouseTimeSlotId) return 'Time slot is required';
    if (!formData.date) return 'Visit date is required';
    
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return 'Date must be today or in the future';
    
    if (formData.accompanying.length > 3) return 'Maximum 3 accompanying visitors allowed';
    
    for (let person of formData.accompanying) {
      if (!person.name.trim()) return 'All accompanying persons must have a name';
      if (person.email && !validateEmail(person.email)) return 'Invalid email in accompanying persons';
      if (person.phone && !validatePhone(person.phone)) return 'Invalid phone in accompanying persons';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        visitorTypeId: formData.visitorTypeId,
        warehouseId: formData.warehouseId,
        warehouseTimeSlotId: formData.warehouseTimeSlotId,
        purpose: formData.purpose || '',
        date: formData.date,
        accompanying: formData.accompanying
      };

      await visitorRequestAPI.createRequest(payload);
      setSuccess('Visitor request submitted successfully!');

      await fetchAllData();
      resetForm();
      setShowFormModal(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccompanying = () => {
    if (!accompanyingPerson.name.trim()) {
      setError('Accompanying person name is required');
      return;
    }
    if (formData.accompanying.length >= 3) {
      setError('Maximum 3 accompanying visitors allowed');
      return;
    }
    if (accompanyingPerson.email && !validateEmail(accompanyingPerson.email)) {
      setError('Invalid email format for accompanying person');
      return;
    }
    if (accompanyingPerson.phone && !validatePhone(accompanyingPerson.phone)) {
      setError('Invalid phone format for accompanying person');
      return;
    }

    setFormData(prev => ({
      ...prev,
      accompanying: [...prev.accompanying, { ...accompanyingPerson }]
    }));
    setAccompanyingPerson({ name: '', email: '', phone: '' });
    setError('');
  };

  const handleRemoveAccompanying = (index) => {
    setFormData(prev => ({
      ...prev,
      accompanying: prev.accompanying.filter((_, i) => i !== index)
    }));
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      visitorTypeId: '',
      warehouseId: '',
      warehouseTimeSlotId: '',
      purpose: '',
      date: '',
      accompanying: []
    });
    setAccompanyingPerson({ name: '', email: '', phone: '' });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTimeSlot = (from, to) => {
    if (!from || !to) return '-';
    try {
      const fromTime = new Date(`1970-01-01T${from}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const toTime = new Date(`1970-01-01T${to}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return `${fromTime} - ${toTime}`;
    } catch {
      return `${from} - ${to}`;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = !searchQuery || 
      request.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.visitorTypeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.warehouseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.trackingCode?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      request.status?.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesDate = !dateFilter || request.date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Visitor Requests</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and review all visitor requests</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowFormModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-3 flex-wrap items-center">
              <div className="flex-1 min-w-64 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
              {(searchQuery || statusFilter !== 'all' || dateFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDateFilter('');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Request ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Visitor Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Warehouse</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500">
                      Loading requests...
                    </td>
                  </tr>
                ) : currentRequests.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-sm text-gray-500">
                      {requests.length === 0 ? 'No visitor requests found' : 'No requests match your filters'}
                    </td>
                  </tr>
                ) : (
                  currentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{request.trackingCode || request.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{request.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{request.email || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{request.phone || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{request.visitorTypeName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{request.warehouseName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(request.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(request.status)}`}>
                          {request.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white rounded-b-lg">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">New Visitor Request</h3>
              <button
                onClick={() => {
                  setShowFormModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visitor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Enter visitor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="visitor@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visitor Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.visitorTypeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, visitorTypeId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Visitor Type</option>
                    {visitorTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.warehouseId}
                    onChange={(e) => setFormData(prev => ({ ...prev, warehouseId: e.target.value, warehouseTimeSlotId: '' }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} - {warehouse.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.warehouseTimeSlotId}
                    onChange={(e) => setFormData(prev => ({ ...prev, warehouseTimeSlotId: e.target.value }))}
                    disabled={!formData.warehouseId}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">
                      {formData.warehouseId ? 'Select Time Slot' : 'Select warehouse first'}
                    </option>
                    {timeSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.name || `${slot.from} - ${slot.to}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose of Visit
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="Enter the purpose of visit (optional)"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Accompanying Visitors</h4>
                    <p className="text-xs text-gray-500">Maximum 3 accompanying persons allowed</p>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formData.accompanying.length}/3
                  </span>
                </div>

                {formData.accompanying.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {formData.accompanying.map((person, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{person.name}</p>
                          <p className="text-xs text-gray-600">
                            {person.email && `${person.email}`}
                            {person.email && person.phone && ' • '}
                            {person.phone && `${person.phone}`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAccompanying(index)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {formData.accompanying.length < 3 && (
                  <div className="bg-blue-50 p-4 rounded space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={accompanyingPerson.name}
                        onChange={(e) => setAccompanyingPerson(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Name *"
                        className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="email"
                        value={accompanyingPerson.email}
                        onChange={(e) => setAccompanyingPerson(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Email (optional)"
                        className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="tel"
                        value={accompanyingPerson.phone}
                        onChange={(e) => setAccompanyingPerson(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Phone (optional)"
                        className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAccompanying}
                      disabled={!accompanyingPerson.name.trim()}
                      className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Accompanying Person
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 text-sm font-medium text-white rounded ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Visitor Request Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Visitor Name</label>
                    <p className="text-sm text-gray-900 font-medium">{selectedRequest.name || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 rounded">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Request ID</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedRequest.trackingCode || selectedRequest.id}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded">
                    <Tag className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{selectedRequest.email || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-100 rounded">
                    <Tag className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900">{selectedRequest.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-pink-100 rounded">
                    <Tag className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Visitor Type</label>
                    <p className="text-sm text-gray-900">{selectedRequest.visitorTypeName || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-indigo-100 rounded">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Warehouse</label>
                    <p className="text-sm text-gray-900">{selectedRequest.warehouseName || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-red-100 rounded">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Visit Date</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedRequest.date)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-orange-100 rounded">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Time Slot</label>
                    <p className="text-sm text-gray-900">{formatTimeSlot(selectedRequest.from, selectedRequest.to)}</p>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-start space-x-3">
                  <div className="p-2 bg-teal-100 rounded">
                    <FileText className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>

              {selectedRequest.purpose && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Purpose of Visit</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                    {selectedRequest.purpose}
                  </p>
                </div>
              )}

              {selectedRequest.accompanying && selectedRequest.accompanying.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-500 mb-3">Accompanying Persons</label>
                  <div className="space-y-2">
                    {selectedRequest.accompanying.map((person, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{index + 1}. {person.name || person}</p>
                        {(person.email || person.phone) && (
                          <p className="text-xs text-gray-600 mt-1">
                            {person.email && person.email}
                            {person.email && person.phone && ' • '}
                            {person.phone && person.phone}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 rounded border border-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorRequestManagement;
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
      // Only redirect if we have a token (expired session)
      // Don't redirect for login attempts (invalid credentials)
      const token = localStorage.getItem('authToken');
      if (token) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      // For login attempts without token, just throw the error
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Invalid credentials');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// =================== Visitor API ===================
export const visitorAPI = {
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

  submitVisitorRequest: async (requestData) => {
    const payload = {
      name: requestData.name,
      phone: requestData.phone,
      email: requestData.email,
      visitorTypeId: requestData.visitorType,
      warehouseId: requestData.warehouse,
      warehouseTimeSlotId: requestData.timeSlot,
      accompanying: requestData.accompanying || [],
      date: requestData.date,
    };
    const response = await fetch(`${BASE_URL}/visitors/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  getAllUsers: async () => {
    const response = await fetch(`${BASE_URL}/users/getall`, { headers: getAuthHeaders() });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  getUserById: async (userId) => {
    const response = await fetch(`${BASE_URL}/users/${userId}`, { headers: getAuthHeaders() });
    const data = await handleResponse(response);
    return data.data || data;
  },

  createUser: async (userData) => {
    const response = await fetch(`${BASE_URL}/users/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  updateUser: async (userId, userData) => {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

// =================== Visitor Types API ===================
export const visitorTypesAPI = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/visitortypes/getall`, { 
      headers: getAuthHeaders() 
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  getAllDisabled: async () => {
    const response = await fetch(`${BASE_URL}/visitortypes/getall/disabled`, { 
      headers: getAuthHeaders() 
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/visitortypes/${id}`, { 
      headers: getAuthHeaders() 
    });
    const data = await handleResponse(response);
    return data.data || data;
  },

  create: async (visitorTypeData) => {
    const response = await fetch(`${BASE_URL}/visitortypes/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(visitorTypeData),
    });
    return handleResponse(response);
  },

  update: async (id, visitorTypeData) => {
    const response = await fetch(`${BASE_URL}/visitortypes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(visitorTypeData),
    });
    return handleResponse(response);
  },

  disable: async (id) => {
    const response = await fetch(`${BASE_URL}/visitortypes/${id}/disable`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  enable: async (id) => {
    const response = await fetch(`${BASE_URL}/visitortypes/${id}/enable`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

// =================== Visitor Requests API ===================
export const visitorRequestAPI = {
  getAllRequests: async () => {
    const response = await fetch(`${BASE_URL}/visitors/getall`, { 
      headers: getAuthHeaders() 
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  getRequestById: async (requestId) => {
    const response = await fetch(`${BASE_URL}/visitors/${requestId}`, { 
      headers: getAuthHeaders() 
    });
    const data = await handleResponse(response);
    return data.data || data;
  },

  getRequestsByUserId: async (userId) => {
    const response = await fetch(`${BASE_URL}/visitors/user/${userId}`, { 
      headers: getAuthHeaders() 
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  getPendingRequestsByUserId: async (userId) => {
    const response = await fetch(`${BASE_URL}/visitors/user/${userId}/pending`, { 
      headers: getAuthHeaders() 
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  getApprovedRequestsByUserId: async (userId) => {
    const response = await fetch(`${BASE_URL}/visitors/user/${userId}/approved`, { 
      headers: getAuthHeaders() 
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  getRejectedRequestsByUserId: async (userId) => {
    const response = await fetch(`${BASE_URL}/visitors/user/${userId}/rejected`, { 
      headers: getAuthHeaders() 
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  approveRequest: async (requestId) => {
    const response = await fetch(`${BASE_URL}/visitors/${requestId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  rejectRequest: async (requestId) => {
    const response = await fetch(`${BASE_URL}/visitors/${requestId}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getByTrackingCode: async (trackingCode) => {
    const response = await fetch(`${BASE_URL}/visitors/track/${trackingCode}`);
    const data = await handleResponse(response);
    return data.data || data;
  },

  updateRequest: async (requestId, requestData) => {
    const response = await fetch(`${BASE_URL}/visitors/${requestId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });
    return handleResponse(response);
  },
};

// =================== Approver API (NEW) ===================
export const approverAPI = {
  // Get all requests assigned to approver
  getAllRequests: async (userId) => {
    const response = await fetch(`${BASE_URL}/visitors/user/${userId}`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  // Get pending requests for approver
  getPendingRequests: async (userId) => {
    const response = await fetch(`${BASE_URL}/visitors/user/${userId}/pending`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  // Get approved requests by approver
  getApprovedRequests: async (userId) => {
    const response = await fetch(`${BASE_URL}/visitors/user/${userId}/approved`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  // Get rejected requests by approver
  getRejectedRequests: async (userId) => {
    const response = await fetch(`${BASE_URL}/visitors/user/${userId}/rejected`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  // Approve a visitor request
  approveRequest: async (requestId) => {
    const response = await fetch(`${BASE_URL}/visitors/${requestId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Reject a visitor request
  rejectRequest: async (requestId) => {
    const response = await fetch(`${BASE_URL}/visitors/${requestId}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

// =================== Receptionist API ===================
export const receptionistAPI = {
  getAllVisitors: async () => {
    const response = await fetch(`${BASE_URL}/visitors/receptionist/all`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  getTodayVisitors: async () => {
    const response = await fetch(`${BASE_URL}/visitors/receptionist/today`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return Array.isArray(data.data) ? data.data : [];
  },

  updateVisitorStatus: async (visitorId, updateData) => {
    const response = await fetch(`${BASE_URL}/visitors/receptionist/update/${visitorId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    return handleResponse(response);
  }
};

// =================== Warehouse API ===================
export const warehouseAPI = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/warehouse/getall`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/warehouse/${id}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  create: async (data) => {
    const response = await fetch(`${BASE_URL}/warehouse/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/warehouse/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/warehouse/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

// =================== Warehouse Time Slots API ===================
export const warehouseTimeSlotsAPI = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/warehouse-time-slots/getall`, { 
      headers: getAuthHeaders() 
    });
    return handleResponse(response);
  },

  getByWarehouseId: async (warehouseId) => {
    const response = await fetch(`${BASE_URL}/warehouse-time-slots/${warehouseId}`, { 
      headers: getAuthHeaders() 
    });
    return handleResponse(response);
  },

  create: async (warehouseId, data) => {
    const response = await fetch(`${BASE_URL}/warehouse-time-slots/warehouse/${warehouseId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/warehouse-time-slots/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/warehouse-time-slots/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// =================== Warehouse Workflow API ===================
export const warehouseWorkflowAPI = {
  getByWarehouseId: async (warehouseId) => {
    const response = await fetch(`${BASE_URL}/warehouse-workflow/${warehouseId}`, { 
      headers: getAuthHeaders() 
    });
    const data = await handleResponse(response);
    return data;
  },

  add: async (data) => {
    const response = await fetch(`${BASE_URL}/warehouse-workflow`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/warehouse-workflow/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/warehouse-workflow/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};
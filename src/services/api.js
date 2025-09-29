const BASE_URL = 'https://wkj7m8ft-5000.inc1.devtunnels.ms/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  console.log('Getting auth token:', token ? 'Found' : 'Not found');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const visitorAPI = {
  // Get all visitor types
  getVisitorTypes: async () => {
    try {
      const response = await fetch(`${BASE_URL}/visitortypes/getall`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched visitor types:', data);

      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching visitor types:', error);
      throw error;
    }
  },

  // Get all warehouses
  getWarehouses: async () => {
    try {
      const response = await fetch(`${BASE_URL}/warehouse/getall`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched warehouses:', data);

      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  },

  // Get time slots for a specific warehouse
  getTimeSlots: async (warehouseId) => {
    try {
      const response = await fetch(`${BASE_URL}/warehouse-time-slots/${warehouseId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Fetched time slots for warehouse ${warehouseId}:`, data);

      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }
  },

  // Submit visitor request
  submitVisitorRequest: async (requestData) => {
    try {
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

      console.log('Submitting visitor request payload:', payload);

      const response = await fetch(`${BASE_URL}/visitors/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Visitor request submitted:', data);

      return data;
    } catch (error) {
      console.error('Error submitting visitor request:', error);
      throw error;
    }
  },

  // Login API method
  login: async (credentials) => {
    try {
      console.log('Attempting login with:', { email: credentials.email });

      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Login successful:', { 
        hasToken: !!data.token, 
        redirectTo: data.redirectTo 
      });

      // Token will be saved by LoginPage component
      // We don't save it here to avoid duplication
      return data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  // USER MANAGEMENT APIs

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/getall`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched users:', data);

      return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched user:', data);

      return data.data || data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
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
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
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
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
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
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in again.');
        }
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
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
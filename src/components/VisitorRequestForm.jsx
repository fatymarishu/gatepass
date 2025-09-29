import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { visitorAPI } from '../services/api';

const VisitorRequestForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    visitorType: '',
    warehouse: '',
    date: '',
    timeSlot: '',
    purpose: '',
    accompanying: []
  });

  const [visitorTypes, setVisitorTypes] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Fetch visitor types and warehouses on component mount
  useEffect(() => {
    fetchVisitorTypes();
    fetchWarehouses();
  }, []);

  const fetchVisitorTypes = async () => {
    try {
      const data = await visitorAPI.getVisitorTypes();
      setVisitorTypes(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load visitor types' });
      setVisitorTypes([]);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await visitorAPI.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load warehouses' });
      setWarehouses([]);
    }
  };

  const fetchTimeSlots = async (warehouseId) => {
    try {
      console.log('Fetching time slots for warehouse:', warehouseId);
      const data = await visitorAPI.getTimeSlots(warehouseId);
      console.log('Time slots received:', data);
      setTimeSlots(data);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setMessage({ type: 'error', text: 'Failed to load time slots' });
      setTimeSlots([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }

    // Fetch time slots when warehouse is selected
    if (name === 'warehouse' && value) {
      console.log('Warehouse selected:', value);
      fetchTimeSlots(value);
      setFormData(prev => ({
        ...prev,
        timeSlot: '' // Reset time slot when warehouse changes
      }));
    }
  };

  const addAccompanyingPerson = () => {
    if (formData.accompanying.length < 6) {
      setFormData(prev => ({
        ...prev,
        accompanying: [...prev.accompanying, { name: '', email: '', phone: '' }]
      }));
    }
  };

  const removeAccompanyingPerson = (index) => {
    setFormData(prev => ({
      ...prev,
      accompanying: prev.accompanying.filter((_, i) => i !== index)
    }));
  };

  const updateAccompanyingPerson = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      accompanying: prev.accompanying.map((person, i) =>
        i === index ? { ...person, [field]: value } : person
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Visitor Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.visitorType) newErrors.visitorType = 'Visitor Type is required';
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.timeSlot) newErrors.timeSlot = 'Time Slot is required';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Validate date is not in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.date = 'Please select a future date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // The payload structure matches what the API expects now
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        visitorType: formData.visitorType, // API will transform this to visitorTypeId
        warehouse: formData.warehouse, // API will transform this to warehouseId
        date: formData.date,
        timeSlot: formData.timeSlot, // API will transform this to warehouseTimeSlotId
        purpose: formData.purpose,
        accompanying: formData.accompanying.filter(person => 
          person.name.trim() || person.email.trim() || person.phone.trim()
        )
      };

      console.log('Submitting form data:', payload);
      const result = await visitorAPI.submitVisitorRequest(payload);
      
      setMessage({ type: 'success', text: 'Visitor request submitted successfully!' });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        visitorType: '',
        warehouse: '',
        date: '',
        timeSlot: '',
        purpose: '',
        accompanying: []
      });
      setTimeSlots([]);
    } catch (error) {
      console.error('Form submission error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to submit visitor request. Please check all fields and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Built-in Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-gray-900">
                Visitor Management System
              </h1>
            </div>

            {/* Login Button */}
            <div>
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Form Content */}
      <div className="py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8">
            Visitor Request Form
          </h1>

          {message.text && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Visitor Details Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Visitor Details</h2>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visitor Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visitor Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visitor Phone*
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Visit Details Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Visit Details</h2>
              
              <div className="space-y-4">
                {/* Visitor Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visitor Type*
                  </label>
                  <select
                    name="visitorType"
                    value={formData.visitorType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.visitorType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Visitor Type</option>
                    {Array.isArray(visitorTypes) && visitorTypes.map((type, index) => (
                      <option key={type._id || type.id || index} value={type._id || type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {errors.visitorType && <p className="text-red-500 text-sm mt-1">{errors.visitorType}</p>}
                </div>

                {/* Warehouse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse*
                  </label>
                  <select
                    name="warehouse"
                    value={formData.warehouse}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.warehouse ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Warehouse</option>
                    {Array.isArray(warehouses) && warehouses.map((warehouse, index) => (
                      <option key={warehouse._id || warehouse.id || index} value={warehouse._id || warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                  {errors.warehouse && <p className="text-red-500 text-sm mt-1">{errors.warehouse}</p>}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date*
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requested Time Slot*
                  </label>
                  {!formData.warehouse ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500">
                      Please select a warehouse first
                    </div>
                  ) : (
                    <select
                      name="timeSlot"
                      value={formData.timeSlot}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.timeSlot ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">
                        {timeSlots.length === 0 ? 'Loading time slots...' : 'Select a time slot'}
                      </option>
                      {Array.isArray(timeSlots) && timeSlots.map((slot, index) => (
                        <option key={slot._id || slot.id || index} value={slot._id || slot.id}>
                          {slot.time || slot.name || slot.slot || `${slot.startTime} - ${slot.endTime}`}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.timeSlot && <p className="text-red-500 text-sm mt-1">{errors.timeSlot}</p>}
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Purpose of visit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Accompanying Persons Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Accompanying Persons</h2>
              
              {formData.accompanying.length === 0 ? (
                <p className="text-gray-500 text-sm mb-4">No accompanying persons added yet.</p>
              ) : (
                <div className="space-y-4 mb-4">
                  {formData.accompanying.map((person, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-gray-700">Person {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeAccompanyingPerson(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Name"
                          value={person.name}
                          onChange={(e) => updateAccompanyingPerson(index, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={person.email}
                          onChange={(e) => updateAccompanyingPerson(index, 'email', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={person.phone}
                          onChange={(e) => updateAccompanyingPerson(index, 'phone', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.accompanying.length < 6 && (
                <button
                  type="button"
                  onClick={addAccompanyingPerson}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <span className="mr-1">+</span> Add Accompanying Person
                </button>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VisitorRequestForm;
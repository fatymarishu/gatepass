import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { visitorTypesAPI } from '../services/api';

const VisitorTypes = () => {
  const [visitorTypes, setVisitorTypes] = useState([]);
  const [disabledTypes, setDisabledTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [viewMode, setViewMode] = useState('active'); // 'active' or 'disabled'
  const [typeForm, setTypeForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchVisitorTypes();
  }, [viewMode]);

  const fetchVisitorTypes = async () => {
    setLoading(true);
    setError('');
    try {
      if (viewMode === 'active') {
        const data = await visitorTypesAPI.getAll();
        setVisitorTypes(data);
      } else {
        const data = await visitorTypesAPI.getAllDisabled();
        setDisabledTypes(data);
      }
    } catch (error) {
      console.error('Error fetching visitor types:', error);
      setError('Failed to load visitor types. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!typeForm.name.trim()) {
      setError('Visitor type name is required');
      setLoading(false);
      return;
    }

    try {
      if (editingType) {
        await visitorTypesAPI.update(editingType.id, typeForm);
      } else {
        await visitorTypesAPI.create(typeForm);
      }
      
      await fetchVisitorTypes();
      setShowModal(false);
      setEditingType(null);
      resetForm();
    } catch (error) {
      console.error('Error saving visitor type:', error);
      if (error.message.includes('409')) {
        setError('A visitor type with this name already exists.');
      } else {
        setError('Failed to save visitor type. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setTypeForm({
      name: type.name,
      description: type.description || ''
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (type) => {
    const action = type.isActive ? 'disable' : 'enable';
    const confirmMessage = `Are you sure you want to ${action} "${type.name}"?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      if (type.isActive) {
        await visitorTypesAPI.disable(type.id);
      } else {
        await visitorTypesAPI.enable(type.id);
      }
      await fetchVisitorTypes();
    } catch (error) {
      console.error(`Error ${action}ing visitor type:`, error);
      setError(`Failed to ${action} visitor type. Please try again.`);
    }
  };

  const resetForm = () => {
    setTypeForm({
      name: '',
      description: ''
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingType(null);
    resetForm();
  };

  const currentData = viewMode === 'active' ? visitorTypes : disabledTypes;

  return (
    <div style={{ 
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 6px 0'
          }}>
            Visitor Types Management
          </h2>
          <p style={{ 
            fontSize: '14px',
            color: '#6b7280',
            margin: '0'
          }}>
            Manage different types of visitors and their categories.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            display: 'inline-flex',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            padding: '4px'
          }}>
            <button
              onClick={() => setViewMode('active')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: viewMode === 'active' ? '#ffffff' : 'transparent',
                color: viewMode === 'active' ? '#1f2937' : '#6b7280',
                boxShadow: viewMode === 'active' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Active Types ({visitorTypes.length})
            </button>
            <button
              onClick={() => setViewMode('disabled')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: viewMode === 'disabled' ? '#ffffff' : 'transparent',
                color: viewMode === 'disabled' ? '#1f2937' : '#6b7280',
                boxShadow: viewMode === 'disabled' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Disabled Types ({disabledTypes.length})
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <UserPlus size={18} />
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          padding: '14px 16px',
          borderRadius: '8px',
          border: '1px solid #fee2e2',
          fontSize: '14px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{
                padding: '14px 24px',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.6px'
              }}>
                NAME
              </th>
              <th style={{
                padding: '14px 24px',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.6px'
              }}>
                DESCRIPTION
              </th>
              <th style={{
                padding: '14px 24px',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.6px'
              }}>
                STATUS
              </th>
              <th style={{
                padding: '14px 24px',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.6px'
              }}>
                CREATED DATE
              </th>
              <th style={{
                padding: '14px 24px',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.6px'
              }}>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  Loading visitor types...
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan="5" style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  No {viewMode} visitor types found
                </td>
              </tr>
            ) : (
              currentData.map((type, index) => (
                <tr 
                  key={type.id}
                  style={{
                    borderBottom: index < currentData.length - 1 ? '1px solid #f3f4f6' : 'none',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ 
                    padding: '18px 24px',
                    color: '#1f2937',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {type.name}
                  </td>
                  <td style={{
                    padding: '18px 24px',
                    color: '#4b5563',
                    fontSize: '14px'
                  }}>
                    {type.description || 'No description'}
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: type.isActive ? '#d1fae5' : '#f3f4f6',
                      color: type.isActive ? '#065f46' : '#4b5563'
                    }}>
                      {type.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{
                    padding: '18px 24px',
                    color: '#4b5563',
                    fontSize: '14px'
                  }}>
                    {type.createdAt ? new Date(type.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '18px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(type)}
                        title="Edit"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          backgroundColor: 'transparent',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#2563eb',
                          transition: 'all 0.15s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#dbeafe';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(type)}
                        title={type.isActive ? 'Disable' : 'Enable'}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          backgroundColor: 'transparent',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: type.isActive ? '#dc2626' : '#16a34a',
                          transition: 'all 0.15s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = type.isActive ? '#fee2e2' : '#dcfce7';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {type.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(type)}
                        title="Delete"
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          backgroundColor: 'transparent',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#dc2626',
                          transition: 'all 0.15s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#fee2e2';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {editingType ? 'Edit Visitor Type' : 'Add New Visitor Type'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Name*
                </label>
                <input
                  type="text"
                  required
                  value={typeForm.name}
                  onChange={(e) => setTypeForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter visitor type name"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Description
                </label>
                <textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description (optional)"
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '8px'
              }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#ffffff',
                    backgroundColor: loading ? '#9ca3af' : '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.target.style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseOut={(e) => {
                    if (!loading) e.target.style.backgroundColor = '#2563eb';
                  }}
                >
                  {loading ? 'Saving...' : editingType ? 'Update Type' : 'Create Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorTypes;
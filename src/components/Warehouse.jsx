import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, ArrowLeft, X } from 'lucide-react';
import { warehouseAPI, warehouseTimeSlotsAPI, warehouseWorkflowAPI, visitorAPI } from '../services/api';

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [activeView, setActiveView] = useState('list');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  
  const [slots, setSlots] = useState([]);
  const [slotForm, setSlotForm] = useState({ name: '', from: '', to: '' });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  
  const [workflows, setWorkflows] = useState({});
  const [visitorTypes, setVisitorTypes] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);
  const [workflowForm, setWorkflowForm] = useState({
    visitorTypeId: '',
    stepNo: 1,
    approverId: ''
  });

  useEffect(() => {
    fetchWarehouses();
    fetchVisitorTypes();
    fetchApprovers();
  }, []);

  useEffect(() => {
    if (activeView === 'slots' && selectedWarehouse?.id) {
      fetchSlots();
    }
  }, [activeView, selectedWarehouse]);

  useEffect(() => {
    if (activeView === 'workflow' && selectedWarehouse?.id) {
      fetchWorkflows();
    }
  }, [activeView, selectedWarehouse]);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const result = await warehouseAPI.getAll();
      if (result.success) {
        setWarehouses(result.data);
      } else {
        setError('Failed to fetch warehouses');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitorTypes = async () => {
    try {
      const types = await visitorAPI.getVisitorTypes();
      setVisitorTypes(types);
    } catch (err) {
      console.error('Error fetching visitor types:', err);
    }
  };

  const fetchApprovers = async () => {
    try {
      const users = await visitorAPI.getAllUsers();
      const approversList = users.filter(user => user.role === 'Approver' && user.isActive);
      setApprovers(approversList);
    } catch (err) {
      console.error('Error fetching approvers:', err);
    }
  };

  const fetchSlots = async () => {
    try {
      setLoadingSlots(true);
      const res = await warehouseTimeSlotsAPI.getByWarehouseId(selectedWarehouse.id);
      if (res.success) setSlots(res.data || []);
      else setSlots([]);
    } catch (e) {
      console.error('Error fetching slots:', e);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchWorkflows = async () => {
    try {
      setLoadingWorkflow(true);
      const data = await warehouseWorkflowAPI.getByWarehouseId(selectedWarehouse.id);
      setWorkflows(data);
    } catch (err) {
      console.error('Error fetching workflows:', err);
      setWorkflows({});
    } finally {
      setLoadingWorkflow(false);
    }
  };

  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const result = await warehouseAPI.create(formData);
      if (result.success) {
        setShowAddModal(false);
        setFormData({ name: '', location: '' });
        fetchWarehouses();
      } else {
        alert(result.message || 'Failed to create warehouse');
      }
    } catch (err) {
      alert('Error creating warehouse');
      console.error('Create error:', err);
    }
  };

  const handleUpdateWarehouse = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const result = await warehouseAPI.update(editWarehouse.id, formData);
      if (result.success) {
        setShowEditModal(false);
        setEditWarehouse(null);
        setFormData({ name: '', location: '' });
        fetchWarehouses();
      } else {
        alert(result.message || 'Failed to update warehouse');
      }
    } catch (err) {
      alert('Error updating warehouse');
      console.error('Update error:', err);
    }
  };

  const handleDeleteWarehouse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return;

    try {
      const result = await warehouseAPI.delete(id);
      if (result.success) {
        fetchWarehouses();
      } else {
        alert(result.message || 'Failed to delete warehouse');
      }
    } catch (err) {
      alert('Error deleting warehouse');
      console.error('Delete error:', err);
    }
  };

  const openEditModal = (warehouse) => {
    setEditWarehouse(warehouse);
    setFormData({ name: warehouse.name, location: warehouse.location });
    setShowEditModal(true);
  };

  const handleCreateSlot = async () => {
    if (!slotForm.name || !slotForm.from || !slotForm.to) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const res = await warehouseTimeSlotsAPI.create(selectedWarehouse.id, slotForm);
      if (res.success) {
        setSlots(prev => [...prev, res.data]);
        setSlotForm({ name: '', from: '', to: '' });
      } else {
        alert(res.message || 'Failed to add slot');
      }
    } catch (err) {
      console.error('Create slot error:', err);
      alert('Error creating slot');
    }
  };

  const handleUpdateSlot = async () => {
    if (!slotForm.name || !slotForm.from || !slotForm.to) {
      alert('Please fill in all fields');
      return;
    }
    try {
      const res = await warehouseTimeSlotsAPI.update(editingSlot.id, slotForm);
      if (res.success) {
        setSlots(prev => prev.map(s => s.id === editingSlot.id ? res.data : s));
        setSlotForm({ name: '', from: '', to: '' });
        setEditingSlot(null);
      } else {
        alert(res.message || 'Failed to update slot');
      }
    } catch (err) {
      console.error('Update slot error:', err);
      alert('Error updating slot');
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({ name: slot.name, from: slot.from, to: slot.to });
  };

  const handleCancelEditSlot = () => {
    setEditingSlot(null);
    setSlotForm({ name: '', from: '', to: '' });
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;
    try {
      const res = await warehouseTimeSlotsAPI.delete(id);
      if (res.success) {
        setSlots(prev => prev.filter(s => s.id !== id));
      } else {
        alert(res.message || 'Failed to delete slot');
      }
    } catch (err) {
      console.error('Delete slot error:', err);
      alert('Error deleting slot');
    }
  };

  const handleAddWorkflowStep = async () => {
    if (!workflowForm.visitorTypeId || !workflowForm.approverId) {
      alert('Please select visitor type and approver');
      return;
    }

    try {
      const payload = {
        warehouse_id: selectedWarehouse.id,
        visitor_type_id: workflowForm.visitorTypeId,
        step_no: workflowForm.stepNo,
        approver: workflowForm.approverId
      };

      const res = await warehouseWorkflowAPI.add(payload);
      if (res.success) {
        fetchWorkflows();
        setWorkflowForm({ visitorTypeId: '', stepNo: 1, approverId: '' });
      } else {
        alert(res.message || 'Failed to add workflow step');
      }
    } catch (err) {
      console.error('Add workflow error:', err);
      alert('Error adding workflow step');
    }
  };

  const handleDeleteWorkflowStep = async (workflowId) => {
    if (!window.confirm('Are you sure you want to delete this workflow step?')) return;
    
    try {
      const res = await warehouseWorkflowAPI.delete(workflowId);
      if (res.success || res.status === 204) {
        fetchWorkflows();
      } else {
        alert('Failed to delete workflow step');
      }
    } catch (err) {
      console.error('Delete workflow error:', err);
      alert('Error deleting workflow step');
    }
  };

  const handleManageSlots = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setActiveView('slots');
  };

  const handleManageWorkflow = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setActiveView('workflow');
  };

  const goBack = () => {
    setActiveView('list');
    setSelectedWarehouse(null);
    setEditingSlot(null);
    setSlotForm({ name: '', from: '', to: '' });
    setWorkflowForm({ visitorTypeId: '', stepNo: 1, approverId: '' });
  };

  const filteredWarehouses = warehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (activeView === 'slots' && selectedWarehouse) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="p-6 max-w-7xl mx-auto">
          <button 
            onClick={goBack} 
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <ArrowLeft size={18} /> Back to Warehouses
          </button>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Manage Time Slots - {selectedWarehouse.name}
          </h2>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSlot ? 'Update Time Slot' : 'Add New Time Slot'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slot Name</label>
                <input
                  type="text"
                  placeholder="e.g., Morning"
                  value={slotForm.name}
                  onChange={(e) => setSlotForm({ ...slotForm, name: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <input
                  type="time"
                  value={slotForm.from}
                  onChange={(e) => setSlotForm({ ...slotForm, from: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <input
                  type="time"
                  value={slotForm.to}
                  onChange={(e) => setSlotForm({ ...slotForm, to: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              {editingSlot ? (
                <>
                  <button
                    onClick={handleUpdateSlot}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    Update Slot
                  </button>
                  <button
                    onClick={handleCancelEditSlot}
                    className="px-5 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium shadow-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreateSlot}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                >
                  Add Slot
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loadingSlots ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-3 text-sm text-gray-600">Loading slots...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-sm">No time slots found. Add your first slot above.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">To</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {slots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{slot.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{slot.from}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{slot.to}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditSlot(slot)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'workflow' && selectedWarehouse) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="p-6 max-w-7xl mx-auto">
          <button 
            onClick={goBack} 
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <ArrowLeft size={18} /> Back to Warehouses
          </button>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Manage Workflow - {selectedWarehouse.name}
          </h2>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Approval Step</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Type</label>
                <select
                  value={workflowForm.visitorTypeId}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, visitorTypeId: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Visitor Type</option>
                  {visitorTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Step Number</label>
                <input
                  type="number"
                  min="1"
                  value={workflowForm.stepNo}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, stepNo: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Approver</label>
                <select
                  value={workflowForm.approverId}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, approverId: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Approver</option>
                  {approvers.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleAddWorkflowStep}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              <Plus size={18} /> Add Step
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Workflows by Visitor Type</h3>
            {loadingWorkflow ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-3 text-sm text-gray-600">Loading workflows...</p>
              </div>
            ) : Object.keys(workflows).length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-sm">No workflows configured. Add approval steps above.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(workflows).map(([visitorTypeId, workflow]) => (
                  <div key={visitorTypeId} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                      <h4 className="text-base font-semibold text-gray-900">{workflow.visitorType}</h4>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Step</th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Approver</th>
                          <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {workflow.steps.map((step) => (
                          <tr key={step.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 text-sm font-medium text-gray-900">Step {step.stepNo}</td>
                            <td className="px-5 py-3 text-sm text-gray-700">{step.approver}</td>
                            <td className="px-5 py-3 text-right">
                              <button
                                onClick={() => handleDeleteWorkflowStep(step.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Warehouses Management</h1>
                <p className="text-gray-600 mt-1 text-sm">Manage your warehouse locations and settings</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
              >
                <Plus size={18} />
                Add Warehouse
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-5">
              <input
                type="text"
                placeholder="Search warehouses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg w-80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-3 text-sm text-gray-600">Loading warehouses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 text-red-600 text-sm">{error}</div>
            ) : filteredWarehouses.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-sm">No warehouses found</div>
            ) : (
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWarehouses.map((warehouse) => (
                      <tr key={warehouse.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{warehouse.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{warehouse.location}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{formatDate(warehouse.createdAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-1.5"
                              onClick={() => handleManageSlots(warehouse)}
                            >
                              Manage Slots
                            </button>
                            <button
                              className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-1.5"
                              onClick={() => handleManageWorkflow(warehouse)}
                            >
                              Manage Workflow
                            </button>
                            <button
                              onClick={() => openEditModal(warehouse)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteWarehouse(warehouse.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Warehouse</h3>
              <button 
                onClick={() => { setShowAddModal(false); setFormData({ name: '', location: '' }); }} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Enter warehouse name" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.location} 
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Enter location" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => { setShowAddModal(false); setFormData({ name: '', location: '' }); }} 
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddWarehouse} 
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                >
                  Add Warehouse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Warehouse</h3>
              <button 
                onClick={() => { setShowEditModal(false); setEditWarehouse(null); setFormData({ name: '', location: '' }); }} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.location} 
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => { setShowEditModal(false); setEditWarehouse(null); setFormData({ name: '', location: '' }); }} 
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateWarehouse} 
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                >
                  Update Warehouse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseManagement;
export { WarehouseManagement as Warehouse };
export const WarehouseTimeSlots = WarehouseManagement;
export const WarehouseWorkflow = WarehouseManagement;
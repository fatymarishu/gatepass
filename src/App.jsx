import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VisitorRequestForm from './components/VisitorRequestForm';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import { Warehouse, WarehouseTimeSlots, WarehouseWorkflow } from "./components/Warehouse";
import ReceptionistDashboard from './components/ReceptionistDashboard';
import ApproverDashboard from './components/ApproverDashboard';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<VisitorRequestForm />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/warehouse" element={<Warehouse />} /> 
          <Route path="/warehouse/:id/timeslots" element={<WarehouseTimeSlots />} />
          <Route path="/warehouse/:id/workflow" element={<WarehouseWorkflow />} />
          <Route path="/reception/reception-dashboard" element={<ReceptionistDashboard />} />
          <Route path="/approver/approver-dashboard" element={<ApproverDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
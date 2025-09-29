import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VisitorRequestForm from './components/VisitorRequestForm';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';  // ← ADD THIS LINE

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<VisitorRequestForm />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/admin-dashboard" element={<AdminDashboard />} />  {/* ← ADD THIS LINE */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
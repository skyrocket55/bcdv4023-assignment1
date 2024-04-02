import './App.css';
import React from 'react';
import { BrowserRouter as Router, 
  Routes, 
  Route,
  Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className='container-fluid'>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          {/* Invalid Path Redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/"/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminApp from './admin/AdminApp';
import UserApp from './user/UserApp';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<UserApp />} />
      </Routes>
    </Router>
  );
}

export default App;

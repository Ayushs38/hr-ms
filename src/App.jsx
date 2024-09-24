import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import SignUpPage from './pages/SignUp';
import DashboardLayout from './pages/dashboard/Layout';
import Settings from './pages/dashboard/Settings';
import Profile from './pages/dashboard/Profile';
import LandingPage from './pages/LandingPage';
import Branches from './pages/dashboard/Branches';
import DashboardHome from './pages/dashboard/Home';
import ProfileUpdate from './pages/dashboard/ProfileUpdate';


const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="" element={<DashboardHome />} />
          <Route path="branches" element={<Branches />} />
          <Route path="profile" element={<Profile />} />
          <Route path="update-profile" element={<ProfileUpdate />} />
          <Route path="settings" element={<Settings />} />
        </Route>

      </Routes>
    </Router>
  );
};


export default App;

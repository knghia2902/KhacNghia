import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Docs from './pages/Docs';
import Tools from './pages/Tools';
import Images from './pages/Images';
import Login from './pages/Login';

// Protected Route Component (Inline for simplicity or could be separate)
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null; // Or a loading spinner
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route path="/docs" element={<Docs />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/gallery" element={<Images />} />
          <Route path="/login" element={<Login />} />
          {/* Redirect unknown routes to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;

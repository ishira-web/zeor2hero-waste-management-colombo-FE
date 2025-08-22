import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './Auth/AuthContext.jsx'
import Home from './Client/Pages/Home'
import AdminRoutes from './Admin/Routes/AdminRoutes'
import LoginPage from './Client/Pages/LoginPage'
import { ToastContainer } from 'react-toastify'
import CollectorProfile from './Collector/Pages/CollectorProfile.jsx'
import Register from './Client/Pages/Register.jsx'
import Profile from './Client/Pages/Profile.jsx'

// Protected Route component
function ProtectedRoute({ children, requiredRole }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <>
      <ToastContainer/>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/' element={<Home/>}/>
        <Route path='/admin/*' element={
          <ProtectedRoute requiredRole="admin">
            <AdminRoutes />
          </ProtectedRoute>
        } />
        <Route path='/collector-dashboard' element={
          <ProtectedRoute requiredRole="collector">
            <CollectorProfile/>
          </ProtectedRoute>
        } />
        <Route path='/register' element={<Register/>}/>
        <Route path='/dweller-dashboard' element={
          <ProtectedRoute requiredRole="dweller">
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './Auth/AuthContext.jsx'
import Home from './Client/Pages/Home'
import AdminRoutes from './Admin/Routes/AdminRoutes'
import LoginPage from './Client/Pages/LoginPage'
import { ToastContainer } from 'react-toastify'

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
      {/* Add other protected routes for collector and dweller roles */}
      <Route path='/collector-dashboard' element={
        <ProtectedRoute requiredRole="collector">
          <div>Collector Dashboard</div>
        </ProtectedRoute>
      } />
      <Route path='/dweller-dashboard' element={
        <ProtectedRoute requiredRole="dweller">
          <div>Dweller Dashboard</div>
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
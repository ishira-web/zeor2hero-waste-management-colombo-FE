import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminLayout from '../Layout/AdminLayout'
import Dashboard from '../Pages/Dashboard'
import ManageAdmins from '../Pages/ManageAdmins'
import ManageUsers from '../Pages/ManageUsers'
import ManageCollectors from '../Pages/ManageCollectors'
import ManageRoutes from '../Pages/ManageRoutes'
import ManageTime from '../Pages/ManageTime'

function AdminRoutes() {
  return (
    <Routes>
        <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admins" element={<ManageAdmins />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="collectors" element={<ManageCollectors />} />
        <Route path="routesCl" element={<ManageRoutes/>} />
        <Route path="teams" element={<ManageTime/>} />
        <Route path="*" element={<h1>Not found</h1>} />
        </Route>
    </Routes>
  )
}

export default AdminRoutes

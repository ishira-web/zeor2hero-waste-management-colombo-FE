import React from 'react'
import Sidebar from '../Component/Sidebar'
import { Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className="h-screen font-outfit">
      <Sidebar/>
      <main className="ml-64 h-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout

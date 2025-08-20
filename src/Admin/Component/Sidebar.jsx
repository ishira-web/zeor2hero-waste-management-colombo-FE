import React from 'react'
import { NavLink } from 'react-router-dom'

function Sidebar() {
  const sidebarItems = [
    { name: 'Dashboard', path: 'dashboard' },
    { name: 'Manage Admins', path: 'admins' },
    { name: 'Manage Users', path: 'users' },
    { name: 'Manage Collectors', path: 'collectors' },
    { name: 'Manage Routes', path: 'routesCl' },
    {name :  'Manage Teams', path: 'teams'},
  ]
  return (
    <div className='w-64 h-screen bg-[var(--color-primary)] text-black font-poppins fixed left-0 top-0 shadow-lg flex flex-col py-6 px-4'>
      <h1 className='text-2xl font-semibold mb-8 text-center'>Zero2Hero</h1>
      <nav className='flex flex-col gap-4 font-Funnel_Display'>
        {sidebarItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded transition-colors ${
                isActive ? 'bg-blue-500' : 'hover:bg-blue-500'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
      <button className='mt-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors w-full text-center'> 
        Logout
      </button>
      <div className='mt-4 text-gray-500 text-xs'>
        <h1 className='text-xs text-center text-gray-400'>zero2hero system presented ❤️</h1>
      </div>
    </div>
  )
}

export default Sidebar

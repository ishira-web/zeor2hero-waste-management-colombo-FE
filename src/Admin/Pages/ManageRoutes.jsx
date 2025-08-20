import React, { useState, useEffect } from 'react';
import {Leaf,Bell,Search,Trash2,Edit,Plus,LogOut,Route as RouteIcon} from "lucide-react";
import { useAuth } from '../../Auth/AuthContext';

function ManageRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRoute, setNewRoute] = useState({
    routeName: '',
    startLocation: '',
    endLocation: '',
    date: '',
    time: '',
    isActive: true});
  const { currentUser, logout } = useAuth();

  // Fetch routes from API
  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:3000/api/route/getAllRoutes", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to fetch routes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setRoutes(data);
      } else if (data.routes && Array.isArray(data.routes)) {
        setRoutes(data.routes);
      } else if (data.data && Array.isArray(data.data)) {
        setRoutes(data.data);
      } else {
        setRoutes([]);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      setError("Error fetching routes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form change for new route
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoute({
      ...newRoute,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Create new route
  const handleCreateRoute = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:3000/api/route/createRoutes", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRoute),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create route");
      }
      
      const data = await res.json();
      setRoutes([...routes, data]);
      setShowModal(false);
      setNewRoute({
        routeName: '',
        startLocation: '',
        endLocation: '',
        date: '',
        time: '',
        isActive: true
      });
      alert("Route created successfully!");
    } catch (error) {
      console.error("Error creating route:", error);
      alert("Error creating route: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update route
  const handleUpdateRoute = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/route/updateRouteById/${selectedRoute._id}`, {
        method: "PUT",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRoute),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update route");
      }
      
      const data = await res.json();
      setRoutes(routes.map(route => route._id === selectedRoute._id ? data : route));
      setShowModal(false);
      setEditMode(false);
      setSelectedRoute(null);
      setNewRoute({
        routeName: '',
        startLocation: '',
        endLocation: '',
        date: '',
        time: '',
        isActive: true
      });
      alert("Route updated successfully!");
    } catch (error) {
      console.error("Error updating route:", error);
      alert("Error updating route: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete route
  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/route/deleteRouteById/${routeId}`, { 
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        throw new Error("Failed to delete route");
      }
      
      setRoutes(routes.filter((route) => route._id !== routeId));
      alert("Route deleted successfully!");
    } catch (error) {
      console.error("Error deleting route:", error);
      alert("Error deleting route: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle route active status
  const toggleRouteStatus = async (route) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/route/updateRouteById/${route._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !route.isActive })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        throw new Error("Failed to update route status");
      }
      
      // Update local state
      setRoutes(routes.map(r => 
        r._id === route._id 
          ? { ...r, isActive: !r.isActive } 
          : r
      ));
      
      alert("Route status updated successfully!");
    } catch (error) {
      console.error("Error updating route status:", error);
      alert("Error updating route status: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (route) => {
    setSelectedRoute(route);
    setEditMode(true);
    setNewRoute({
      routeName: route.routeName,
      startLocation: route.startLocation,
      endLocation: route.endLocation,
      date: route.date.split('T')[0], // Format date for input
      time: route.time,
      isActive: route.isActive
    });
    setShowModal(true);
  };

  // Filter routes based on search term
  const filteredRoutes = Array.isArray(routes) ? routes.filter(route => 
    route.routeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.routeID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.startLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.endLocation?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if current user has permission to manage routes
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <Leaf className="h-5 w-5 text-green-600" />
              <span>Waste Management</span>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                aria-label="Search"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <button className="relative rounded-xl p-2 hover:bg-gray-100" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400" />
              <span className="text-sm">{currentUser.name || 'Admin'}</span>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-2 rounded-xl p-2 hover:bg-gray-100 text-red-600"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Manage Routes</h1>
          <button
            onClick={() => {
              setEditMode(false);
              setSelectedRoute(null);
              setNewRoute({
                routeName: '',
                startLocation: '',
                endLocation: '',
                date: '',
                time: '',
                isActive: true
              });
              setShowModal(true);
            }}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Plus size={18} /> Add New Route
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <p>Loading routes...</p>
          </div>
        )}

        {/* Routes Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 font-medium text-gray-700">Route ID</th>
                <th className="py-3 px-4 font-medium text-gray-700">Route Name</th>
                <th className="py-3 px-4 font-medium text-gray-700">Start Location</th>
                <th className="py-3 px-4 font-medium text-gray-700">End Location</th>
                <th className="py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="py-3 px-4 font-medium text-gray-700">Time</th>
                <th className="py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map((route) => (
                <tr key={route._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono">{route.routeID}</td>
                  <td className="py-3 px-4">{route.routeName}</td>
                  <td className="py-3 px-4">{route.startLocation}</td>
                  <td className="py-3 px-4">{route.endLocation}</td>
                  <td className="py-3 px-4">{formatDate(route.date)}</td>
                  <td className="py-3 px-4">{route.time}</td>
                  <td className="py-3 px-4">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        route.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {route.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex items-center gap-3">
                    <button
                      onClick={() => openEditModal(route)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      title="Edit Route"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => toggleRouteStatus(route)}
                      disabled={loading}
                      className={`px-3 py-1 rounded text-sm ${
                        route.isActive 
                          ? "bg-red-100 text-red-800 hover:bg-red-200" 
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      } disabled:opacity-50`}
                      title={route.isActive ? "Deactivate Route" : "Activate Route"}
                    >
                      {route.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteRoute(route._id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50"
                      title="Delete Route"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRoutes.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <p>No routes found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Route Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? 'Edit Route' : 'Add New Route'}
            </h2>
            <form onSubmit={editMode ? handleUpdateRoute : handleCreateRoute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Name *
                </label>
                <input
                  type="text"
                  name="routeName"
                  placeholder="Enter route name"
                  value={newRoute.routeName}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Location *
                </label>
                <input
                  type="text"
                  name="startLocation"
                  placeholder="Enter start location"
                  value={newRoute.startLocation}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Location *
                </label>
                <input
                  type="text"
                  name="endLocation"
                  placeholder="Enter end location"
                  value={newRoute.endLocation}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={newRoute.date}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={newRoute.time}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={newRoute.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active Route
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(false);
                    setSelectedRoute(null);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (editMode ? 'Update Route' : 'Create Route')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageRoutes;
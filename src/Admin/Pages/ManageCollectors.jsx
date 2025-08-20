import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Bell,
  Search,
  Trash2,
  Eye,
  EyeOff,
  UserPlus,
  LogOut,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Hash,
  Calendar,
  Edit,
  CheckCircle,
  XCircle,
  Truck
} from "lucide-react";
import { useAuth } from '../../Auth/AuthContext';

function ManageCollectors() {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [profilePreview, setProfilePreview] = useState(null);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [newCollector, setNewCollector] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    addressLine1: '',
    houseNumber: '',
    city: 'Colombo',
    aTaxNumber: '',
    postalCode: '',
    profilePicture: null,
    vehicleType: '',
    vehicleNumber: ''
  });
  const { currentUser, logout } = useAuth();

  // Fetch collectors from API
  useEffect(() => {
    fetchCollectors();
  }, []);

  const fetchCollectors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:3000/api/collector/getcollectors", {
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
        throw new Error(`Failed to fetch collectors: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check if data is an array, if not, convert it to an array
      if (Array.isArray(data)) {
        setCollectors(data);
      } else if (data.collectors && Array.isArray(data.collectors)) {
        // If response has a collectors property that is an array
        setCollectors(data.collectors);
      } else if (data.data && Array.isArray(data.data)) {
        // If response has a data property that is an array
        setCollectors(data.data);
      } else {
        // If it's a single object, wrap it in an array
        setCollectors([data]);
      }
    } catch (error) {
      console.error("Error fetching collectors:", error);
      setError("Error fetching collectors: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form change for new collector
  const handleChange = (e) => {
    setNewCollector({ ...newCollector, [e.target.name]: e.target.value });
  };

  // Handle profile picture upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCollector({ ...newCollector, profilePicture: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create new collector
  const handleCreateCollector = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Append all collector data to formData
      Object.keys(newCollector).forEach(key => {
        if (newCollector[key] !== null) {
          formData.append(key, newCollector[key]);
        }
      });
      
      const res = await fetch("http://localhost:3000/api/collector/register", {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create collector");
      }
      
      const data = await res.json();
      setCollectors([...collectors, data]);
      setShowModal(false);
      setNewCollector({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        addressLine1: '',
        houseNumber: '',
        city: 'Colombo',
        aTaxNumber: '',
        postalCode: '',
        profilePicture: null,
        vehicleType: '',
        vehicleNumber: ''
      });
      setProfilePreview(null);
      alert("Collector created successfully!");
    } catch (error) {
      console.error("Error creating collector:", error);
      alert("Error creating collector: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete collector
  const handleDeleteCollector = async (collectorId) => {
    if (!window.confirm("Are you sure you want to delete this collector?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/collector/${collectorId}`, { 
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
        throw new Error("Failed to delete collector");
      }
      
      setCollectors(collectors.filter((c) => c.collectorId !== collectorId));
      setSelectedCollector(null);
      setViewMode('table');
      alert("Collector deleted successfully!");
    } catch (error) {
      console.error("Error deleting collector:", error);
      alert("Error deleting collector: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle collector active status
  const toggleCollectorStatus = async (collector) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/collector/${collector.collectorId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isOnline: collector.isOnline === "Active" ? "inActive" : "Active" })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        throw new Error("Failed to update collector status");
      }
      
      // Update local state
      setCollectors(collectors.map(c => 
        c.collectorId === collector.collectorId 
          ? { ...c, isOnline: c.isOnline === "Active" ? "inActive" : "Active" } 
          : c
      ));
      
      if (selectedCollector && selectedCollector.collectorId === collector.collectorId) {
        setSelectedCollector({
          ...selectedCollector, 
          isOnline: selectedCollector.isOnline === "Active" ? "inActive" : "Active"
        });
      }
      
      alert("Collector status updated successfully!");
    } catch (error) {
      console.error("Error updating collector status:", error);
      alert("Error updating collector status: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter collectors based on search term
  const filteredCollectors = Array.isArray(collectors) ? collectors.filter(collector => 
    collector.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collector.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collector.collectorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collector.phoneNumber?.includes(searchTerm)
  ) : [];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if current user has permission to manage collectors
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
      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {viewMode === 'table' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Manage Collectors</h1>
              <button
                onClick={() => setShowModal(true)}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <UserPlus size={18} /> Add New Collector
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading && (
              <div className="bg-white p-4 rounded-lg shadow mb-4">
                <p>Loading collectors...</p>
              </div>
            )}

            {/* Collectors Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 font-medium text-gray-700">Profile</th>
                    <th className="py-3 px-4 font-medium text-gray-700">Collector ID</th>
                    <th className="py-3 px-4 font-medium text-gray-700">Full Name</th>
                    <th className="py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollectors.map((collector) => (
                    <tr key={collector.collectorId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {collector.profilePicture ? (
                          <img 
                            src={collector.profilePicture} 
                            alt={collector.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User size={20} className="text-gray-500" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">{collector.collectId}</td>
                      <td className="py-3 px-4">{collector.fullName}</td>
                      <td className="py-3 px-4">{collector.email}</td>

                      <td className="py-3 px-4">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            collector.isOnline === "Active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {collector.isOnline || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedCollector(collector);
                            setViewMode('detail');
                          }}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => toggleCollectorStatus(collector)}
                          disabled={loading}
                          className={`px-3 py-1 rounded text-sm ${
                            collector.isOnline === "Active" 
                              ? "bg-red-100 text-red-800 hover:bg-red-200" 
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          } disabled:opacity-50`}
                          title={collector.isOnline === "Active" ? "Deactivate Collector" : "Activate Collector"}
                        >
                          {collector.isOnline === "Active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteCollector(collector.collectorId)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50"
                          title="Delete Collector"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCollectors.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <p>No collectors found.</p>
                </div>
              )}
            </div>
          </>
        )}

        {viewMode === 'detail' && selectedCollector && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedCollector.profilePicture ? (
                    <img 
                      src={selectedCollector.profilePicture} 
                      alt={selectedCollector.fullName}
                      className="h-16 w-16 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
                      <User size={32} className="text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">{selectedCollector.fullName}</h1>
                    <p className="text-emerald-100">{selectedCollector.collectorId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCollector.isOnline === "Active" 
                        ? "bg-white text-green-700" 
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedCollector.isOnline === "Active" ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={16} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle size={16} /> Inactive
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => toggleCollectorStatus(selectedCollector)}
                    disabled={loading}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedCollector.isOnline === "Active" 
                        ? "bg-white text-red-600 hover:bg-red-50" 
                        : "bg-white text-green-600 hover:bg-green-50"
                    } disabled:opacity-50`}
                  >
                    {selectedCollector.isOnline === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={18} /> Personal Information
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="text-gray-500" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedCollector.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="text-gray-500" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">{selectedCollector.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Hash className="text-gray-500" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">Tax Number</p>
                        <p className="font-medium">{selectedCollector.aTaxNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="text-gray-500" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">{formatDate(selectedCollector.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin size={18} /> Address Information
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{selectedCollector.addressLine1}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-sm text-gray-500">House Number</p>
                        <p className="font-medium">{selectedCollector.houseNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="font-medium">{selectedCollector.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Postal Code</p>
                        <p className="font-medium">{selectedCollector.postalCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Truck size={18} /> Vehicle Information
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Type</p>
                      <p className="font-medium">{selectedCollector.vehicleType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Number</p>
                      <p className="font-medium">{selectedCollector.vehicleNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText size={18} /> Account Information
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Collector ID</p>
                      <p className="font-medium font-mono">{selectedCollector.collectorId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium capitalize">{selectedCollector.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Status</p>
                      <p className="font-medium">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedCollector.isOnline === "Active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedCollector.isOnline || 'N/A'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">{formatDate(selectedCollector.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleDeleteCollector(selectedCollector.collectorId)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={16} /> Delete Collector
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Collector Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New Collector</h2>
            <form onSubmit={handleCreateCollector} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profilePreview ? (
                      <img 
                        src={profilePreview} 
                        alt="Profile preview" 
                        className="h-20 w-20 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border">
                        <User size={32} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-green-500">
                      <Upload className="w-6 h-6 text-gray-500 mb-1" />
                      <span className="text-sm text-gray-600">Upload photo</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={loading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max 5MB)</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter full name"
                  value={newCollector.fullName}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={newCollector.email}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  value={newCollector.phoneNumber}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    value={newCollector.password}
                    onChange={handleChange}
                    className="w-full border rounded p-2 pr-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-gray-500" />
                    ) : (
                      <Eye size={18} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  placeholder="Enter address line 1"
                  value={newCollector.addressLine1}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  House Number *
                </label>
                <input
                  type="text"
                  name="houseNumber"
                  placeholder="Enter house number"
                  value={newCollector.houseNumber}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={newCollector.city}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Number *
                </label>
                <input
                  type="text"
                  name="aTaxNumber"
                  placeholder="Enter tax number"
                  value={newCollector.aTaxNumber}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Enter postal code"
                  value={newCollector.postalCode}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  name="vehicleType"
                  placeholder="e.g., Truck, Van"
                  value={newCollector.vehicleType}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  placeholder="Vehicle registration number"
                  value={newCollector.vehicleNumber}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setProfilePreview(null);
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
                  {loading ? 'Creating...' : 'Create Collector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCollectors;
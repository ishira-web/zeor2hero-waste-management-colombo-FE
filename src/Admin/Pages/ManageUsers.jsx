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
  MoreVertical
} from "lucide-react";
import { useAuth } from '../../Auth/AuthContext';
import { toast } from 'react-toastify';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [profilePreview, setProfilePreview] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'detail'
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    addressLine1: '',
    houseNumber: '',
    city: 'Colombo',
    aTaxNumber: '',
    postalCode: '',
    profilePicture: null
  });
  const { currentUser, logout } = useAuth();

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:3000/api/user/all", {
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
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Error fetching users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form change for new user
  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // Handle profile picture upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewUser({ ...newUser, profilePicture: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Append all user data to formData
      Object.keys(newUser).forEach(key => {
        if (newUser[key] !== null) {
          formData.append(key, newUser[key]);
        }
      });
      
      const res = await fetch("http://localhost:3000/api/user/create", {
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
        throw new Error(errorData.message || "Failed to create user");
      }
      
      const data = await res.json();
      setUsers([...users, data]);
      setShowModal(false);
      setNewUser({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        addressLine1: '',
        houseNumber: '',
        city: 'Colombo',
        aTaxNumber: '',
        postalCode: '',
        profilePicture: null
      });
      setProfilePreview(null);
      toast.success("User created successfully!");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Error creating user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (dwellerID) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/user/${dwellerId}`, { 
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
        throw new Error("Failed to delete user");
      }
      
      setUsers(users.filter((u) => u.dwellerID !== dwellerID));
      setSelectedUser(null);
      setViewMode('table');
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (user) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/user/${user.dwellerID}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: user.isActive === "Active" ? "inActive" : "Active" })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        throw new Error("Failed to update user status");
      }
      
      // Update local state
      setUsers(users.map(u => 
        u.dwellerID === user.dwellerID 
          ? { ...u, isActive: u.isActive === "Active" ? "inActive" : "Active" } 
          : u
      ));
      
      if (selectedUser && selectedUser.dwellerID === user.dwellerID) {
        setSelectedUser({
          ...selectedUser, 
          isActive: selectedUser.isActive === "Active" ? "inActive" : "Active"
        });
      }
      
      alert("User status updated successfully!");
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Error updating user status: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.dwellerID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber.includes(searchTerm)
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if current user has permission to manage users
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
              <h1 className="text-2xl font-semibold text-gray-800">Manage Users</h1>
              <button
                onClick={() => setShowModal(true)}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <UserPlus size={18} /> Add New User
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading && (
              <div className="bg-white p-4 rounded-lg shadow mb-4">
                <p>Loading users...</p>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 font-medium text-gray-700">Profile</th>
                    <th className="py-3 px-4 font-medium text-gray-700">User ID</th>
                    <th className="py-3 px-4 font-medium text-gray-700">Full Name</th>
                    <th className="py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.dwellerID} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {user.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User size={20} className="text-gray-500" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">{user.dwellerId}</td>
                      <td className="py-3 px-4">{user.fullName}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive === "Active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setViewMode('detail');
                          }}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user)}
                          disabled={loading}
                          className={`px-3 py-1 rounded text-sm ${
                            user.isActive === "Active" 
                              ? "bg-red-100 text-red-800 hover:bg-red-200" 
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          } disabled:opacity-50`}
                          title={user.isActive === "Active" ? "Deactivate User" : "Activate User"}
                        >
                          {user.isActive === "Active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.dwellerID)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <p>No users found.</p>
                </div>
              )}
            </div>
          </>
        )}

        {viewMode === 'detail' && selectedUser && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedUser.profilePicture ? (
                    <img 
                      src={selectedUser.profilePicture} 
                      alt={selectedUser.fullName}
                      className="h-16 w-16 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white">
                      <User size={32} className="text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">{selectedUser.fullName}</h1>
                    <p className="text-emerald-100">{selectedUser.dwellerID}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.isActive === "Active" 
                        ? "bg-white text-green-700" 
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedUser.isActive === "Active" ? (
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
                    onClick={() => toggleUserStatus(selectedUser)}
                    disabled={loading}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedUser.isActive === "Active" 
                        ? "bg-white text-red-600 hover:bg-red-50" 
                        : "bg-white text-green-600 hover:bg-green-50"
                    } disabled:opacity-50`}
                  >
                    {selectedUser.isActive === "Active" ? "Deactivate" : "Activate"}
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
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="text-gray-500" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium">{selectedUser.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Hash className="text-gray-500" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">Tax Number</p>
                        <p className="font-medium">{selectedUser.aTaxNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="text-gray-500" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
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
                      <p className="font-medium">{selectedUser.addressLine1}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-sm text-gray-500">House Number</p>
                        <p className="font-medium">{selectedUser.houseNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="font-medium">{selectedUser.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Postal Code</p>
                        <p className="font-medium">{selectedUser.postalCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText size={18} /> Account Information
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium font-mono">{selectedUser.dwellerID}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium capitalize">{selectedUser.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Status</p>
                      <p className="font-medium">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedUser.isActive === "Active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedUser.isActive}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">{formatDate(selectedUser.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleDeleteUser(selectedUser.dwellerID)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={16} /> Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  value={newUser.fullName}
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
                  value={newUser.email}
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
                  value={newUser.phoneNumber}
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
                    value={newUser.password}
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
                  value={newUser.addressLine1}
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
                  value={newUser.houseNumber}
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
                  value={newUser.city}
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
                  value={newUser.aTaxNumber}
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
                  value={newUser.postalCode}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
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
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
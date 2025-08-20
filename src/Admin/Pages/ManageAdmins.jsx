import React, { useEffect, useState } from "react";
import { Trash2, UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuth } from '../../Auth/AuthContext';
import { toast } from "react-toastify";

function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ 
    name: "", 
    email: "", 
    password: "",
  });
  
  const { currentUser } = useAuth();

  // Fetch admins
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:3000/api/admin/allAdmin", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Failed to fetch admins: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      alert("Error fetching admins: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form change
  const handleChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  // Create new admin
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:3000/api/admin/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAdmin),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create admin");
      }
      
      const data = await res.json();
      setAdmins([...admins, data]);
      setShowModal(false);
      setNewAdmin({ name: "", email: "", password: "", role: "admin" });
      toast.success("Admin created successfully!");
    } catch (error) {
      console.error("Error creating admin:", error);
     toast.error("Error creating admin: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete admin
  const handleDelete = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/allAdmin/${adminId}`, { 
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
        throw new Error("Failed to delete admin");
      }
      
      setAdmins(admins.filter((a) => a.adminId !== adminId));
      toast.success("Admin deleted successfully!");
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Error deleting admin: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle admin active status
  const toggleActiveStatus = async (adminId, currentStatus) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/allAdmin/${adminId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          return;
        }
        throw new Error("Failed to update admin status");
      }
      
      // Update local state
      setAdmins(admins.map(admin => 
        admin.adminId === adminId 
          ? { ...admin, isActive: !currentStatus } 
          : admin
      ));
      
      toast.success(`Admin ${currentStatus ? "deactivated" : "activated"} successfully!`);
    } catch (error) {
      console.error("Error updating admin status:", error);
      alert("Error updating admin status: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user has permission to manage admins
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
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <header>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Manage Admins</h1>
          <button
            onClick={() => setShowModal(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <UserPlus size={18} /> Add New Admin
          </button>
        </div>
      </header>

      {loading && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <p>Loading...</p>
        </div>
      )}

      {/* Admin Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 font-medium text-gray-700">Admin ID</th>
              <th className="py-3 px-4 font-medium text-gray-700">Name</th>
              <th className="py-3 px-4 font-medium text-gray-700">Email</th>
              <th className="py-3 px-4 font-medium text-gray-700">Role</th>
              <th className="py-3 px-4 font-medium text-gray-700">Status</th>
              <th className="py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.adminId} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{admin.adminId}</td>
                <td className="py-3 px-4">{admin.name}</td>
                <td className="py-3 px-4">{admin.email}</td>
                <td className="py-3 px-4 capitalize">{admin.role}</td>
                <td className="py-3 px-4">
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      admin.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {admin.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4 flex items-center gap-3">
                  <button
                    onClick={() => toggleActiveStatus(admin.adminId, admin.isActive)}
                    disabled={loading}
                    className={`px-3 py-1 rounded text-sm ${
                      admin.isActive 
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300" 
                        : "bg-green-200 text-green-800 hover:bg-green-300"
                    } disabled:opacity-50`}
                  >
                    {admin.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(admin.adminId)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50"
                    title="Delete Admin"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {admins.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <p>No admins found.</p>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add New Admin</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={newAdmin.name}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={newAdmin.email}
                  onChange={handleChange}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    value={newAdmin.password}
                    onChange={handleChange}
                    className="w-full border rounded p-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAdmins;
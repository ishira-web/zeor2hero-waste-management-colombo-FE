import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  ChevronDown,
  Calendar,
  Clock,
  MapPin,
  Users,
  Route,
  CheckCircle,
  XCircle,
  Bell,
  Leaf,
  UserCheck,
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ManageTime() {
  // State for timetable data
  const [timetables, setTimetables] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [routes, setRoutes] = useState([]);
  
  // State for new timetable form
  const [showAddTimetable, setShowAddTimetable] = useState(false);
  const [newTimetable, setNewTimetable] = useState({
    collectorID: '',
    collectionDay: '',
    collectionTime: '',
    collectionLocation: '',
    routeName: '',
    crewMembers: [],
    isActive: true
  });
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for loading
  const [loading, setLoading] = useState(true);

  // Areas in Colombo for selection
  const colomboAreas = [
    "Colombo 1 (Fort)", "Colombo 2 (Slave Island)", "Colombo 3 (Kollupitiya)", 
    "Colombo 4 (Bambalapitiya)", "Colombo 5 (Havelock Town)", "Colombo 6 (Wellawatte)",
    "Colombo 7 (Cinnamon Gardens)", "Colombo 8 (Borella)", "Colombo 9 (Dematagoda)",
    "Colombo 10 (Maradana)", "Colombo 11 (Pettah)", "Colombo 12 (Hulftsdorp)",
    "Colombo 13 (Kotahena)", "Colombo 14 (Grandpass)", "Colombo 15 (Mutwal)"
  ];

  // Fetch timetables, collectors, and routes on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch collectors
      const collectorResponse = await fetch('http://localhost:3000/api/collector/getcollectors');
      if (!collectorResponse.ok) {
        throw new Error(`HTTP error! status: ${collectorResponse.status}`);
      }
      const collectorData = await collectorResponse.json();
      if (collectorData.collectors) {
        setCollectors(collectorData.collectors);
      } else {
        toast.error('Failed to fetch collectors - invalid response format');
      }
      
      // Fetch routes
      const routeResponse = await fetch('http://localhost:3000/api/route/getAllRoutes');
      if (!routeResponse.ok) {
        throw new Error(`HTTP error! status: ${routeResponse.status}`);
      }
      const routeData = await routeResponse.json();
      if (routeData.routes) {
        setRoutes(routeData.routes);
      } else {
        toast.error('Failed to fetch routes - invalid response format');
      }
      
      // Fetch timetables - try different endpoints
      let timetableResponse;
      let timetableData;
      
      // Try the correct endpoint first
      try {
        timetableResponse = await fetch('http://localhost:3000/api/timetable/all');
        if (!timetableResponse.ok) {
          throw new Error(`HTTP error! status: ${timetableResponse.status}`);
        }
        timetableData = await timetableResponse.json();
      } catch (err) {
        // Fallback to the other endpoint if the first one fails
        console.log('First timetable endpoint failed, trying fallback...');
        timetableResponse = await fetch('http://localhost:3000/api/timetable/getall');
        if (!timetableResponse.ok) {
          throw new Error(`HTTP error! status: ${timetableResponse.status}`);
        }
        timetableData = await timetableResponse.json();
      }
      
      if (timetableData.timeTables) {
        setTimetables(timetableData.timeTables);
      } else {
        toast.error('Failed to fetch timetables - invalid response format');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.message.includes('JSON')) {
        toast.error('Server returned invalid data. Please check if the API endpoints are correct.');
      } else if (err.message.includes('404')) {
        toast.error('API endpoint not found. Please check the server routes.');
      } else {
        toast.error('Failed to fetch data. Please check if the server is running.');
      }
      setLoading(false);
    }
  };

  // Function to handle adding a new timetable
  const handleAddTimetable = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/timetable/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTimetable),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (response.ok) {
        setTimetables([...timetables, data.timeTable]);
        setNewTimetable({
          collectorID: '',
          collectionDay: '',
          collectionTime: '',
          collectionLocation: '',
          routeName: '',
          crewMembers: [],
          isActive: true
        });
        setShowAddTimetable(false);
        toast.success('Timetable created successfully!');
        // Refresh the data
        fetchData();
      } else {
        toast.error(data.message || 'Failed to create timetable');
      }
    } catch (err) {
      console.error('Error creating timetable:', err);
      if (err.message.includes('JSON')) {
        toast.error('Server returned invalid response. Please check the API endpoint.');
      } else {
        toast.error('Failed to create timetable. Please check your connection.');
      }
    }
  };

  // Function to handle toggling timetable status
  const toggleTimetableStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/timetable/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (response.ok) {
        // Update the local state
        setTimetables(timetables.map(timetable => 
          timetable._id === id ? { ...timetable, isActive: !currentStatus } : timetable
        ));
        toast.success(`Timetable ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update timetable');
      }
    } catch (err) {
      console.error('Error updating timetable:', err);
      toast.error('Failed to update timetable');
    }
  };

  // Function to handle deleting a timetable
  const handleDeleteTimetable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timetable?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/timetable/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (response.ok) {
        setTimetables(timetables.filter(timetable => timetable._id !== id));
        toast.success('Timetable deleted successfully!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete timetable');
      }
    } catch (err) {
      console.error('Error deleting timetable:', err);
      toast.error('Failed to delete timetable');
    }
  };

  // Filter timetables based on search query and status filter
  const filteredTimetables = timetables.filter(timetable => {
    const matchesSearch = 
      (timetable.timeTableID && timetable.timeTableID.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (timetable.collectorID && timetable.collectorID.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (timetable.collectionLocation && timetable.collectionLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (timetable.routeName && timetable.routeName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && timetable.isActive) ||
                         (statusFilter === 'inactive' && !timetable.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Days of the week for selection
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Get collector name by ID
  const getCollectorName = (id) => {
    const collector = collectors.find(c => c._id === id);
    return collector ? collector.fullName : 'Unknown Collector';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading timetables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <Leaf className="h-5 w-5 text-green-600" />
              <span>Waste Management</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                aria-label="Search"
                placeholder="Search timetables, locations..."
                className="w-72 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <button className="relative rounded-xl p-2 hover:bg-gray-100" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400" />
              <span className="text-sm hidden sm:inline">Admin</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600">Manage collection schedules and crew assignments</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-600">Total Schedules</h3>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{timetables.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-600">Active Schedules</h3>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{timetables.filter(t => t.isActive).length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-600">Inactive Schedules</h3>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{timetables.filter(t => !t.isActive).length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-600">Available Crew</h3>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{collectors.length}</p>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search timetables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50 pr-8"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="h-4 w-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            
            <button 
              onClick={() => setShowAddTimetable(true)}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 flex-1 sm:flex-none justify-center"
            >
              <Plus className="h-4 w-4" />
              <span>New Schedule</span>
            </button>
          </div>
        </div>

        {/* Timetables table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Leader</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crew Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTimetables.map((timetable) => (
                  <tr key={timetable._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{timetable.timeTableID}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-500" />
                        <span className="text-gray-900">{getCollectorName(timetable.collectorID)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{timetable.collectionDay}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{timetable.collectionTime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{timetable.collectionLocation}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Route className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{timetable.routeName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{timetable.crewMembers?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => toggleTimetableStatus(timetable._id, timetable.isActive)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${timetable.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {timetable.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTimetable(timetable._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredTimetables.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No schedules found</h3>
            <p className="text-gray-500 mb-4">Get started by creating a new collection schedule.</p>
            <button 
              onClick={() => setShowAddTimetable(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              <span>New Schedule</span>
            </button>
          </div>
        )}
      </main>

      {/* Add Timetable Modal */}
      {showAddTimetable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create New Schedule</h2>
            </div>
            
            <form onSubmit={handleAddTimetable} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Leader</label>
                  <select
                    required
                    value={newTimetable.collectorID}
                    onChange={(e) => setNewTimetable({...newTimetable, collectorID: e.target.value})}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a team leader</option>
                    {collectors.map(collector => (
                      <option key={collector._id} value={collector._id}>
                        {collector.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collection Day</label>
                  <select
                    required
                    value={newTimetable.collectionDay}
                    onChange={(e) => setNewTimetable({...newTimetable, collectionDay: e.target.value})}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a day</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Collection Time</label>
                  <input
                    type="time"
                    required
                    value={newTimetable.collectionTime}
                    onChange={(e) => setNewTimetable({...newTimetable, collectionTime: e.target.value})}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                  <select
                    required
                    value={newTimetable.routeName}
                    onChange={(e) => setNewTimetable({...newTimetable, routeName: e.target.value})}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a route</option>
                    {routes.map(route => (
                      <option key={route._id} value={route.routeName}>
                        {route.routeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collection Location</label>
                <select
                  required
                  value={newTimetable.collectionLocation}
                  onChange={(e) => setNewTimetable({...newTimetable, collectionLocation: e.target.value})}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a location in Colombo</option>
                  {colomboAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crew Members</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-xl">
                  {collectors.map(collector => (
                    <div key={collector._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`crew-${collector._id}`}
                        checked={newTimetable.crewMembers.includes(collector._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTimetable({
                              ...newTimetable,
                              crewMembers: [...newTimetable.crewMembers, collector._id]
                            });
                          } else {
                            setNewTimetable({
                              ...newTimetable,
                              crewMembers: newTimetable.crewMembers.filter(id => id !== collector._id)
                            });
                          }
                        }}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor={`crew-${collector._id}`} className="ml-2 text-sm text-gray-700">
                        {collector.fullName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newTimetable.isActive}
                  onChange={(e) => setNewTimetable({...newTimetable, isActive: e.target.checked})}
                  className="rounded text-green-600 focus:ring-green-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active Schedule
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTimetable(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageTime;
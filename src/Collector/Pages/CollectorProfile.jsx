import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  CheckCircle,
  XCircle,
  Edit,
  Mail,
  Phone,
  Map,
  Truck,
  Star,
  Award,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Filter,
  Search,
  Plus,
  RefreshCw
} from "lucide-react";

function CollectorProfile() {
  // Mock data for the collector
  const [collector, setCollector] = useState({
    id: "COL12345",
    name: "Rajesh Perera",
    email: "rajesh@wastemgmt.com",
    phone: "+94 77 123 4567",
    address: "123 Galle Road, Colombo 3",
    experience: "3 years",
    rating: 4.7,
    completedCollections: 245,
    vehicle: "Toyota Hilux (WP CAB 1234)",
    status: "Active",
    team: "Team Alpha"
  });

  // Mock timetable data
  const [timetables, setTimetables] = useState([
    { id: 1, day: "Monday", time: "08:00 - 12:00", area: "Colombo 3", crew: ["Saman", "Nimal", "Kamal"], status: "Scheduled" },
    { id: 2, day: "Tuesday", time: "09:00 - 13:00", area: "Colombo 7", crew: ["Saman", "Priya"], status: "In Progress" },
    { id: 3, day: "Wednesday", time: "10:00 - 14:00", area: "Colombo 5", crew: ["Nimal", "Kamal", "Lakmal"], status: "Completed" },
    { id: 4, day: "Thursday", time: "08:30 - 12:30", area: "Colombo 2", crew: ["Saman", "Nimal"], status: "Scheduled" },
    { id: 5, day: "Friday", time: "07:30 - 11:30", area: "Colombo 6", crew: ["Kamal", "Priya", "Lakmal"], status: "Scheduled" }
  ]);

  // Mock requests data
  const [requests, setRequests] = useState([
    { id: "REQ001", address: "45 Park Street, Colombo 2", type: "Extra Collection", time: "Today, 10:30 AM", status: "Pending" },
    { id: "REQ002", address: "78 Marine Drive, Colombo 3", type: "Emergency", time: "Today, 11:15 AM", status: "Pending" },
    { id: "REQ003", address: "12 Lotus Road, Colombo 5", type: "Special Handling", time: "Yesterday, 3:45 PM", status: "Completed" }
  ]);

  const [activeTab, setActiveTab] = useState("timetable");
  const [notificationCount, setNotificationCount] = useState(3);

  // Handle request status change
  const handleRequestStatus = (id, newStatus) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: newStatus } : request
    ));
    
    if (newStatus === "Accepted") {
      setNotificationCount(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-green-800 text-white min-h-screen p-4">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8 mt-2">
            <Truck className="h-7 w-7 text-green-300" />
            <span className="text-xl font-bold">WasteCollect</span>
          </div>
          
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab("timetable")}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "timetable" ? "bg-green-700 text-white" : "hover:bg-green-700 text-green-100"} w-full text-left`}
            >
              <Calendar className="h-5 w-5" />
              <span>Timetable</span>
            </button>
            <button 
              onClick={() => setActiveTab("requests")}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "requests" ? "bg-green-700 text-white" : "hover:bg-green-700 text-green-100"} w-full text-left`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Requests</span>
              {notificationCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "profile" ? "bg-green-700 text-white" : "hover:bg-green-700 text-green-100"} w-full text-left`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === "settings" ? "bg-green-700 text-white" : "hover:bg-green-700 text-green-100"} w-full text-left`}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-green-700">
          <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-green-700 text-green-100">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-screen bg-gray-50">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">
                {activeTab === "timetable" && "My Timetable"}
                {activeTab === "requests" && "Collection Requests"}
                {activeTab === "profile" && "My Profile"}
                {activeTab === "settings" && "Settings"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative rounded-xl p-2 hover:bg-gray-100" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5">
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-white text-xs font-medium">
                  {collector.name.charAt(0)}
                </div>
                <span className="text-sm hidden sm:inline">{collector.name}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-4 md:p-6">
          {/* Timetable View */}
          {activeTab === "timetable" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Weekly Collection Schedule</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        placeholder="Search schedule..."
                        className="w-48 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>
                    <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timetables.map(timetable => (
                    <div key={timetable.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{timetable.day}</h3>
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{timetable.time}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          timetable.status === "Completed" ? "bg-green-100 text-green-800" :
                          timetable.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {timetable.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-gray-700 mb-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{timetable.area}</span>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <Users className="h-4 w-4" />
                          <span>Crew Members ({timetable.crew.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {timetable.crew.map((member, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Tuesday Collection</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>09:00 - 13:00</span>
                      <MapPin className="h-4 w-4 ml-2" />
                      <span>Colombo 7</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                      Start Route
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Requests View */}
          {activeTab === "requests" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Collection Requests</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        placeholder="Search requests..."
                        className="w-48 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>
                    <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50">
                      <Filter className="h-4 w-4" />
                      <span>Filter</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {requests.map(request => (
                    <div key={request.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{request.type} Request</h3>
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>{request.address}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{request.time}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === "Completed" ? "bg-green-100 text-green-800" :
                          request.status === "Accepted" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      
                      {request.status === "Pending" && (
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => handleRequestStatus(request.id, "Accepted")}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Accept
                          </button>
                          <button 
                            onClick={() => handleRequestStatus(request.id, "Declined")}
                            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile View */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-white text-3xl font-medium mb-4">
                      {collector.name.charAt(0)}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{collector.name}</h2>
                    <p className="text-gray-600 mt-1">Waste Collection Specialist</p>
                    
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`h-4 w-4 ${star <= Math.floor(collector.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">({collector.rating})</span>
                    </div>
                    
                    <div className="mt-6 w-full space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{collector.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{collector.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Map className="h-4 w-4" />
                        <span>{collector.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Truck className="h-4 w-4" />
                        <span>{collector.vehicle}</span>
                      </div>
                    </div>
                    
                    <button className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Stats</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-800">{collector.completedCollections}</div>
                      <div className="text-sm text-green-600">Collections</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-800">{collector.experience}</div>
                      <div className="text-sm text-blue-600">Experience</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-800">98%</div>
                      <div className="text-sm text-purple-600">Completion Rate</div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-amber-800">12</div>
                      <div className="text-sm text-amber-600">Awards</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Award className="h-5 w-5 text-amber-500" />
                      <div>
                        <h3 className="font-medium text-gray-900">Employee of the Month</h3>
                        <p className="text-sm text-gray-600">Awarded for exceptional performance in March</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Award className="h-5 w-5 text-amber-500" />
                      <div>
                        <h3 className="font-medium text-gray-900">Perfect Attendance</h3>
                        <p className="text-sm text-gray-600">6 consecutive months with perfect attendance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Award className="h-5 w-5 text-amber-500" />
                      <div>
                        <h3 className="font-medium text-gray-900">Safety Excellence</h3>
                        <p className="text-sm text-gray-600">Recognized for outstanding safety practices</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings View */}
          {activeTab === "settings" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Notification Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Email Notifications</label>
                      <input type="checkbox" className="rounded text-green-600" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">SMS Alerts</label>
                      <input type="checkbox" className="rounded text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Request Notifications</label>
                      <input type="checkbox" className="rounded text-green-600" defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Appearance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Dark Mode</label>
                      <input type="checkbox" className="rounded text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Language</label>
                      <select className="rounded border border-gray-300 px-2 py-1 text-sm">
                        <option>English</option>
                        <option>Sinhala</option>
                        <option>Tamil</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Change Password</h3>
                <div className="space-y-3 max-w-md">
                  <input 
                    type="password" 
                    placeholder="Current Password" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input 
                    type="password" 
                    placeholder="New Password" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input 
                    type="password" 
                    placeholder="Confirm New Password" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CollectorProfile;
import React, { useState } from 'react'
import { User, Clock, Users, MapPin, Calendar, CheckCircle, XCircle, AlertCircle, Pause } from 'lucide-react'

function CollectorProfile() {
  const [requests, setRequests] = useState([
    { id: 1, dwellerName: 'John Smith', address: '123 Oak Street', status: 'Pending', time: '09:30 AM', type: 'Regular Collection' },
    { id: 2, dwellerName: 'Maria Garcia', address: '456 Pine Avenue', status: 'In Progress', time: '10:15 AM', type: 'Bulk Waste' },
    { id: 3, dwellerName: 'David Wilson', address: '789 Elm Road', status: 'Completed', time: '11:00 AM', type: 'Recyclables' },
    { id: 4, dwellerName: 'Sarah Johnson', address: '321 Maple Drive', status: 'Cancelled', time: '11:45 AM', type: 'Special Request' },
    { id: 5, dwellerName: 'Ahmed Hassan', address: '654 Cedar Lane', status: 'Pending', time: '01:30 PM', type: 'Hazardous Waste' },
  ])

  const collectorInfo = {
    name: 'Michael Anderson',
    id: 'COL-2024-001',
    phone: '+1 (555) 123-4567',
    email: 'michael.anderson@wastecorp.com',
    experience: '5 years',
    rating: 4.8
  }

  const crew = [
    { name: 'Robert Chen', role: 'Assistant Collector', phone: '+1 (555) 234-5678' },
    { name: 'Carlos Rodriguez', role: 'Driver', phone: '+1 (555) 345-6789' }
  ]

  const schedule = [
    { time: '08:00 AM', activity: 'Start Shift - Equipment Check', location: 'Depot A' },
    { time: '08:30 AM', activity: 'Begin Route - Residential Area', location: 'Oak Street District' },
    { time: '12:00 PM', activity: 'Lunch Break', location: 'Central Station' },
    { time: '01:00 PM', activity: 'Continue Route - Commercial Area', location: 'Business District' },
    { time: '05:00 PM', activity: 'End Shift - Vehicle Return', location: 'Depot A' }
  ]

  const route = {
    name: 'Route 7 - North District',
    totalStops: 45,
    estimatedTime: '8 hours',
    areas: ['Oak Street', 'Pine Avenue', 'Elm Road', 'Maple Drive', 'Cedar Lane']
  }

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: newStatus }
        : request
    ))
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'In Progress': return <Pause className="w-5 h-5 text-blue-500" />
      case 'Completed': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'Cancelled': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-outfit">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Collector Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collector Profile */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
            </div>
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{collectorInfo.name}</h3>
              <p className="text-sm text-gray-500">ID: {collectorInfo.id}</p>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Phone:</span> {collectorInfo.phone}</p>
              <p><span className="font-medium">Email:</span> {collectorInfo.email}</p>
              <p><span className="font-medium">Experience:</span> {collectorInfo.experience}</p>
              <p><span className="font-medium">Rating:</span> ⭐ {collectorInfo.rating}/5.0</p>
            </div>
          </div>

          {/* Crew Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Crew</h2>
            </div>
            <div className="space-y-4">
              {crew.map((member, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                  <p className="text-sm text-gray-500">{member.phone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Route Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-purple-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Route</h2>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">{route.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Total Stops:</span>
                  <p className="text-gray-600">{route.totalStops}</p>
                </div>
                <div>
                  <span className="font-medium">Est. Time:</span>
                  <p className="text-gray-600">{route.estimatedTime}</p>
                </div>
              </div>
              <div>
                <span className="font-medium text-sm">Coverage Areas:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {route.areas.map((area, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-6 h-6 text-orange-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
          </div>
          <div className="space-y-4">
            {schedule.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                    {item.time.split(' ')[0]}
                  </span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900">{item.activity}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {item.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requests Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Collection Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dweller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.dwellerName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectorProfile
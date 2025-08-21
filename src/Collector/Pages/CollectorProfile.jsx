import React, { useState, useEffect } from 'react'
import { User, Clock, Users, MapPin, Calendar, CheckCircle, XCircle, AlertCircle, Pause } from 'lucide-react'

function CollectorProfile() {
  const [collectorInfo, setCollectorInfo] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCollectorData = async () => {
      try {
        console.log('Starting to fetch collector data...')
        
        // Get user data from localStorage
        const userDataString = localStorage.getItem('userData')
        console.log('User data from localStorage:', userDataString)
        
        if (!userDataString) {
          throw new Error('User data not found in localStorage')
        }

        const userData = JSON.parse(userDataString)
        console.log('Parsed user data:', userData)
        
        if (!userData._id) {
          throw new Error('User ID not found in user data')
        }

        // Get token from localStorage
        const token = localStorage.getItem('oken') || userData.token;
        console.log('Token found:', token ? 'Yes' : 'No')
        
        if (!token) {
          throw new Error('Authentication token not found')
        }

        console.log('Making API request to:', `http://localhost:3000/api/collector/getcollector/${userData._id}`)
        
        // Fetch collector data using the ID from localStorage
        const response = await fetch(`http://localhost:3000/api/collector/getcollector/${userData._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        console.log('API response status:', response.status)
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API response data:', data)
        
        // Extract the collector data from the response
        if (data.collector) {
          setCollectorInfo(data.collector)
        } else {
          throw new Error('Collector data not found in API response')
        }
        
        // In a real app, you would also fetch requests, crew, schedule, and route data
        // For now, we'll use the mock data for these
        setRequests([
          { id: 1, dwellerName: 'John Smith', address: '123 Oak Street', status: 'Pending', time: '09:30 AM', type: 'Regular Collection' },
          { id: 2, dwellerName: 'Maria Garcia', address: '456 Pine Avenue', status: 'In Progress', time: '10:15 AM', type: 'Bulk Waste' },
          { id: 3, dwellerName: 'David Wilson', address: '789 Elm Road', status: 'Completed', time: '11:00 AM', type: 'Recyclables' },
          { id: 4, dwellerName: 'Sarah Johnson', address: '321 Maple Drive', status: 'Cancelled', time: '11:45 AM', type: 'Special Request' },
          { id: 5, dwellerName: 'Ahmed Hassan', address: '654 Cedar Lane', status: 'Pending', time: '01:30 PM', type: 'Hazardous Waste' },
        ])
        
        setLoading(false)
      } catch (err) {
        console.error('Error in fetchCollectorData:', err)
        setError(err.message)
        setLoading(false)
        
        // If authentication failed, redirect to login
        if (err.message.includes('Authentication failed')) {
          // Clear invalid token/data
          localStorage.removeItem('oken')
          localStorage.removeItem('userData')
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
        }
      }
    }

    fetchCollectorData()
  }, [])

  // Mock data for crew, schedule, and route (in a real app, these would come from APIs)
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

  // Add a temporary debug component
  const DebugInfo = () => {
    const userDataString = localStorage.getItem('userData')
    const userData = userDataString ? JSON.parse(userDataString) : null
    const token = localStorage.getItem('oken') || (userData ? userData.token : null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading collector profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error Loading Profile</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          {error.includes('Authentication failed') ? (
            <p className="mt-2 text-sm text-gray-500">Redirecting to login page...</p>
          ) : (
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  // If collectorInfo is still null, show an error
  if (!collectorInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">No Collector Data</h2>
          <p className="mt-2 text-gray-600">Unable to load collector information.</p>
          <DebugInfo />
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-outfit">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Collector Dashboard</h1>
        
        {/* Debug info - remove this in production */}
        <DebugInfo />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collector Profile */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
            </div>
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                {collectorInfo.profilePicture ? (
                  <img 
                    src={collectorInfo.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-blue-600" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900">{collectorInfo.fullName}</h3>
              <p className="text-sm text-gray-500">ID: {collectorInfo.collectId}</p>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Phone:</span> {collectorInfo.phoneNumber}</p>
              <p><span className="font-medium">Email:</span> {collectorInfo.email}</p>
              <p><span className="font-medium">NIC:</span> {collectorInfo.nicNumber}</p>
              <p><span className="font-medium">Address:</span> {collectorInfo.addressLine1}, {collectorInfo.houseNumber}, {collectorInfo.city}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${collectorInfo.isActive === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {collectorInfo.isActive}
                </span>
              </p>
              <p><span className="font-medium">Online:</span> 
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${collectorInfo.isOnline === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {collectorInfo.isOnline}
                </span>
              </p>
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
                        <option value='Cancelled'>Cancelled</option>
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
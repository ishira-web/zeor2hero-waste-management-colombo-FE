import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Users,
  Truck,
  MapPin,
  Calendar,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Recycle,
  Trash2,
  Package,
  DollarSign,
  Eye,
  MoreHorizontal,
  Search,
  Bell,
  LogOut
} from "lucide-react";
import { useAuth } from '../../Auth/AuthContext';

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCollectors: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    completedCollections: 0,
    pendingCollections: 0,
    totalWaste: 0,
    revenue: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingCollections, setUpcomingCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 1247,
        totalCollectors: 45,
        totalRoutes: 18,
        activeRoutes: 12,
        completedCollections: 2345,
        pendingCollections: 23,
        totalWaste: 12450, // kg
        revenue: 124500 // dollars
      });

      setRecentActivities([
        { id: 1, type: 'collection', message: 'New collection scheduled for Route #RT1234', time: '2 minutes ago', status: 'success' },
        { id: 2, type: 'user', message: 'New user registered: John Doe', time: '15 minutes ago', status: 'info' },
        { id: 3, type: 'route', message: 'Route #RT5678 completed successfully', time: '1 hour ago', status: 'success' },
        { id: 4, type: 'alert', message: 'Low inventory alert for recycling bags', time: '2 hours ago', status: 'warning' },
        { id: 5, type: 'payment', message: 'Monthly revenue report generated', time: '3 hours ago', status: 'info' }
      ]);

      setUpcomingCollections([
        { id: 1, route: '#RT1234', area: 'Colombo Central', time: 'Today, 9:00 AM', status: 'scheduled' },
        { id: 2, route: '#RT5678', area: 'Kandy City', time: 'Today, 11:30 AM', status: 'scheduled' },
        { id: 3, route: '#RT9012', area: 'Galle Fort', time: 'Tomorrow, 8:00 AM', status: 'scheduled' },
        { id: 4, route: '#RT3456', area: 'Negombo Beach', time: 'Tomorrow, 2:00 PM', status: 'scheduled' }
      ]);

      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const StatCard = ({ icon: Icon, title, value, change, changeType, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp size={14} className="mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'collection': return <Package size={16} />;
        case 'user': return <Users size={16} />;
        case 'route': return <MapPin size={16} />;
        case 'alert': return <AlertCircle size={16} />;
        case 'payment': return <DollarSign size={16} />;
        default: return <BarChart3 size={16} />;
      }
    };

    const getStatusColor = () => {
      switch (activity.status) {
        case 'success': return 'text-green-600';
        case 'warning': return 'text-yellow-600';
        case 'error': return 'text-red-600';
        default: return 'text-blue-600';
      }
    };

    return (
      <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0">
        <div className={`p-2 rounded-full ${getStatusColor()} bg-opacity-10`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
        </div>
      </div>
    );
  };

  const CollectionItem = ({ collection }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Truck size={16} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{collection.route}</p>
          <p className="text-xs text-gray-500">{collection.area}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">{collection.time}</p>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {collection.status}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <Leaf className="h-5 w-5 text-green-600" />
              <span>Waste Management Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                aria-label="Search"
                placeholder="Search..."
                className="w-48 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <button className="relative rounded-xl p-2 hover:bg-gray-100" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 inline-flex h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-green-600 to-emerald-400" />
              <span className="text-sm">{currentUser?.name || 'Admin'}</span>
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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {currentUser?.name || 'Admin'}!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your waste management system today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            change="+12% from last month"
            changeType="positive"
            color="bg-blue-500"
          />
          <StatCard
            icon={Truck}
            title="Active Collectors"
            value={stats.totalCollectors}
            change="+3 new this week"
            changeType="positive"
            color="bg-green-500"
          />
          <StatCard
            icon={MapPin}
            title="Active Routes"
            value={`${stats.activeRoutes}/${stats.totalRoutes}`}
            change="2 routes completed today"
            changeType="positive"
            color="bg-orange-500"
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            change="+8% from last month"
            changeType="positive"
            color="bg-purple-500"
          />
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={CheckCircle}
            title="Completed Collections"
            value={stats.completedCollections.toLocaleString()}
            change="+45 today"
            changeType="positive"
            color="bg-green-500"
          />
          <StatCard
            icon={AlertCircle}
            title="Pending Collections"
            value={stats.pendingCollections}
            change="+2 needs attention"
            changeType="negative"
            color="bg-yellow-500"
          />
          <StatCard
            icon={Recycle}
            title="Total Waste Collected"
            value={`${(stats.totalWaste / 1000).toFixed(1)} tons`}
            change="+120 kg today"
            changeType="positive"
            color="bg-emerald-500"
          />
          <StatCard
            icon={BarChart3}
            title="System Efficiency"
            value="92%"
            change="+2% improvement"
            changeType="positive"
            color="bg-indigo-500"
          />
        </div>

        {/* Charts and Activities Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              <button className="text-sm text-green-600 hover:text-green-700">View All</button>
            </div>
            <div className="space-y-2">
              {recentActivities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* Upcoming Collections */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Collections</h2>
              <button className="text-sm text-green-600 hover:text-green-700">View Schedule</button>
            </div>
            <div className="space-y-2">
              {upcomingCollections.map(collection => (
                <CollectionItem key={collection.id} collection={collection} />
              ))}
            </div>
          </div>
        </div>

        {/* Waste Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waste Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Waste Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Recyclable</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Organic</span>
                  <span className="font-medium">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Non-Recyclable</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Hazardous</span>
                  <span className="font-medium">5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                <Calendar className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-800">Schedule Pickup</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-800">Manage Users</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                <Truck className="h-6 w-6 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-orange-800">View Routes</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
                <BarChart3 className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-800">Reports</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 Waste Management System. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-gray-600">System Status:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle size={12} className="mr-1" /> Operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
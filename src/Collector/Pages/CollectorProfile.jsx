// src/pages/CollectorProfile.jsx
import React, { useEffect, useState } from "react";
import {
  User,
  Clock,
  Users,
  MapPin,
  Calendar as CalIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Pause,
} from "lucide-react";

const API_BASE = "http://localhost:3000";

const dayOrder = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7,
};

function CollectorProfile() {
  const [collectorInfo, setCollectorInfo] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timetables
  const [timeTables, setTimeTables] = useState([]);
  const [ttLoading, setTtLoading] = useState(true);
  const [ttError, setTtError] = useState(null);

  // Crew modal
  const [crewModalOpen, setCrewModalOpen] = useState(false);
  const [crewLoading, setCrewLoading] = useState(false);
  const [crewError, setCrewError] = useState(null);
  const [crewMembers, setCrewMembers] = useState([]);
  const [activeTimeTableId, setActiveTimeTableId] = useState(null);

  useEffect(() => {
    const fetchCollectorData = async () => {
      try {
        const userDataString = localStorage.getItem("userData");
        if (!userDataString) throw new Error("User data not found in localStorage");
        const userData = JSON.parse(userDataString);
        if (!userData._id) throw new Error("User ID not found in user data");

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("oken") ||
          userData.token;
        if (!token) throw new Error("Authentication token not found");

        // Profile
        const res = await fetch(`${API_BASE}/api/collector/getcollector/${userData._id}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error("Authentication failed. Please log in again.");
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (!data.collector) throw new Error("Collector data not found in API response");
        setCollectorInfo(data.collector);

        // Mock requests
        setRequests([
          { id: 1, dwellerName: "John Smith", address: "123 Oak Street", status: "Pending", time: "09:30 AM", type: "Regular Collection" },
          { id: 2, dwellerName: "Maria Garcia", address: "456 Pine Avenue", status: "In Progress", time: "10:15 AM", type: "Bulk Waste" },
          { id: 3, dwellerName: "David Wilson", address: "789 Elm Road", status: "Completed", time: "11:00 AM", type: "Recyclables" },
          { id: 4, dwellerName: "Sarah Johnson", address: "321 Maple Drive", status: "Cancelled", time: "11:45 AM", type: "Special Request" },
          { id: 5, dwellerName: "Ahmed Hassan", address: "654 Cedar Lane", status: "Pending", time: "01:30 PM", type: "Hazardous Waste" },
        ]);

        setLoading(false);

        await fetchTimetables(userData._id, token);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        if (err.message.includes("Authentication failed")) {
          localStorage.removeItem("token");
          localStorage.removeItem("oken");
          localStorage.removeItem("userData");
          setTimeout(() => (window.location.href = "/login"), 1500);
        }
      }
    };

    const fetchTimetables = async (collectorId, token) => {
      try {
        setTtLoading(true);
        setTtError(null);

        const res = await fetch(
          `${API_BASE}/api/timetable/getTimetablebyCollector/${collectorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 404) {
          setTimeTables([]);
          setTtLoading(false);
          return;
        }
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();
        const sorted = [...json.timeTables].sort((a, b) => {
          const dayDiff = (dayOrder[a.collectionDay] || 99) - (dayOrder[b.collectionDay] || 99);
          if (dayDiff !== 0) return dayDiff;
          return (a.collectionTime || "").localeCompare(b.collectionTime || "");
        });
        setTimeTables(sorted);
        setTtLoading(false);
      } catch (e) {
        setTtError(e.message);
        setTtLoading(false);
      }
    };

    fetchCollectorData();
  }, []);

  // ---- Crew fetcher ----
  const openCrewModal = async (timeTableId) => {
    try {
      setCrewModalOpen(true);
      setCrewLoading(true);
      setCrewError(null);
      setCrewMembers([]);
      setActiveTimeTableId(timeTableId);

      const userDataString = localStorage.getItem("userData");
      const userData = userDataString ? JSON.parse(userDataString) : {};
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("oken") ||
        userData.token;

      const res = await fetch(
        `${API_BASE}/api/timetable/getCrewMembers/${timeTableId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        if (res.status === 404) {
          setCrewMembers([]);
          setCrewLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      // Expecting { crewMembers: [{ _id, fullName, email, phoneNumber }, ...] }
      setCrewMembers(Array.isArray(json.crewMembers) ? json.crewMembers : []);
      setCrewLoading(false);
    } catch (e) {
      setCrewError(e.message);
      setCrewLoading(false);
    }
  };

  const closeCrewModal = () => {
    setCrewModalOpen(false);
    setCrewMembers([]);
    setActiveTimeTableId(null);
    setCrewError(null);
  };

  const handleStatusChange = (requestId, newStatus) => {
    setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r)));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "In Progress": return <Pause className="w-5 h-5 text-blue-500" />;
      case "Completed": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Cancelled": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-300";
      case "Completed": return "bg-green-100 text-green-800 border-green-300";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading collector profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error Loading Profile</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          {!error.includes("Authentication failed") && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          )}
          {error.includes("Authentication failed") && (
            <p className="mt-2 text-sm text-gray-500">Redirecting to login…</p>
          )}
        </div>
      </div>
    );
  }

  if (!collectorInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">No Collector Data</h2>
          <p className="mt-2 text-gray-600">Unable to load collector information.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- UI ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-outfit">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Collector Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
            </div>
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                {collectorInfo.profilePicture ? (
                  <img src={collectorInfo.profilePicture} alt="Profile" className="w-full h-full object-cover" />
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
              <p>
                <span className="font-medium">Status:</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${collectorInfo.isActive === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {collectorInfo.isActive}
                </span>
              </p>
              <p>
                <span className="font-medium">Online:</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${collectorInfo.isOnline === "online" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                  {collectorInfo.isOnline}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Timetable */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <CalIcon className="w-6 h-6 text-teal-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Collector Timetable</h2>
          </div>

          {ttLoading && <div className="text-gray-600">Loading timetables…</div>}
          {ttError && <div className="text-red-600">Failed to load: {ttError}</div>}
          {!ttLoading && !ttError && timeTables.length === 0 && (
            <div className="text-gray-600">No timetables found for this collector.</div>
          )}

          {!ttLoading && !ttError && timeTables.length > 0 && (
            <div className="space-y-3">
              {timeTables.map((tt) => (
                <div
                  key={tt._id}
                  className="p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-800">
                      {tt.collectionDay}
                    </span>
                    <div className="flex items-center text-sm text-gray-700">
                      <Clock className="w-4 h-4 mr-1" />
                      {tt.collectionTime || "—"}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="w-4 h-4 mr-1" />
                    {tt.collectionLocation || "—"}
                  </div>

                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Route:</span> {tt.routeName || "—"}
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <Users className="w-4 h-4 mr-1" />
                    {Array.isArray(tt.crewMembers) ? `${tt.crewMembers.length} crew` : "—"}
                  </div>

                  <div className="flex items-center gap-2">
                    {tt.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                        <XCircle className="w-4 h-4 mr-1" /> Inactive
                      </span>
                    )}

                    {/* View Crew button */}
                    <button
                      onClick={() => openCrewModal(tt._id)}
                      className="px-3 py-1.5 text-sm rounded-md border border-teal-600 text-teal-700 hover:bg-teal-50"
                    >
                      View Crew
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Requests */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <CalIcon className="w-6 h-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Collection Requests</h2>
          </div>
          <div className="overflow-x-auto">
            {/* ... your table stays the same ... */}
          </div>
        </div>
      </div>

      {/* Crew Modal */}
      {crewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Crew Members</h3>
              <button onClick={closeCrewModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            {crewLoading && <div className="text-gray-600">Loading crew…</div>}
            {crewError && <div className="text-red-600">Failed to load: {crewError}</div>}

            {!crewLoading && !crewError && (
              crewMembers.length === 0 ? (
                <div className="text-gray-600">No crew assigned to this timetable.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {crewMembers.map((m, idx) => (
                    <li key={m._id || idx} className="py-3">
                      <p className="font-medium text-gray-900">
                        {m.fullName || m.name || String(m)}
                      </p>
                      {(m.email || m.phoneNumber) && (
                        <p className="text-sm text-gray-500">
                          {[m.email, m.phoneNumber].filter(Boolean).join(" • ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )
            )}

            <div className="mt-5 text-right">
              <button
                onClick={closeCrewModal}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* End Crew Modal */}
    </div>
  );
}

export default CollectorProfile;

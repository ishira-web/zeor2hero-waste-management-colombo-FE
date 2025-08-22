// src/pages/CollectorProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
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
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "http://localhost:3000";

const dayOrder = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7,
};
const ORDERED_DAYS = Object.keys(dayOrder).sort((a, b) => dayOrder[a] - dayOrder[b]);

const STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"];

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function Skeleton({ className = "" }) {
  return <div className={classNames("animate-pulse bg-gray-200 rounded", className)} />;
}

function CollectorProfile() {
  const [collectorInfo, setCollectorInfo] = useState(null);

  // Timetables
  const [timeTables, setTimeTables] = useState([]);
  const [ttLoading, setTtLoading] = useState(true);
  const [ttError, setTtError] = useState(null);

  // Requests
  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(true);
  const [reqError, setReqError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Crew modal
  const [crewModalOpen, setCrewModalOpen] = useState(false);
  const [crewLoading, setCrewLoading] = useState(false);
  const [crewError, setCrewError] = useState(null);
  const [crewMembers, setCrewMembers] = useState([]);
  const [activeTimeTableId, setActiveTimeTableId] = useState(null);

  // token + id
  const getAuth = () => {
    const userDataString = localStorage.getItem("userData");
    const userData = userDataString ? JSON.parse(userDataString) : {};
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("oken") ||
      userData.token;
    const collectorId = userData?._id;
    return { token, collectorId };
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { token, collectorId } = getAuth();
        if (!collectorId) throw new Error("User ID not found in localStorage");
        if (!token) throw new Error("Authentication token not found");

        // Profile
        const res = await fetch(`${API_BASE}/api/collector/getcollector/${collectorId}`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error("Authentication failed. Please log in again.");
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (!data.collector) throw new Error("Collector data not found in API response");
        setCollectorInfo(data.collector);
        setLoading(false);

        await Promise.all([
          fetchTimetables(collectorId, token),
          fetchRequestsByCollector(collectorId, token),
        ]);
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
    init();
  }, []);

  // --- APIs ---
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

  const fetchRequestsByCollector = async (collectorId, token) => {
    try {
      setReqLoading(true);
      setReqError(null);

      const res = await fetch(
        `${API_BASE}/api/requests/collector/${collectorId}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      if (res.status === 404) {
        setRequests([]);
        setReqLoading(false);
        return;
      }
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const json = await res.json();
      setRequests(Array.isArray(json.requests) ? json.requests : []);
      setReqLoading(false);
    } catch (e) {
      setReqError(e.message);
      setReqLoading(false);
    }
  };

  // Crew modal fetcher
  const openCrewModal = async (timeTableId) => {
    try {
      setCrewModalOpen(true);
      setCrewLoading(true);
      setCrewError(null);
      setCrewMembers([]);
      setActiveTimeTableId(timeTableId);

      const { token } = getAuth();

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

  // Requests: status update with toast
  const updateRequestStatus = async (requestId, newStatus) => {
    const prev = requests;
    const next = prev.map((r) => (r._id === requestId ? { ...r, status: newStatus } : r));
    setRequests(next);
    setUpdatingId(requestId);

    const { token } = getAuth();

    try {
      await toast.promise(
        (async () => {
          const res = await fetch(`${API_BASE}/api/requests/${requestId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          });
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const json = await res.json();
          setRequests((curr) => curr.map((r) => (r._id === requestId ? json.request : r)));
        })(),
        {
          pending: "Updating request status…",
          success: "Request status updated",
          error: "Failed to update status",
        }
      );
    } catch (e) {
      setRequests(prev); // rollback
    } finally {
      setUpdatingId(null);
    }
  };

  // helpers
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
  const fmtTime = (val) => {
    if (!val) return "—";
    try { return new Date(val).toLocaleString(); } catch { return String(val); }
  };

  // Derived UI data
  const requestStats = useMemo(() => {
    const by = { total: requests.length };
    for (const s of STATUSES) by[s] = requests.filter((r) => (r.status || "Pending") === s).length;
    return by;
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const statusOk = statusFilter === "All" || (r.status || "Pending") === statusFilter;
      if (!q) return statusOk;
      const displayName = (r.dwellerName || r.name || r.customerName || r.requesterName || "").toLowerCase();
      const address = (r.address || r.location || "").toLowerCase();
      const type = (r.type || r.category || "").toLowerCase();
      return statusOk && (displayName.includes(q) || address.includes(q) || type.includes(q));
    });
  }, [requests, statusFilter, search]);

  // Loading page
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  // Error page
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-6 max-w-md w-full text-center">
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
        <div className="bg-white shadow rounded-lg p-6 max-w-md w-full text-center">
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-outfit">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Collector Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const { token, collectorId } = getAuth();
                await fetchTimetables(collectorId, token);
                toast.info("Timetables refreshed");
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-gray-700"
            >
              <RefreshCw className="w-4 h-4" /> Timetables
            </button>
            <button
              onClick={async () => {
                const { token, collectorId } = getAuth();
                await fetchRequestsByCollector(collectorId, token);
                toast.info("Requests refreshed");
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-gray-700"
            >
              <RefreshCw className="w-4 h-4" /> Requests
            </button>
          </div>
        </div>

        {/* Profile + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow p-6">
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
                <span className={classNames(
                  "ml-1 px-2 py-0.5 rounded-full text-xs",
                  collectorInfo.isActive === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                )}>
                  {collectorInfo.isActive}
                </span>
              </p>
              <p>
                <span className="font-medium">Online:</span>
                <span className={classNames(
                  "ml-1 px-2 py-0.5 rounded-full text-xs",
                  collectorInfo.isOnline === "online" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                )}>
                  {collectorInfo.isOnline}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow p-6 col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatBox label="Total" value={requestStats.total} />
              <StatBox label="Pending" value={requestStats["Pending"]} tone="yellow" />
              <StatBox label="In Progress" value={requestStats["In Progress"]} tone="blue" />
              <StatBox label="Completed" value={requestStats["Completed"]} tone="green" />
              <StatBox label="Cancelled" value={requestStats["Cancelled"]} tone="red" />
            </div>
          </div>
        </div>

        {/* Timetable (Grouped by Day) */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CalIcon className="w-6 h-6 text-teal-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Collector Timetable</h2>
            </div>
          </div>

          {ttLoading && <TimetableSkeleton />}
          {ttError && <div className="text-red-600">Failed to load: {ttError}</div>}
          {!ttLoading && !ttError && timeTables.length === 0 && (
            <div className="text-gray-600">No timetables found for this collector.</div>
          )}

          {!ttLoading && !ttError && timeTables.length > 0 && (
            <div className="space-y-6">
              {ORDERED_DAYS.map((day) => {
                const items = timeTables.filter((t) => t.collectionDay === day);
                if (items.length === 0) return null;
                return (
                  <div key={day}>
                    <div className="text-sm font-semibold text-teal-700 mb-2">{day}</div>
                    <div className="space-y-3">
                      {items.map((tt) => (
                        <div
                          key={tt._id}
                          className="p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-800">
                              {tt.collectionTime || "—"}
                            </span>
                            <div className="flex items-center text-sm text-gray-700">
                              <MapPin className="w-4 h-4 mr-1" />
                              {tt.collectionLocation || "—"}
                            </div>
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Requests */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalIcon className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Collection Requests</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, address, type…"
                  className="pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="relative">
                <Filter className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-8 pr-7 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {["All", ...STATUSES].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {(statusFilter !== "All" || search) && (
                <button
                  onClick={() => { setStatusFilter("All"); setSearch(""); }}
                  className="px-3 py-2 text-sm border rounded-md bg-gray-50 hover:bg-gray-100"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {reqLoading && <RequestsSkeleton />}
          {reqError && <div className="text-red-600">Failed to load: {reqError}</div>}
          {!reqLoading && !reqError && filteredRequests.length === 0 && (
            <div className="text-gray-600">No requests match your filters.</div>
          )}

          {!reqLoading && !reqError && filteredRequests.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Dweller</Th>
                    <Th>Address</Th>
                    <Th>Time</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((r) => {
                    const displayName = r.dwellerName || r.name || r.customerName || r.requesterName || "—";
                    const address = r.address || r.location || "—";
                    const time = r.time || fmtTime(r.createdAt);
                    const type = r.type || r.category || "—";
                    const status = r.status || "Pending";

                    return (
                      <tr key={r._id} className="hover:bg-gray-50">
                        <Td>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{displayName}</div>
                            </div>
                          </div>
                        </Td>
                        <Td className="text-sm text-gray-900">{address}</Td>
                        <Td className="text-sm text-gray-900">{time}</Td>
                        <Td className="text-sm text-gray-900">{type}</Td>
                        <Td>
                          <span className={classNames(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            getStatusColor(status)
                          )}>
                            {getStatusIcon(status)}
                            <span className="ml-1">{status}</span>
                          </span>
                        </Td>
                        <Td>
                          <select
                            value={status}
                            disabled={updatingId === r._id}
                            onChange={(e) => updateRequestStatus(r._id, e.target.value)}
                            className={classNames(
                              "bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-60",
                              updatingId === r._id && "cursor-wait"
                            )}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Crew Modal */}
      {crewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
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

/* ---------- Small UI helpers ---------- */
function Th({ children }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={classNames("px-6 py-4 whitespace-nowrap", className)}>{children}</td>;
}
function StatBox({ label, value, tone }) {
  const tones = {
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    green: "bg-green-50 text-green-800 border-green-200",
    red: "bg-red-50 text-red-800 border-red-200",
    default: "bg-gray-50 text-gray-800 border-gray-200",
  };
  const cls = tones[tone] || tones.default;
  return (
    <div className={classNames("rounded-xl border p-4", cls)}>
      <div className="text-sm">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value ?? 0}</div>
    </div>
  );
}
function TimetableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
function RequestsSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default CollectorProfile;

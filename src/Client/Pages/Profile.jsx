// src/pages/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../Auth/AuthContext"; // <-- adjust path if needed
import {
  User,
  Mail,
  Phone,
  Hash,
  CalendarDays,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";

const API_BASE = "http://localhost:3000/api";

const dayOrder = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [timetables, setTimetables] = useState([]);
  const [loadingTT, setLoadingTT] = useState(true);
  const [error, setError] = useState("");

  // Resolve IDs safely (handles different backend payload shapes)
  const userId = useMemo(() => {
    return (
      currentUser?.user?._id ||
      currentUser?._id ||
      currentUser?.user?.id ||
      currentUser?.id ||
      null
    );
  }, [currentUser]);

  const dwellerId = useMemo(() => {
    return (
      currentUser?.user?.dwellerId ||
      currentUser?.dwellerId ||
      currentUser?.user?.dwellerID ||
      currentUser?.dwellerID ||
      null
    );
  }, [currentUser]);

  const token = useMemo(() => localStorage.getItem("token"), []);

  // Fetch fresh user profile from backend (fallback to currentUser if call fails)
  useEffect(() => {
    const controller = new AbortController();

    async function fetchProfile() {
      if (!currentUser) {
        setLoadingProfile(false);
        return;
      }

      try {
        setError("");
        setLoadingProfile(true);

        // If your API expects Mongo _id, userId should work.
        // If your API expects dwellerId, either change this endpoint on backend,
        // or add another route like /api/user/by-dweller/:dwellerId.
        const idForApi = userId ?? dwellerId;
        if (!idForApi) {
          // Fallback: just show whatever is already in localStorage
          setProfile(currentUser?.user || currentUser);
          setLoadingProfile(false);
          return;
        }

        const res = await fetch(`${API_BASE}/user/${idForApi}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        if (res.status === 401) {
          setError("Your session has expired. Please log in again.");
          logout();
          return;
        }

        if (!res.ok) {
          // Fallback to stored data if API fails
          setProfile(currentUser?.user || currentUser);
        } else {
          const data = await res.json();
          // Accept either { user: {...} } or plain object
          setProfile(data?.user || data);
        }
      } catch (e) {
        // Fallback to stored data
        setProfile(currentUser?.user || currentUser);
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchProfile();
    return () => controller.abort();
    // Only re-run when currentUser changes (prevents infinite loops)
  }, [currentUser, userId, dwellerId, token, logout]);

  // Fetch timetables once
  useEffect(() => {
    const controller = new AbortController();

    async function fetchTimetables() {
      try {
        setError("");
        setLoadingTT(true);
        const res = await fetch(`${API_BASE}/timetable/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        if (res.status === 401) {
          setError("Your session has expired. Please log in again.");
          logout();
          return;
        }

        if (!res.ok) {
          setTimetables([]);
          return;
        }

        const data = await res.json();
        const list = data?.timeTables || data?.timetables || data || [];
        setTimetables(Array.isArray(list) ? list : []);
      } catch (_) {
        setTimetables([]);
      } finally {
        setLoadingTT(false);
      }
    }

    fetchTimetables();
    return () => controller.abort();
  }, [token, logout]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-2" />
          <h1 className="text-xl font-semibold mb-2">You are not logged in</h1>
          <p className="text-gray-600">
            Please log in to view your profile and timetable.
          </p>
        </div>
      </div>
    );
  }

  const fullName =
    profile?.fullName ||
    profile?.name ||
    profile?.user?.fullName ||
    currentUser?.fullName ||
    currentUser?.user?.fullName ||
    "User";

  const email =
    profile?.email ||
    profile?.user?.email ||
    currentUser?.email ||
    currentUser?.user?.email ||
    "";

  const phoneNumber =
    profile?.phoneNumber ||
    profile?.phone ||
    profile?.user?.phoneNumber ||
    currentUser?.phoneNumber ||
    currentUser?.user?.phoneNumber ||
    "";

  // sort timetables by day order if a day field exists
  const sortedTimetables = useMemo(() => {
    return [...timetables].sort((a, b) => {
      const da = dayOrder[a?.day] || 99;
      const db = dayOrder[b?.day] || 99;
      if (da !== db) return da - db;
      // optional: then sort by start time
      const ta = a?.startTime || "";
      const tb = b?.startTime || "";
      return ta.localeCompare(tb);
    });
  }, [timetables]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-2xl font-bold">
            {getInitials(fullName)}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              {fullName}
            </h1>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="truncate">{email || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{phoneNumber || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <span>{dwellerId || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Card (shows only your model fields) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Profile Details</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Full Name</p>
                    <p className="font-medium">{fullName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Phone Number</p>
                    <p className="font-medium">{phoneNumber || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Hash className="h-4 w-4 mt-0.5 text-gray-500" />
                  <div>
                    <p className="text-gray-500">Dweller ID</p>
                    <p className="font-medium">{dwellerId || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timetable List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Timetables</h2>
              </div>

              {loadingTT ? (
                <div className="flex items-center gap-2 text-gray-600 mt-6">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading timetables…</span>
                </div>
              ) : sortedTimetables.length === 0 ? (
                <p className="text-gray-600 mt-6">No timetables found.</p>
              ) : (
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sortedTimetables.map((tt) => {
                    const day = tt?.day || "—";
                    const start = tt?.startTime || "—";
                    const end = tt?.endTime || "—";
                    const route =
                      tt?.routeName?.routeName ||
                      tt?.routeName ||
                      tt?.route ||
                      "—";
                    const location =
                      tt?.location ||
                      tt?.area ||
                      tt?.zone ||
                      tt?.routeArea ||
                      null;

                    return (
                      <li
                        key={tt?._id || `${day}-${start}-${route}`}
                        className="border rounded-xl p-4 hover:shadow-sm transition"
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CalendarDays className="h-4 w-4" />
                          <span className="font-medium">{day}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="h-4 w-4" />
                          <span>
                            {start} – {end}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">
                            {route}
                            {location ? ` • ${location}` : ""}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Loading skeleton for profile fetch */}
        {loadingProfile && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading your profile…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

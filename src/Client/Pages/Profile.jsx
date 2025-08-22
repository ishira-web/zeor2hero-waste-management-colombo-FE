// src/pages/Profile.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
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
  Camera,
  Save,
  X,
  RefreshCw,
  Users,
  ImageOff,
  Shield,
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

function normalizeTimeTable(tt) {
  const timeTableID = tt?.timeTableID || tt?._id || "—";
  const collectorID =
    tt?.collectorID?._id ||
    tt?.collectorID?.id ||
    tt?.collectorId ||
    tt?.collectorID ||
    "—";
  const collectionDay = tt?.collectionDay || tt?.day || "—";
  const collectionTime = tt?.collectionTime || tt?.startTime || "—";
  const collectionLocation =
    tt?.collectionLocation ||
    tt?.location ||
    tt?.area ||
    tt?.zone ||
    tt?.routeArea ||
    "—";
  const routeName =
    (typeof tt?.routeName === "object" ? tt?.routeName?.routeName : tt?.routeName) ||
    tt?.route ||
    "—";
  const crewMembers = Array.isArray(tt?.crewMembers)
    ? tt.crewMembers
    : Array.isArray(tt?.crew)
    ? tt.crew
    : Array.isArray(tt?.members)
    ? tt.members
    : [];

  const collectorName = tt?.collectorName || tt?.collectorID?.fullName || null;

  return {
    timeTableID,
    collectorID,
    collectionDay,
    collectionTime,
    collectionLocation,
    routeName,
    crewMembers,
    collectorName,
    _raw: tt,
  };
}

export default function Profile() {
  const { currentUser, logout } = useAuth();

  // Profile state
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Timetables state
  const [timetables, setTimetables] = useState([]);
  const [loadingTT, setLoadingTT] = useState(true);

  // IDs & token
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

  // ----- Fetch profile -----
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

        const idForApi = userId ?? dwellerId;
        if (!idForApi) {
          // No ID for API; fallback to whatever we have
          const fallback = currentUser?.user || currentUser;
          setProfile(fallback);
          setAvatarUrl(fallback?.avatarUrl || fallback?.profilePicture || "");
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
          const fallback = currentUser?.user || currentUser;
          setProfile(fallback);
          setAvatarUrl(fallback?.avatarUrl || fallback?.profilePicture || "");
        } else {
          const data = await res.json();
          const fresh = data?.user || data;
          setProfile(fresh);
          setAvatarUrl(fresh?.avatarUrl || fresh?.profilePicture || "");
        }
      } catch (e) {
        const fallback = currentUser?.user || currentUser;
        setProfile(fallback);
        setAvatarUrl(fallback?.avatarUrl || fallback?.profilePicture || "");
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchProfile();
    return () => controller.abort();
  }, [currentUser, userId, dwellerId, token, logout]);

  // ----- Fetch timetables -----
  async function fetchTimetables(signal) {
    try {
      setError("");
      setLoadingTT(true);
      const res = await fetch(`${API_BASE}/timetable/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal,
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

  useEffect(() => {
    const controller = new AbortController();
    fetchTimetables(controller.signal);
    return () => controller.abort();
  }, [token, logout]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
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

  const initials = getInitials(fullName);

  // ----- Avatar handlers -----
  function handlePickFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setError("");
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
  }

  async function handleUploadAvatar() {
    if (!avatarFile) return;
    const idForApi = userId ?? dwellerId;
    if (!idForApi) {
      setError("Cannot upload: user ID is missing.");
      return;
    }
    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      // Adjust endpoint to your backend (e.g., /user/:id/avatar or /user/:id/profile-picture)
      const res = await fetch(`${API_BASE}/user/${idForApi}/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type for multipart/form-data; browser will set boundary
        },
        body: formData,
      });

      if (res.status === 401) {
        setError("Your session has expired. Please log in again.");
        logout();
        return;
      }

      if (!res.ok) {
        setError("Failed to upload profile picture. Please try again.");
        return;
      }

      const data = await res.json();
      // Expect backend to return { avatarUrl: '...' } or updated user
      const newUrl = data?.avatarUrl || data?.user?.avatarUrl || "";
      if (newUrl) setAvatarUrl(newUrl);

      // Optionally refresh profile
      // (Keeping it simple; you could re-fetch /user/:id here)
      setAvatarFile(null);
    } catch (e) {
      setError("Something went wrong while uploading the image.");
    } finally {
      setAvatarUploading(false);
    }
  }

  function handleCancelAvatar() {
    // Reset preview to original from profile/currentUser
    const fallback =
      profile?.avatarUrl ||
      profile?.profilePicture ||
      currentUser?.avatarUrl ||
      currentUser?.profilePicture ||
      "";
    setAvatarUrl(fallback);
    setAvatarFile(null);
  }

  // ----- Timetable sorting & shaping -----
  const normalizedSortedTT = useMemo(() => {
    const items = timetables.map(normalizeTimeTable);
    return items.sort((a, b) => {
      const da = dayOrder[a.collectionDay] || 99;
      const db = dayOrder[b.collectionDay] || 99;
      if (da !== db) return da - db;
      return String(a.collectionTime).localeCompare(String(b.collectionTime));
    });
  }, [timetables]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover / Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          {error && (
            <div className="mb-4 rounded-xl bg-white/10 text-white/90 border border-white/20 p-3">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
            {/* Avatar + name */}
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-2xl bg-white/10 ring-2 ring-white/30 p-1">
                  <div className="h-full w-full rounded-xl bg-white overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        onError={(e) => {
                          e.currentTarget.src = "";
                        }}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-indigo-700 font-semibold text-2xl">
                        {initials || <User className="h-7 w-7" />}
                      </div>
                    )}
                  </div>
                </div>

                {/* Change picture button (floating) */}
                <button
                  type="button"
                  onClick={handlePickFile}
                  className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-gray-800 shadow hover:bg-gray-50"
                >
                  <Camera className="h-4 w-4" />
                  Change
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="text-white">
                <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
                  {fullName}
                </h1>
                <p className="mt-1 text-white/80 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Member
                </p>
              </div>
            </div>

            {/* Save / Cancel avatar actions */}
            {avatarFile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelAvatar}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-white/30"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleUploadAvatar}
                  disabled={avatarUploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-medium text-emerald-950 shadow hover:bg-emerald-300 disabled:opacity-60"
                >
                  {avatarUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Picture
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: Profile card */}
          <section className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="mb-5 text-lg font-semibold text-gray-800">
                Profile
              </h2>
              {loadingProfile ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded" />
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <InfoRow
                    icon={<User className="h-4 w-4 text-gray-500" />}
                    label="Full Name"
                    value={fullName}
                  />
                  <InfoRow
                    icon={<Mail className="h-4 w-4 text-gray-500" />}
                    label="Email"
                    value={email || "—"}
                  />
                  <InfoRow
                    icon={<Phone className="h-4 w-4 text-gray-500" />}
                    label="Phone Number"
                    value={phoneNumber || "—"}
                  />
                  <InfoRow
                    icon={<Hash className="h-4 w-4 text-gray-500" />}
                    label="Dweller ID"
                    value={dwellerId || "—"}
                  />
                </div>
              )}
            </div>

            {/* Avatar tips */}
            <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 text-sm text-gray-700">
              <div className="flex items-center gap-2 mb-1 font-medium">
                <ImageOff className="h-4 w-4 text-indigo-600" />
                Avatar tips
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use a square image for best fit.</li>
                <li>Max ~2MB JPEG/PNG recommended.</li>
                <li>You’ll see a live preview before saving.</li>
              </ul>
            </div>
          </section>

          {/* Right column: Timetables */}
          <section className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Timetables
                </h2>
                <button
                  onClick={() => fetchTimetables()}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>

              {loadingTT ? (
                <div className="flex items-center gap-2 text-gray-600 mt-6">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading timetables…</span>
                </div>
              ) : normalizedSortedTT.length === 0 ? (
                <p className="text-gray-600 mt-6">No timetables found.</p>
              ) : (
                <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {normalizedSortedTT.map((tt) => (
                    <li
                      key={tt.timeTableID + "_" + tt.collectionTime}
                      className="border rounded-xl p-4 hover:shadow-sm transition"
                    >
                      {/* Day + time */}
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarDays className="h-4 w-4" />
                        <span className="font-medium">{tt.collectionDay}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="h-4 w-4" />
                        <span>{tt.collectionTime}</span>
                      </div>

                      {/* Route + location */}
                      <div className="mt-2 flex items-start gap-2 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <div className="truncate">
                          <div className="font-medium">
                            Route: {tt.routeName}
                          </div>
                          <div className="text-gray-600">
                            Location: {tt.collectionLocation}
                          </div>
                        </div>
                      </div>

                      {/* IDs */}
                      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5" />
                          <span className="truncate">
                            <span className="text-gray-500">TimeTable ID:</span>{" "}
                            <span className="font-medium">{tt.timeTableID}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5" />
                          <span className="truncate">
                            <span className="text-gray-500">Collector:</span>{" "}
                            <span className="font-medium">
                              {tt.collectorName || "—"}
                            </span>{" "}
                            <span className="text-gray-500">ID:</span>{" "}
                            <span className="font-medium">{tt.collectorID}</span>
                          </span>
                        </div>
                      </div>

                      {/* Crew */}
                      <div className="mt-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                          <Users className="h-4 w-4" />
                          Crew Members
                        </div>
                        {tt.crewMembers.length === 0 ? (
                          <p className="text-xs text-gray-600 mt-1">—</p>
                        ) : (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {tt.crewMembers.map((m, idx) => {
                              // accept string or object {name: '', id: ''} gracefully
                              const label =
                                typeof m === "string"
                                  ? m
                                  : m?.name || m?.fullName || m?.email || "Member";
                              return (
                                <span
                                  key={String(m?.id || m?._id || m || idx)}
                                  className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                                >
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/** ---------- Small UI helper ---------- */
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-gray-500">{label}</p>
        <p className="font-medium break-all">{value}</p>
      </div>
    </div>
  );
}

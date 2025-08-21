import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

/**
 * ManageRequest
 * - Lists requests from GET /api/requests
 * - Shows analytics summary from GET /api/requests/analytics/summary
 * - Includes: search (q), filters (status, type, date range), pagination, sorting
 *
 * Endpoints (assumed base path): /api/requests
 *   router.get("/", getRequests);
 *   router.get("/analytics/summary", getRequestsSummary);
 *
 * If your base path differs (e.g., "/requests"), change API_BASE below.
 */

const API_BASE = "http://localhost:3000/api/requests"; // adjust if needed

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Cancelled"];
const TYPE_OPTIONS = ["General", "Urgent", "Emergency"];

function classNames(...arr) {
  return arr.filter(Boolean).join(" ");
}

function StatusPill({ value }) {
  const color =
    value === "Completed"
      ? "bg-green-100 text-green-700 ring-green-200"
      : value === "In Progress"
      ? "bg-blue-100 text-blue-700 ring-blue-200"
      : value === "Cancelled"
      ? "bg-red-100 text-red-700 ring-red-200"
      : "bg-yellow-100 text-yellow-700 ring-yellow-200";
  return (
    <span className={classNames("px-2 py-1 text-xs font-medium rounded-full ring-1", color)}>
      {value}
    </span>
  );
}

function TypeBadge({ value }) {
  const color =
    value === "Emergency"
      ? "bg-red-50 text-red-700 ring-red-200"
      : value === "Urgent"
      ? "bg-orange-50 text-orange-700 ring-orange-200"
      : "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span className={classNames("px-2 py-1 text-xs font-medium rounded-md ring-1", color)}>
      {value}
    </span>
  );
}

export default function ManageRequest() {
  // table/query state
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  // loading/error
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // analytics
  const [summary, setSummary] = useState({ total: 0, byStatus: {}, byType: {} });
  const [summaryLoading, setSummaryLoading] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("limit", limit);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return params.toString();
  }, [page, limit, sortBy, sortOrder, q, status, type, dateFrom, dateTo]);

  async function fetchList() {
    setLoading(true);
    setErr("");
    try {
      // Removed credentials: "include" to fix CORS issue
      const res = await fetch(`${API_BASE}?${queryString}`);
      if (!res.ok) throw new Error(`List error: ${res.status}`);
      const json = await res.json();
      setItems(json.data || []);
      setMeta(json.meta || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    setSummaryLoading(true);
    try {
      // Removed credentials: "include" to fix CORS issue
      const res = await fetch(`${API_BASE}/analytics/summary`);
      if (!res.ok) throw new Error(`Summary error: ${res.status}`);
      const json = await res.json();
      setSummary(json.data || { total: 0, byStatus: {}, byType: {} });
    } catch (e) {
      // show nothing / keep old summary
    } finally {
      setSummaryLoading(false);
    }
  }

  // initial load + when query changes
  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  // refresh summary occasionally / on mount
  useEffect(() => {
    fetchSummary();
  }, []);

  function resetFilters() {
    setQ("");
    setStatus("");
    setType("");
    setDateFrom("");
    setDateTo("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setLimit(10);
    setPage(1);
  }

  function onSort(col) {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Analytics */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-5 w-5" />
          <h2 className="text-lg font-semibold text-gray-800">Requests Overview</h2>
          {summaryLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <StatCard label="Total Requests" value={summary.total ?? 0} />
          <StatCard label="Pending" value={summary.byStatus?.Pending ?? 0} />
          <StatCard label="In Progress" value={summary.byStatus?.["In Progress"] ?? 0} />
          <StatCard label="Completed" value={summary.byStatus?.Completed ?? 0} />
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="General" value={summary.byType?.General ?? 0} />
          <StatCard label="Urgent" value={summary.byType?.Urgent ?? 0} />
          <StatCard label="Emergency" value={summary.byType?.Emergency ?? 0} />
        </div>
      </section>

      {/* Filters */}
      <section className="mb-4">
        <div className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-3">
              <label className="text-sm text-gray-600">Search</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border px-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  placeholder="Search ID, name, address..."
                  className="w-full py-2 outline-none"
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <label className="text-sm text-gray-600">Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="text-sm text-gray-600">Type</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="">All</option>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="text-sm text-gray-600">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="text-sm text-gray-600">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div className="lg:col-span-1 flex items-end gap-2">
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="h-4 w-4" />
            <span>
              Showing {items.length} of {meta.total} (page {meta.page} / {meta.totalPages})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows</label>
            <select
              value={limit}
              onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
              className="rounded-lg border px-2 py-1 text-sm"
            >
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr className="text-xs uppercase text-gray-500">
                <Th onClick={() => onSort("requestID")} active={sortBy === "requestID"} order={sortOrder}>Request ID</Th>
                <Th onClick={() => onSort("userName")} active={sortBy === "userName"} order={sortOrder}>User</Th>
                <Th onClick={() => onSort("dwellerAddress")} active={sortBy === "dwellerAddress"} order={sortOrder}>Address</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th onClick={() => onSort("requestDate")} active={sortBy === "requestDate"} order={sortOrder}>Date</Th>
                <Th>Time</Th>
                <Th onClick={() => onSort("collectorID")} active={sortBy === "collectorID"} order={sortOrder}>Collector</Th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-gray-500">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-gray-500">No requests found.</td>
                </tr>
              )}
              {!loading && items.map((r) => (
                <tr key={r._id || r.requestID} className="border-t">
                  <td className="px-3 py-3 font-medium text-gray-800">{r.requestID}</td>
                  <td className="px-3 py-3">{r.userName}</td>
                  <td className="px-3 py-3 max-w-[320px] truncate" title={r.dwellerAddress}>{r.dwellerAddress}</td>
                  <td className="px-3 py-3"><TypeBadge value={r.requestType} /></td>
                  <td className="px-3 py-3"><StatusPill value={r.requestStatus} /></td>
                  <td className="px-3 py-3">{r.requestDate ? new Date(r.requestDate).toLocaleDateString() : "-"}</td>
                  <td className="px-3 py-3">{r.requestTime || "-"}</td>
                  <td className="px-3 py-3">{r.collectorID}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3">
          <div className="text-sm text-gray-600">
            {err ? <span className="text-red-600">Error: {err}</span> : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={classNames(
                "inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm",
                page <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
              )}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <span className="text-sm text-gray-700">Page {page} of {meta.totalPages || 1}</span>
            <button
              disabled={page >= (meta.totalPages || 1)}
              onClick={() => setPage((p) => Math.min((meta.totalPages || 1), p + 1))}
              className={classNames(
                "inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm",
                page >= (meta.totalPages || 1) ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
              )}
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function Th({ children, onClick, active, order }) {
  return (
    <th
      onClick={onClick}
      className={classNames(
        "px-3 py-3 cursor-pointer select-none",
        active ? "text-gray-900" : "text-gray-600"
      )}
      title="Sort"
    >
      <div className="inline-flex items-center gap-1">
        <span>{children}</span>
        {active && <span className="text-xs uppercase">{order}</span>}
      </div>
    </th>
  );
}
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, X, UserCircle2 } from "lucide-react";

function classNames(...x) {
  return x.filter(Boolean).join(" ");
}

const Navbar = () => {
  const navigate = useNavigate();

  // Read auth state from localStorage
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem("authUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Refs for click-outside handling
  const menuBtnRef = useRef(null);
  const menuRef = useRef(null);

  // Sync auth across tabs & after login/logout
  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem("authUser");
        setAuth(raw ? JSON.parse(raw) : null);
      } catch {
        setAuth(null);
      }
    };
    window.addEventListener("storage", sync);
    window.addEventListener("auth:changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth:changed", sync);
    };
  }, []);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuOpen) return;
      const btn = menuBtnRef.current;
      const menu = menuRef.current;
      if (btn?.contains(e.target) || menu?.contains(e.target)) return;
      setMenuOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen]);

  const logout = () => {
    localStorage.removeItem("authUser");
    window.dispatchEvent(new Event("auth:changed"));
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const user = auth?.user;
  const avatarUrl = user?.profilePicture;
  const initials = (user?.fullName || user?.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Brand + Desktop Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 font-semibold text-slate-800"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                WM
              </span>
              WasteMate
            </Link>

            <div className="hidden md:flex items-center gap-4">
              {navLinks.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    classNames(
                      "px-3 py-2 rounded-md text-sm font-medium transition",
                      isActive
                        ? "text-blue-700 bg-blue-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right: Auth Area */}
          <div className="flex items-center gap-2">
            {/* Desktop */}
            <div className="hidden md:flex items-center">
              {!auth ? (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              ) : (
                <div className="relative">
                  {/* Icon-only avatar button */}
                  <button
                    ref={menuBtnRef}
                    onClick={() => setMenuOpen((s) => !s)}
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white p-1 shadow-sm hover:bg-slate-50 transition"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label="Account menu"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
                        {initials}
                      </div>
                    )}
                  </button>

                  {/* Dropdown */}
                  {menuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg p-1"
                      role="menu"
                    >
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/profile");
                        }}
                        className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-slate-100"
                        role="menuitem"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 inline-flex items-center gap-2"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-1">
              {navLinks.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    classNames(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      isActive
                        ? "text-blue-700 bg-blue-50"
                        : "text-slate-700 hover:bg-slate-100"
                    )
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </div>

            <div className="mt-3 border-t pt-3">
              {!auth ? (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-2 w-full justify-center rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-2">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle2 className="h-9 w-9 text-slate-500" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">
                        {user?.fullName || "My Account"}
                      </div>
                      <div className="text-xs text-slate-500">{user?.email}</div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 px-2">
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/profile");
                      }}
                      className="px-3 py-2 rounded-lg text-sm bg-slate-100 hover:bg-slate-200"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="px-3 py-2 rounded-lg text-sm bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

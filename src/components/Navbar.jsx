import { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Link, useLocation } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { theme, setTheme, city, setCity } = useContext(ThemeContext);
  const location = useLocation();
  const { isSignedIn, user } = useUser();
  const isAdmin = isSignedIn && user?.id === import.meta.env.VITE_ADMIN_CLERK_ID;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define tabs based on role
  const navTabs = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "History", path: "/history" },
    { name: "Compare", path: "/compare" },
    { name: "Reports", path: "/reports" },
    { name: "About", path: "/about" },
  ];

  // Health and Settings are only for signed-in users (fixes the duplicate issue)
  if (isSignedIn) {
    navTabs.push({ name: "Health", path: "/health" });
    // navTabs.push({ name: "Settings", path: "/settings" });
  }

  if (isAdmin) {
    navTabs.push({ name: "Admin", path: "/admin" });
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className="
        fixed top-0 left-0 w-full z-50
        backdrop-blur-md bg-[var(--bg)]/90 dark:bg-[var(--bg)]/80
        border-b border-[var(--card-border)]
        transition-all
      "
    >
      <nav className="w-full h-20 flex items-center justify-between px-4 md:px-8">

        {/* LEFT — LOGO */}
        <div className="text-xl font-bold tracking-wide select-none whitespace-nowrap" style={{ fontFamily: "'Fraunces', serif" }}>
          <Link to="/">BreatheBetter</Link>
        </div>

        {/* CENTER — NAV TABS (Desktop) */}
        <div className="hidden lg:flex items-center justify-center gap-2 flex-1 mx-4">
          {navTabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.name}
                to={tab.path}
                className={`
                  text-sm font-medium transition-colors
                  px-4 py-2 rounded-full
                  ${isActive
                    ? "text-indigo-700 bg-indigo-100 dark:text-white dark:bg-gray-700 font-semibold"
                    : "text-secondary hover:text-primary hover:bg-gray-500/10"
                  }
                `}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>

        {/* RIGHT — CONTROLS + LOGIN (Desktop) */}
        <div className="hidden lg:flex items-center justify-end gap-4 min-w-[200px]">
          <CityDropdown city={city} setCity={setCity} />

          <div className="h-6 w-px bg-[var(--card-border)]"></div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="
              w-10 h-10 rounded-lg flex items-center justify-center
              bg-[var(--card)] border border-[var(--card-border)]
              text-primary shadow hover:shadow-lg transition hover:cursor-pointer
              outline-none hover:focus:ring-2 focus:ring-gray-500 
            "
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <div className="h-6 w-px bg-[var(--card-border)]"></div>

          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Link
              to="/sign-in"
              className="px-5 py-2 rounded-xl text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow hover:shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Login
            </Link>
          )}
        </div>

        {/* MOBILE CONTROLS & TRIGGER */}
        <div className="flex lg:hidden items-center justify-end gap-3">
          <CityDropdown city={city} setCity={setCity} />

          {isSignedIn && (
            <div className="flex items-center justify-center pl-1">
              <UserButton afterSignOutUrl="/" />
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 text-primary hover:bg-gray-500/10 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU DROPDOWN */}
      <div
        className={`
          lg:hidden flex flex-col items-center gap-4 bg-[var(--card)] 
          border-b border-[var(--card-border)] shadow-xl
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? "max-h-[calc(100vh-5rem)] overflow-y-auto opacity-100 py-6" : "max-h-0 overflow-hidden opacity-0 py-0"}
        `}
      >
        {/* Mobile Navigation Links */}
        <div className="w-full px-4 flex flex-col gap-1">
          {navTabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <Link
                key={tab.name}
                to={tab.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center w-full px-4 py-3.5 rounded-xl text-base font-semibold transition-all
                  ${isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5"}
                `}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>

        <div className="w-[calc(100%-2rem)] h-px bg-[var(--card-border)] my-2"></div>

        {/* Mobile Action Row */}
        <div className="flex flex-col items-center justify-center gap-3 w-full px-6 pb-2">
          <button
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              setIsMobileMenuOpen(false);
            }}
            className="flex w-full justify-center items-center gap-2 px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--card-border)] text-primary font-medium"
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          {!isSignedIn && (
            <Link
              to="/sign-in"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center px-6 py-3 rounded-xl text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}


// ------------------------------------------------------------------
// 🔥 NEW CUSTOM DROPDOWN COMPONENT
// ------------------------------------------------------------------
const CITIES = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"];

function CityDropdown({ city, setCity }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // This hook closes the dropdown if you click outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleSelectCity = (selectedCity) => {
    setCity(selectedCity);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 1. The Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center justify-between
          pl-3 pr-2 py-2 rounded-lg text-sm font-medium
          bg-[var(--card)] text-primary 
          border border-[var(--card-border)]
          shadow hover:shadow-md transition
          outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500
          hover:cursor-pointer
        "
      >
        {/* 🔥 FIX 2: Added Location Icon */}
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span>{city}</span>
        </span>
        {/* The dropdown arrow, which spins */}
        <svg
          className={`w-5 h-5 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 2. The Options Menu (now fully styled) */}
      {isOpen && (
        <div
          className="
            absolute top-full left-0 mt-2 w-full
            bg-[var(--card)] border border-[var(--card-border)]
            rounded-lg shadow-lg overflow-hidden
            z-[100]
          "
        >
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => handleSelectCity(c)}
              className={`
                w-full text-left px-4 py-2 text-sm text-primary
                hover:bg-gray-500/20
                ${city === c ? 'bg-gray-500/20 font-semibold' : ''}
              `}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
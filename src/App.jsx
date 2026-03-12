// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Compare from "./pages/Compare";
import History from "./pages/History";
import Health from "./pages/Health";
import Reports from "./pages/Reports";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Whitepaper from "./pages/Whitepaper";


export default function App() {
  const location = useLocation();
  const isLanding = location.pathname === "/" || location.pathname === "/whitepaper";

  return (
    <div className="flex flex-col min-h-screen text-slate-900 dark:text-slate-100">

      {/* FIXED NAVBAR — hidden on landing page */}
      {!isLanding && <Navbar />}

      {/* MAIN CONTENT - Flexible column, centers content globally */}
      <main className={`flex-1 w-full flex flex-col items-center ${isLanding ? "" : "pt-20"}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/health" element={<Health />} />
          <Route path="/history" element={<History />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/about" element={<About />} />
          <Route path="/whitepaper" element={<Whitepaper />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/sign-in/*" element={
            <div className="flex justify-center items-center py-16">
              <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
            </div>
          } />
          <Route path="/sign-up/*" element={
            <div className="flex justify-center items-center py-16">
              <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
            </div>
          } />
        </Routes>
      </main>

      {/* STICKY FOOTER AT BOTTOM */}
      {!isLanding && <Footer />}
    </div>
  );
}// force reload

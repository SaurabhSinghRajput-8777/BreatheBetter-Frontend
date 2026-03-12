// src/components/Footer.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter, Mail, ChevronDown } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full mt-auto z-40 border-t border-[var(--card-border)] bg-[var(--card)]/95 backdrop-blur-xl transition-colors duration-300">
      <div className="w-full mx-auto px-6 md:px-12 lg:px-16 py-10 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 xl:gap-24 mb-10">

          {/* Brand Col */}
          <div className="md:col-span-2 lg:col-span-2 space-y-6 pr-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
                  BreatheBetter
                </span>
              </div>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm font-medium">
                Empowering your breathing space with hyper-local, AI-driven air quality forecasts and enterprise-grade insights.
              </p>
            </div>

            {/* API Status */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 mt-2 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                All systems operational
              </span>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-12 border-t border-gray-100 dark:border-gray-800 md:border-t-0 pt-6 md:pt-0">
            {/* Product Links */}
            <FooterAccordion title="Product">
              <FooterLink to="/dashboard">Live Dashboard</FooterLink>
              <FooterLink to="/compare">City Comparison</FooterLink>
              <FooterLink to="/history">Historical Trends</FooterLink>
              <FooterLink to="/reports">Enterprise Reports</FooterLink>
            </FooterAccordion>

            {/* Technology Links */}
            <FooterAccordion title="Technology">
              <FooterExternalLink href="https://openweathermap.org" iconColor="bg-sky-500">
                OpenWeatherMap
              </FooterExternalLink>
              <FooterExternalLink href="https://open-meteo.com" iconColor="bg-indigo-500">
                Open-Meteo
              </FooterExternalLink>
              <FooterExternalLink href="#" iconColor="bg-rose-500">
                Ensemble XGBoost
              </FooterExternalLink>
              <FooterExternalLink href="#" iconColor="bg-amber-500">
                Random Forest ML
              </FooterExternalLink>
            </FooterAccordion>

            {/* Resources */}
            <FooterAccordion title="Resources">
              <FooterLink to="#">Developer API</FooterLink>
              <FooterLink to="#">Documentation</FooterLink>
              <FooterLink to="#">Community Help</FooterLink>
              <FooterLink to="#">Open Source</FooterLink>
            </FooterAccordion>
          </div>

        </div>

        {/* Bottom Strip: Socials, Copyright, Links */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800 gap-4">

          <div className="flex items-center justify-between w-full md:w-auto gap-6 text-xs text-gray-500 dark:text-gray-400 font-medium order-2 md:order-1">
            <span>© {new Date().getFullYear()} BreatheBetter.</span>
            <div className="flex gap-4 sm:gap-6">
              <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</a>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center md:items-center gap-3 w-full md:w-auto order-1 md:order-2 pb-4 md:pb-0 border-b border-gray-100 dark:border-gray-800 md:border-b-0">
            <SocialIcon href="https://github.com/SaurabhSinghRajput-8777" label="GitHub" icon={Github} />
            <SocialIcon href="https://www.linkedin.com/in/saurabh-singh-bu/" label="LinkedIn" icon={Linkedin} />
            <SocialIcon href="https://x.com/saurabh56675251?s=21" label="Twitter" icon={Twitter} />
            <SocialIcon href="mailto:saurabhsingh052005@gmail.com" label="Email" icon={Mail} />
          </div>

        </div>
      </div>
    </footer>
  );
}

// Mobile Expandable Column Component
function FooterAccordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 dark:border-gray-800/60 md:border-none pb-2 md:pb-0 last:border-none">
      {/* Mobile Toggle Button (Disabled on Desktop via cursor-default & pointer-events) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between md:cursor-default py-2 md:py-0 md:pb-4 text-left group"
      >
        <h3 className="text-[13px] sm:text-xs font-bold text-gray-900 dark:text-white/90 uppercase tracking-widest md:tracking-wider">
          {title}
        </h3>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 md:hidden ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expandable Content Area */}
      <div
        className={`overflow-hidden transition-all duration-300 md:h-auto md:opacity-100 md:block ${isOpen ? "h-auto opacity-100 pb-4 pt-2" : "h-0 opacity-0 md:h-auto"
          }`}
      >
        <ul className="space-y-3.5 md:space-y-3">
          {children}
        </ul>
      </div>
    </div>
  );
}

// Custom Link Components
function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="text-[14px] font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all hover:translate-x-1 block w-fit"
      >
        {children}
      </Link>
    </li>
  );
}

function FooterExternalLink({ href, iconColor, children }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className={`w-1.5 h-1.5 rounded-full ${iconColor} shadow-sm shrink-0`}></span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[14px] font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
      >
        {children}
      </a>
    </li>
  );
}

function SocialIcon({ href, label, icon: Icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition-all transform hover:scale-105 hover:-translate-y-1 shadow-sm hover:shadow-indigo-500/25"
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}

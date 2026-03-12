import React from "react";
import OurMissionImg from "../assets/Our_Mission.png";
import OurVisionImg from "../assets/Our_Vision.png";

export default function About() {
  return (
    // Reduced pb-20 to pb-10 to decrease footer gap
    <div className="min-h-screen bg-[--bg] transition-colors pb-10">

      {/* Hero with Gradient */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Breathing new life into data.
          </h1>
          <p className="text-indigo-100 text-lg md:text-xl leading-relaxed">
            BreatheBetter AI combines real-time monitoring with advanced machine learning to predict air quality trends, helping you plan a healthier future.
          </p>
        </div>
      </div>

      {/* Reduced py-16 to py-12 */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">

        {/* Section 1: Our Mission (Text Left - Image Right) */}
        <div className="mb-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-4">Our Mission</h2>
            <p className="text-secondary leading-relaxed">
              Air pollution is one of the greatest environmental health risks of our time. Our mission is to democratize access to accurate, hyper-local air quality data. By leveraging satellite imagery and ground station data, we provide actionable insights that empower communities to take precautions when it matters most.
            </p>
          </div>
          <div className="rounded-2xl h-80 overflow-hidden shadow-lg border border-[var(--card-border)]">
            <img 
              src={OurMissionImg} 
              alt="Our Mission" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Section 2: Our Vision (Image Left - Text Right) */}
        {/* Removed mb-8 since it's the last element */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Block */}
          <div className="rounded-2xl h-80 overflow-hidden shadow-lg border border-[var(--card-border)] order-last md:order-first">
            <img 
              src={OurVisionImg} 
              alt="Our Vision" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Block */}
          <div>
            <h2 className="text-2xl font-bold text-primary mb-4">Our Vision</h2>
            <p className="text-secondary leading-relaxed">
              We envision a world where clean air is a fundamental right, not a luxury. Through continuous innovation and community engagement, we aim to build a global network of informed citizens who can actively contribute to a healthier, sustainable planet.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
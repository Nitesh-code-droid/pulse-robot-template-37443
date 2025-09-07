
import React, { useRef, useEffect } from "react";

const RobotShowcaseSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple animation when the section comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-20 bg-gray-100" id="robot-showcase">
      <div className="container px-6 lg:px-8 mx-auto">
        <div className="flex flex-col items-center opacity-0 translate-y-10 transition-all duration-1000">
          <div className="mb-12 text-center">
            <div className="pulse-chip mb-4">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">03</span>
              <span>Meet the Future</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Nexion
              </span> - Your Mental Health Companion
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A comprehensive digital platform that combines AI-powered support, professional counseling, 
              and peer community to provide holistic mental wellness solutions for students.
            </p>
          </div>
          
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-8 mx-auto">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Nexion
                </span> Platform
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Comprehensive mental health support designed specifically for students
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">AI Chat Support</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">24/7 instant help</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Peer Community</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Connect with others</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Professional Help</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Expert counseling</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-xl shadow-elegant hover:shadow-elegant-hover transition-all duration-300">
              <div className="w-12 h-12 bg-pulse-100 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#FC4D0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2">Advanced Sensors</h4>
              <p className="text-gray-600">High-precision sensors provide real-time environmental awareness and object recognition.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-elegant hover:shadow-elegant-hover transition-all duration-300">
              <div className="w-12 h-12 bg-pulse-100 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.5 14.5L5.5 18.5M9.5 14.5L11.5 16.5L14.5 13.5M9.5 14.5L6.5 11.5M14.5 13.5L18.5 9.5M14.5 13.5L17.5 16.5M18.5 9.5L17.086 8.086M18.5 9.5L19.914 10.914" stroke="#FC4D0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2">Adaptive Learning</h4>
              <p className="text-gray-600">Continuously learns from interactions to improve performance and personalize responses.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-elegant hover:shadow-elegant-hover transition-all duration-300">
              <div className="w-12 h-12 bg-pulse-100 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 8V16M21 12H17M7 8V16M7 12H3M12 3V21M12 16L16 12M12 16L8 12" stroke="#FC4D0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2">Fluid Movement</h4>
              <p className="text-gray-600">Engineered for natural, human-like movement with high degrees of freedom in all joints.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RobotShowcaseSection;

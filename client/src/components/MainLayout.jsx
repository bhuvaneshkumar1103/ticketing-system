import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { LogOut, User, ChevronDown } from 'lucide-react';

const MainLayout = ({ children, pageTitle, userName = "John Doe" }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex antialiased">
      <Sidebar />

      <main className="flex-1 ml-36 mr-10 py-10 flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0071e3] mb-1">System Portal</span>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 capitalize">
              {pageTitle}
            </h1>
          </div>
          
          {/* User Card with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border transition-all cursor-pointer select-none ${
                isDropdownOpen ? 'border-blue-200 shadow-md ring-4 ring-blue-50' : 'border-gray-100 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-gray-900 leading-none">{userName}</span>
                <span className="text-[10px] text-gray-400 font-medium">Administrator</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#0071e3] flex items-center justify-center text-white text-sm font-bold shadow-blue-200 shadow-lg">
                {userName.charAt(0)}
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                <button className="w-full px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                  <User size={16} className="text-gray-400" />
                  Profile Settings
                </button>
                <div className="h-px bg-gray-100 my-1 mx-2"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors font-semibold"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
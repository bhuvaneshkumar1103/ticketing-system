import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { LogOut, User, ChevronDown, Loader2 } from 'lucide-react';
import api from '../api'; // Ensure this path points to your axios instance

const MainLayout = ({ children, pageTitle }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({ name: '', role: '' });
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  // 1. Fetch real user identity
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        const user = res.data?.user || res.data;
        setUserData({
          name: user.name || 'User',
          role: user.role || 'GUEST'
        });
      } catch (err) {
        console.error("Layout Auth Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

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

  // Dynamic colors based on Role
  const getRoleStyles = (role) => {
    switch(role) {
      case 'ADMIN': return 'text-purple-600 bg-purple-50';
      case 'MANUFACTURER': return 'text-blue-600 bg-blue-50';
      case 'CMR': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-gray-400 bg-gray-50';
    }
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
              onClick={() => !isLoading && setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border transition-all cursor-pointer select-none ${
                isDropdownOpen ? 'border-blue-200 shadow-md ring-4 ring-blue-50' : 'border-gray-100 shadow-sm hover:shadow-md'
              }`}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-blue-500 mr-2" />
              ) : (
                <>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-900 leading-none">{userData.name}</span>
                    <span className={`text-[9px] mt-1 px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${getRoleStyles(userData.role)}`}>
                      {userData.role}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#0071e3] flex items-center justify-center text-white text-sm font-bold shadow-blue-200 shadow-lg">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </>
              )}
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
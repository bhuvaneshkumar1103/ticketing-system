import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, Box } from 'lucide-react';

const SideNavItem = ({ icon, to, active }) => (
  <Link 
    to={to}
    className={`relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 group ${
      active 
      ? 'bg-white text-[#0071e3] shadow-lg scale-110' // Active: White box, Blue icon
      : 'text-white/60 hover:text-white hover:bg-white/10' // Inactive: Transparent/White
    }`}
  >
    {icon}
    {active && (
      <div className="absolute -left-4 w-1.5 h-6 bg-white rounded-r-full shadow-[2px_0_10px_rgba(255,255,255,0.5)]" />
    )}
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50">
      {/* Background is now the Vibrant Blue */}
      <nav className="w-20 bg-[#0071e3] border border-blue-400/30 shadow-[0_20px_50px_rgba(0,113,227,0.3)] rounded-[30px] py-8 flex flex-col items-center gap-8 h-fit transition-all duration-500">
        
        {/* Brand Logo - Inverted */}
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-2 shadow-sm">
            <span className="text-[#0071e3] font-black text-xs italic">I</span>
        </div>
        
        <SideNavItem icon={<LayoutDashboard size={22}/>} to="/dashboard" active={isActive('/dashboard')} />
        <SideNavItem icon={<Ticket size={22}/>} to="/tickets" active={isActive('/tickets')} />
        <SideNavItem icon={<Box size={22}/>} to="/assets" active={isActive('/assets')} />
      </nav>
    </div>
  );
};

export default Sidebar;
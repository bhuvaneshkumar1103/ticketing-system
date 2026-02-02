import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, Line, Legend
} from 'recharts';
import { 
  TrendingUp, Users, Zap, ShieldCheck, 
  Clock, AlertCircle, Filter, Download 
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import api from '../api';

const BusinessDashboard = () => {
  // Business Metrics Data
  const efficiencyData = [
    { month: 'Jan', resolved: 45, received: 50, sla: 92 },
    { month: 'Feb', resolved: 52, received: 48, sla: 95 },
    { month: 'Mar', resolved: 38, received: 60, sla: 88 },
    { month: 'Apr', resolved: 65, received: 62, sla: 98 },
  ];

  const distributionData = [
    { name: 'Data Mismatch', value: 45 },
    { name: 'Hardware', value: 25 },
    { name: 'Connectivity', value: 20 },
    { name: 'User Error', value: 10 },
  ];

  return (
    <MainLayout pageTitle="Business Intelligence Ops">
      <div className="space-y-8 pb-20">
        
        {/* TOP ROW: EXECUTIVE KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <BIStatCard label="Operational Uptime" value="99.8%" sub="Target: 99.9%" icon={<Zap />} color="text-amber-500" />
          <BIStatCard label="SLA Compliance" value="94.2%" sub="+2.1% from last month" icon={<ShieldCheck />} color="text-emerald-500" />
          <BIStatCard label="Avg. Resolution Time" value="1.8 hrs" sub="-15m vs industry avg" icon={<Clock />} color="text-blue-500" />
          <BIStatCard label="Open Risk Items" value="14" sub="3 critical priority" icon={<AlertCircle />} color="text-rose-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. OPERATIONAL EFFICIENCY (Composed Chart) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Operational Throughput</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Received vs Resolved Tickets (SLA % Line)</p>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 transition-all"><Download size={16}/></button>
              </div>
            </div>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={efficiencyData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                  <Legend iconType="circle" />
                  <Bar dataKey="received" fill="#e2e8f0" radius={[10, 10, 0, 0]} barSize={40} name="New Tickets" />
                  <Bar dataKey="resolved" fill="#0071e3" radius={[10, 10, 0, 0]} barSize={40} name="Resolved" />
                  <Line type="monotone" dataKey="sla" stroke="#10b981" strokeWidth={3} dot={{r: 6}} name="SLA %" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. ROOT CAUSE ANALYTICS (Vertical Bar) */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 mb-8 text-center">Volume by Root Cause</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={distributionData} margin={{left: 20}}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: '#64748b'}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#0f172a" radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-6 border-t border-gray-50 flex justify-around">
               <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Hardware</p>
                  <p className="text-sm font-bold text-gray-800">25%</p>
               </div>
               <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Software</p>
                  <p className="text-sm font-bold text-gray-800">75%</p>
               </div>
            </div>
          </div>

        </div>

        {/* 3. BUSINESS RISK HEATMAP (Conceptual Grid) */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <Users size={18} className="text-blue-600" />
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Cluster Manager Workload Heatmap</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <HeatmapCell cluster="North-Z1" load="High" color="bg-rose-500" count="42" />
             <HeatmapCell cluster="South-Z2" load="Normal" color="bg-emerald-500" count="12" />
             <HeatmapCell cluster="East-Z4" load="Warning" color="bg-amber-500" count="28" />
             <HeatmapCell cluster="West-Z1" load="Normal" color="bg-emerald-500" count="15" />
             <HeatmapCell cluster="HQ-Direct" load="Low" color="bg-blue-500" count="5" />
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

// --- BI Helper Components ---

const BIStatCard = ({ label, value, sub, icon, color }) => (
  <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:translate-y-[-4px] transition-all">
    <div className={`flex items-center justify-between mb-4`}>
      <div className={`p-2 rounded-xl bg-gray-50 ${color}`}>{icon}</div>
      <span className="text-[8px] font-black bg-gray-900 text-white px-2 py-1 rounded-md uppercase tracking-tighter">Live</span>
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
    <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">{sub}</p>
  </div>
);

const HeatmapCell = ({ cluster, load, color, count }) => (
  <div className="p-4 rounded-2xl border border-gray-50 bg-gray-50/30 flex flex-col items-center text-center">
    <div className={`w-3 h-3 rounded-full ${color} mb-3 shadow-sm`} />
    <p className="text-[10px] font-black text-gray-800 uppercase mb-1">{cluster}</p>
    <p className="text-xs text-gray-400 font-bold uppercase">{load}</p>
    <div className="mt-3 text-lg font-black text-gray-900">{count}</div>
  </div>
);

export default BusinessDashboard;
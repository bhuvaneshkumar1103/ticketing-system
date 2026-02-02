import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, ChevronLeft, ChevronRight, 
  ArrowUpDown, X, MapPin, Radio, Battery, ShieldAlert
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import api from '../api';

const AssetList = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'imei_no', direction: 'desc' });
  const itemsPerPage = 10;

  // Filter States based on your Mongoose Schema
  const [filters, setFilters] = useState({
    imei_no: '',
    device_id: '',
    vehicle_no: '',
    is_online: '',
    sos_button_status: ''
  });

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const res = await api.get('/assets');
        setAssets(res.data?.data ?? res.data ?? []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  // 1. Filter Logic
  const filteredAssets = useMemo(() => {
    return assets.filter(a => (
      (a.imei_no || '').toString().includes(filters.imei_no) &&
      (a.device_id || '').toLowerCase().includes(filters.device_id.toLowerCase()) &&
      (a.vehicle_no || '').toLowerCase().includes(filters.vehicle_no.toLowerCase()) &&
      (a.sos_button_status || '').toLowerCase().includes(filters.sos_button_status.toLowerCase()) &&
      (filters.is_online === '' || a.is_online.toString() === filters.is_online)
    ));
  }, [assets, filters]);

  // 2. Sort Logic
  const sortedAssets = useMemo(() => {
    let sortableItems = [...filteredAssets];
    sortableItems.sort((a, b) => {
      let aVal = a[sortConfig.key] ?? '';
      let bVal = b[sortConfig.key] ?? '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [filteredAssets, sortConfig]);

  // 3. Pagination Logic
  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage);
  const currentData = sortedAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };

  return (
    <MainLayout pageTitle="GPS Asset Fleet">
      <div className="space-y-6">
        
        {/* Actions Bar */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm border transition-all ${
              showFilters ? 'bg-blue-50 border-blue-200 text-[#0071e3]' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {showFilters ? <X size={18} /> : <Search size={18} />}
            {showFilters ? 'Hide Filters' : 'Search Fleet'}
          </button>

          <button 
            onClick={() => navigate('/assets/new')}
            className="flex items-center gap-2 bg-[#0071e3] text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-600 transition-all"
          >
            <Plus size={18} /> Register Asset
          </button>
        </div>

        {/* Fleet Table */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th onClick={() => setSortConfig({key: 'imei_no', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})} className="cursor-pointer px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-blue-500">
                    <div className="flex items-center gap-2">IMEI / ID <ArrowUpDown size={12}/></div>
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Vehicle No</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Coordinates</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Battery/Signal</th>
                </tr>

                {/* FILTER ROW */}
                {showFilters && (
                  <tr className="bg-blue-50/30 border-b border-blue-100/50 animate-in slide-in-from-top duration-200">
                    <td className="px-6 py-3"><input name="imei_no" value={filters.imei_no} onChange={handleFilterChange} placeholder="Search IMEI..." className="w-full px-3 py-2 rounded-xl border-none text-xs outline-none" /></td>
                    <td className="px-6 py-3"><input name="vehicle_no" value={filters.vehicle_no} onChange={handleFilterChange} placeholder="Plate No..." className="w-full px-3 py-2 rounded-xl border-none text-xs outline-none" /></td>
                    <td className="px-6 py-3"></td>
                    <td className="px-6 py-3">
                      <select name="is_online" value={filters.is_online} onChange={handleFilterChange} className="w-full px-3 py-2 rounded-xl border-none text-xs outline-none bg-transparent">
                        <option value="">All Status</option>
                        <option value="true">Online</option>
                        <option value="false">Offline</option>
                      </select>
                    </td>
                    <td className="px-6 py-3"><input name="sos_button_status" value={filters.sos_button_status} onChange={handleFilterChange} placeholder="SOS Status..." className="w-full px-3 py-2 rounded-xl border-none text-xs outline-none" /></td>
                  </tr>
                )}
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="5" className="p-20 text-center animate-pulse text-gray-300 font-bold tracking-widest uppercase">Fetching Fleet Data...</td></tr>
                ) : currentData.map((asset) => (
                  <tr 
                    key={asset._id} 
                    className="group hover:bg-blue-50/40 cursor-pointer transition-all"
                    onClick={() => navigate(`/assets/${asset._id}`)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#0071e3] tracking-tight">{asset.imei_no}</span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase">{asset.device_id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-700">{asset.vehicle_no || "N/A"}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin size={14} className={asset.gps_fixed ? "text-emerald-500" : "text-rose-400"} />
                        <span className="text-[11px] font-mono">{asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${asset.is_online ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${asset.is_online ? "text-emerald-600" : "text-gray-400"}`}>
                          {asset.is_online ? "Live" : "Offline"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Battery size={14} className={asset.battery_duration < 20 ? "text-rose-500" : "text-gray-400"} />
                          <span className="text-[11px] font-bold">{asset.battery_duration}%</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Radio size={14} />
                          <span className="text-[11px] font-bold">{asset.signal_strength_dbm} dBm</span>
                        </div>
                        {asset.sos_button_status !== 'NORMAL' && (
                          <ShieldAlert size={16} className="text-rose-500 animate-bounce" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between px-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Total Fleet: {filteredAssets.length} Units
          </p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-20 shadow-sm transition-all"><ChevronLeft size={18} /></button>
            <div className="flex items-center px-6 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-700 shadow-sm">
              PAGE {currentPage} / {totalPages || 1}
            </div>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="p-2.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-20 shadow-sm transition-all"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AssetList;
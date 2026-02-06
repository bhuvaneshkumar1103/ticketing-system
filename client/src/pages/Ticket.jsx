import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, ChevronLeft, ChevronRight, 
  ArrowUpDown, X, Filter
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import api from '../api';

const TicketList = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isManufacturer,setIsManufacturer] = useState(false);

  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'ticket_id', direction: 'desc' });
  const itemsPerPage = 10;

  // Filter States (One for each relevant column)
  const [filters, setFilters] = useState({
    ticket_id: '',
    imei_no: '',
    root_cause: '',
    status: '',
    reported_by: ''
  });

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tickets');
        setTickets(res.data?.data ?? res.data ?? []);
        const response = await api.get(`/users/me`);
        const user = response.data?.user || response.data;
        setIsManufacturer(user.role === "MANUFACTURER"?true:false);
      } catch (err) {
        setError("Unable to sync tickets.");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // 1. Filter Logic
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      return (
        t.ticket_id?.toString().includes(filters.ticket_id) &&
        t.imei_no?.toLowerCase().includes(filters.imei_no.toLowerCase()) &&
        (t.analysis?.root_cause || '').toLowerCase().includes(filters.root_cause.toLowerCase()) &&
        (t.status || '').toLowerCase().includes(filters.status.toLowerCase()) &&
        (t.error_data?.reported_by || '').toLowerCase().includes(filters.reported_by.toLowerCase())
      );
    });
  }, [tickets, filters]);

  // 2. Sort Logic
  const sortedTickets = useMemo(() => {
    let sortableItems = [...filteredTickets];
    sortableItems.sort((a, b) => {
      let aVal = a[sortConfig.key] ?? '';
      let bVal = b[sortConfig.key] ?? '';
      
      // Handle nested keys if necessary (simplified here)
      if (sortConfig.key === 'root_cause') aVal = a.analysis?.root_cause ?? '';
      if (sortConfig.key === 'reported_by') aVal = a.error_data?.reported_by ?? '';

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [filteredTickets, sortConfig]);

  // 3. Pagination Logic
  const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);
  const currentData = sortedTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to page 1 on search
  };

  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Styles from your original code
  const getStatusStyle = (status) => {
    const styles = {
      OPEN: 'bg-rose-500 text-white',
      IN_ANALYSIS: 'bg-orange-500 text-white',
      CMR_REVIEW: 'bg-yellow-500 text-white',
      CLOSED: 'bg-green-500 text-white'
    };
    return styles[status] || 'bg-gray-400 text-white';
  };
  const getRootCauseStyle = (status) => {
    const styles = {
      DATA_MISSING: 'text-rose-500',
      DATA_MISMATCH: 'text-orange-500',
      HARDWARE_FAILURE: 'text-yellow-500',
      DEVICE_NOT_FOUND: 'text-red-500'
    };
    return styles[status] || 'text-gray-400';
  };
  return (
    <MainLayout pageTitle="Support Tickets">
      <div className="space-y-6">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all border ${
                showFilters ? 'bg-blue-50 border-blue-200 text-[#0071e3]' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {showFilters ? <X size={18} /> : <Search size={18} />}
              {showFilters ? 'Close Search' : 'Search Filters'}
            </button>
          </div>

          {isManufacturer ?<button 
            onClick={() => navigate('/tickets/new')}
            className="flex items-center gap-2 bg-[#0071e3] text-white px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-600 transition-all active:scale-95"
          >
            <Plus size={18} />
            New Ticket
          </button> : ""}
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th onClick={() => requestSort('ticket_id')} className="cursor-pointer px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-500 transition-colors">
                   <div className="flex items-center gap-2">Ticket ID <ArrowUpDown size={12}/></div>
                </th>
                <th onClick={() => requestSort('imei_no')} className="cursor-pointer px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-500">
                   <div className="flex items-center gap-2">IMEI No <ArrowUpDown size={12}/></div>
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Root Cause</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Reporter</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-widest">Updated Time</th>
              </tr>

              {/* DYNAMIC SEARCH ROW */}
              {showFilters && (
                <tr className="bg-blue-50/30 animate-in fade-in duration-300">
                  <td className="px-6 py-3"><input name="ticket_id" value={filters.ticket_id} onChange={handleFilterChange} placeholder="ID..." className="w-full px-3 py-1.5 rounded-lg border-gray-100 text-xs focus:ring-2 focus:ring-blue-100 outline-none" /></td>
                  <td className="px-6 py-3"><input name="imei_no" value={filters.imei_no} onChange={handleFilterChange} placeholder="IMEI..." className="w-full px-3 py-1.5 rounded-lg border-gray-100 text-xs focus:ring-2 focus:ring-blue-100 outline-none" /></td>
                  <td className="px-6 py-3"><input name="root_cause" value={filters.root_cause} onChange={handleFilterChange} placeholder="Cause..." className="w-full px-3 py-1.5 rounded-lg border-gray-100 text-xs focus:ring-2 focus:ring-blue-100 outline-none" /></td>
                  <td className="px-6 py-3"><input name="status" value={filters.status} onChange={handleFilterChange} placeholder="Status..." className="w-full px-3 py-1.5 rounded-lg border-gray-100 text-xs focus:ring-2 focus:ring-blue-100 outline-none" /></td>
                  <td className="px-6 py-3"><input name="reported_by" value={filters.reported_by} onChange={handleFilterChange} placeholder="Name..." className="w-full px-3 py-1.5 rounded-lg border-gray-100 text-xs focus:ring-2 focus:ring-blue-100 outline-none" /></td>
                  <td className="px-6 py-3"></td>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center animate-pulse text-gray-400">Syncing database...</td></tr>
              ) : currentData.map((t) => (
                <tr 
                  key={t._id} 
                  className="group hover:bg-blue-50/40 cursor-pointer transition-all"
                  onClick={() => navigate(`/tickets/${t.ticket_id}`)}
                >
                  <td className="px-8 py-5 font-bold text-[#0071e3] text-sm">#{t.ticket_id}</td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-700">{t.imei_no}</td>
                  <td className={`px-8 py-5 text-xs font-semibold text-gray-500 italic ${getRootCauseStyle(t.analysis.root_cause)}`}>{t.analysis?.root_cause.replaceAll('_', ' ') || "Pending"}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getStatusStyle(t.status)}`}>
                      {t.status?.replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">{t.error_data?.reported_by.replaceAll('_', ' ')}</td>
                  <td className="px-8 py-5 text-gray-400 font-mono">
                    {t.error_data?.timestamp}
                  </td>
                  <td className="px-8 py-5 text-gray-400 font-mono">
                    {t.last_updated_time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION SECTION */}
        <div className="flex items-center justify-between px-2">
          <p className="text-xs font-bold text-gray-400">
            Showing <span className="text-gray-900">{currentData.length}</span> of {filteredTickets.length} Results
          </p>
          
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-30 shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center px-4 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 shadow-sm">
              Page {currentPage} of {totalPages || 1}
            </div>

            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 disabled:opacity-30 shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TicketList;
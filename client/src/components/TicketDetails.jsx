import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, Calendar, HardDrive, AlertCircle, CheckCircle2,User,Globe, X, Zap, } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import api from '../api';
import AlertModal from './AlertModal';
const getStatusStyle = (status) => {
    const styles = {
      OPEN: 'bg-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]',
      IN_ANALYSIS: 'bg-orange-500 text-white shadow-[0_4px_12px_rgba(251,146,60,0.3)]',
      CMR_REVIEW: 'bg-yellow-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]',
      MANUFACTURER_ANALYSIS: 'bg-red-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]',
      RESOLVED: 'bg-lime-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]',
      CLOSED: 'bg-green-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
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
const DataField = ({ label, value, highlight = false }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
    <span className={`text-sm font-medium ${highlight ? 'text-[#0071e3]' : 'text-gray-700'}`}>
      {value || "N/A"}
    </span>
  </div>
);

const SectionHeader = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={18} className="text-[#0071e3]" />
    <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">{title}</h3>
  </div>
);

const parseConversation = (text) => {
  if (!text) return [];
  // Splits the string by "User:" or "AI:" while keeping the markers
  const parts = text.split(/(User:|AI:)/g).filter(p => p.trim() !== "");
  const messages = [];

  for (let i = 0; i < parts.length; i += 2) {
    messages.push({
      sender: parts[i].replace(":", "").trim(),
      text: parts[i + 1]?.trim() || ""
    });
  }
  return messages;
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
    const [isManufacturer,setIsManufacturer] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/tickets/${id}`);
        setTicket(res.data.data);
        const response = await api.get(`/users/me`);
        const user = response.data?.user || response.data;
        setIsManufacturer(user.role === "MANUFACTURER"?true:false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

    const [alertConfig, setAlertConfig] = useState({ isOpen: false });

    const handleTicketDeleteTrigger = () => {
    setAlertConfig({
        isOpen: true,
        type: 'danger',
        title: 'Confirm Deletion',
        message: 'This will permanently remove this record from the fleet database. This action cannot be undone.',
        onConfirm: executeDeletion
    });
    };

    const executeDeletion = async () => {
    try {
        await api.delete(`/tickets/${id}`);
        showToast("Ticket removed from registry", "success");
        navigate('/tickets');
    } catch (err) {
        showToast("Critical: Deletion failed", "error");
    } finally {
        setAlertConfig({ isOpen: false });
    }
    };

  if (loading) return <MainLayout pageTitle="Loading..."><div className="p-10 animate-pulse text-gray-400">Loading details...</div></MainLayout>;
  if (!ticket) return <MainLayout pageTitle="Error"><div className="p-10 text-rose-500">Ticket not found.</div></MainLayout>;

  return (
    <MainLayout pageTitle="Ticket Details">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/tickets')}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <button 
          onClick={() => navigate(`/tickets/edit/${id}`)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-200 bg-white text-gray-600 hover:bg-blue-50 transition-all shadow-sm text-sm font-bold cursor-pointer">
            <Edit3 size={18} /> Edit
          </button>
          {!isManufacturer ? <button 
          onClick={handleTicketDeleteTrigger}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rose-100 bg-white text-rose-500 hover:bg-rose-50 transition-all shadow-sm text-sm font-bold cursor-pointer">
            <Trash2 size={18} /> Delete
          </button> :""}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-10 space-y-10">
        
        {/* Header Section: Error Message */}
        <div className="space-y-4">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${getStatusStyle(ticket.status)}`}>
            {ticket.status?.replace('_', ' ')}
          </span>
          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
            {ticket.error_data?.error_message}
          </h2>
          
          <div className="grid grid-cols-2 gap-8 pt-4">
            <DataField label="Ticket ID" value={`#${ticket.ticket_id}`} highlight />
            <DataField label="IMEI Number" value={ticket.imei_no} highlight />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section: Source & Timeline */}
       {!isManufacturer ?  <section>
          <SectionHeader title="Environment Details" icon={Calendar} />
          <div className="grid grid-cols-3 gap-8">
            <DataField label="Source Website" value={ticket.error_data?.source_website} />
            <DataField label="Reported By" value={ticket.error_data?.reported_by} />
            <DataField label="Reported Time" value={new Date(ticket.error_data?.timestamp).toLocaleString()} />
            <DataField label="Last Updated" value={new Date(ticket.last_updated_time).toLocaleString()} />
          </div>
        </section> : ""}

        <hr className="border-gray-100" />

        {/* Section: Error Analysis */}
        <div className="grid grid-cols-2 gap-12">
          <section className="bg-rose-50/30 p-6 rounded-2xl border border-rose-100/50">
            <SectionHeader title="Mismatched & Missing Fields" icon={AlertCircle} />
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-rose-400 uppercase mb-2">Mismatched Data</p>
                {Object.entries(ticket.error_data?.mismatched_fields || {}).map(([key, val]) => (
                  <div key={key} className="text-sm py-1 font-medium text-gray-700">
                    <span className="capitalize">{key.replace('_', ' ')}:</span> <span className="text-rose-500">{val}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-rose-400 uppercase mb-2">Missing from Record</p>
                <div className="flex flex-wrap gap-2">
                  {ticket.error_data?.missing_fields?.map(field => (
                    <span key={field} className="px-3 py-1 bg-white border border-rose-200 text-rose-600 text-[11px] font-bold rounded-lg uppercase">
                      {field.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100/50">
            <SectionHeader title="Resolution Analysis" icon={CheckCircle2} />
            <div className="space-y-4">
              <DataField label="Root Cause" value={ticket.analysis?.root_cause?.replace('_', ' ')} />
              <div className="p-4 bg-white rounded-xl border border-emerald-100 text-sm text-gray-600 italic">
                "{ticket.analysis?.resolution_steps}"
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase mb-2">Suggested Data</p>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(ticket.analysis?.suggested_data || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-xs py-1 border-b border-emerald-50 last:border-0">
                      <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                      <span className="font-bold text-emerald-600">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          {/* MANUFACTURER RESOLUTION SECTION */}
          {ticket.manufacturer_resolution ? (
            <div className="bg-blue-600 rounded-[32px] p-8 shadow-xl shadow-blue-100 text-white relative overflow-hidden">
              {/* Decorative Icon Background */}
              <Zap className="absolute -right-4 -bottom-4 text-blue-500 opacity-20" size={120} />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 border-b border-blue-400 pb-4">
                  <CheckCircle2 size={18} className="text-blue-200" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">Manufacturer Resolution</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium leading-relaxed bg-black/10 p-5 rounded-2xl border border-white/10">
                    {ticket.manufacturer_resolution}
                  </p>
                  
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-blue-200">
                    <span className="flex items-center gap-1">
                      <User size={12} /> Technical Fix Verified
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe size={12} /> Remote/On-site Update
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-[32px] p-8 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
              <Zap size={24} className="text-gray-300 mb-2" />
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                Manufacturer resolution pending
              </p>
            </div>
          )}
          {/* Ticket Description Section */}
          {/* {ticket.history && (
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[#0071e3]">
                <div className="w-1.5 h-4 bg-[#0071e3] rounded-full" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">General Description</h3>
              </div>
              
              <div className="px-1">
                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                  {ticket.history}
                </p>
              </div>
            </div>
          )} */}
          {/* WhatsApp Style Chat History */}
          {/* Professional Light Theme Chat History */}
          {ticket.history && (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              {/* Clean Header */}
              <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Interaction Log
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {parseConversation(ticket.history).length} Messages
                </span>
              </div>

              {/* Chat Body */}
              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto flex flex-col bg-gray-50/30">
                {parseConversation(ticket.history).map((msg, idx) => {
                  const isUser = msg.sender === "User";
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      {/* Sender Label */}
                      <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1.5 px-1">
                        {msg.sender}
                      </span>

                      {/* Message Bubble */}
                      <div 
                        className={`max-w-[80%] px-5 py-3 rounded-[22px] text-sm shadow-sm transition-all hover:shadow-md ${
                          isUser 
                            ? "bg-[#0071e3] text-white rounded-tr-none" // User: Signature Blue
                            : "bg-white text-gray-700 border border-gray-100 rounded-tl-none" // AI: Clean White
                        }`}
                      >
                        <p className="leading-relaxed font-medium whitespace-pre-wrap">
                          {msg.text}
                        </p>

                        {/* Action Badge */}
                        {msg.text.includes("[ACTION:RAISE_TICKET]") && (
                          <div className={`mt-3 pt-2 border-t flex items-center gap-2 text-[10px] font-bold ${
                            isUser ? "border-white/20 text-blue-100" : "border-gray-100 text-blue-600"
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isUser ? "bg-white" : "bg-blue-600"}`} />
                            SYSTEM ESCALATION TRIGGERED
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

    <AlertModal 
    {...alertConfig} 
    onCancel={() => setAlertConfig({ isOpen: false })} 
    />
    </MainLayout>
  );
};

export default TicketDetail;
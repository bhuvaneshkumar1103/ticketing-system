import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Database, Plus, Trash2, CheckCircle2, Globe, User, X, Zap, Loader2 } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import api from '../api';
import { useToast } from '../context/ToastContext';

const TicketForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = !!id;

  // --- Main Form State ---
  const [formData, setFormData] = useState({
    ticket_id: '',
    imei_no: '',
    status: 'OPEN',
    manufacturer_resolution: '', // New Field
    error_data: {
      source_website: 'RTA_Main_Portal',
      error_message: '',
      reported_by: 'ADMIN',
      mismatched_fields: {},
      missing_fields: []
    },
    analysis: {
      root_cause: '',
      resolution_steps: '',
      suggested_data: {}
    }
  });

  // --- Temporary states for adding new Object Keys ---
  const [newMismatch, setNewMismatch] = useState({ key: '', value: '' });
  const [newSuggestion, setNewSuggestion] = useState({ key: '', value: '' });
  const [isManufacturer,setIsManufacturer] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchTicket = async () => {
        try {
          const res = await api.get(`/tickets/${id}`);
          var user = await api.get(`/users/me`);
          user = user.data.user;
          setIsManufacturer(user.role === "MANUFACTURER"?true:false);
          const data = res.data?.data || res.data;
          setFormData({
            ...data,
             manufacturer_resolution: data.manufacturer_resolution || '',
            error_data: { ...data.error_data, mismatched_fields: data.error_data.mismatched_fields || {}, missing_fields: data.error_data.missing_fields || [] },
            analysis: { ...data.analysis, suggested_data: data.analysis.suggested_data || {} }
          });
        } catch (err) {
          showToast("Failed to load ticket", "error");
        }
      };
      fetchTicket();
    }
  }, [id, isEditMode]);

  // --- Logic Helpers ---
  const updateNested = (path, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      let root = { ...prev };
      let ref = root;
      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = { ...ref[keys[i]] };
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return root;
    });
  };

  const addMismatchedField = () => {
    if (!newMismatch.key) return showToast("Field name required", "error");
    const key = newMismatch.key.toLowerCase().replace(/\s+/g, '_');
    updateNested(`error_data.mismatched_fields.${key}`, newMismatch.value);
    setNewMismatch({ key: '', value: '' });
  };

  const addSuggestedField = () => {
    if (!newSuggestion.key) return showToast("Field name required", "error");
    const key = newSuggestion.key.toLowerCase().replace(/\s+/g, '_');
    updateNested(`analysis.suggested_data.${key}`, newSuggestion.value);
    setNewSuggestion({ key: '', value: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalId = id;
      if (isEditMode) {
        await api.put(`/tickets/${id}`, formData);
        showToast("Ticket updated", "success");
      } else {
        const res = await api.post('/tickets', formData);
        finalId = res.data?._id || res.data?.data?._id;
        showToast("Ticket created", "success");
      }
      navigate(`/tickets/${finalId}`);
    } catch (err) {
      showToast("Save failed", "error");
    }
  };

  return (
    <MainLayout pageTitle={isEditMode ? "Modify Record" : "New Ticket Registration"}>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-10 pb-20">
        
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate(-1)} className="p-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <button type="submit" className="flex items-center gap-2 px-10 py-3.5 rounded-2xl bg-[#0071e3] text-white font-bold shadow-xl shadow-blue-100 hover:scale-[1.02] transition-all">
            <Save size={18} /> {isEditMode ? "Save Changes" : "Register Ticket"}
          </button>
        </div>

        {/* SECTION 1: CORE DATA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
           <div className="md:col-span-3 border-b border-gray-50 pb-4 flex items-center gap-2 text-[#0071e3]">
              <Database size={18} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Identification</h3>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Ticket ID</label>
              <input type="text" value={formData.ticket_id || ''} onChange={(e) => setFormData({...formData, ticket_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">IMEI No</label>
              <input type="text" value={formData.imei_no || ''} onChange={(e) => setFormData({...formData, imei_no: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Status</label>
              <select value={formData.status || 'OPEN'} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none cursor-pointer">
                 <option value="OPEN">Open</option>
                 <option value="CMR_REVIEW">CMR Review</option>
                 <option value="IN_ANALYSIS">In Analysis</option>
                 <option value="MANUFACTURER_ANALYSIS">Manufacturer Analysis</option>
                 <option value="RESOLVED">Resolved</option>
                 <option value="CLOSED">Closed</option>
              </select>
           </div>
        </div>
        {/* SECTION: MANUFACTURER RESOLUTION */}
        <div className="bg-blue-600 p-8 rounded-[32px] shadow-xl shadow-blue-100 text-white space-y-6">
           <div className="flex items-center gap-2 border-b border-blue-400 pb-4">
              <Zap size={18} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Manufacturer Resolution Field</h3>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-200 uppercase ml-1">Action Taken / Resolution Details</label>
              <textarea 
                rows="4" 
                disabled={!isManufacturer}
                value={formData.manufacturer_resolution || ''} 
                onChange={(e) => setFormData({...formData, manufacturer_resolution: e.target.value})} 
                placeholder={isManufacturer ? "Describe the hardware replacement or software fix..." : "Field restricted to Manufacturer roles."}
                className={`w-full px-5 py-4 rounded-2xl text-base font-medium outline-none border-none ${isManufacturer ? 'bg-white/10 text-white placeholder:text-blue-300' : 'bg-black/10 text-blue-100 cursor-not-allowed'}`} 
              />
           </div>
        </div>
        {/* SECTION 2: ERROR DIAGNOSTICS */}
        <div className="bg-rose-50/20 p-8 rounded-[32px] border border-rose-100/50 space-y-8">
           <div className="flex items-center gap-2 text-rose-500 border-b border-rose-100 pb-4">
              <AlertCircle size={18} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Error Diagnostics</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-2">
                 <label className="text-[10px] font-black text-rose-400 uppercase ml-1">Master Error Message</label>
                 <input value={formData.error_data.error_message || ''} onChange={(e) => updateNested('error_data.error_message', e.target.value)} className="w-full px-5 py-4 bg-white border border-rose-100 rounded-2xl text-base font-semibold outline-none focus:ring-4 focus:ring-rose-50" />
              </div>

              {/* Mismatched Fields (Object) */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-rose-400 uppercase ml-1">Mismatched Key-Value Pairs</label>
                 {Object.entries(formData.error_data.mismatched_fields || {}).map(([key, val]) => (
                   <div key={key} className="flex gap-2">
                      <div className="w-1/3 px-4 py-2 bg-rose-100/30 text-[10px] font-bold text-rose-600 rounded-lg flex items-center capitalize truncate">{key.replace(/_/g, ' ')}</div>
                      <input value={val || ''} onChange={(e) => updateNested(`error_data.mismatched_fields.${key}`, e.target.value)} className="w-2/3 px-4 py-2 bg-white border border-rose-100 rounded-lg text-sm outline-none" />
                      <button type="button" onClick={() => {
                        const next = {...formData.error_data.mismatched_fields};
                        delete next[key];
                        updateNested('error_data.mismatched_fields', next);
                      }} className="text-rose-300 hover:text-rose-500"><X size={16}/></button>
                   </div>
                 ))}
                 <div className="flex gap-2 p-2 bg-white rounded-xl border border-dashed border-rose-200">
                    <input placeholder="New Field" value={newMismatch.key} onChange={e => setNewMismatch({...newMismatch, key: e.target.value})} className="w-1/3 text-xs p-2 outline-none" />
                    <input placeholder="Value" value={newMismatch.value} onChange={e => setNewMismatch({...newMismatch, value: e.target.value})} className="w-2/3 text-xs p-2 outline-none border-l border-gray-100" />
                    <button type="button" onClick={addMismatchedField} className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"><Plus size={16}/></button>
                 </div>
              </div>

              {/* Missing Fields (Array) */}
              <div className="space-y-4">
                 <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Missing Fields</label>
                    <button type="button" onClick={() => updateNested('error_data.missing_fields', [...formData.error_data.missing_fields, ""])} className="text-rose-500 hover:bg-rose-100 p-1 rounded-lg transition-colors"><Plus size={16}/></button>
                 </div>
                 {formData.error_data.missing_fields?.map((field, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input value={field || ''} onChange={(e) => {
                        const updated = [...formData.error_data.missing_fields];
                        updated[idx] = e.target.value;
                        updateNested('error_data.missing_fields', updated);
                      }} className="flex-1 px-4 py-2 bg-white border border-rose-100 rounded-lg text-sm outline-none" />
                      <button type="button" onClick={() => updateNested('error_data.missing_fields', formData.error_data.missing_fields.filter((_, i) => i !== idx))} className="text-rose-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* SECTION 3: ANALYSIS & SUGGESTIONS */}
        <div className="bg-emerald-50/20 p-8 rounded-[32px] border border-emerald-100/50 space-y-8">
           <div className="flex items-center gap-2 text-emerald-500 border-b border-emerald-100 pb-4">
              <CheckCircle2 size={18} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Resolution Analysis</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-emerald-600 uppercase ml-1">Technical Root Cause</label>
                 <input value={formData.analysis.root_cause || ''} onChange={(e) => updateNested('analysis.root_cause', e.target.value)} className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl text-sm focus:ring-4 focus:ring-emerald-50 outline-none" />
                 <label className="text-[10px] font-black text-emerald-600 uppercase ml-1 block mt-4">Resolution Steps</label>
                 <textarea rows="5" value={formData.analysis.resolution_steps || ''} onChange={(e) => updateNested('analysis.resolution_steps', e.target.value)} className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-xl text-sm italic outline-none" />
              </div>

              {/* Suggested Data (Object) */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-emerald-600 uppercase ml-1">Suggested Correction Data</label>
                 {Object.entries(formData.analysis.suggested_data || {}).map(([key, val]) => (
                    <div key={key} className="flex flex-col gap-1 mb-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{key.replace(/_/g, ' ')}</span>
                        <button type="button" onClick={() => {
                          const next = {...formData.analysis.suggested_data};
                          delete next[key];
                          updateNested('analysis.suggested_data', next);
                        }} className="text-gray-300 hover:text-rose-400"><X size={12}/></button>
                      </div>
                      <input value={val || ''} onChange={(e) => updateNested(`analysis.suggested_data.${key}`, e.target.value)} className="px-4 py-2 border-b border-gray-100 bg-transparent text-sm focus:border-emerald-400 outline-none transition-all" />
                    </div>
                 ))}
                 <div className="flex gap-2 p-2 bg-white rounded-xl border border-dashed border-emerald-200 mt-4">
                    <input placeholder="Field Name" value={newSuggestion.key} onChange={e => setNewSuggestion({...newSuggestion, key: e.target.value})} className="w-1/2 text-xs p-2 outline-none" />
                    <input placeholder="Suggested Value" value={newSuggestion.value} onChange={e => setNewSuggestion({...newSuggestion, value: e.target.value})} className="w-1/2 text-xs p-2 outline-none" />
                    <button type="button" onClick={addSuggestedField} className="p-2 bg-emerald-500 text-white rounded-lg"><Plus size={16}/></button>
                 </div>
              </div>
           </div>
        </div>
      </form>
    </MainLayout>
  );
};

export default TicketForm;
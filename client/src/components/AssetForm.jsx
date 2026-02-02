import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Cpu, MapPin, Battery, 
  ShieldCheck, Info, Radio, Settings2 
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import api from '../api';
import { useToast } from '../context/ToastContext';

const AssetForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    imei_no: '',
    device_id: '',
    vehicle_no: '',
    latitude: 0,
    longitude: 0,
    accuracy: 0,
    satellites_connected: 0,
    signal_strength_dbm: 0,
    data_upload_interval: 30,
    battery_duration: 100,
    tamper_detection: false,
    sos_button_status: 'NORMAL',
    rto_compilance_status: true,
    is_online: false,
    gps_fixed: false,
    metadata: {
      device_model: '',
      manufacturer: '',
      cluster_manager_id: '',
      installation_date: ''
    }
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchAsset = async () => {
        try {
          const res = await api.get(`/assets/${id}`);
          const data = res.data?.data || res.data;
          // Format date for the input field if it exists
          if (data.metadata?.installation_date) {
            data.metadata.installation_date = new Date(data.metadata.installation_date).toISOString().split('T')[0];
          }
          setFormData(prev => ({ ...prev, ...data }));
        } catch (err) {
          showToast("Failed to fetch asset details", "error");
        }
      };
      fetchAsset();
    }
  }, [id, isEditMode]);

  const updateNestedMetadata = (field, value) => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let targetId = id;
      if (isEditMode) {
        await api.put(`/assets/${id}`, formData);
        showToast("Asset updated successfully", "success");
      } else {
        const res = await api.post('/assets', formData);
        targetId = res.data?._id || res.data?.data?._id;
        showToast("New asset registered", "success");
      }
      navigate(`/assets/${targetId}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed", "error");
    }
  };

  return (
    <MainLayout pageTitle={isEditMode ? "Modify Asset" : "Register New Asset"}>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate(-1)} className="p-3 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-all shadow-sm">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <button type="submit" className="flex items-center gap-2 px-10 py-3.5 rounded-2xl bg-[#0071e3] text-white font-bold shadow-xl shadow-blue-100 hover:scale-[1.02] transition-all active:scale-95">
            <Save size={18} /> {isEditMode ? "Update Asset" : "Register Asset"}
          </button>
        </div>

        {/* Section 1: Core Identification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="md:col-span-3 border-b border-gray-50 pb-4 flex items-center gap-2 text-[#0071e3]">
            <Cpu size={18} />
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Device Identity</h3>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">IMEI Number</label>
            <input required type="text" value={formData.imei_no} onChange={e => setFormData({...formData, imei_no: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" placeholder="860..." />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Device ID</label>
            <input required type="text" value={formData.device_id} onChange={e => setFormData({...formData, device_id: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" placeholder="DEV-99..." />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Vehicle No</label>
            <input type="text" value={formData.vehicle_no} onChange={e => setFormData({...formData, vehicle_no: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" placeholder="KA-01-..." />
          </div>
        </div>

        {/* Section 2: GPS & Signal Technical Data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="md:col-span-4 border-b border-gray-50 pb-4 flex items-center gap-2 text-blue-500">
            <MapPin size={18} />
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">GPS & Signal Sensors</h3>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Latitude</label>
            <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Longitude</label>
            <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Signal (dBm)</label>
            <input type="number" value={formData.signal_strength_dbm} onChange={e => setFormData({...formData, signal_strength_dbm: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Satellites</label>
            <input type="number" value={formData.satellites_connected} onChange={e => setFormData({...formData, satellites_connected: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none" />
          </div>
        </div>

        {/* Section 3: Status & Compliances (Toggles) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-emerald-50/30 p-8 rounded-[32px] border border-emerald-100 space-y-6">
            <div className="flex items-center gap-2 text-emerald-600 border-b border-emerald-100 pb-4">
              <ShieldCheck size={18} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Security & Compliance</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Tamper Detection", key: "tamper_detection" },
                { label: "RTO Compliance", key: "rto_compilance_status" },
                { label: "Online Status", key: "is_online" },
                { label: "GPS Fixed", key: "gps_fixed" }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-emerald-50">
                  <span className="text-[10px] font-black text-gray-500 uppercase">{item.label}</span>
                  <input 
                    type="checkbox" 
                    checked={formData[item.key]} 
                    onChange={e => setFormData({...formData, [item.key]: e.target.checked})}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50/30 p-8 rounded-[32px] border border-blue-100 space-y-6">
            <div className="flex items-center gap-2 text-blue-600 border-b border-blue-100 pb-4">
              <Settings2 size={18} />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">System Config</h3>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">SOS Button Status</label>
                <select value={formData.sos_button_status} onChange={e => setFormData({...formData, sos_button_status: e.target.value})} className="px-4 py-3 bg-white border border-blue-100 rounded-xl text-sm outline-none">
                  <option value="NORMAL">Normal</option>
                  <option value="TRIGGERED">Triggered</option>
                  <option value="FAULTY">Faulty</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Battery Duration (Hrs)</label>
                  <input type="number" value={formData.battery_duration} onChange={e => setFormData({...formData, battery_duration: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-sm outline-none" />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Upload Interval (Sec)</label>
                  <input type="number" value={formData.data_upload_interval} onChange={e => setFormData({...formData, data_upload_interval: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-sm outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Business Metadata */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <div className="border-b border-gray-50 pb-4 flex items-center gap-2 text-gray-400">
            <Info size={18} />
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Business Metadata</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Device Model</label>
              <input type="text" value={formData.metadata.device_model} onChange={e => updateNestedMetadata('device_model', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Manufacturer</label>
              <input type="text" value={formData.metadata.manufacturer} onChange={e => updateNestedMetadata('manufacturer', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Cluster Manager ID</label>
              <input type="text" value={formData.metadata.cluster_manager_id} onChange={e => updateNestedMetadata('cluster_manager_id', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Installation Date</label>
              <input type="date" value={formData.metadata.installation_date} onChange={e => updateNestedMetadata('installation_date', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none" />
            </div>
          </div>
        </div>

      </form>
    </MainLayout>
  );
};

export default AssetForm;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit3, Trash2, Cpu, Map, Signal, 
  Battery, ShieldCheck, Calendar, User, Activity, Zap 
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import api from '../api';
import { useToast } from '../context/ToastContext';
import AlertModal from './AlertModal';


const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await api.get(`/assets/${id}`);
        setAsset(res.data?.data || res.data);
      } catch (err) {
        showToast("Error loading asset details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  const [alertConfig, setAlertConfig] = useState({ isOpen: false });

    const handleDeleteTrigger = () => {
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
        await api.delete(`/assets/${id}`);
        showToast("Asset removed from registry", "success");
        navigate('/assets');
    } catch (err) {
        showToast("Critical: Deletion failed", "error");
    } finally {
        setAlertConfig({ isOpen: false });
    }
    };

//   const handleDelete = async () => {
//     if (window.confirm("Are you sure you want to decommission this asset? This action cannot be undone.")) {
//       try {
//         await api.delete(`/assets/${id}`);
//         showToast("Asset removed from registry", "success");
//         navigate('/assets');
//       } catch (err) {
//         showToast("Delete failed", "error");
//       }
//     }
//   };

  if (loading) return <MainLayout><div className="p-20 text-center animate-pulse text-gray-400 font-black">SYNCHRONIZING...</div></MainLayout>;
  if (!asset) return <MainLayout><div className="p-20 text-center text-rose-500">Asset not found.</div></MainLayout>;

  return (
    <MainLayout pageTitle={`Asset: ${asset.imei_no}`}>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/assets')} className="p-3 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-all shadow-sm">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex gap-4">
            <button onClick={handleDeleteTrigger} className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-rose-100 text-rose-500 font-bold hover:bg-rose-50 transition-all">
              <Trash2 size={18} /> Decommission
            </button>
            <button onClick={() => navigate(`/assets/edit/${id}`)} className="flex items-center gap-2 px-10 py-3 rounded-2xl bg-[#0071e3] text-white font-bold shadow-xl shadow-blue-100 hover:scale-[1.02] transition-all">
              <Edit3 size={18} /> Edit Details
            </button>
          </div>
        </div>

        {/* TOP ROW: Live Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatusCard 
            icon={<Activity size={20} />} 
            label="Connectivity" 
            value={asset.is_online ? "ONLINE" : "OFFLINE"} 
            color={asset.is_online ? "text-emerald-500" : "text-rose-500"}
          />
          <StatusCard 
            icon={<Signal size={20} />} 
            label="Signal Strength" 
            value={`${asset.signal_strength_dbm} dBm`} 
            color="text-blue-600"
          />
          <StatusCard 
            icon={<Battery size={20} />} 
            label="Battery Level" 
            value={`${asset.battery_duration} hrs`} 
            color="text-orange-500"
          />
          <StatusCard 
            icon={<Zap size={20} />} 
            label="GPS Status" 
            value={asset.gps_fixed ? "FIXED" : "SEARCHING"} 
            color={asset.gps_fixed ? "text-emerald-500" : "text-amber-500"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Technical Specs */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-8 text-[#0071e3]">
                <Map size={20} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Live Telemetry</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
                <DataField label="Latitude" value={asset.latitude} />
                <DataField label="Longitude" value={asset.longitude} />
                <DataField label="Accuracy" value={`${asset.accuracy}m`} />
                <DataField label="Satellites" value={asset.satellites_connected} />
                <DataField label="Update Interval" value={`${asset.data_upload_interval}s`} />
                <DataField label="Vehicle No" value={asset.vehicle_no || "N/A"} />
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-8 text-emerald-600">
                <ShieldCheck size={20} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Compliance & Safety</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BooleanBadge label="Tamper Detection" active={asset.tamper_detection} />
                <BooleanBadge label="RTO Compliance" active={asset.rto_compilance_status} />
                <div className="p-4 rounded-2xl bg-gray-50">
                   <p className="text-[9px] font-black text-gray-400 uppercase mb-1">SOS Button</p>
                   <p className={`text-sm font-bold ${asset.sos_button_status === 'NORMAL' ? 'text-gray-700' : 'text-rose-500'}`}>{asset.sos_button_status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Metadata & Business info */}
          <div className="space-y-8">
            <div className="bg-gray-900 p-8 rounded-[32px] text-white shadow-xl">
              <div className="flex items-center gap-2 mb-8 text-blue-400">
                <Cpu size={20} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Device Identity</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase">IMEI Number</p>
                  <p className="text-lg font-mono font-bold tracking-tighter">{asset.imei_no}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase">System ID</p>
                  <p className="text-sm font-medium text-gray-300">{asset.device_id}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <User size={20} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Metadata</h3>
              </div>
              <DataField label="Model" value={asset.metadata?.device_model} />
              <DataField label="Manufacturer" value={asset.metadata?.manufacturer} />
              <DataField label="Cluster Manager" value={asset.metadata?.cluster_manager_id} />
              <div className="pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold uppercase">Installed On</span>
                </div>
                <p className="text-sm font-bold text-gray-700">
                  {asset.metadata?.installation_date ? new Date(asset.metadata.installation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "Not Set"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <AlertModal 
        {...alertConfig} 
        onCancel={() => setAlertConfig({ isOpen: false })} 
        />
    </MainLayout>
  );
};

// --- Sub-Components for Cleanliness ---

const StatusCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-gray-50 ${color}`}>{icon}</div>
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className={`text-sm font-black ${color}`}>{value}</p>
    </div>
  </div>
);

const DataField = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-gray-800">{value || "—"}</p>
  </div>
);

const BooleanBadge = ({ label, active }) => (
  <div className={`p-4 rounded-2xl border ${active ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">{label}</p>
    <p className={`text-xs font-black ${active ? 'text-emerald-600' : 'text-rose-600'}`}>
      {active ? "COMPLIANT" : "NON-COMPLIANT"}
    </p>
  </div>
);

export default AssetDetail;
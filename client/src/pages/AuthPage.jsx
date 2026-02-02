import React, { useState } from 'react';
import { ChevronRight, Cpu, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Your customized axios instance
import { useToast } from '../context/ToastContext';

/**
 * MaterialInput Component
 * Defined outside to prevent focus loss on re-renders.
 */
const MaterialInput = ({ label, name, type = "text", value, onChange, placeholder = " " }) => (
  <div className="relative w-full group">
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="block w-full px-4 pt-6 pb-2 text-[17px] text-[#1d1d1f] bg-transparent border border-[#d2d2d7] rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-[#0071e3] peer transition-all"
    />
    <label className="absolute text-[16px] text-[#86868b] duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#0071e3]">
      {label}
    </label>
  </div>
);

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    email: '',
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? '/users/login' : '/users/register';

    try {
      const response = await api.post(endpoint, formData);
      
      // 1. Save Token
      localStorage.setItem('token', response.data.token);
      
      // 2. Success Feedback
      showToast(isLogin ? "Welcome back!" : "Account created successfully!", "success");
      
      // 3. Auto-Redirect to Tickets
      // Using window.location.href ensures App.jsx re-evaluates the auth state
      window.location.href = '/tickets';
      
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Check your connection.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] flex flex-col items-center justify-center p-6 antialiased">
      <form onSubmit={handleSubmit} className="w-full max-w-[440px] space-y-8">
        
        {/* Apple Brand Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex w-14 h-14 bg-black rounded-2xl items-center justify-center shadow-lg mb-2">
            <Cpu className="text-white w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-[32px] font-semibold tracking-tight text-slate-900">
              {isLogin ? 'Sign in' : 'Create Account'}
            </h1>
            <p className="text-[#86868b] text-[17px]">Use your IoT credentials to continue.</p>
          </div>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <>
              <MaterialInput 
                label="Full Name" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
              />
              
              <div className="relative w-full group">
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 pt-6 pb-2 text-[17px] text-[#1d1d1f] bg-transparent border border-[#d2d2d7] rounded-xl appearance-none focus:outline-none focus:ring-0 focus:border-[#0071e3] peer transition-all cursor-pointer"
                >
                  <option value="" disabled hidden></option>
                  <option value="cmr">CMR (Field Rep)</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="admin">Administrator</option>
                </select>
                <label className={`absolute text-[16px] text-[#86868b] duration-200 transform top-4 z-10 origin-[0] left-4 pointer-events-none transition-all ${formData.role ? 'scale-75 -translate-y-3 text-[#0071e3]' : ''} peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[#0071e3]`}>
                  Select System Role
                </label>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 mt-1 text-[#86868b] pointer-events-none" size={18} />
              </div>

              <MaterialInput 
                label="Email Address" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
              />
            </>
          )}

          <MaterialInput 
            label="Username" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
          />
          <MaterialInput 
            label="Password" 
            name="password" 
            type="password" 
            value={formData.password} 
            onChange={handleChange} 
          />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0071e3] hover:bg-[#0077ed] disabled:bg-blue-300 text-white py-4 mt-4 rounded-full text-[17px] font-medium transition-all flex items-center justify-center gap-1 shadow-md active:scale-[0.98] group"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Continue')}
            {!loading && <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </div>

        {/* Switcher */}
        <div className="text-center pt-6">
          <p className="text-[15px] text-[#6e6e73]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-[#06c] hover:underline font-medium focus:outline-none"
            >
              {isLogin ? 'Create Account' : 'Sign in'}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default AuthPage;
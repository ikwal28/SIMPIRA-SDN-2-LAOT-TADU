import React, { useState, useEffect } from 'react';
import { 
  Info, 
  User, 
  Code, 
  Heart, 
  ShieldCheck, 
  Activity, 
  Calendar, 
  Cpu, 
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { APP_VERSION, LAST_UPDATE, DEVELOPER_NAME, DEVELOPER_TITLE, SCHOOL_NAME } from '../constants';
import { api } from '../api';

export const About: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // We use a simple call that is likely to succeed if connected
        // getDashboard might be too heavy or require auth, but we can try a simple one
        // or just rely on the fact that the app is running.
        // Let's try to fetch something light or just assume if we can reach the script
        const res = await api.getSiswa().catch(() => null);
        if (res) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
        }
      } catch (error) {
        setConnectionStatus('error');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-8 px-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 text-center">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-cyan-400 to-teal-400" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary animate-pulse shrink-0">
            <Info size={40} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-1 tracking-tight">
              SIMPIRA <span className="text-primary">MENABUNG</span>
            </h2>
            <p className="text-slate-400 font-semibold text-base mb-4">
              Simpanan Pintar Rajin Menabung
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                <Cpu size={14} className="text-primary" />
                <span className="text-[10px] font-bold text-slate-600 uppercase">v{APP_VERSION}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                <Calendar size={14} className="text-cyan-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase">{LAST_UPDATE}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                connectionStatus === 'connected' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                connectionStatus === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                'bg-slate-50 border-slate-100 text-slate-400'
              }`}>
                {connectionStatus === 'connected' ? <CheckCircle2 size={14} /> : 
                 connectionStatus === 'error' ? <XCircle size={14} /> : 
                 <RefreshCw size={14} className="animate-spin" />}
                <span className="text-[10px] font-bold uppercase">
                  {connectionStatus === 'connected' ? 'Terhubung' : 
                   connectionStatus === 'error' ? 'Terputus' : 
                   'Mengecek...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* About App */}
        <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
              <Code size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm">Tentang Aplikasi</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Platform Digital</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            SIMPIRA adalah platform digital pengelolaan tabungan sekolah yang dirancang khusus untuk <span className="text-slate-800 font-bold">{SCHOOL_NAME}</span>.
          </p>
        </div>

        {/* Developer */}
        <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm">Pengembang</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Software Engineering</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-primary">{DEVELOPER_NAME}</p>
            <div className="flex items-center gap-2 text-slate-500">
              <Activity size={12} className="text-teal-400" />
              <p className="text-[10px] font-bold">{DEVELOPER_TITLE}</p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm">Keamanan Data</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Cloud Infrastructure</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Data dikelola menggunakan <span className="text-slate-800 font-bold">Google Cloud Platform</span> dengan enkripsi SSL/TLS.
          </p>
        </div>

        {/* Vision */}
        <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
              <Heart size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm">Visi & Misi</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Future Goals</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Membangun budaya gemar menabung sejak dini melalui teknologi yang <span className="text-pink-500 font-bold">modern dan terpercaya</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

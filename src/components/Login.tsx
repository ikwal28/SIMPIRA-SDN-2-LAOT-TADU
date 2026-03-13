import React, { useState } from 'react';
import { LogIn, Shield, User, Lock, Loader2, Download } from 'lucide-react';
import { cn } from '../utils';
import Swal from 'sweetalert2';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile, isStandalone, isInstalled, installPWA } = usePWAInstall();

  const handleInstallClick = async () => {
    const result = await installPWA();
    
    if (result === 'already_installed' || isInstalled) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Aplikasi SIMPIRA sudah terinstal di perangkat Anda',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } else if (result === 'ios_manual') {
      Swal.fire({
        title: 'Install di iOS',
        html: 'Ketuk ikon <b>Bagikan</b> di bawah, lalu pilih <b>Tambah ke Layar Utama</b>.',
        icon: 'info',
        confirmButtonText: 'Mengerti',
        confirmButtonColor: '#10b981'
      });
    } else if (result === 'not_supported') {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Browser tidak mendukung instalasi otomatis',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onLogin(username, password);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-teal-100/60 via-orange-50/50 to-cyan-100/60 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary/15 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl shadow-primary/10 mb-6 animate-in zoom-in duration-500">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Shield size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">SIMPIRA MENABUNG</h1>
          <p className="text-slate-400 font-medium">SD Negeri 2 Laot Tadu</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-white animate-in slide-in-from-bottom-8 duration-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username / No Rekening</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="text" 
                  required
                  autoComplete="username"
                  placeholder="Masukkan username anda"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="password" 
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan password anda"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:bg-teal-600 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <LogIn size={24} />
                  Masuk Sekarang
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Lupa password? Hubungi Admin Sekolah
            </p>
          </div>

          {/* PWA Install Button for Mobile */}
          {isMobile && !isStandalone && (
            <div className="mt-6 pt-6 border-t border-slate-50">
              <button
                onClick={handleInstallClick}
                type="button"
                className="w-full py-3.5 bg-teal-50 text-teal-600 border border-teal-200 rounded-2xl font-bold shadow-sm hover:bg-teal-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Install Aplikasi SIMPIRA
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            © 2026 SDN 2 LAOT TADU - IKWAL PRESETIAWAN,S.T
          </p>
        </div>
      </div>
    </div>
  );
};

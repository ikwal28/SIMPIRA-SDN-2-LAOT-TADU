import React from 'react';
import { Info, User, Code, Heart, ShieldCheck } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 md:pb-0">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
          <Info size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">SIMPIRA MENABUNG</h2>
        <p className="text-slate-400 font-medium mb-6">Simpanan Pintar Rajin Menabung</p>
        <div className="h-1 w-20 bg-primary/20 mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500">
              <Code size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Tentang Aplikasi</h3>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            SIMPIRA adalah platform digital pengelolaan tabungan sekolah yang dirancang khusus untuk SDN 2 Laot Tadu. 
            Aplikasi ini bertujuan untuk meningkatkan transparansi, akurasi, dan kemudahan dalam menabung bagi siswa dan GTK.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <User size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Pengembang</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-700">IKWAL PRESETIAWAN, S.T</p>
            <p className="text-xs text-slate-400">Senior Fullstack Developer & System Architect</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Keamanan Data</h3>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Data tersimpan aman menggunakan infrastruktur Google Cloud dengan sistem enkripsi standar industri untuk memastikan privasi tabungan setiap anggota.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500">
              <Heart size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Visi & Misi</h3>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Membangun budaya gemar menabung sejak dini dan menciptakan ekosistem keuangan sekolah yang modern dan terpercaya.
          </p>
        </div>
      </div>

      <footer className="text-center py-8">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          © 2026 SDN 2 LAOT TADU - IKWAL PRESETIAWAN,S.T
        </p>
      </footer>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserRound, 
  ArrowLeftRight, 
  History, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Info
} from 'lucide-react';
import { User, Role } from '../types';
import { cn } from '../utils';

interface SidebarProps {
  role: Role;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: User;
}

export const Layout: React.FC<{ children: React.ReactNode; sidebarProps: SidebarProps }> = ({ children, sidebarProps }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { role, activeTab, setActiveTab, onLogout, user } = sidebarProps;

  const menuGroups = [
    {
      title: 'Utama',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPERADMIN', 'ADMINSISWA', 'ADMINGTK', 'SISWA', 'GTK'] },
        { id: 'siswa', label: 'Data Siswa', icon: Users, roles: ['SUPERADMIN', 'ADMINSISWA'] },
        { id: 'gtk', label: 'Data GTK', icon: UserRound, roles: ['SUPERADMIN', 'ADMINGTK'] },
      ]
    },
    {
      title: 'Transaksi',
      items: [
        { id: 'transaksi_siswa', label: 'Tabungan Siswa', icon: ArrowLeftRight, roles: ['SUPERADMIN', 'ADMINSISWA'] },
        { id: 'transaksi_gtk', label: 'Tabungan GTK', icon: ArrowLeftRight, roles: ['SUPERADMIN', 'ADMINGTK'] },
      ]
    },
    {
      title: 'Laporan & Riwayat',
      items: [
        { id: 'riwayat_siswa', label: 'Riwayat Siswa', icon: History, roles: ['SUPERADMIN', 'ADMINSISWA'] },
        { id: 'riwayat_gtk', label: 'Riwayat GTK', icon: History, roles: ['SUPERADMIN', 'ADMINGTK'] },
        { id: 'koran_siswa', label: 'Cetak Rekening Siswa', icon: FileText, roles: ['SUPERADMIN', 'ADMINSISWA'] },
        { id: 'koran_gtk', label: 'Cetak Rekening GTK', icon: FileText, roles: ['SUPERADMIN', 'ADMINGTK'] },
        { id: 'manual_form', label: 'Form Manual Tabungan', icon: FileText, roles: ['SUPERADMIN', 'ADMINSISWA', 'ADMINGTK'] },
      ]
    },
    {
      title: 'Sistem',
      items: [
        { id: 'pengaturan', label: 'Pengaturan', icon: Settings, roles: ['SUPERADMIN', 'ADMINSISWA', 'ADMINGTK'] },
        { id: 'about', label: 'About', icon: Info, roles: ['SUPERADMIN', 'ADMINSISWA', 'ADMINGTK', 'SISWA', 'GTK'] },
      ]
    }
  ];

  const allMenuItems = menuGroups.flatMap(g => g.items);
  const filteredMenu = allMenuItems.filter(item => item.roles.includes(role));

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex-none flex items-center justify-between p-4 bg-primary text-white z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30 shadow-inner">
            <span className="text-white font-bold text-lg">
              {(user.nama || (user as any).Nama || 'U').charAt(0)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider">Selamat Datang,</span>
            <span className="font-bold text-sm truncate max-w-[160px]">
              {user.nama || (user as any).Nama || 'User'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-tight">SIMPIRA</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Menabung</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
            {menuGroups.map((group, gIdx) => {
              const filteredItems = group.items.filter(item => item.roles.includes(role));
              if (filteredItems.length === 0) return null;

              return (
                <div key={gIdx} className="space-y-1">
                  <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {group.title}
                  </h3>
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        activeTab === item.id 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                      )}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          
          <div className="p-4 border-t border-slate-100 md:hidden">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={18} />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="hidden md:flex flex-none items-center justify-between px-8 py-3 bg-white border-b border-slate-100">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {activeTab.replace('_', ' ')}
            </h2>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="text-xs text-slate-400 font-medium">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 leading-none">{user.nama || (user as any).Nama || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">{role}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold border border-primary/10">
                {(user.nama || (user as any).Nama || 'U').charAt(0)}
              </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-100" />
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
            >
              <LogOut size={18} />
              Keluar
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden flex-none bg-white border-t border-slate-100 px-2 py-2 flex justify-around items-center z-50">
          {(() => {
            const items = filteredMenu.filter(m => m.id !== 'about').slice(0, 4);
            const about = allMenuItems.find(m => m.id === 'about');
            const finalItems = about ? [...items, about] : items;
            
            return finalItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                  activeTab === item.id ? "text-primary" : "text-slate-400"
                )}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-bold">{item.label.split(' ')[0]}</span>
              </button>
            ));
          })()}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

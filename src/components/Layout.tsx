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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPERADMIN', 'ADMINSISWA', 'ADMINGTK', 'SISWA', 'GTK'] },
    { id: 'siswa', label: 'Data Siswa', icon: Users, roles: ['SUPERADMIN', 'ADMINSISWA'] },
    { id: 'transaksi_siswa', label: 'Transaksi Siswa', icon: ArrowLeftRight, roles: ['SUPERADMIN', 'ADMINSISWA'] },
    { id: 'gtk', label: 'Data GTK', icon: UserRound, roles: ['SUPERADMIN', 'ADMINGTK'] },
    { id: 'transaksi_gtk', label: 'Transaksi GTK', icon: ArrowLeftRight, roles: ['SUPERADMIN', 'ADMINGTK'] },
    { id: 'riwayat_siswa', label: 'Riwayat Siswa', icon: History, roles: ['SUPERADMIN', 'ADMINSISWA'] },
    { id: 'riwayat_gtk', label: 'Riwayat GTK', icon: History, roles: ['SUPERADMIN', 'ADMINGTK'] },
    { id: 'koran_siswa', label: 'Cetak Rekening Siswa', icon: FileText, roles: ['SUPERADMIN', 'ADMINSISWA'] },
    { id: 'koran_gtk', label: 'Cetak Rekening GTK', icon: FileText, roles: ['SUPERADMIN', 'ADMINGTK'] },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings, roles: ['SUPERADMIN', 'ADMINSISWA', 'ADMINGTK'] },
    { id: 'about', label: 'About', icon: Info, roles: ['SUPERADMIN', 'ADMINSISWA', 'ADMINGTK', 'SISWA', 'GTK'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-primary text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-xl">S</span>
          </div>
          <span className="font-bold tracking-tight">SIMPIRA</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
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

          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="hidden md:flex items-center justify-between px-8 py-3 bg-white border-b border-slate-100">
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
                <p className="text-sm font-bold text-slate-800 leading-none">{user.nama}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1">{role}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold border border-primary/10">
                {user.nama.charAt(0)}
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
        <div className="md:hidden bg-white border-t border-slate-100 px-2 py-2 flex justify-around items-center sticky bottom-0 z-50">
          {filteredMenu.slice(0, 4).map((item) => (
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
          ))}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center gap-1 p-2 text-slate-400"
          >
            <Menu size={20} />
            <span className="text-[10px] font-bold">Menu</span>
          </button>
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

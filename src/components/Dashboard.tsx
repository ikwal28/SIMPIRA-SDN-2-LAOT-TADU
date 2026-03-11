import React from 'react';
import { 
  TrendingUp, 
  Users, 
  UserCheck, 
  Wallet,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { DashboardStats, User } from '../types';
import { formatCurrency, cn } from '../utils';

interface DashboardProps {
  stats: DashboardStats;
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, user }) => {
  const isUser = user.role === 'SISWA' || user.role === 'GTK';
  const isAdminSiswa = user.role === 'ADMINSISWA';
  const isAdminGTK = user.role === 'ADMINGTK';
  const isSuperAdmin = user.role === 'SUPERADMIN';

  const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444'];

  // Defensive checks for stats
  const safeStats = {
    totalTabunganSiswa: stats?.totalTabunganSiswa || 0,
    totalTabunganGTK: stats?.totalTabunganGTK || 0,
    jumlahSiswa: stats?.jumlahSiswa || 0,
    jumlahGTK: stats?.jumlahGTK || 0,
    chartData: Array.isArray(stats?.chartData) ? stats.chartData : []
  };

  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Selamat Datang, {user.nama}!</h1>
          <p className="text-white/80 text-sm md:text-base max-w-md">
            {isUser 
              ? 'Kelola tabunganmu dengan bijak untuk masa depan yang lebih cerah.' 
              : 'Pantau dan kelola data tabungan sekolah dengan mudah dan transparan.'}
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-secondary/20 rounded-full blur-2xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!isUser ? (
          <>
            {(isSuperAdmin || isAdminSiswa) && (
              <StatCard 
                title="Total Tabungan Siswa" 
                value={formatCurrency(safeStats.totalTabunganSiswa)} 
                icon={Wallet} 
                color="bg-emerald-50 text-emerald-600"
              />
            )}
            {(isSuperAdmin || isAdminGTK) && (
              <StatCard 
                title="Total Tabungan GTK" 
                value={formatCurrency(safeStats.totalTabunganGTK)} 
                icon={TrendingUp} 
                color="bg-sky-50 text-sky-600"
              />
            )}
            {(isSuperAdmin || isAdminSiswa) && (
              <StatCard 
                title="Jumlah Siswa" 
                value={safeStats.jumlahSiswa.toString()} 
                icon={Users} 
                color="bg-amber-50 text-amber-600"
              />
            )}
            {(isSuperAdmin || isAdminGTK) && (
              <StatCard 
                title="Jumlah GTK" 
                value={safeStats.jumlahGTK.toString()} 
                icon={UserCheck} 
                color="bg-indigo-50 text-indigo-600"
              />
            )}
          </>
        ) : (
          <>
            <div className="col-span-1 sm:col-span-2 lg:col-span-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Wallet size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Saldo Anda</p>
                    <h2 className="text-3xl font-bold text-slate-800">{formatCurrency(user.saldo || 0)}</h2>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="flex-1 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                      <ArrowUpRight size={16} />
                      <span className="text-xs font-bold uppercase">No Rekening</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800">{user.noRekening}</p>
                  </div>
                  <div className="flex-1 bg-sky-50 p-4 rounded-2xl border border-sky-100">
                    <div className="flex items-center gap-2 text-sky-600 mb-1">
                      <UserCheck size={16} />
                      <span className="text-xs font-bold uppercase">Status</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800">{user.status || 'AKTIF'}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", color)}>
      <Icon size={24} />
    </div>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-xl font-bold text-slate-800">{value}</h3>
  </div>
);

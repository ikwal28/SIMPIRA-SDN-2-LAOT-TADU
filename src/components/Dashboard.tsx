import React from 'react';
import { 
  TrendingUp, 
  Users, 
  UserCheck, 
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  AlertCircle
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
import { DashboardStats, User, Transaction } from '../types';
import { formatCurrency, cn } from '../utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface DashboardProps {
  stats: DashboardStats;
  user: User;
  transactions?: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, user, transactions = [] }) => {
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

  const safeFormatDate = (dateVal: any) => {
    try {
      if (!dateVal) return '-';
      return format(new Date(dateVal), 'dd MMM yyyy HH:mm', { locale: id });
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="space-y-4">
      {/* Welcome Section - Hidden for SISWA */}
      {user.role !== 'SISWA' && (
        <div className="bg-gradient-to-br from-primary to-teal-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Selamat Datang, {user.nama || (user as any).Nama || 'User'}!</h1>
            <p className="text-white/80 text-sm md:text-base max-w-md">
              {isUser 
                ? 'Kelola tabunganmu dengan bijak untuk masa depan yang lebih cerah.' 
                : 'Pantau dan kelola data tabungan sekolah dengan mudah dan transparan.'}
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -top-10 w-48 h-48 bg-secondary/20 rounded-full blur-2xl" />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!isUser ? (
          <>
            {(isSuperAdmin || isAdminSiswa) && (
              <StatCard 
                title="Total Tabungan Siswa" 
                value={formatCurrency(safeStats.totalTabunganSiswa)} 
                icon={Wallet} 
                color="bg-teal-50 text-teal-600"
              />
            )}
            {(isSuperAdmin || isAdminGTK) && (
              <StatCard 
                title="Total Tabungan GTK" 
                value={formatCurrency(safeStats.totalTabunganGTK)} 
                icon={TrendingUp} 
                color="bg-cyan-50 text-cyan-600"
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
                color="bg-orange-50 text-orange-600"
              />
            )}
          </>
        ) : (
          <>
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 space-y-4">
              {user.role === 'SISWA' && (
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl lg:rounded-3xl p-[2px] lg:p-1 shadow-lg shadow-orange-500/20">
                  <div className="bg-white/95 backdrop-blur-sm rounded-[14px] lg:rounded-[22px] p-4 lg:p-6 flex items-start lg:items-center gap-3 lg:gap-6">
                    <div className="bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600 p-3 lg:p-4 rounded-xl lg:rounded-2xl shrink-0 shadow-inner mt-0.5 lg:mt-0">
                      <AlertCircle className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-orange-600 font-extrabold text-sm lg:text-base uppercase tracking-widest mb-1 lg:mb-1.5">Pemberitahuan Penting</h3>
                      <p className="text-slate-700 text-sm lg:text-base font-semibold leading-relaxed">
                        UNTUK PENARIKAN SALDO DILAKUKAN SAAT SISWA TELAH MENYELESAIKAN PENDIDIKAN DI <span className="font-extrabold text-orange-600 bg-orange-50 px-1.5 py-0.5 lg:px-2 lg:py-0.5 rounded lg:rounded-md border border-orange-100 ml-1">SD NEGERI 2 LAOT TADU</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Wallet size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Saldo Anda</p>
                    <h2 className="text-3xl font-bold text-slate-800">{formatCurrency(Number(user.saldo || (user as any).Saldo || 0))}</h2>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <div className="flex-1 bg-teal-50 p-4 rounded-2xl border border-teal-100">
                    <div className="flex items-center gap-2 text-teal-600 mb-1">
                      <ArrowUpRight size={16} />
                      <span className="text-xs font-bold uppercase">No Rekening</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800">{user.noRekening || (user as any)['No Rekening']}</p>
                  </div>
                  <div className="flex-1 bg-cyan-50 p-4 rounded-2xl border border-cyan-100">
                    <div className="flex items-center gap-2 text-cyan-600 mb-1">
                      <UserCheck size={16} />
                      <span className="text-xs font-bold uppercase">Status</span>
                    </div>
                    <p className="text-lg font-bold text-slate-800">{user.status || (user as any).Status || 'AKTIF'}</p>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <History className="text-primary" size={24} />
                  <h3 className="text-lg font-bold text-slate-800">Riwayat Transaksi Terakhir</h3>
                </div>
                
                <div className="space-y-4">
                  {transactions.length > 0 ? (
                    transactions.slice(0, 10).map((trx, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            (trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? "bg-teal-100 text-teal-600" : "bg-red-100 text-red-600"
                          )}>
                            {(trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {(trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? 'Setoran Tunai' : 'Penarikan Tunai'}
                            </p>
                            <p className="text-xs text-slate-400">{safeFormatDate(trx?.tanggal || (trx as any)?.Tanggal)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "font-bold",
                            (trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? "text-teal-600" : "text-red-600"
                          )}>
                            {(trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? '+' : '-'} {formatCurrency(Number(trx?.nominal || (trx as any)?.Nominal || 0))}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Petugas: {trx?.namaAdmin || (trx as any)?.NamaAdmin}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <History size={48} className="mx-auto mb-4 opacity-20" />
                      <p>Belum ada transaksi</p>
                    </div>
                  )}
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

import React from 'react';
import { 
  TrendingUp, 
  Users, 
  UserCheck, 
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  AlertCircle,
  Calendar,
  Activity,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { DashboardStats, User, Transaction } from '../types';
import { formatCurrency, cn } from '../utils';
import { format, isSameDay, isSameMonth, parseISO } from 'date-fns';
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

  const now = new Date();

  const dailyIncoming = transactions
    .filter(t => {
      const isSetor = t.jenis === 'SETOR' || (t as any).Jenis === 'SETOR';
      const tDate = t.tanggal || (t as any).Tanggal;
      if (!isSetor || !tDate) return false;
      try {
        return isSameDay(new Date(tDate), now);
      } catch (e) {
        return false;
      }
    })
    .reduce((sum, t) => sum + (t.nominal || (t as any).Nominal || 0), 0);

  const monthlyIncoming = transactions
    .filter(t => {
      const isSetor = t.jenis === 'SETOR' || (t as any).Jenis === 'SETOR';
      const tDate = t.tanggal || (t as any).Tanggal;
      if (!isSetor || !tDate) return false;
      try {
        return isSameMonth(new Date(tDate), now);
      } catch (e) {
        return false;
      }
    })
    .reduce((sum, t) => sum + (t.nominal || (t as any).Nominal || 0), 0);

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
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Dashboard Ringkasan</h2>
          <p className="text-[11px] text-slate-500 font-medium">Selamat datang kembali, <span className="text-primary font-bold">{user.nama || (user as any).Nama || 'User'}</span></p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
          <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg flex items-center gap-2">
            <Calendar size={14} />
            <span className="text-[10px] font-bold">{format(new Date(), 'dd MMMM yyyy', { locale: id })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!isUser ? (
          <>
            {(isSuperAdmin || isAdminSiswa) && (
              <StatCard 
                title="Total Tabungan Siswa" 
                value={formatCurrency(safeStats.totalTabunganSiswa)} 
                icon={<Wallet size={18} />} 
                color="bg-teal-50 text-teal-600"
                trend="+2.4%"
              />
            )}
            {(isSuperAdmin || isAdminGTK) && (
              <StatCard 
                title="Total Tabungan GTK" 
                value={formatCurrency(safeStats.totalTabunganGTK)} 
                icon={<TrendingUp size={18} />} 
                color="bg-cyan-50 text-cyan-600"
                trend="+1.8%"
              />
            )}
            {(isSuperAdmin || isAdminSiswa) && (
              <StatCard 
                title="Jumlah Siswa" 
                value={safeStats.jumlahSiswa.toString()} 
                icon={<Users size={18} />} 
                color="bg-amber-50 text-amber-600"
                trend="Aktif"
              />
            )}
            {(isSuperAdmin || isAdminGTK) && (
              <StatCard 
                title="Jumlah GTK" 
                value={safeStats.jumlahGTK.toString()} 
                icon={<UserCheck size={18} />} 
                color="bg-orange-50 text-orange-600"
                trend="Aktif"
              />
            )}
            {(isSuperAdmin || isAdminSiswa) && (
              <>
                <StatCard 
                  title="Setoran Hari Ini" 
                  value={formatCurrency(dailyIncoming)} 
                  icon={<ArrowDownLeft size={18} />} 
                  color="bg-emerald-50 text-emerald-600"
                  trend="Harian"
                />
                <StatCard 
                  title="Setoran Bulan Ini" 
                  value={formatCurrency(monthlyIncoming)} 
                  icon={<Activity size={18} />} 
                  color="bg-indigo-50 text-indigo-600"
                  trend="Bulanan"
                />
              </>
            )}
          </>
        ) : (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 space-y-4">
            {user.role === 'SISWA' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-amber-500 text-white p-2 rounded-lg shrink-0">
                  <AlertCircle size={16} />
                </div>
                <p className="text-[10px] lg:text-xs text-amber-800 font-bold leading-tight">
                  PEMBERITAHUAN: PENARIKAN SALDO DILAKUKAN SAAT SISWA TELAH MENYELESAIKAN PENDIDIKAN DI <span className="underline">SD NEGERI 2 LAOT TADU</span>
                </p>
              </div>
            )}
            
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo Anda</p>
                  <h2 className="text-xl font-black text-slate-800">{formatCurrency(Number(user.saldo || (user as any).Saldo || 0))}</h2>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="flex-1 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">No Rekening</p>
                  <p className="text-xs font-black text-slate-800 font-mono">{user.noRekening || (user as any)['No Rekening']}</p>
                </div>
                <div className="flex-1 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Status</p>
                  <p className="text-xs font-black text-primary">{user.status || (user as any).Status || 'AKTIF'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {!isUser ? (
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" />
                Statistik Tabungan
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Siswa</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">GTK</span>
                </div>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={safeStats.chartData}>
                  <defs>
                    <linearGradient id="colorSiswa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGTK" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891B2" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0891B2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 600}}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 600}}
                    tickFormatter={(value) => `Rp ${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontSize: '11px', fontWeight: 'bold'}}
                  />
                  <Area type="monotone" dataKey="siswa" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#colorSiswa)" />
                  <Area type="monotone" dataKey="gtk" stroke="#0891B2" strokeWidth={2} fillOpacity={1} fill="url(#colorGTK)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}

        <div className={cn(
          "bg-white rounded-2xl p-5 border border-slate-100 shadow-sm",
          isUser ? "lg:col-span-3" : "lg:col-span-1"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <History size={16} className="text-primary" />
              {isUser ? 'Riwayat Transaksi' : 'Aktivitas Terakhir'}
            </h3>
            {isUser && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {transactions.length} Transaksi
              </span>
            )}
          </div>
          
          <div className={cn(
            "space-y-3 overflow-y-auto pr-1 custom-scrollbar",
            isUser ? "max-h-[400px]" : "max-h-[200px]"
          )}>
            {transactions.length > 0 ? (
              transactions.slice(0, isUser ? 20 : 10).map((trx, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      (trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                    )}>
                      {(trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">
                        {(trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? 'Setoran' : 'Penarikan'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold">{safeFormatDate(trx?.tanggal || (trx as any)?.Tanggal)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-xs font-black",
                      (trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {(trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? '+' : '-'} {formatCurrency(Number(trx?.nominal || (trx as any)?.Nominal || 0)).replace('Rp ', '')}
                    </p>
                    {!isUser && (
                      <p className="text-[8px] text-slate-400 font-bold uppercase truncate max-w-[80px]">
                        {trx?.nama || (trx as any)?.Nama}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-300">
                <Activity size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-[10px] font-medium">Belum ada transaksi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex items-center justify-between mb-3">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", color)}>
        {icon}
      </div>
      <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
        {trend}
      </span>
    </div>
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
      <h4 className="text-base font-black text-slate-800 tracking-tight">{value}</h4>
    </div>
  </div>
);

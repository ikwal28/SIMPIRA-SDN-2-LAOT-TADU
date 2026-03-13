import React, { useState, useEffect } from 'react';
import { Search, ArrowUpRight, ArrowDownLeft, Wallet, User, Calendar } from 'lucide-react';
import { User as UserType, Transaction } from '../types';
import { formatCurrency, cn } from '../utils';
import Swal from 'sweetalert2';

interface TransactionManagerProps {
  type: 'SISWA' | 'GTK';
  users: UserType[];
  adminName: string;
  onTransaction: (type: 'SISWA' | 'GTK', data: Partial<Transaction>) => Promise<void>;
}

export const TransactionManager: React.FC<TransactionManagerProps> = ({ type, users, adminName, onTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [nominal, setNominal] = useState<string>('');
  const [jenis, setJenis] = useState<'SETOR' | 'TARIK'>('SETOR');
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSearching, setIsSearching] = useState(false);

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = searchTerm.length > 0 ? safeUsers.filter(u => 
    (u?.nama || (u as any)?.Nama || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u?.['No Rekening'] || u?.noRekening || '').toString().includes(searchTerm)
  ).slice(0, 5) : [];

  const handleSelectUser = (user: UserType) => {
    setSelectedUser(user);
    setSearchTerm('');
    setIsSearching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const amount = Number(nominal);
    if (isNaN(amount) || amount <= 0) {
      Swal.fire('Error', 'Nominal harus angka positif', 'error');
      return;
    }

    const currentSaldo = Number(selectedUser?.saldo || (selectedUser as any)?.Saldo || 0);
    if (jenis === 'TARIK' && currentSaldo < amount) {
      Swal.fire('Error', 'Saldo tidak mencukupi', 'error');
      return;
    }

    try {
      await onTransaction(type, {
        noRekening: (selectedUser?.['No Rekening'] || selectedUser?.noRekening || '').toString(),
        nama: selectedUser?.nama || (selectedUser as any)?.Nama || '',
        kelas: selectedUser?.kelas || (selectedUser as any)?.Kelas || '',
        jabatan: selectedUser?.jabatan || (selectedUser as any)?.Jabatan || '',
        nominal: amount,
        jenis,
        namaAdmin: adminName,
        tanggal: tanggal // Pass the selected date
      });
      
      setNominal('');
      setSelectedUser(null);
      setTanggal(new Date().toISOString().split('T')[0]); // Reset to today
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ArrowUpRight className="text-primary" />
          Transaksi {type}
        </h3>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* User Selection */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cari {type}</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Ketik No Rekening atau Nama..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSearching(true);
                  }}
                  onFocus={() => setIsSearching(true)}
                />
              </div>

              {isSearching && filteredUsers.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {filteredUsers.map((user, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate text-sm">{user?.nama || (user as any)?.Nama || '-'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{user?.['No Rekening'] || user?.noRekening || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-teal-600">{formatCurrency(Number(user?.saldo || (user as any)?.Saldo || 0))}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected User Card */}
            {selectedUser ? (
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between animate-in zoom-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Terpilih</p>
                    <p className="font-bold text-slate-800 text-sm">{selectedUser?.nama || (selectedUser as any)?.Nama || '-'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{selectedUser?.['No Rekening'] || selectedUser?.noRekening || '-'}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedUser(null)}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                <User size={32} className="mb-2 opacity-20" />
                <p className="text-xs font-medium">Pilih nasabah terlebih dahulu</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Transaction Details */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setJenis('SETOR')}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all",
                  jenis === 'SETOR' ? "border-teal-500 bg-teal-50 text-teal-600" : "border-slate-100 bg-slate-50 text-slate-400"
                )}
              >
                <ArrowUpRight size={20} />
                <span className="font-bold uppercase tracking-widest text-xs">Setor</span>
              </button>
              <button
                type="button"
                onClick={() => setJenis('TARIK')}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all",
                  jenis === 'TARIK' ? "border-red-500 bg-red-50 text-red-600" : "border-slate-100 bg-slate-50 text-slate-400"
                )}
              >
                <ArrowDownLeft size={20} />
                <span className="font-bold uppercase tracking-widest text-xs">Tarik</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tanggal Transaksi</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <input 
                  type="date" 
                  required 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-700"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nominal Transaksi</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                <input 
                  type="number" 
                  required 
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-2xl font-bold text-slate-800"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={!selectedUser || !nominal}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-teal-600 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              Proses Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

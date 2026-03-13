import React, { useState, useMemo } from 'react';
import { Search, FileText, User as UserIcon, Printer, ChevronDown } from 'lucide-react';
import { User, Transaction } from '../types';
import { formatCurrency, generatePDF, cn } from '../utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Swal from 'sweetalert2';

interface PrintManagerProps {
  type: 'SISWA' | 'GTK';
  users: User[];
  transactions: Transaction[];
}

export const PrintManager: React.FC<PrintManagerProps> = ({ type, users, transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');

  const safeUsers = Array.isArray(users) ? users : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const classes = useMemo(() => {
    if (type !== 'SISWA') return [];
    const uniqueClasses = new Set<string>();
    safeUsers.forEach(s => {
      const className = String(s.kelas || (s as any).Kelas || '');
      if (className && className !== '' && className !== '-') uniqueClasses.add(className);
    });
    return Array.from(uniqueClasses).sort();
  }, [safeUsers, type]);

  const filteredUsers = searchTerm.length > 0 ? safeUsers.filter(u => 
    (u?.nama || (u as any)?.Nama || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u?.['No Rekening'] || u?.noRekening || '').toString().includes(searchTerm)
  ).slice(0, 5) : [];

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchTerm('');
    setIsSearching(false);
  };

  const handlePrintKoran = () => {
    if (!selectedUser) return;
    
    const noRek = (selectedUser?.noRekening || (selectedUser as any)?.['No Rekening'] || '').toString();
    const nama = selectedUser?.nama || (selectedUser as any)?.Nama || '';
    
    const userTrx = safeTransactions.filter(t => (t?.noRekening || (t as any)?.['No Rekening']) === noRek);
    
    const personalInfo = {
      nama: nama,
      noRekening: noRek,
      kelas: selectedUser?.kelas || (selectedUser as any)?.Kelas,
      jabatan: selectedUser?.jabatan || (selectedUser as any)?.Jabatan,
      saldo: Number(selectedUser?.saldo || (selectedUser as any)?.Saldo || 0)
    };

    const headers = ['Tanggal', 'Kode TRX', 'Jenis', 'Nominal'];
    const body = userTrx.map(t => {
      const dateVal = t?.tanggal || (t as any)?.Tanggal;
      let formattedDate = '-';
      try {
        if (dateVal) formattedDate = format(new Date(dateVal), 'dd/MM/yyyy HH:mm');
      } catch (e) {
        console.error('Date format error:', e);
      }
      return [
        String(formattedDate),
        String(t?.kodeTRX || (t as any)?.KodeTRX || '-'),
        String(t?.jenis || (t as any)?.Jenis || '-'),
        String(formatCurrency(Number(t?.nominal || (t as any)?.Nominal || 0)))
      ];
    });
    
    generatePDF(`Rekening Koran - ${nama}`, headers, body, `Koran_${nama}`, personalInfo);
  };

  const handlePrintRekapan = () => {
    const headers = ['No Rekening', 'Nama', type === 'SISWA' ? 'Kelas' : 'Jabatan', 'Saldo'];
    
    let totalSaldo = 0;
    const body = safeUsers.map(u => {
      const saldo = Number(u?.saldo || (u as any)?.Saldo || 0);
      totalSaldo += saldo;
      return [
        String(u?.noRekening || u?.['No Rekening'] || '-'),
        String(u?.nama || (u as any)?.Nama || '-'),
        String(u?.kelas || (u as any)?.Kelas || u?.jabatan || (u as any)?.Jabatan || '-'),
        String(formatCurrency(saldo))
      ];
    });

    body.push(['', '', 'TOTAL KESELURUHAN', String(formatCurrency(totalSaldo))]);

    generatePDF(`Rekapan Saldo ${type}`, headers, body, `Rekapan_${type}`);
  };

  const handlePrintRekapanKelas = () => {
    if (!selectedClass) {
      Swal.fire('Info', 'Silakan pilih kelas terlebih dahulu', 'info');
      return;
    }

    const classUsers = safeUsers.filter(u => String(u?.kelas || (u as any)?.Kelas || '') === selectedClass);
    
    if (classUsers.length === 0) {
      Swal.fire('Info', `Tidak ada data siswa untuk kelas ${selectedClass}`, 'info');
      return;
    }

    const headers = ['No Rekening', 'Nama', 'Kelas', 'Saldo'];
    
    let totalSaldo = 0;
    const body = classUsers.map(u => {
      const saldo = Number(u?.saldo || (u as any)?.Saldo || 0);
      totalSaldo += saldo;
      return [
        String(u?.noRekening || u?.['No Rekening'] || '-'),
        String(u?.nama || (u as any)?.Nama || '-'),
        String(u?.kelas || (u as any)?.Kelas || '-'),
        String(formatCurrency(saldo))
      ];
    });

    body.push(['', '', 'TOTAL KESELURUHAN', String(formatCurrency(totalSaldo))]);

    generatePDF(`Rekapan Saldo Kelas ${selectedClass}`, headers, body, `Rekapan_Kelas_${selectedClass}`);
  };

  const handlePrintRekapanLulus = () => {
    const lulusUsers = safeUsers.filter(u => String(u?.status || (u as any)?.Status || '').toUpperCase() === 'LULUS');
    
    if (lulusUsers.length === 0) {
      Swal.fire('Info', 'Tidak ada data siswa dengan status LULUS', 'info');
      return;
    }

    const headers = ['No Rekening', 'Nama', 'Kelas', 'Saldo'];
    
    let totalSaldo = 0;
    const body = lulusUsers.map(u => {
      const saldo = Number(u?.saldo || (u as any)?.Saldo || 0);
      totalSaldo += saldo;
      return [
        String(u?.noRekening || u?.['No Rekening'] || '-'),
        String(u?.nama || (u as any)?.Nama || '-'),
        String(u?.kelas || (u as any)?.Kelas || '-'),
        String(formatCurrency(saldo))
      ];
    });

    body.push(['', '', 'TOTAL KESELURUHAN', String(formatCurrency(totalSaldo))]);

    generatePDF(`Rekapan Saldo Siswa Lulus`, headers, body, `Rekapan_Siswa_Lulus`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Cetak Rekening {type}</h2>
        <p className="text-slate-500">Pilih nasabah untuk mencetak rekening koran atau cetak rekapan seluruh data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Individual Print Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Printer size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Cetak Rekening Koran</h3>
          </div>

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
                      <UserIcon size={16} />
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

          {selectedUser ? (
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-4 animate-in zoom-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Nasabah Terpilih</p>
                    <p className="font-bold text-slate-800">{selectedUser?.nama || (selectedUser as any)?.Nama || '-'}</p>
                    <p className="text-xs text-slate-400 font-mono">{selectedUser?.['No Rekening'] || selectedUser?.noRekening || '-'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Ganti
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-white rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Saldo</p>
                  <p className="font-bold text-teal-600">{formatCurrency(Number(selectedUser?.saldo || (selectedUser as any)?.Saldo || 0))}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{type === 'SISWA' ? 'Kelas' : 'Jabatan'}</p>
                  <p className="font-bold text-slate-700">{selectedUser?.kelas || (selectedUser as any)?.Kelas || selectedUser?.jabatan || (selectedUser as any)?.Jabatan || '-'}</p>
                </div>
              </div>

              <button 
                onClick={handlePrintKoran}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                Generate Rekening Koran
              </button>
            </div>
          ) : (
            <div className="p-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
              <UserIcon size={48} className="mb-3 opacity-20" />
              <p className="font-medium">Pilih nasabah terlebih dahulu</p>
            </div>
          )}
        </div>

        {/* Summary Print Card */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                  <FileText size={20} />
                </div>
                <h3 className="font-bold text-slate-800">Cetak Rekapan Seluruh {type}</h3>
              </div>

              <div className="p-6 bg-secondary/5 border border-secondary/10 rounded-2xl space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Fitur ini akan mencetak laporan keuangan yang merangkum data seluruh {type} beserta saldo terakhir mereka dalam satu dokumen PDF.
                </p>
                <div className="flex items-center gap-4 text-xs font-bold text-secondary uppercase tracking-widest">
                  <span>Total Data: {safeUsers.length} Nasabah</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePrintRekapan}
              className="w-full mt-6 py-4 bg-secondary text-white rounded-2xl font-bold shadow-lg shadow-secondary/20 hover:bg-cyan-600 transition-all flex items-center justify-center gap-2"
            >
              <Printer size={20} />
              Cetak Rekapan Semua {type}
            </button>
          </div>

          {type === 'SISWA' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                    <FileText size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800">Cetak Rekapan per Kelas & Lulus</h3>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pilih Kelas</label>
                  <div className="relative">
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none font-bold text-slate-700"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {classes.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <button 
                  onClick={handlePrintRekapanKelas}
                  className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  Cetak Rekapan Kelas
                </button>
                <button 
                  onClick={handlePrintRekapanLulus}
                  className="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  Cetak Rekapan Siswa Lulus
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

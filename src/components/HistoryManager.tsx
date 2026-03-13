import React, { useState } from 'react';
import { Search, History, Trash2, FileText } from 'lucide-react';
import { Transaction, User } from '../types';
import { formatCurrency, generatePDF, cn } from '../utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Swal from 'sweetalert2';

interface HistoryManagerProps {
  type: 'SISWA' | 'GTK';
  data: Transaction[];
  users?: User[]; // Added users data
  onDelete: (type: 'SISWA' | 'GTK', kodeTRX: string) => Promise<void>;
  isKoran?: boolean;
  userRole?: string;
}

export const HistoryManager: React.FC<HistoryManagerProps> = ({ type, data, users = [], onDelete, isKoran = false, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const safeData = Array.isArray(data) ? data : [];

  const filteredData = safeData.filter(t => 
    (t?.nama || (t as any)?.Nama || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t?.noRekening || (t as any)?.['No Rekening'] || '').toString().includes(searchTerm)
  );

  const handleDelete = async (kodeTRX: string) => {
    const result = await Swal.fire({
      title: 'Hapus Transaksi?',
      text: "Saldo user akan dikembalikan otomatis!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      await onDelete(type, kodeTRX);
    }
  };

  const handlePrintKoran = (noRek: string, nama: string) => {
    const userTrx = safeData.filter(t => (t?.noRekening || (t as any)?.['No Rekening']) === noRek);
    
    // Find user info from users list for accurate balance
    const userInfo = users.find(u => (u?.noRekening || u?.['No Rekening']) === noRek);
    const lastTrx = userTrx[0];
    
    const personalInfo = {
      nama: nama,
      noRekening: noRek,
      kelas: userInfo?.kelas || (userInfo as any)?.Kelas || lastTrx?.kelas || (lastTrx as any)?.Kelas,
      jabatan: userInfo?.jabatan || (userInfo as any)?.Jabatan || lastTrx?.jabatan || (lastTrx as any)?.Jabatan,
      saldo: Number(userInfo?.saldo || (userInfo as any)?.Saldo || 0)
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

  const handlePrintAll = () => {
    const headers = ['Tanggal', 'Nama', 'No Rekening', 'Jenis', 'Nominal'];
    const body = filteredData.map(t => {
      const dateVal = t?.tanggal || (t as any)?.Tanggal;
      let formattedDate = '-';
      try {
        if (dateVal) formattedDate = format(new Date(dateVal), 'dd/MM/yyyy HH:mm');
      } catch (e) {
        console.error('Date format error:', e);
      }
      return [
        String(formattedDate),
        String(t?.nama || (t as any)?.Nama || '-'),
        String(t?.noRekening || (t as any)?.['No Rekening'] || '-'),
        String(t?.jenis || (t as any)?.Jenis || '-'),
        String(formatCurrency(Number(t?.nominal || (t as any)?.Nominal || 0)))
      ];
    });
    
    generatePDF(`Riwayat Transaksi ${type}`, headers, body, `Riwayat_${type}`);
  };

  const safeFormatDate = (dateVal: any) => {
    try {
      if (!dateVal) return '-';
      return format(new Date(dateVal), 'dd MMM yyyy HH:mm', { locale: id });
    } catch (e) {
      return '-';
    }
  };

  const handlePrintRekapan = () => {
    const headers = ['No Rekening', 'Nama', type === 'SISWA' ? 'Kelas' : 'Jabatan', 'Saldo'];
    
    // We need the users data to get the final balance
    const body = users.map(u => [
      String(u?.noRekening || u?.['No Rekening'] || '-'),
      String(u?.nama || (u as any)?.Nama || '-'),
      String(u?.kelas || (u as any)?.Kelas || u?.jabatan || (u as any)?.Jabatan || '-'),
      String(formatCurrency(Number(u?.saldo || (u as any)?.Saldo || 0)))
    ]);

    generatePDF(`Rekapan Saldo ${type}`, headers, body, `Rekapan_${type}`);
  };

  return (
    <div className="space-y-6">
      {userRole !== 'SISWA' && userRole !== 'GTK' && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari No Rekening atau Nama..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {isKoran && (
              <button 
                onClick={handlePrintRekapan}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl font-bold shadow-lg shadow-secondary/20 hover:bg-cyan-600 transition-all"
              >
                <FileText size={20} />
                Cetak Rekapan
              </button>
            )}
            {!isKoran && (
              <button 
                onClick={handlePrintAll}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl font-bold shadow-lg shadow-secondary/20 hover:bg-cyan-600 transition-all"
              >
                <FileText size={20} />
                Cetak Laporan
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nominal</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Petugas</th>
                {userRole !== 'SISWA' && userRole !== 'GTK' && (
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((trx, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {safeFormatDate(trx?.tanggal || (trx as any)?.Tanggal)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700">{trx?.nama || (trx as any)?.Nama || '-'}</p>
                    <p className="text-[10px] font-mono text-slate-400">{trx?.noRekening || (trx as any)?.['No Rekening'] || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                      (trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? "bg-teal-100 text-teal-600" : "bg-red-100 text-red-600"
                    )}>
                      {trx?.jenis || (trx as any)?.Jenis || '-'}
                    </span>
                  </td>
                  <td className={cn(
                    "px-6 py-4 font-bold",
                    (trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? "text-teal-600" : "text-red-600"
                  )}>
                    {(trx?.jenis || (trx as any)?.Jenis) === 'SETOR' ? '+' : '-'} {formatCurrency(Number(trx?.nominal || (trx as any)?.Nominal || 0))}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">{trx?.namaAdmin || (trx as any)?.NamaAdmin || '-'}</td>
                  {userRole !== 'SISWA' && userRole !== 'GTK' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {isKoran ? (
                          <button 
                            onClick={() => handlePrintKoran((trx?.noRekening || (trx as any)?.['No Rekening'] || '').toString(), trx?.nama || (trx as any)?.Nama || '')}
                            className="p-2 text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors"
                            title="Cetak Rekening Koran"
                          >
                            <FileText size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleDelete(trx?.kodeTRX || (trx as any)?.KodeTRX || '')}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Transaksi"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={userRole !== 'SISWA' && userRole !== 'GTK' ? 6 : 5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Tidak ada riwayat transaksi ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

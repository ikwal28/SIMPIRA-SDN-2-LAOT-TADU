import React, { useState } from 'react';
import { Trash2, AlertTriangle, Users } from 'lucide-react';
import { User } from '../types';
import Swal from 'sweetalert2';

interface DeleteLulusManagerProps {
  siswa: User[];
  onDeleteLulus: () => Promise<void>;
}

export const DeleteLulusManager: React.FC<DeleteLulusManagerProps> = ({ siswa, onDeleteLulus }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter students with status 'LULUS' or 'Lulus'
  const siswaLulus = siswa.filter(s => {
    const status = s.status || (s as any).Status || '';
    return status.toUpperCase() === 'LULUS';
  });

  const totalSaldoLulus = siswaLulus.reduce((sum, s) => {
    const saldo = s.saldo || (s as any).Saldo || 0;
    return sum + Number(saldo);
  }, 0);

  const handleDelete = async () => {
    if (siswaLulus.length === 0) {
      Swal.fire('Info', 'Tidak ada data siswa dengan status Lulus.', 'info');
      return;
    }

    const result = await Swal.fire({
      title: 'PERINGATAN KERAS!',
      html: `
        <div class="text-left space-y-4">
          <p class="text-red-600 font-bold">Apakah Anda sudah mencetak laporan rekening siswa yang sudah lulus?</p>
          <p>Jika belum, <b>lakukan terlebih dahulu!</b></p>
          <p>Menghapus siswa dengan status lulus akan <b>menghapus seluruh data mereka (termasuk riwayat transaksi) secara permanen</b> dari database.</p>
          <p class="text-sm text-slate-500 mt-4">Jumlah siswa yang akan dihapus: <b>${siswaLulus.length} Siswa</b></p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Saya Yakin Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        await onDeleteLulus();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
          <Trash2 size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hapus Data Siswa Lulus</h2>
          <p className="text-sm text-slate-500 font-medium">Hapus permanen data siswa yang telah lulus beserta transaksinya</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
        <div className="flex gap-4">
          <AlertTriangle className="text-amber-500 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-amber-800 font-bold mb-2">Penting Sebelum Menghapus!</h3>
            <ul className="list-disc list-inside text-amber-700 text-sm space-y-1">
              <li>Pastikan Anda telah <b>mencetak buku rekening / laporan</b> untuk semua siswa yang lulus.</li>
              <li>Tindakan ini akan menghapus data profil siswa dan <b>seluruh riwayat tabungan mereka</b>.</li>
              <li>Data yang sudah dihapus <b>tidak dapat dikembalikan</b>.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Total Siswa Lulus</p>
            <p className="text-2xl font-bold text-slate-800">{siswaLulus.length} <span className="text-sm font-medium text-slate-500">Siswa</span></p>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <span className="font-bold text-lg">Rp</span>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Total Saldo Tersisa</p>
            <p className="text-2xl font-bold text-slate-800">
              Rp {totalSaldoLulus.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Daftar Siswa Lulus</h3>
        {siswaLulus.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">No Rekening</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siswaLulus.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-700">{s.noRekening || (s as any)['No Rekening']}</td>
                    <td className="p-4 text-sm font-bold text-slate-800">{s.nama || (s as any).Nama}</td>
                    <td className="p-4 text-sm text-slate-600">{s.kelas || (s as any).Kelas}</td>
                    <td className="p-4 text-sm font-bold text-emerald-600 text-right">
                      Rp {Number(s.saldo || (s as any).Saldo || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <p className="text-slate-500 font-medium">Tidak ada data siswa dengan status Lulus.</p>
          </div>
        )}
      </div>

      <button
        onClick={handleDelete}
        disabled={isDeleting || siswaLulus.length === 0}
        className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-red-500/30 hover:bg-red-600 hover:shadow-red-500/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Trash2 size={24} />
        {isDeleting ? 'Menghapus Data...' : 'Hapus Semua Data Siswa Lulus'}
      </button>
    </div>
  );
};

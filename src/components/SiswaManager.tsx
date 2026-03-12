import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { User } from '../types';
import { formatCurrency, formatAccount, generatePDF, cn } from '../utils';
import Swal from 'sweetalert2';

interface SiswaManagerProps {
  data: User[];
  onAdd: (data: Partial<User>) => Promise<void>;
  onUpdate: (id: string, data: Partial<User>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const SiswaManager: React.FC<SiswaManagerProps> = ({ data, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    noRekening: '',
    nama: '',
    kelas: '',
    status: 'AKTIF'
  });

  const safeData = Array.isArray(data) ? data : [];

  const filteredData = safeData.filter(s => 
    (s?.nama || (s as any)?.Nama || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s?.['No Rekening'] || s?.noRekening || '').toString().includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSiswa) {
        await onUpdate((editingSiswa['No Rekening'] || editingSiswa.noRekening || '').toString(), formData);
      } else {
        await onAdd(formData);
      }
      setIsModalOpen(false);
      setEditingSiswa(null);
      setFormData({ noRekening: '', nama: '', kelas: '', status: 'AKTIF' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (siswa: User) => {
    setEditingSiswa(siswa);
    setFormData({
      noRekening: (siswa?.['No Rekening'] || siswa?.noRekening || '').toString().replace('simpira', ''),
      nama: siswa?.nama || (siswa as any)?.Nama || '',
      kelas: siswa?.kelas || (siswa as any)?.Kelas || '',
      status: siswa?.status || (siswa as any)?.Status || 'AKTIF'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    const result = await Swal.fire({
      title: 'Apakah anda yakin?',
      text: "Data siswa dan saldonya akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      await onDelete(id);
    }
  };

  const handlePrintReport = () => {
    const headers = ['No Rekening', 'Nama', 'Kelas', 'Saldo', 'Status'];
    const body = filteredData.map(s => [
      s?.['No Rekening'] || s?.noRekening || '-',
      s?.nama || (s as any)?.Nama || '-',
      s?.kelas || (s as any)?.Kelas || '-',
      formatCurrency(Number(s?.saldo || (s as any)?.Saldo || 0)),
      s?.status || (s as any)?.Status || '-'
    ]);
    
    generatePDF('Laporan Rekening Siswa', headers, body, 'Laporan_Rekening_Siswa');
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari No Rekening atau Nama..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => {
              setEditingSiswa(null);
              setFormData({ noRekening: '', nama: '', kelas: '', status: 'AKTIF' });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all text-sm"
          >
            <Plus size={18} />
            Tambah Siswa
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">No Rekening</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kelas</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saldo</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((siswa, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {siswa?.['No Rekening'] || siswa?.noRekening || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-bold text-slate-700 text-sm">{siswa?.nama || (siswa as any)?.Nama || '-'}</td>
                  <td className="px-4 py-2 text-slate-500 text-sm">{siswa?.kelas || (siswa as any)?.Kelas || '-'}</td>
                  <td className="px-4 py-2 font-bold text-emerald-600 text-sm">{formatCurrency(Number(siswa?.saldo || (siswa as any)?.Saldo || 0))}</td>
                  <td className="px-4 py-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                      (siswa?.status || (siswa as any)?.Status) === 'AKTIF' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                    )}>
                      {siswa?.status || (siswa as any)?.Status || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(siswa)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete((siswa?.['No Rekening'] || siswa?.noRekening || '').toString())}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Tidak ada data siswa ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingSiswa ? 'Edit Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">No Rekening (Angka)</label>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    required 
                    disabled={!!editingSiswa}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-l-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                    value={formData.noRekening}
                    onChange={(e) => setFormData({ ...formData, noRekening: e.target.value })}
                  />
                  <span className="px-4 py-3 bg-slate-200 text-slate-600 font-bold rounded-r-2xl text-sm">simpira</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kelas</label>
                <select 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                >
                  <option value="">Pilih Kelas</option>
                  {[1, 2, 3, 4, 5, 6].map(k => (
                    <option key={k} value={k}>Kelas {k}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NON-AKTIF">NON-AKTIF</option>
                </select>
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all"
                >
                  {editingSiswa ? 'Simpan Perubahan' : 'Daftarkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

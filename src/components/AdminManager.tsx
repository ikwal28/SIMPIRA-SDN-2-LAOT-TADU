import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, Shield } from 'lucide-react';
import { User, Role } from '../types';
import { cn } from '../utils';
import Swal from 'sweetalert2';

interface AdminManagerProps {
  data: User[];
  currentRole: Role;
  onAdd: (data: Partial<User>) => Promise<void>;
  onUpdate: (username: string, data: Partial<User>) => Promise<void>;
  onDelete: (username: string) => Promise<void>;
}

export const AdminManager: React.FC<AdminManagerProps> = ({ data, currentRole, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'ADMINSISWA' as Role,
    nama: ''
  });

  const safeData = Array.isArray(data) ? data : [];

  const filteredData = safeData.filter(a => 
    (a?.nama || (a as any)?.Nama || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a?.username || (a as any)?.Username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await onUpdate(editingAdmin?.username || (editingAdmin as any)?.Username || '', formData);
      } else {
        await onAdd(formData);
      }
      setIsModalOpen(false);
      setEditingAdmin(null);
      setFormData({ username: '', password: '', role: 'ADMINSISWA', nama: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (admin: User) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin?.username || (admin as any)?.Username || '',
      password: admin?.password || (admin as any)?.Password || '',
      role: admin?.role || (admin as any)?.Role || 'ADMINSISWA',
      nama: admin?.nama || (admin as any)?.Nama || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (username: string) => {
    if (!username) return;
    if (username === 'superadmin') {
      Swal.fire('Error', 'Super Admin tidak dapat dihapus', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Hapus Admin?',
      text: "Akses admin ini akan dicabut permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      await onDelete(username);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari Username atau Nama..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {currentRole === 'SUPERADMIN' && (
          <button 
            onClick={() => {
              setEditingAdmin(null);
              setFormData({ username: '', password: '', role: 'ADMINSISWA', nama: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-teal-600 transition-all text-sm"
          >
            <Plus size={18} />
            Tambah Admin
          </button>
        )}
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((admin, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs font-bold text-slate-700">{admin?.username || (admin as any)?.Username || '-'}</td>
                  <td className="px-4 py-2 font-bold text-slate-700 text-sm">{admin?.nama || (admin as any)?.Nama || '-'}</td>
                  <td className="px-4 py-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                      (admin?.role || (admin as any)?.Role) === 'SUPERADMIN' ? "bg-orange-100 text-orange-600" : "bg-cyan-100 text-cyan-600"
                    )}>
                      {admin?.role || (admin as any)?.Role || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(admin)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      {currentRole === 'SUPERADMIN' && (admin?.username || (admin as any)?.Username) !== 'superadmin' && (
                        <button 
                          onClick={() => handleDelete(admin?.username || (admin as any)?.Username || '')}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Shield className="text-primary" />
                {editingAdmin ? 'Edit Admin' : 'Tambah Admin Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                <input 
                  type="text" 
                  required 
                  disabled={!!editingAdmin}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {currentRole === 'SUPERADMIN' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  >
                    <option value="ADMINSISWA">ADMIN SISWA</option>
                    <option value="ADMINGTK">ADMIN GTK</option>
                    <option value="SUPERADMIN">SUPER ADMIN</option>
                  </select>
                </div>
              )}
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-teal-600 transition-all"
                >
                  {editingAdmin ? 'Simpan Perubahan' : 'Tambah Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Search, CreditCard, Users, Printer, ChevronDown, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { generateStudentCardPDF, cn } from '../utils';
import Swal from 'sweetalert2';

interface StudentCardManagerProps {
  siswa: User[];
}

export const StudentCardManager: React.FC<StudentCardManagerProps> = ({ siswa }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');

  const safeSiswa = Array.isArray(siswa) ? siswa : [];

  const classes = useMemo(() => {
    const uniqueClasses = new Set<string>();
    safeSiswa.forEach(s => {
      const className = String(s.kelas || (s as any).Kelas || '');
      if (className && className !== '' && className !== '-') uniqueClasses.add(className);
    });
    return Array.from(uniqueClasses).sort();
  }, [safeSiswa]);

  const filteredUsers = searchTerm.length > 0 ? safeSiswa.filter(u => 
    (u?.nama || (u as any)?.Nama || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u?.['No Rekening'] || u?.noRekening || '').toString().includes(searchTerm)
  ).slice(0, 5) : [];

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchTerm('');
    setIsSearching(false);
  };

  const handlePrintIndividual = () => {
    if (!selectedUser) return;
    generateStudentCardPDF([selectedUser]);
  };

  const handlePrintClass = () => {
    if (!selectedClass) {
      Swal.fire('Info', 'Silakan pilih kelas terlebih dahulu', 'info');
      return;
    }
    const classUsers = safeSiswa.filter(u => String(u?.kelas || (u as any).Kelas || '') === selectedClass);
    if (classUsers.length === 0) {
      Swal.fire('Info', `Tidak ada data siswa untuk kelas ${selectedClass}`, 'info');
      return;
    }
    generateStudentCardPDF(classUsers);
  };

  const handlePrintAll = () => {
    if (safeSiswa.length === 0) {
      Swal.fire('Info', 'Tidak ada data siswa', 'info');
      return;
    }
    Swal.fire({
      title: 'Konfirmasi',
      text: `Apakah Anda yakin ingin mencetak kartu untuk seluruh siswa (${safeSiswa.length} data)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Cetak',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        generateStudentCardPDF(safeSiswa);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Cetak Kartu Rekening Siswa</h2>
        <p className="text-slate-500">Pilih metode pencetakan kartu rekening untuk siswa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Individual Selection */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <CreditCard size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Cari Berdasarkan Siswa</h3>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nama atau No Rekening</label>
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
              <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
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
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedUser ? (
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Siswa Terpilih</p>
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
              
              <button 
                onClick={handlePrintIndividual}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
              >
                <Printer size={20} />
                Cetak Kartu Siswa
              </button>
            </div>
          ) : (
            <div className="p-12 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
              <UserIcon size={48} className="mb-3 opacity-20" />
              <p className="font-medium">Pilih siswa terlebih dahulu</p>
            </div>
          )}
        </div>

        {/* Group & All Selection */}
        <div className="space-y-6">
          {/* Class Selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Cari Berdasarkan Kelompok</h3>
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

            <button 
              onClick={handlePrintClass}
              className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
            >
              <Printer size={20} />
              Cetak Kartu per Kelas
            </button>
          </div>

          {/* All Students */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Cetak Semua Siswa</h3>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              Mencetak kartu rekening untuk seluruh siswa yang terdaftar dalam sistem.
            </p>

            <button 
              onClick={handlePrintAll}
              className="w-full py-4 bg-secondary text-white rounded-2xl font-bold shadow-lg shadow-secondary/20 hover:bg-cyan-600 transition-all flex items-center justify-center gap-2"
            >
              <Printer size={20} />
              Cetak Semua Kartu ({safeSiswa.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { GraduationCap, AlertTriangle, CheckCircle2, ArrowUpCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface ClassPromotionManagerProps {
  onPromote: () => Promise<void>;
}

export const ClassPromotionManager: React.FC<ClassPromotionManagerProps> = ({ onPromote }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePromote = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Kenaikan Kelas',
      text: 'Apakah Anda yakin ingin menaikkan kelas semua siswa? Tindakan ini akan menaikkan kelas 1-5 ke tingkat berikutnya dan mengubah status kelas 6 menjadi LULUS. Tindakan ini tidak dapat dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Naikkan Kelas!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      setIsProcessing(true);
      try {
        await onPromote();
      } catch (error) {
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
          <GraduationCap size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Kenaikan Kelas Massal</h3>
          <p className="text-sm text-slate-500">Proses kenaikan kelas untuk seluruh siswa secara otomatis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
          <h4 className="font-bold text-slate-700 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500" />
            Aturan Kenaikan Kelas
          </h4>
          <ul className="space-y-3">
            {[
              'Siswa Kelas 1 s/d 5 akan naik ke tingkat berikutnya (misal: 1 → 2).',
              'Siswa Kelas 6 akan otomatis diubah statusnya menjadi "LULUS".',
              'Saldo tabungan tetap utuh dan tidak berubah.',
              'Proses ini hanya dilakukan sekali setiap awal tahun ajaran baru.'
            ].map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
          <h4 className="font-bold text-amber-700 flex items-center gap-2">
            <AlertTriangle size={18} />
            Peringatan Penting
          </h4>
          <p className="text-sm text-amber-600 leading-relaxed">
            Pastikan semua data transaksi tahun ajaran ini sudah selesai diproses sebelum melakukan kenaikan kelas. 
            Tindakan ini akan mengubah data kelas pada database secara permanen.
          </p>
          <div className="pt-2">
            <button
              onClick={handlePromote}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowUpCircle size={18} />
                  Proses Kenaikan Kelas Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

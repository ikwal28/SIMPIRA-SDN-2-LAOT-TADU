import React, { useState } from 'react';
import { GraduationCap, AlertTriangle, CheckCircle2, ArrowUpCircle, Trash2, Users, FileText, Download, Printer, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../utils';

interface GraduationManagerProps {
  siswa: User[];
  onPromote: () => Promise<void>;
  onDeleteLulus: () => Promise<void>;
}

export const GraduationManager: React.FC<GraduationManagerProps> = ({ siswa, onPromote, onDeleteLulus }) => {
  const [isProcessingPromote, setIsProcessingPromote] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLulusList, setShowLulusList] = useState(false);

  // Filter students with status 'LULUS' or 'Lulus'
  const siswaLulus = siswa.filter(s => {
    const status = s.status || (s as any).Status || '';
    return status.toUpperCase() === 'LULUS';
  });

  const totalSaldoLulus = siswaLulus.reduce((sum, s) => {
    const saldo = s.saldo || (s as any).Saldo || 0;
    return sum + Number(saldo);
  }, 0);

  const handlePromote = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi Kenaikan Kelas',
      text: 'Apakah Anda yakin ingin menaikkan kelas semua siswa? Tindakan ini akan menaikkan kelas 1-5 ke tingkat berikutnya dan mengubah status kelas 6 menjadi LULUS. Tindakan ini tidak dapat dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Naikkan Kelas!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      setIsProcessingPromote(true);
      try {
        await onPromote();
      } finally {
        setIsProcessingPromote(false);
      }
    }
  };

  const generatePDF = (action: 'print' | 'download') => {
    if (siswaLulus.length === 0) {
      Swal.fire('Info', 'Tidak ada data siswa lulus untuk dicetak.', 'info');
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Laporan Rekapan Siswa Lulus', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 105, 22, { align: 'center' });

    // Summary
    doc.text(`Total Siswa Lulus: ${siswaLulus.length} Siswa`, 14, 35);
    doc.text(`Total Saldo Keseluruhan: ${formatCurrency(totalSaldoLulus)}`, 14, 42);

    // Table Data
    const tableData = siswaLulus.map((s, index) => [
      index + 1,
      s.noRekening || (s as any)['No Rekening'],
      s.nama || (s as any).Nama,
      s.kelas || (s as any).Kelas,
      formatCurrency(Number(s.saldo || (s as any).Saldo || 0))
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['No', 'No Rekening', 'Nama Siswa', 'Kelas Terakhir', 'Saldo Tabungan']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [13, 148, 136] }, // Teal 600
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        4: { halign: 'right' }
      }
    });

    if (action === 'print') {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else {
      doc.save(`Rekapan_Siswa_Lulus_${new Date().getTime()}.pdf`);
    }
  };

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
          <p>Jika belum, <b>lakukan terlebih dahulu di Step 2!</b></p>
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
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
        <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600">
          <GraduationCap size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Kenaikan Kelas & Kelulusan</h2>
          <p className="text-sm text-slate-500">Proses kenaikan kelas, cetak laporan kelulusan, dan pembersihan data.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* STEP 1: Kenaikan Kelas */}
        <div className="relative pl-8 md:pl-12 border-l-2 border-teal-100 pb-8">
          <div className="absolute -left-[17px] top-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shadow-md shadow-teal-200">
            1
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Kenaikan Kelas Massal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} className="text-teal-500" />
                Aturan Kenaikan Kelas
              </h4>
              <ul className="space-y-2">
                {[
                  'Siswa Kelas 1 s/d 5 akan naik ke tingkat berikutnya.',
                  'Siswa Kelas 6 akan otomatis menjadi "LULUS".',
                  'Saldo tabungan tetap utuh.'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center">
              <button
                onClick={handlePromote}
                disabled={isProcessingPromote}
                className="w-full flex items-center justify-center gap-2 py-4 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-200"
              >
                {isProcessingPromote ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowUpCircle size={20} />
                    Proses Kenaikan Kelas
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* STEP 2: Cetak Laporan Siswa Lulus */}
        <div className="relative pl-8 md:pl-12 border-l-2 border-teal-100 pb-8">
          <div className="absolute -left-[17px] top-0 w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold shadow-md shadow-teal-200">
            2
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Laporan Siswa Lulus</h3>
              <p className="text-sm text-slate-500">Total: <span className="font-bold text-teal-600">{siswaLulus.length} Siswa</span> | Saldo: <span className="font-bold text-teal-600">{formatCurrency(totalSaldoLulus)}</span></p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowLulusList(!showLulusList)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
              >
                {showLulusList ? <><EyeOff size={16} /> Sembunyikan</> : <><Eye size={16} /> View Data</>}
              </button>
              <button
                onClick={() => generatePDF('print')}
                disabled={siswaLulus.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-cyan-200"
              >
                <Printer size={16} /> Cetak (PDF)
              </button>
              <button
                onClick={() => generatePDF('download')}
                disabled={siswaLulus.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-amber-200"
              >
                <Download size={16} /> Download (PDF)
              </button>
            </div>
          </div>

          {showLulusList && (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 max-h-80 overflow-y-auto">
              {siswaLulus.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="border-b border-slate-200">
                      <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">No Rek</th>
                      <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                      <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
                      <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {siswaLulus.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 text-sm font-medium text-slate-700">{s.noRekening || (s as any)['No Rekening']}</td>
                        <td className="p-3 text-sm font-bold text-slate-800">{s.nama || (s as any).Nama}</td>
                        <td className="p-3 text-sm text-slate-600">{s.kelas || (s as any).Kelas}</td>
                        <td className="p-3 text-sm font-bold text-teal-600 text-right">
                          {formatCurrency(Number(s.saldo || (s as any).Saldo || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-500">Belum ada data siswa lulus.</div>
              )}
            </div>
          )}
        </div>

        {/* STEP 3: Hapus Siswa Lulus */}
        <div className="relative pl-8 md:pl-12">
          <div className="absolute -left-[17px] top-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-md shadow-red-200">
            3
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Data Siswa Lulus</h3>
          <p className="text-sm text-slate-500 mb-4">Hapus permanen data siswa yang telah lulus beserta seluruh riwayat transaksinya.</p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4 flex gap-3">
            <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-amber-800">
              Pastikan Anda telah menyelesaikan <b>Step 2 (Cetak/Download Laporan)</b> sebelum melakukan penghapusan. Data yang dihapus tidak dapat dikembalikan.
            </div>
          </div>

          <button
            onClick={handleDelete}
            disabled={isDeleting || siswaLulus.length === 0}
            className="w-full md:w-auto px-8 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Trash2 size={20} />
            {isDeleting ? 'Menghapus Data...' : 'Hapus Semua Data Siswa Lulus'}
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { FileText, Printer, Search, ChevronDown } from 'lucide-react';
import { User } from '../types';
import { cn } from '../utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

interface ManualFormManagerProps {
  siswa: User[];
}

export const ManualFormManager: React.FC<ManualFormManagerProps> = ({ siswa }) => {
  const [printMode, setPrintMode] = useState<'all' | 'class'>('all');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const classes = useMemo(() => {
    const uniqueClasses = new Set<string>();
    siswa.forEach(s => {
      const className = String(s.kelas || (s as any).Kelas || '');
      if (className && className !== '' && className !== '-') uniqueClasses.add(className);
    });
    return Array.from(uniqueClasses).sort();
  }, [siswa]);

  const generatePDF = async () => {
    let targetSiswa = [];
    if (printMode === 'all') {
      targetSiswa = siswa;
    } else {
      if (!selectedClass) {
        Swal.fire('Info', 'Silakan pilih kelas terlebih dahulu', 'info');
        return;
      }
      targetSiswa = siswa.filter(s => String(s.kelas || (s as any).Kelas || '') === selectedClass);
    }

    if (targetSiswa.length === 0) {
      Swal.fire('Info', 'Tidak ada data siswa untuk dicetak', 'info');
      return;
    }

    setIsGenerating(true);
    console.log('Generating PDF for', targetSiswa.length, 'students');
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      if (!doc) throw new Error('Failed to initialize jsPDF');

      targetSiswa.forEach((student, index) => {
        if (index > 0) {
          doc.addPage();
        }

        const nama = String(student.nama || (student as any).Nama || '-');
        const noRek = String(student?.['No Rekening'] || student?.noRekening || '-');
        const kelas = String(student.kelas || (student as any).Kelas || '-');
        const saldo = Number(student.saldo || (student as any).Saldo || 0).toLocaleString('id-ID');
        
        console.log('Processing student:', nama, noRek, kelas);

        // Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('FORM MANUAL TABUNGAN', 105, 15, { align: 'center' });
        doc.text('SIMPIRA MENABUNG', 105, 22, { align: 'center' });
        doc.setFontSize(12);
        doc.text('SD NEGERI 2 LAOT TADU', 105, 29, { align: 'center' });

        // Divider
        doc.setLineWidth(0.5);
        doc.line(20, 33, 190, 33);

        // Student Info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        let y = 42;
        const labelX = 25;
        const valueX = 65;

        doc.text('Nama Siswa', labelX, y);
        doc.text(':', valueX - 5, y);
        doc.setFont('helvetica', 'bold');
        doc.text(nama, valueX, y);
        
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('Nama Panggilan', labelX, y);
        doc.text(':', valueX - 5, y);
        doc.text('..................................................', valueX, y);

        y += 7;
        doc.text('No Rekening', labelX, y);
        doc.text(':', valueX - 5, y);
        doc.setFont('helvetica', 'bold');
        doc.text(noRek, valueX, y);

        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('Kelas', labelX, y);
        doc.text(':', valueX - 5, y);
        doc.text('..................................................', valueX, y);

        y += 7;
        doc.text('Tahun', labelX, y);
        doc.text(':', valueX - 5, y);
        doc.text('..................................................', valueX, y);

        y += 7;
        doc.text('Saldo Terakhir', labelX, y);
        doc.text(':', valueX - 5, y);
        doc.setFont('helvetica', 'bold');
        doc.text(`Rp ${saldo}`, valueX, y);

        // Table
        const tableData = [];
        for (let i = 1; i <= 30; i++) {
          tableData.push([
            i.toString(), '', '', // Left column
            (i + 30).toString(), '', '' // Right column
          ]);
        }

        autoTable(doc, {
          startY: y + 10,
          head: [['No', 'Tanggal', 'Setoran', 'No', 'Tanggal', 'Setoran']],
          body: tableData,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 1.5,
            halign: 'center',
            valign: 'middle',
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
          },
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 35 },
            2: { cellWidth: 40 },
            3: { cellWidth: 10 },
            4: { cellWidth: 35 },
            5: { cellWidth: 40 }
          },
          margin: { left: 20, right: 20 }
        });

        // Footer
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(10);
        doc.text('Mengetahui', 150, finalY, { align: 'center' });
        doc.text('Petugas SIMPIRA', 150, finalY + 5, { align: 'center' });
        doc.text('( ............................ )', 150, finalY + 25, { align: 'center' });
      });

      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const win = window.open(url, '_blank');
      
      if (!win) {
        Swal.fire('Perhatian', 'PDF berhasil dibuat tetapi diblokir oleh browser. Silakan izinkan pop-up untuk situs ini.', 'warning');
      } else {
        Swal.fire('Berhasil', 'PDF berhasil dibuat dan dibuka di tab baru', 'success');
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Swal.fire('Error', 'Gagal membuat PDF', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <FileText size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Form Manual Tabungan</h3>
          <p className="text-sm text-slate-500">Cetak formulir tabungan manual untuk arsip sekolah</p>
          {siswa.length === 0 && (
            <p className="text-xs text-red-500 font-bold mt-1 animate-pulse">
              ⚠️ Data siswa belum dimuat. Silakan tunggu atau segarkan halaman.
            </p>
          )}
          {siswa.length > 0 && (
            <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-wider">
              ✓ {siswa.length} Data Siswa Siap Cetak
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pilih Mode Cetak</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPrintMode('all')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                  printMode === 'all' 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-slate-100 hover:border-slate-200 text-slate-500"
                )}
              >
                <FileText size={24} />
                <span className="text-sm font-bold">Semua Siswa</span>
              </button>
              <button
                onClick={() => setPrintMode('class')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                  printMode === 'class' 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-slate-100 hover:border-slate-200 text-slate-500"
                )}
              >
                <Search size={24} />
                <span className="text-sm font-bold">Kelompok Kelas</span>
              </button>
            </div>
          </div>

          {printMode === 'class' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pilih Kelas</label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none font-bold text-slate-700"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className={cn(
                "w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3",
                isGenerating && "opacity-70 cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Printer size={20} />
              )}
              {isGenerating ? 'Sedang Memproses...' : 'Cetak PDF (A4)'}
            </button>
          </div>
        </div>

        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 mb-4">Informasi Cetak</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-xs text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-none" />
              <span>PDF akan berisi satu halaman untuk setiap siswa.</span>
            </li>
            <li className="flex items-start gap-3 text-xs text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-none" />
              <span>Ukuran kertas otomatis diset ke A4 (Portrait).</span>
            </li>
            <li className="flex items-start gap-3 text-xs text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-none" />
              <span>Data Nama dan No Rekening akan terisi otomatis. Kelas dapat diisi manual.</span>
            </li>
            <li className="flex items-start gap-3 text-xs text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-none" />
              <span>Tabel berisi 60 baris transaksi (30 baris x 2 kolom).</span>
            </li>
            <li className="flex items-start gap-3 text-xs text-slate-600">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-none" />
              <span>Gunakan browser Chrome/Edge untuk hasil cetak terbaik.</span>
            </li>
          </ul>
          
          <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
              <strong>Catatan:</strong> Pastikan pop-up blocker browser Anda dinonaktifkan agar PDF dapat terbuka di tab baru secara otomatis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { User } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatAccount(num: string | number) {
  const s = num.toString();
  if (s.endsWith('simpira')) return s;
  return `${s}simpira`;
}

export function generatePDF(title: string, headers: string[], data: any[][], filename: string, personalInfo?: any) {
  const doc = new jsPDF();
  
  // Add Header with modern styling
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.setFont('helvetica', 'bold');
  doc.text('SIMPIRA', 105, 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('helvetica', 'normal');
  doc.text('SISTEM INFORMASI MANAJEMEN TABUNGAN SEKOLAH DIGITAL', 105, 20, { align: 'center' });
  doc.text('SD Negeri 2 Laot Tadu - Nagan Raya', 105, 24, { align: 'center' });
  
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.8);
  doc.line(20, 28, 190, 28);
  
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 105, 40, { align: 'center' });

  let startY = 50;

  // Add Personal Info if provided (Modern Style)
  if (personalInfo) {
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.roundedRect(20, 48, 170, 35, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.roundedRect(20, 48, 170, 35, 2, 2, 'S');

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    
    const leftX = 25;
    const midX = 60;
    
    doc.text('Nama Nasabah', leftX, 56);
    doc.text(':', midX - 5, 56);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont('helvetica', 'bold');
    doc.text(String(personalInfo.nama || ''), midX, 56);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('No. Rekening', leftX, 63);
    doc.text(':', midX - 5, 63);
    doc.setTextColor(15, 23, 42);
    doc.text(String(personalInfo.noRekening || ''), midX, 63);
    
    doc.setTextColor(100, 116, 139);
    doc.text(personalInfo.kelas ? 'Kelas' : 'Jabatan', leftX, 70);
    doc.text(':', midX - 5, 70);
    doc.setTextColor(15, 23, 42);
    doc.text(String(personalInfo.kelas || personalInfo.jabatan || ''), midX, 70);
    
    doc.setTextColor(100, 116, 139);
    doc.text('Saldo Terakhir', leftX, 77);
    doc.text(':', midX - 5, 77);
    doc.setTextColor(16, 185, 129); // Emerald 600
    doc.setFont('helvetica', 'bold');
    doc.text(String(formatCurrency(personalInfo.saldo || 0)), midX, 77);
    
    doc.setFont('helvetica', 'normal');
    startY = 90;
  }
  
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: startY,
    theme: 'grid',
    headStyles: { 
      fillColor: [16, 185, 129],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [255, 255, 255]
    },
    bodyStyles: { 
      fontSize: 9,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { halign: 'center' },
      3: { halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });
  
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate 400
  const footerY = (doc as any).lastAutoTable.finalY + 20;
  
  if (footerY < 270) {
    doc.text(`Dicetak pada: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}`, 20, footerY);
    doc.setTextColor(71, 85, 105);
    doc.text('Petugas Tabungan,', 150, footerY);
    doc.setFont('helvetica', 'bold');
    doc.text('SDN 2 LAOT TADU', 150, footerY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('___________________', 150, footerY + 25);
  }
  
  // Open in new window
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export function generateStudentCardPDF(students: User[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const cardWidth = 180;
  const cardHeight = 65;
  const marginX = (pageWidth - cardWidth) / 2;
  const marginY = 10;
  const gap = 6;
  
  let cardsOnPage = 0;

  students.forEach((student) => {
    if (cardsOnPage === 4) {
      doc.addPage();
      cardsOnPage = 0;
    }

    const x = marginX;
    const y = marginY + cardsOnPage * (cardHeight + gap);

    // Card Background (Cream Theme)
    doc.setDrawColor(210, 190, 160); // Warm Tan Border
    doc.setFillColor(255, 253, 225); // Cream Background
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');

    // Playful Accents (Subtle Bubbles)
    doc.setFillColor(255, 235, 180); // Warm Yellow
    doc.circle(x + 5, y + 5, 2, 'F');
    doc.setFillColor(200, 240, 210); // Soft Sage Green
    doc.circle(x + cardWidth - 5, y + cardHeight - 5, 3, 'F');
    doc.setFillColor(255, 210, 225); // Soft Rose
    doc.circle(x + cardWidth - 12, y + 6, 1.5, 'F');

    // Vertical Divider (Clean Line)
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.2);
    doc.line(x + cardWidth / 2, y + 5, x + cardWidth / 2, y + cardHeight - 5);

    // LEFT SIDE: Student Info
    // Header Left
    doc.setFillColor(13, 148, 136); // Teal 600
    doc.roundedRect(x + 5, y + 5, cardWidth / 2 - 10, 14, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SIMPIRA MENABUNG', x + cardWidth / 4, y + 9.5, { align: 'center' });
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('simpira.my.id', x + cardWidth / 4, y + 12.5, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('KARTU REKENING SISWA', x + cardWidth / 4, y + 16, { align: 'center' });

    // Details
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    
    const noRek = student.noRekening || (student as any)['No Rekening'] || '-';
    const nama = student.nama || (student as any).Nama || '-';
    const status = student.status || (student as any).Status || 'AKTIF';
    const password = student.password || (student as any).Password || '-';

    let textY = y + 26;
    const labelX = x + 8;
    const valueX = x + 32;

    // Row 1: No Rek
    doc.setFont('helvetica', 'normal');
    doc.text('No Rekening', labelX, textY);
    doc.text(':', valueX - 3, textY);
    doc.setFont('helvetica', 'bold');
    doc.text(String(noRek), valueX, textY);
    
    // Row 2: Nama
    textY += 5.5;
    doc.setFont('helvetica', 'normal');
    doc.text('Nama Siswa', labelX, textY);
    doc.text(':', valueX - 3, textY);
    doc.setFont('helvetica', 'bold');
    doc.text(String(nama), valueX, textY);
    
    // Row 3: Status
    textY += 5.5;
    doc.setFont('helvetica', 'normal');
    doc.text('Status Akun', labelX, textY);
    doc.text(':', valueX - 3, textY);
    doc.setFont('helvetica', 'bold');
    doc.text(String(status), valueX, textY);

    // Login Info Section
    textY += 7;
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.15);
    doc.line(labelX, textY - 4, x + cardWidth / 2 - 8, textY - 4);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 148, 136);
    doc.text('INFORMASI LOGIN APLIKASI', labelX, textY);
    
    // Row 4: User
    textY += 5.5;
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.text('Username', labelX, textY);
    doc.text(':', valueX - 3, textY);
    doc.setFont('helvetica', 'bold');
    doc.text(String(noRek), valueX, textY);
    
    // Row 5: Pass
    textY += 5.5;
    doc.setFont('helvetica', 'normal');
    doc.text('Password', labelX, textY);
    doc.text(':', valueX - 3, textY);
    doc.setFont('helvetica', 'bold');
    doc.text(String(password), valueX, textY);

    // Footer Left (Decorative URL)
    doc.setTextColor(13, 148, 136);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('---------- simpira.my.id ----------', x + cardWidth / 4, y + cardHeight - 4, { align: 'center' });

    // RIGHT SIDE: Instructions
    // Header Right
    doc.setFillColor(13, 148, 136);
    doc.roundedRect(x + cardWidth / 2 + 5, y + 5, cardWidth / 2 - 10, 12, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PETUNJUK PENGGUNAAN', x + (3 * cardWidth) / 4, y + 12.5, { align: 'center' });

    // Instructions List
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    let instrY = y + 25;
    const instructions = [
      'Buka browser di HP/Laptop: simpira.my.id',
      'Masukkan Username & Password sesuai kartu',
      'Pilih "Instal Aplikasi" agar muncul di layar HP',
      'Cek saldo, riwayat transaksi, dan profil Anda',
      'Simpan kartu ini dengan baik, jangan sampai hilang'
    ];

    instructions.forEach((text, i) => {
      const splitText = doc.splitTextToSize(`${i + 1}. ${text}`, cardWidth / 2 - 15);
      doc.text(splitText, x + cardWidth / 2 + 8, instrY);
      instrY += (splitText.length * 5);
    });

    // Decorative Star (Bottom Right)
    doc.setTextColor(13, 148, 136);
    doc.setFontSize(12);
    doc.text('★', x + cardWidth - 10, y + cardHeight - 8);

    cardsOnPage++;
  });

  // Open in new window
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}


import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
  
  // Add Header
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.text('SIMPIRA MENABUNG', 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('SD Negeri 2 Laot Tadu', 105, 20, { align: 'center' });
  doc.text('Kecamatan Laot Tadu, Kabupaten Nagan Raya', 105, 24, { align: 'center' });
  
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(20, 28, 190, 28);
  
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(title.toUpperCase(), 105, 38, { align: 'center' });

  let startY = 48;

  // Add Personal Info if provided (Bank Style)
  if (personalInfo) {
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.rect(20, 45, 170, 35, 'F');
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.rect(20, 45, 170, 35, 'S');

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate 600
    
    const leftX = 25;
    const midX = 60;
    
    doc.text('Nama Nasabah', leftX, 52);
    doc.text(':', midX - 5, 52);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont('helvetica', 'bold');
    doc.text(String(personalInfo.nama || ''), midX, 52);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('No. Rekening', leftX, 59);
    doc.text(':', midX - 5, 59);
    doc.setTextColor(15, 23, 42);
    doc.text(String(personalInfo.noRekening || ''), midX, 59);
    
    doc.setTextColor(71, 85, 105);
    doc.text(personalInfo.kelas ? 'Kelas' : 'Jabatan', leftX, 66);
    doc.text(':', midX - 5, 66);
    doc.setTextColor(15, 23, 42);
    doc.text(String(personalInfo.kelas || personalInfo.jabatan || ''), midX, 66);
    
    doc.setTextColor(71, 85, 105);
    doc.text('Saldo Terakhir', leftX, 73);
    doc.text(':', midX - 5, 73);
    doc.setTextColor(16, 185, 129); // Emerald 600
    doc.setFont('helvetica', 'bold');
    doc.text(String(formatCurrency(personalInfo.saldo || 0)), midX, 73);
    
    doc.setFont('helvetica', 'normal');
    startY = 88;
  }
  
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: startY,
    theme: 'striped',
    headStyles: { 
      fillColor: [16, 185, 129],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
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

export function generateAccountCard(user: any) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [90, 55] // Business Card size
  });
  
  const width = 90;
  const height = 55;

  // Modern Background - Emerald Header
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 0, width, 18, 'F');
  
  // Accent shape
  doc.setFillColor(5, 150, 105); // Emerald 600
  doc.triangle(width - 30, 0, width, 0, width, 18, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SIMPIRA', 8, 8);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('TABUNGAN SEKOLAH', 8, 13);
  
  doc.setFontSize(6);
  doc.text('SD Negeri 2 Laot Tadu', width - 8, 10, { align: 'right' });

  // Body Content
  doc.setTextColor(30, 41, 59); // Slate 800
  
  const startX = 10;
  let currentY = 26;
  const lineGap = 5;

  // Card Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('KARTU ANGGOTA', width / 2, 22, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  const drawField = (label: string, value: any) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(String(label || ''), startX, currentY);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(':', startX + 22, currentY);
    doc.text(String(value || '-'), startX + 25, currentY);
    currentY += lineGap;
  };

  drawField('No Rekening', user['No Rekening'] || user.noRekening);
  drawField('Nama', user.Nama || user.nama);
  drawField(user.Kelas || user.kelas ? 'Kelas' : 'Jabatan', user.Kelas || user.kelas || user.Jabatan || user.jabatan);
  drawField('Status', user.Status || user.status || 'AKTIF');
  
  // Divider
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.line(startX, currentY - 2, width - 10, currentY - 2);
  currentY += 1;

  // Login Info
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('INFORMASI LOGIN:', startX, currentY);
  currentY += 4;

  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  
  // Determine credentials based on user type
  // Siswa: username = noRekening, password = column 7
  // GTK: username = column 7, password = column 8
  
  // Check if it's GTK by looking for 'Jabatan' field or presence of column 7/8 data
  const isGTK = !!(user.Jabatan || user.jabatan || (user as any)[7]); 
  
  const username = isGTK 
    ? ((user as any)[7] || user.username || user.Username || '-') 
    : (user['No Rekening'] || user.noRekening || '-');
    
  const password = isGTK 
    ? ((user as any)[8] || user.password || user.Password || '-') 
    : ((user as any)[7] || user.password || user.Password || '-');

  doc.text('Username', startX, currentY);
  doc.text(':', startX + 15, currentY);
  doc.text(String(username || '-'), startX + 18, currentY);
  
  doc.text('Password', startX, currentY + 4);
  doc.text(':', startX + 15, currentY + 4);
  doc.text(String(password || '-'), startX + 18, currentY + 4);

  // Footer
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.rect(0, height - 6, width, 6, 'F');
  doc.setFontSize(5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('© 2026 SDN 2 LAOT TADU - SIMPIRA MENABUNG', width / 2, height - 2.5, { align: 'center' });
  
  // Open in new window
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

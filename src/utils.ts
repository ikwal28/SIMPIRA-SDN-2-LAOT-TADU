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

// Helper to draw a single card on a doc instance
function drawCard(doc: jsPDF, user: any, width: number, height: number) {
  // Modern Background - Emerald Gradient-like
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 0, width, height, 'F');
  
  // Decorative shapes for modern look
  doc.setFillColor(5, 150, 105); // Emerald 600
  doc.circle(width, 0, 40, 'F');
  doc.setFillColor(4, 120, 87); // Emerald 700
  doc.circle(width, 0, 20, 'F');
  
  doc.setFillColor(255, 255, 255, 0.1);
  doc.circle(0, height, 30, 'F');

  // White Card Overlay (Main Content Area)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(5, 5, width - 10, height - 10, 3, 3, 'F');

  // Header in the white card
  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SIMPIRA', 10, 15);
  
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TABUNGAN SEKOLAH DIGITAL', 10, 19);
  
  doc.setFontSize(6);
  doc.text('SD Negeri 2 Laot Tadu', width - 10, 15, { align: 'right' });

  // Divider
  doc.setDrawColor(241, 245, 249);
  doc.line(10, 22, width - 10, 22);

  // Body Content
  const startX = 10;
  let currentY = 28;
  const lineGap = 4.5;

  const drawField = (label: string, value: any, isBold = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, startX, currentY);
    
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(': ' + String(value || '-'), startX + 20, currentY);
    currentY += lineGap;
  };

  const noRek = user['No Rekening'] || user.noRekening || '-';
  const nama = user.Nama || user.nama || '-';
  const kelasJabatan = user.Kelas || user.kelas || user.Jabatan || user.jabatan || '-';
  const labelKelasJabatan = (user.Kelas || user.kelas) ? 'Kelas' : 'Jabatan';

  drawField('No Rekening', noRek, true);
  drawField('Nama Nasabah', nama, true);
  drawField(labelKelasJabatan, kelasJabatan);
  drawField('Status Akun', user.Status || user.status || 'AKTIF');

  // Login Info Box
  currentY += 1;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(startX, currentY, width - 20, 12, 1, 1, 'F');
  
  const infoY = currentY + 4.5;
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI LOGIN', startX + 2, infoY - 1.5);
  
  // Credentials logic
  let username = '-';
  let password = '-';

  const isSiswa = !!(user.Kelas || user.kelas);
  
  if (isSiswa) {
    username = noRek;
    password = user.Password || user.password || (user as any)[6] || (user as any)[7] || '-';
  } else {
    username = user.Username || user.username || (user as any)[6] || (user as any)[7] || noRek;
    password = user.Password || user.password || (user as any)[7] || (user as any)[8] || '-';
  }

  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`Username: ${username}`, startX + 2, infoY + 2.5);
  doc.text(`Password: ${password}`, startX + 35, infoY + 2.5);

  // Footer
  doc.setFontSize(5);
  doc.setTextColor(148, 163, 184);
  doc.text('Kartu ini adalah bukti keanggotaan sah SIMPIRA SDN 2 Laot Tadu', width / 2, height - 7, { align: 'center' });
}

export function generateAccountCard(user: any) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [90, 55]
  });
  
  drawCard(doc, user, 90, 55);
  
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export function generateBulkCards(users: any[]) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [90, 55]
  });

  users.forEach((user, index) => {
    if (index > 0) doc.addPage([90, 55], 'landscape');
    drawCard(doc, user, 90, 55);
  });

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

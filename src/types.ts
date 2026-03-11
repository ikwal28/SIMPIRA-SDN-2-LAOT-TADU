export type Role = 'SUPERADMIN' | 'ADMINSISWA' | 'ADMINGTK' | 'SISWA' | 'GTK';

export interface User {
  username?: string;
  noRekening?: string;
  password?: string;
  role: Role;
  nama: string;
  kelas?: string;
  jabatan?: string;
  status?: string;
  saldo?: number;
  tanggalDibuat?: string;
}

export interface Transaction {
  kodeTRX: string;
  noRekening: string;
  nama: string;
  kelas?: string;
  jabatan?: string;
  nominal: number;
  jenis: 'SETOR' | 'TARIK';
  namaAdmin: string;
  tanggal: string;
}

export interface DashboardStats {
  totalTabunganSiswa: number;
  totalTabunganGTK: number;
  jumlahSiswa: number;
  jumlahGTK: number;
  chartData: { name: string; value: number }[];
}

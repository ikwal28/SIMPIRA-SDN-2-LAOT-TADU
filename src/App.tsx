import React, { useState, useEffect } from 'react';
import { api } from './api';
import { User, Transaction, DashboardStats } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SiswaManager } from './components/SiswaManager';
import { GTKManager } from './components/GTKManager';
import { TransactionManager } from './components/TransactionManager';
import { HistoryManager } from './components/HistoryManager';
import { PrintManager } from './components/PrintManager';
import { AdminManager } from './components/AdminManager';
import { Login } from './components/Login';
import { About } from './components/About';
import Swal from 'sweetalert2';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data States
  const [siswa, setSiswa] = useState<User[]>([]);
  const [gtk, setGTK] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [trxSiswa, setTrxSiswa] = useState<Transaction[]>([]);
  const [trxGTK, setTrxGTK] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTabunganSiswa: 0,
    totalTabunganGTK: 0,
    jumlahSiswa: 0,
    jumlahGTK: 0,
    chartData: []
  });

  // Check session
  useEffect(() => {
    const savedUser = localStorage.getItem('simpira_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch data when user changes or tab changes
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const promises: Promise<any>[] = [];

      // Always fetch dashboard stats as they are small and often needed
      if (activeTab === 'dashboard') {
        promises.push(api.getDashboard(user.role, user.username || user.noRekening!).then(res => {
          if (res.success) setStats(res.stats);
        }));
      }

      // Fetch data based on active tab to save time and bandwidth
      console.log('Active Tab:', activeTab);
      console.log('User Role:', user.role);
      
      if (['siswa', 'transaksi_siswa', 'koran_siswa'].includes(activeTab) && ['SUPERADMIN', 'ADMINSISWA'].includes(user.role)) {
        promises.push(api.getSiswa().then(res => {
          console.log('Siswa Data:', res);
          if (Array.isArray(res)) setSiswa(res);
        }));
      }

      if (['gtk', 'transaksi_gtk', 'koran_gtk'].includes(activeTab) && ['SUPERADMIN', 'ADMINGTK'].includes(user.role)) {
        promises.push(api.getGTK().then(res => {
          console.log('GTK Data:', res);
          if (Array.isArray(res)) setGTK(res);
        }));
      }

      if (['riwayat_siswa', 'koran_siswa'].includes(activeTab)) {
        promises.push(api.getTransactions('SISWA', user.role === 'SISWA' ? user.noRekening : undefined).then(res => {
          console.log('Trx Siswa Data:', res);
          if (Array.isArray(res)) setTrxSiswa(res);
        }));
      }

      if (['riwayat_gtk', 'koran_gtk'].includes(activeTab)) {
        promises.push(api.getTransactions('GTK', user.role === 'GTK' ? user.noRekening : undefined).then(res => {
          if (Array.isArray(res)) setTrxGTK(res);
        }));
      }

      if (activeTab === 'pengaturan' && user.role === 'SUPERADMIN') {
        promises.push(api.getAdmin().then(res => {
          if (Array.isArray(res)) setAdmins(res);
        }));
      }

      // Initial load for users
      if (user.role === 'SISWA' && activeTab === 'dashboard') {
        promises.push(api.getTransactions('SISWA', user.noRekening).then(res => {
          if (Array.isArray(res)) setTrxSiswa(res);
        }));
      }
      if (user.role === 'GTK' && activeTab === 'dashboard') {
        promises.push(api.getTransactions('GTK', user.noRekening).then(res => {
          if (Array.isArray(res)) setTrxGTK(res);
        }));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Fetch Data Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const res = await api.login(username, password);
      if (res.success) {
        setUser(res.user);
        localStorage.setItem('simpira_user', JSON.stringify(res.user));
        Swal.fire({
          title: `Selamat Datang, ${res.user.nama}!`,
          text: 'Login berhasil',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire('Error', res.error, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('simpira_user');
    setActiveTab('dashboard');
  };

  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
    setIsLoading(true);
    try {
      const res = await action();
      if (res.success) {
        Swal.fire('Berhasil', successMsg, 'success');
        await fetchData();
      } else {
        Swal.fire('Gagal', res.error, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Terjadi kesalahan sistem', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} user={user} />;
      case 'siswa':
        return (
          <SiswaManager 
            data={siswa} 
            onAdd={(d) => handleAction(() => api.addSiswa(d), 'Siswa berhasil ditambahkan')}
            onUpdate={(id, d) => handleAction(() => api.updateSiswa(id, d), 'Data siswa diperbarui')}
            onDelete={(id) => handleAction(() => api.deleteSiswa(id), 'Siswa berhasil dihapus')}
          />
        );
      case 'gtk':
        return (
          <GTKManager 
            data={gtk} 
            onAdd={(d) => handleAction(() => api.addGTK(d), 'GTK berhasil ditambahkan')}
            onUpdate={(id, d) => handleAction(() => api.updateGTK(id, d), 'Data GTK diperbarui')}
            onDelete={(id) => handleAction(() => api.deleteGTK(id), 'GTK berhasil dihapus')}
          />
        );
      case 'transaksi_siswa':
        return (
          <TransactionManager 
            type="SISWA" 
            users={siswa} 
            adminName={user.nama}
            onTransaction={(t, d) => handleAction(() => api.addTransaction(t, d), 'Transaksi berhasil')}
          />
        );
      case 'transaksi_gtk':
        return (
          <TransactionManager 
            type="GTK" 
            users={gtk} 
            adminName={user.nama}
            onTransaction={(t, d) => handleAction(() => api.addTransaction(t, d), 'Transaksi berhasil')}
          />
        );
      case 'riwayat_siswa':
        return <HistoryManager type="SISWA" data={trxSiswa} onDelete={(t, id) => handleAction(() => api.deleteTransaction(t, id), 'Transaksi dibatalkan')} />;
      case 'riwayat_gtk':
        return <HistoryManager type="GTK" data={trxGTK} onDelete={(t, id) => handleAction(() => api.deleteTransaction(t, id), 'Transaksi dibatalkan')} />;
      case 'koran_siswa':
        return <PrintManager type="SISWA" users={siswa} transactions={trxSiswa} />;
      case 'koran_gtk':
        return <PrintManager type="GTK" users={gtk} transactions={trxGTK} />;
      case 'pengaturan':
        return (
          <AdminManager 
            data={admins} 
            currentRole={user.role}
            onAdd={(d) => handleAction(() => api.addAdmin(d), 'Admin baru ditambahkan')}
            onUpdate={(u, d) => handleAction(() => api.updateAdmin(u, d), 'Data admin diperbarui')}
            onDelete={(u) => handleAction(() => api.deleteAdmin(u), 'Admin berhasil dihapus')}
          />
        );
      case 'about':
        return <About />;
      default:
        return <Dashboard stats={stats} user={user} />;
    }
  };

  return (
    <Layout 
      sidebarProps={{
        role: user.role,
        activeTab,
        setActiveTab,
        onLogout: handleLogout,
        user
      }}
    >
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {renderContent()}
    </Layout>
  );
}

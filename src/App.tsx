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
import { SettingsManager } from './components/SettingsManager';
import { ManualFormManager } from './components/ManualFormManager';
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
    const savedUser = sessionStorage.getItem('simpira_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Handle session expired from another device
    const handleSessionExpired = () => {
      setUser(null);
      sessionStorage.removeItem('simpira_user');
      setActiveTab('dashboard');
      Swal.fire({
        title: 'Session Berakhir',
        text: 'Session anda telah berakhir karena login di perangkat lain',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    };

    window.addEventListener('session_expired', handleSessionExpired);
    return () => window.removeEventListener('session_expired', handleSessionExpired);
  }, []);

  // Handle inactivity timeout (10 minutes)
  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;
    const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setUser(null);
        sessionStorage.removeItem('simpira_user');
        setActiveTab('dashboard');
        Swal.fire({
          title: 'Sesi Berakhir',
          text: 'Anda telah logout otomatis karena tidak ada aktivitas selama 10 menit.',
          icon: 'info',
          confirmButtonText: 'OK'
        });
      }, INACTIVITY_LIMIT);
    };

    // Events to track activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    
    // Initial start
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [user]);

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
        const identifier = user.username || user.noRekening || (user as any)['No Rekening'] || '';
        promises.push(api.getDashboard(user.role, identifier).then(res => {
          if (res.success) {
            setStats(res.stats);
            if (res.userInfo) {
              // Update user state with latest balance
              const updatedUser = { ...user, saldo: res.userInfo.Saldo || res.userInfo.saldo || 0, status: res.userInfo.Status || res.userInfo.status || 'AKTIF' };
              setUser(updatedUser);
              sessionStorage.setItem('simpira_user', JSON.stringify(updatedUser));
            }
          }
        }));
      }

      // Fetch data based on active tab to save time and bandwidth
      console.log('Active Tab:', activeTab);
      console.log('User Role:', user.role);
      
      if (['siswa', 'transaksi_siswa', 'koran_siswa', 'pengaturan', 'manual_form'].includes(activeTab) && ['SUPERADMIN', 'ADMINSISWA', 'ADMINGTK'].includes(user.role)) {
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
        promises.push(api.getTransactions('SISWA', user.noRekening || (user as any)['No Rekening']).then(res => {
          if (Array.isArray(res)) setTrxSiswa(res);
        }));
      }
      if (user.role === 'GTK' && activeTab === 'dashboard') {
        promises.push(api.getTransactions('GTK', user.noRekening || (user as any)['No Rekening']).then(res => {
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
        sessionStorage.setItem('simpira_user', JSON.stringify(res.user));
        Swal.fire({
          title: `Selamat Datang, ${res.user.nama || res.user.Nama || 'User'}!`,
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
    sessionStorage.removeItem('simpira_user');
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
        return <Dashboard stats={stats} user={user} transactions={user.role === 'SISWA' ? trxSiswa : trxGTK} />;
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
            adminName={user.nama || (user as any).Nama || 'Admin'}
            onTransaction={(t, d) => handleAction(() => api.addTransaction(t, d), 'Transaksi berhasil')}
          />
        );
      case 'transaksi_gtk':
        return (
          <TransactionManager 
            type="GTK" 
            users={gtk} 
            adminName={user.nama || (user as any).Nama || 'Admin'}
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
      case 'manual_form':
        return <ManualFormManager siswa={siswa} />;
      case 'pengaturan':
        return (
          <SettingsManager 
            admins={admins}
            siswa={siswa}
            currentRole={user.role}
            onAddAdmin={(d) => handleAction(() => api.addAdmin(d), 'Admin baru ditambahkan')}
            onUpdateAdmin={(u, d) => handleAction(() => api.updateAdmin(u, d), 'Data admin diperbarui')}
            onDeleteAdmin={(u) => handleAction(() => api.deleteAdmin(u), 'Admin berhasil dihapus')}
          />
        );
      case 'about':
        return <About />;
      default:
        return <Dashboard stats={stats} user={user} transactions={user.role === 'SISWA' ? trxSiswa : trxGTK} />;
    }
  };

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 z-[9999] bg-red-600 text-white text-[10px] px-2 py-1 font-bold">
        APP VERSION: 1.0.1 - DATE PICKER ADDED
      </div>
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
    </div>
  );
}

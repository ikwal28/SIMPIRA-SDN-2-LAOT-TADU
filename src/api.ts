import { User, Transaction, Role } from './types';

// This URL will be provided by the user after deploying Google Apps Script
// @ts-ignore
const SCRIPT_URL = import.meta.env.VITE_GAS_API || '';

async function request(action: string, payload: any = {}) {
  if (!SCRIPT_URL) {
    console.error('GAS Script URL is not configured. Please set VITE_GAS_API in .env');
    throw new Error('API URL not configured');
  }

  // Add session info
  const userStr = sessionStorage.getItem('simpira_user');
  if (userStr && action !== 'login') {
    const user = JSON.parse(userStr);
    payload._authUser = user.username || user.noRekening || user['No Rekening'] || '';
    payload._authRole = user.role;
    payload._sessionToken = user.sessionToken;
  }

  // Use GET for all requests to ensure maximum compatibility with Google Apps Script Web Apps.
  // GAS handles GET requests more reliably across different browser environments and CORS settings.
  const url = new URL(SCRIPT_URL);
  url.searchParams.append('action', action);
  url.searchParams.append('payload', JSON.stringify(payload));

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle session expiration
    if (result && result.success === false && result.error === 'SESSION_EXPIRED') {
      window.dispatchEvent(new CustomEvent('session_expired'));
      throw new Error('SESSION_EXPIRED');
    }
    
    return result;
  } catch (error) {
    if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
      // Don't log session expiration as an error
      throw error;
    }
    console.error('API Request Error:', error);
    throw error;
  }
}

export const api = {
  login: (username: string, password: string) => 
    request('login', { username, password }),
  
  getDashboard: (role: Role, username: string) => 
    request('getDashboard', { role, username }),
  
  getSiswa: () => request('getSiswa'),
  getGTK: () => request('getGTK'),
  getAdmin: () => request('getAdmin'),
  
  addSiswa: (data: Partial<User>) => request('addSiswa', data),
  updateSiswa: (id: string, data: Partial<User>) => request('updateSiswa', { id, data }),
  deleteSiswa: (id: string) => request('deleteSiswa', { id }),
  
  addGTK: (data: Partial<User>) => request('addGTK', data),
  updateGTK: (id: string, data: Partial<User>) => request('updateGTK', { id, data }),
  deleteGTK: (id: string) => request('deleteGTK', { id }),
  
  addTransaction: (type: 'SISWA' | 'GTK', data: Partial<Transaction>) => 
    request('addTransaction', { type, data }),
  
  getTransactions: (type: 'SISWA' | 'GTK', noRekening?: string) => 
    request('getTransactions', { type, noRekening }),
    
  deleteTransaction: (type: 'SISWA' | 'GTK', kodeTRX: string) =>
    request('deleteTransaction', { type, kodeTRX }),

  updateAdmin: (username: string, data: Partial<User>) => request('updateAdmin', { username, data }),
  addAdmin: (data: Partial<User>) => request('addAdmin', data),
  deleteAdmin: (username: string) => request('deleteAdmin', { username }),
  promoteClass: () => request('promoteClass'),
  deleteSiswaLulus: () => request('deleteSiswaLulus'),
};

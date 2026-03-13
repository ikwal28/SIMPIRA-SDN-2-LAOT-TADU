/**
 * Google Apps Script Backend for SIMPIRA MENABUNG
 * Optimized for performance and concurrency.
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const LOCK_TIMEOUT = 10000; // 10 seconds

// Cache for sheet data to avoid multiple reads in one execution
const _cache = {};

function doGet(e) {
  return handleRequest(e.parameter);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    return handleRequest(data);
  } catch (error) {
    return createResponse({ success: false, error: 'Invalid JSON payload' });
  }
}

function handleRequest(params) {
  const action = params.action;
  const payload = params.payload ? (typeof params.payload === 'string' ? JSON.parse(decodeURIComponent(params.payload)) : params.payload) : params;
  
  try {
    // Only init if sheets are missing - this is faster than checking every time
    // We can also check a global property to see if it's already initialized
    const props = PropertiesService.getScriptProperties();
    if (props.getProperty('INITIALIZED') !== 'true') {
      initSheets();
      props.setProperty('INITIALIZED', 'true');
    }
    
    // Validate session for all actions except login
    if (action !== 'login') {
      const authUser = payload._authUser;
      const sessionToken = payload._sessionToken;
      if (!authUser || !sessionToken) {
        return createResponse({ success: false, error: 'SESSION_EXPIRED' });
      }
      const storedToken = props.getProperty('SESSION_' + authUser);
      if (storedToken !== sessionToken) {
        return createResponse({ success: false, error: 'SESSION_EXPIRED' });
      }
    }
    
    const result = handleAction(action, payload);
    return createResponse(result);
  } catch (error) {
    console.error('Request Error:', error);
    return createResponse({ success: false, error: 'Kesalahan Server: ' + error.toString() });
  }
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleAction(action, payload) {
  switch (action) {
    case 'login': return login(payload.username, payload.password);
    case 'getDashboard': return getDashboard(payload.role, payload.username);
    case 'getSiswa': return getSheetData('SISWA');
    case 'getGTK': return getSheetData('GTK');
    case 'getAdmin': return getSheetData('ADMIN');
    case 'addSiswa': return withLock(() => addSiswa(payload));
    case 'updateSiswa': return withLock(() => updateData('SISWA', 'No Rekening', payload.id, payload.data));
    case 'deleteSiswa': return withLock(() => deleteData('SISWA', 'No Rekening', payload.id));
    case 'addGTK': return withLock(() => addGTK(payload));
    case 'updateGTK': return withLock(() => updateData('GTK', 'No Rekening', payload.id, payload.data));
    case 'deleteGTK': return withLock(() => deleteData('GTK', 'No Rekening', payload.id));
    case 'addTransaction': return withLock(() => addTransaction(payload.type, payload.data));
    case 'getTransactions': return getTransactions(payload.type, payload.noRekening);
    case 'deleteTransaction': return withLock(() => deleteTransaction(payload.type, payload.kodeTRX));
    case 'addAdmin': return withLock(() => addAdmin(payload));
    case 'updateAdmin': return withLock(() => updateData('ADMIN', 'Username', payload.username, payload.data));
    case 'deleteAdmin': return withLock(() => deleteData('ADMIN', 'Username', payload.username));
    case 'promoteClass': return withLock(() => promoteClass());
    case 'deleteSiswaLulus': return withLock(() => deleteSiswaLulus());
    default: throw new Error('Invalid action: ' + action);
  }
}

/**
 * Wrapper for write operations to ensure thread safety
 */
function withLock(fn) {
  const lock = LockService.getScriptLock();
  try {
    if (lock.tryLock(LOCK_TIMEOUT)) {
      return fn();
    } else {
      return { success: false, error: 'Server sibuk, silakan coba lagi dalam beberapa saat.' };
    }
  } finally {
    lock.releaseLock();
  }
}

function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = {
    'ADMIN': ['Username', 'Password', 'Role', 'Nama'],
    'SISWA': ['No Rekening', 'Nama', 'Kelas', 'Status', 'Saldo', 'Tanggal Dibuat', 'Password'],
    'TRANSAKSI_SISWA': ['KodeTRX', 'No Rekening', 'Nama', 'Kelas', 'Nominal', 'Jenis', 'NamaAdmin', 'Tanggal'],
    'GTK': ['No Rekening', 'Nama', 'Jabatan', 'Status', 'Saldo', 'Tanggal Dibuat', 'Username', 'Password'],
    'TRANSAKSI_GTK': ['KodeTRX', 'No Rekening', 'Nama', 'Jabatan', 'Nominal', 'Jenis', 'NamaAdmin', 'Tanggal']
  };
  
  for (let name in sheets) {
    if (!ss.getSheetByName(name)) {
      const sheet = ss.insertSheet(name);
      sheet.appendRow(sheets[name]);
      if (name === 'ADMIN') {
        sheet.appendRow(['superadmin', 'superadmin', 'SUPERADMIN', 'Super Admin']);
        sheet.appendRow(['admingtk', 'admingtk', 'ADMINGTK', 'Admin GTK']);
        sheet.appendRow(['adminsiswa', 'adminsiswa', 'ADMINSISWA', 'Admin Siswa']);
      }
    }
  }
}

function getSheetData(sheetName) {
  if (_cache[sheetName]) return _cache[sheetName];
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length <= 1) return [];
  
  const headers = values[0];
  const rows = values.slice(1);
  
  const data = rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
  
  _cache[sheetName] = data;
  return data;
}

function login(username, password) {
  const props = PropertiesService.getScriptProperties();
  const token = Utilities.getUuid();
  
  const admin = getSheetData('ADMIN').find(u => u.Username === username && u.Password === password);
  if (admin) {
    props.setProperty('SESSION_' + admin.Username, token);
    return { success: true, user: { ...admin, role: admin.Role, nama: admin.Nama, sessionToken: token } };
  }
  
  const siswa = getSheetData('SISWA').find(u => u['No Rekening'] === username && u.Password === password);
  if (siswa) {
    props.setProperty('SESSION_' + siswa['No Rekening'], token);
    return { success: true, user: { ...siswa, role: 'SISWA', nama: siswa.Nama, noRekening: siswa['No Rekening'], sessionToken: token } };
  }
  
  const gtk = getSheetData('GTK').find(u => (u.Username === username || u['No Rekening'] === username) && u.Password === password);
  if (gtk) {
    const gtkUsername = gtk.Username || gtk['No Rekening'];
    props.setProperty('SESSION_' + gtkUsername, token);
    return { success: true, user: { ...gtk, role: 'GTK', nama: gtk.Nama, noRekening: gtk['No Rekening'], username: gtkUsername, sessionToken: token } };
  }
  
  return { success: false, error: 'Username atau Password salah' };
}

function getDashboard(role, username) {
  const siswa = getSheetData('SISWA');
  const gtk = getSheetData('GTK');
  
  const totalSiswa = siswa.reduce((acc, curr) => acc + (parseFloat(curr.Saldo) || 0), 0);
  const totalGTK = gtk.reduce((acc, curr) => acc + (parseFloat(curr.Saldo) || 0), 0);
  
  let userInfo = null;
  if (role === 'SISWA') {
    userInfo = siswa.find(u => u['No Rekening'] === username);
  } else if (role === 'GTK') {
    userInfo = gtk.find(u => u['No Rekening'] === username || u.Username === username);
  }
  
  return {
    success: true,
    stats: {
      totalTabunganSiswa: totalSiswa,
      totalTabunganGTK: totalGTK,
      jumlahSiswa: siswa.length,
      jumlahGTK: gtk.length,
      chartData: [
        { name: 'Siswa', value: totalSiswa },
        { name: 'GTK', value: totalGTK }
      ]
    },
    userInfo: userInfo
  };
}

function addSiswa(data) {
  const noRek = data.noRekening.toString().endsWith('simpira') ? data.noRekening : data.noRekening + 'simpira';
  const siswaData = getSheetData('SISWA');
  if (siswaData.some(s => s['No Rekening'] === noRek)) return { success: false, error: 'Nomor Rekening sudah ada' };
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SISWA');
  sheet.appendRow([noRek, data.nama, data.kelas, 'AKTIF', 0, new Date().toISOString(), 'simpirasiswa']);
  return { success: true };
}

function addGTK(data) {
  const noRek = data.noRekening.toString().endsWith('simpira') ? data.noRekening : data.noRekening + 'simpira';
  const gtkData = getSheetData('GTK');
  if (gtkData.some(s => s['No Rekening'] === noRek)) return { success: false, error: 'Nomor Rekening sudah ada' };
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('GTK');
  sheet.appendRow([noRek, data.nama, data.jabatan, 'AKTIF', 0, new Date().toISOString(), data.username || noRek, 'simpiragtk']);
  return { success: true };
}

function addTransaction(type, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheetName = type === 'SISWA' ? 'SISWA' : 'GTK';
  const trxSheetName = type === 'SISWA' ? 'TRANSAKSI_SISWA' : 'TRANSAKSI_GTK';
  
  const userSheet = ss.getSheetByName(userSheetName);
  const userData = getSheetData(userSheetName);
  const userIndex = userData.findIndex(u => u['No Rekening'] === data.noRekening);
  
  if (userIndex === -1) return { success: false, error: 'User tidak ditemukan' };
  
  const currentSaldo = parseFloat(userData[userIndex].Saldo) || 0;
  const nominal = parseFloat(data.nominal);
  const newSaldo = data.jenis === 'SETOR' ? currentSaldo + nominal : currentSaldo - nominal;
  
  if (newSaldo < 0) return { success: false, error: 'Saldo tidak mencukupi' };
  
  // Batch updates
  userSheet.getRange(userIndex + 2, 5).setValue(newSaldo);
  
  const trxSheet = ss.getSheetByName(trxSheetName);
  const kodeTRX = 'TRX' + Date.now();
  const row = type === 'SISWA' ? 
    [kodeTRX, data.noRekening, data.nama, data.kelas, nominal, data.jenis, data.namaAdmin, new Date().toISOString()] :
    [kodeTRX, data.noRekening, data.nama, data.jabatan, nominal, data.jenis, data.namaAdmin, new Date().toISOString()];
  trxSheet.appendRow(row);
  
  return { success: true, newSaldo };
}

function getTransactions(type, noRekening) {
  const data = getSheetData(type === 'SISWA' ? 'TRANSAKSI_SISWA' : 'TRANSAKSI_GTK');
  const filtered = noRekening ? data.filter(t => t['No Rekening'] === noRekening) : data;
  return filtered.slice(-100).reverse(); // Limit to last 100 for speed
}

function updateData(sheetName, keyName, keyValue, newData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIndex = headers.indexOf(keyName);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyIndex] === keyValue) {
      for (let key in newData) {
        const colIndex = headers.indexOf(key);
        if (colIndex !== -1) sheet.getRange(i + 1, colIndex + 1).setValue(newData[key]);
      }
      return { success: true };
    }
  }
  return { success: false, error: 'Data tidak ditemukan' };
}

function deleteData(sheetName, keyName, keyValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const keyIndex = headers.indexOf(keyName);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][keyIndex] === keyValue) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Data tidak ditemukan' };
}

function deleteTransaction(type, kodeTRX) {
  const trxSheetName = type === 'SISWA' ? 'TRANSAKSI_SISWA' : 'TRANSAKSI_GTK';
  const userSheetName = type === 'SISWA' ? 'SISWA' : 'GTK';
  
  const trxData = getSheetData(trxSheetName);
  const trx = trxData.find(t => t.KodeTRX === kodeTRX);
  if (!trx) return { success: false, error: 'Transaksi tidak ditemukan' };
  
  const userData = getSheetData(userSheetName);
  const userIndex = userData.findIndex(u => u['No Rekening'] === trx['No Rekening']);
  
  if (userIndex !== -1) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const userSheet = ss.getSheetByName(userSheetName);
    let currentSaldo = parseFloat(userData[userIndex].Saldo) || 0;
    const nominal = parseFloat(trx.Nominal);
    currentSaldo = trx.Jenis === 'SETOR' ? currentSaldo - nominal : currentSaldo + nominal;
    userSheet.getRange(userIndex + 2, 5).setValue(currentSaldo);
  }
  
  return deleteData(trxSheetName, 'KodeTRX', kodeTRX);
}

function addAdmin(data) {
  const adminData = getSheetData('ADMIN');
  if (adminData.some(a => a.Username === data.username)) return { success: false, error: 'Username sudah ada' };
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ADMIN');
  sheet.appendRow([data.username, data.password, data.role, data.nama]);
  return { success: true };
}

function promoteClass() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetSiswa = ss.getSheetByName('SISWA');
    
    if (!sheetSiswa) {
      return { success: false, error: 'Sheet SISWA tidak ditemukan' };
    }
    
    const dataSiswa = sheetSiswa.getDataRange().getValues();
    if (dataSiswa.length <= 1) {
      return { success: true, message: 'Tidak ada data siswa untuk diproses' };
    }
    
    const headers = dataSiswa[0];
    const idxKelas = headers.indexOf('Kelas');
    const idxStatus = headers.indexOf('Status');
    
    if (idxKelas === -1 || idxStatus === -1) {
      return { success: false, error: 'Kolom Kelas atau Status tidak ditemukan' };
    }
    
    let updatedCount = 0;
    
    // Process from row 2 (index 1)
    for (let i = 1; i < dataSiswa.length; i++) {
      let currentKelas = String(dataSiswa[i][idxKelas]).trim();
      let currentStatus = String(dataSiswa[i][idxStatus]).trim().toUpperCase();
      
      // Only process active students
      if (currentStatus !== 'LULUS') {
        if (currentKelas === '1') {
          sheetSiswa.getRange(i + 1, idxKelas + 1).setValue('2');
          updatedCount++;
        } else if (currentKelas === '2') {
          sheetSiswa.getRange(i + 1, idxKelas + 1).setValue('3');
          updatedCount++;
        } else if (currentKelas === '3') {
          sheetSiswa.getRange(i + 1, idxKelas + 1).setValue('4');
          updatedCount++;
        } else if (currentKelas === '4') {
          sheetSiswa.getRange(i + 1, idxKelas + 1).setValue('5');
          updatedCount++;
        } else if (currentKelas === '5') {
          sheetSiswa.getRange(i + 1, idxKelas + 1).setValue('6');
          updatedCount++;
        } else if (currentKelas === '6') {
          sheetSiswa.getRange(i + 1, idxStatus + 1).setValue('LULUS');
          updatedCount++;
        }
      }
    }
    
    return { success: true, message: `Berhasil memproses kenaikan kelas untuk ${updatedCount} siswa.` };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function deleteSiswaLulus() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetSiswa = ss.getSheetByName('SISWA');
    const sheetTrx = ss.getSheetByName('TRANSAKSI_SISWA');
    
    if (!sheetSiswa || !sheetTrx) {
      return { success: false, error: 'Sheet SISWA atau TRANSAKSI_SISWA tidak ditemukan' };
    }
    
    const dataSiswa = sheetSiswa.getDataRange().getValues();
    const headersSiswa = dataSiswa[0];
    
    const idxNoRek = headersSiswa.indexOf('No Rekening');
    const idxStatus = headersSiswa.indexOf('Status');
    
    if (idxNoRek === -1 || idxStatus === -1) {
      return { success: false, error: 'Kolom No Rekening atau Status tidak ditemukan di Sheet SISWA' };
    }
    
    const noRekLulus = [];
    const rowsToDeleteSiswa = [];
    
    // Cari baris siswa yang LULUS (loop dari bawah ke atas agar index tidak bergeser saat dihapus)
    for (let i = dataSiswa.length - 1; i > 0; i--) {
      const status = String(dataSiswa[i][idxStatus] || '').trim().toUpperCase();
      if (status === 'LULUS') {
        noRekLulus.push(String(dataSiswa[i][idxNoRek]));
        rowsToDeleteSiswa.push(i + 1); // +1 karena index array mulai dari 0, sedangkan baris sheet mulai dari 1
      }
    }
    
    if (noRekLulus.length === 0) {
      return { success: true, message: 'Tidak ada siswa dengan status LULUS' };
    }
    
    // 1. Hapus data dari Sheet Siswa
    rowsToDeleteSiswa.forEach(row => {
      sheetSiswa.deleteRow(row);
    });
    
    // 2. Hapus riwayat transaksi mereka dari Sheet Transaksi Siswa
    const dataTrx = sheetTrx.getDataRange().getValues();
    const headersTrx = dataTrx[0];
    const idxNoRekTrx = headersTrx.indexOf('No Rekening');
    
    if (idxNoRekTrx !== -1) {
      const rowsToDeleteTrx = [];
      for (let i = dataTrx.length - 1; i > 0; i--) {
        const noRek = String(dataTrx[i][idxNoRekTrx]);
        if (noRekLulus.includes(noRek)) {
          rowsToDeleteTrx.push(i + 1);
        }
      }
      
      // Hapus baris transaksi (dari bawah ke atas)
      rowsToDeleteTrx.forEach(row => {
        sheetTrx.deleteRow(row);
      });
    }
    
    return { 
      success: true, 
      message: `Berhasil menghapus ${noRekLulus.length} siswa lulus beserta seluruh riwayat transaksinya.` 
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

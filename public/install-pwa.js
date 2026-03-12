let deferredPrompt;
const POPUP_ID = 'pwa-install-popup';
const LATER_KEY = 'simpiraLaterTimestamp';
const INSTALLED_KEY = 'simpiraInstalled';

// Detect iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired');
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  
  // Logic to show popup
  initInstallPopup();
});

// For iOS or browsers that don't fire beforeinstallprompt immediately
window.addEventListener('load', () => {
  if (isIOS && !isStandalone) {
    console.log('iOS detected, showing manual install instructions');
    initInstallPopup();
  }
});

function initInstallPopup() {
  const isInstalled = localStorage.getItem(INSTALLED_KEY) === 'true';
  const laterTimestamp = localStorage.getItem(LATER_KEY);
  const now = Date.now();
  
  // Check if 24 hours have passed since "Nanti Saja"
  const isCooldownOver = !laterTimestamp || (now - parseInt(laterTimestamp)) > (24 * 60 * 60 * 1000);

  console.log('PWA Status:', { isInstalled, isStandalone, isCooldownOver, isIOS });

  if (!isInstalled && !isStandalone && isCooldownOver) {
    showPopup();
  }
}

function showPopup() {
  const popup = document.getElementById(POPUP_ID);
  if (!popup) return;

  // If iOS, change the text to manual instructions
  if (isIOS) {
    const desc = popup.querySelector('p');
    if (desc) {
      desc.innerHTML = 'Ketuk ikon <span class="font-bold">Bagikan</span> lalu pilih <span class="font-bold">Tambah ke Layar Utama</span> untuk menginstal.';
    }
    const installBtn = popup.querySelector('button[onclick="pwaInstall()"]');
    if (installBtn) {
      installBtn.innerHTML = 'Mengerti';
      installBtn.onclick = handleLater; // Just hide it
    }
  }

  // Show popup with animation
  popup.classList.remove('hidden');
  popup.classList.add('flex');
  
  console.log('PWA Install Popup shown');
}

function hidePopup() {
  const popup = document.getElementById(POPUP_ID);
  if (popup) {
    popup.classList.add('opacity-0');
    setTimeout(() => {
      popup.classList.add('hidden');
      popup.classList.remove('opacity-0');
    }, 500);
  }
}

function handleInstall() {
  if (!deferredPrompt) {
    console.log('No deferredPrompt available');
    return;
  }
  
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      localStorage.setItem(INSTALLED_KEY, 'true');
    }
    deferredPrompt = null;
    hidePopup();
  });
}

function handleLater() {
  localStorage.setItem(LATER_KEY, Date.now().toString());
  hidePopup();
}

window.addEventListener('appinstalled', (evt) => {
  localStorage.setItem(INSTALLED_KEY, 'true');
  console.log('SIMPIRA was installed');
});

// Global functions for HTML buttons
window.pwaInstall = handleInstall;
window.pwaLater = handleLater;

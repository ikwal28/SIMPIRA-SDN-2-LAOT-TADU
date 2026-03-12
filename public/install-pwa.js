let deferredPrompt;
const POPUP_ID = 'pwa-install-popup';
const LATER_KEY = 'simpiraLaterTimestamp';
const INSTALLED_KEY = 'simpiraInstalled';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  
  // Logic to show popup
  initInstallPopup();
});

function initInstallPopup() {
  const isInstalled = localStorage.getItem(INSTALLED_KEY) === 'true';
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const laterTimestamp = localStorage.getItem(LATER_KEY);
  const now = Date.now();
  
  // Check if 24 hours have passed since "Nanti Saja"
  const isCooldownOver = !laterTimestamp || (now - parseInt(laterTimestamp)) > (24 * 60 * 60 * 1000);

  if (!isInstalled && !isStandalone && isCooldownOver) {
    showPopup();
  }
}

function showPopup() {
  const popup = document.getElementById(POPUP_ID);
  if (!popup) return;

  // Show popup with animation
  popup.classList.remove('hidden');
  popup.classList.add('flex');
  
  // Auto-hide after 15 seconds
  setTimeout(() => {
    hidePopup();
  }, 15000);
}

function hidePopup() {
  const popup = document.getElementById(POPUP_ID);
  if (popup) {
    popup.classList.add('translate-y-full');
    popup.classList.add('opacity-0');
    setTimeout(() => {
      popup.classList.add('hidden');
      popup.classList.remove('translate-y-full');
      popup.classList.remove('opacity-0');
    }, 500);
  }
}

function handleInstall() {
  if (!deferredPrompt) return;
  
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

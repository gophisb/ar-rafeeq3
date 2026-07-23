iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
const getChats = () => JSON.parse(localStorage.getItem('chats')) || []; const saveChat = (c) => localStorage.setItem('chats', JSON.stringify([...getChats(), c]));
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; document.dispatchEvent(new CustomEvent('can-install')); });
async function installApp() { if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; deferredPrompt = null; return outcome; } if (isIOS()) { alert('💡 للايفون: اضغط زر "مشاركة" ثم "إضافة للشاشة الرئيسية"'); return 'ios-manual'; } alert('💡 للاندرويد: اضغط (⋮) ثم "إضافة للشاشة الرئيسية"'); return 'android-manual'; }
window.addEventListener('appinstalled', () => { deferredPrompt = null; console.log('✅ تم التثبيت بنجاح'); });
export { installApp, getChats, saveChat };

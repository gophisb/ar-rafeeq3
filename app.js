window.appState = { deferredPrompt: null, isIOS: () => /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream };
window.getChats = function() { try { return JSON.parse(localStorage.getItem('chats')) || []; } catch(e) { return []; } };
window.saveChat = function(c) { try { localStorage.setItem('chats', JSON.stringify([...window.getChats(), c])); } catch(e) { console.error(e); } };
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.appState.deferredPrompt = e; document.dispatchEvent(new CustomEvent('can-install')); });
window.installApp = async function() { 
    let p = window.appState.deferredPrompt; if (p) { p.prompt(); const { outcome } = await p.userChoice; window.appState.deferredPrompt = null; return outcome; }
    if (window.appState.isIOS()) { alert('💡 للايفون: اضغط زر "مشاركة" ثم "إضافة للشاشة الرئيسية"'); return 'ios-manual'; }
    alert('💡 للاندرويد: اضغط (⋮) ثم "إضافة للشاشة الرئيسية"'); return 'android-manual'; 
};
window.addEventListener('appinstalled', () => { window.appState.deferredPrompt = null; console.log('✅ تم التثبيت بنجاح'); });
console.log('🚀 app.js يعمل الآن بأمان دون تداخل مع بقية الميزات');


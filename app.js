
window.AppBridge = { events: {}, on(e, c) { (this.events[e] = this.events[e] || []).push(c); }, emit(e, d) { if (this.events[e]) this.events[e].forEach(c => { try { c(d); } catch(x) { console.error(x); } }); } };
window.appState = { deferredPrompt: null, currentState: null };
window.addEventListener('error', (e) => { console.warn(`⚠️ خطأ معزول تم امتصاصه بنجاح: ${e.message}`); e.preventDefault(); return true; });
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.appState.deferredPrompt = e; window.AppBridge.emit('app-can-install'); });
window.installApp = async function() { 
    let p = window.appState.deferredPrompt; if (!p) return 'not-ready';
    try { p.prompt(); const { outcome } = await p.userChoice; window.appState.deferredPrompt = null; window.AppBridge.emit('app-installed-success'); return outcome; } 
    catch(err) { console.error(err); return 'failed'; }
};
window.addEventListener('appinstalled', () => { window.appState.deferredPrompt = null; window.AppBridge.emit('app-installed-success'); });
console.log('🚀 app.js الدقيق جاهز ويعمل بنظام الاتصال الآمن والمستقر');
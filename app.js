 
// ========================================================
// 1. إعداد وإنشاء واجهة الأزرار برمجياً داخل الصفحة
// ========================================================
const container = document.createElement('div');
container.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; gap:10px; align-items:center; z-index:9999; width:90%; max-width:350px;';

// زر الانتقال للمحادثة المعتاد
const chatBtn = document.createElement('button');
chatBtn.textContent = '💬 فتح محادثة الرفيق';
chatBtn.style.cssText = 'width:100%; padding:14px; background:#2196F3; color:#fff; border:none; border-radius:12px; font-size:16px; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.1); cursor:pointer;';
chatBtn.addEventListener('click', () => {
    window.location.href = 'https://rafeeq.ai';
});

// زر التثبيت الذكي على الشاشة الرئيسية
const installBtn = document.createElement('button');
installBtn.textContent = '📲 تثبيت الأيقونة على الهاتف';
installBtn.style.cssText = 'width:100%; padding:14px; background:#4CAF50; color:#fff; border:none; border-radius:12px; font-size:16px; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.1); cursor:pointer;';

// دمج الأزرار داخل الحاوية وإضافتها للموقع
container.appendChild(chatBtn);
container.appendChild(installBtn);
document.body.appendChild(container);

// ========================================================
// 2. إدارة عملية التثبيت وتخطي قيود الـ Service Worker
// ========================================================
let deferredPrompt;

// التقاط حدث التثبيت التلقائي إن وُجد
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

// تشغيل ميزة التثبيت عند الضغط على الزر الأخضر
installBtn.addEventListener('click', async () => {
    // إذا كان المتصفح يسمح بالتثبيت المباشر
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('تم التثبيت بنجاح');
            installBtn.style.display = 'none';
        }
        deferredPrompt = null;
    } 
    // الحل البديل والذكي لتفادي مشكلة الرفع على سيرفر
    else {
        const confirmGuide = confirm(
            "نظام الأندرويد يحجب التثبيت التلقائي للملفات المحلية.\n\n" +
            "هل تريد إظهار طريقة التثبيت اليدوية الفورية؟"
        );
        if (confirmGuide) {
            alert("💡 الطريقة السريعة:\n\nاضغط الآن على زر الخيارات (⋮) أعلى أو أسفل المتصفح، ثم اختر 'الإضافة إلى الشاشة الرئيسية' (Add to Home screen).");
        }
    }
});

// إخفاء زر التثبيت تلقائياً إذا تمت العملية بنجاح
window.addEventListener('appinstalled', () => {
    installBtn.style.display = 'none';
    alert('🎉 تم إضافة الأيقونة بنجاح إلى شاشتك الرئيسية!');
});

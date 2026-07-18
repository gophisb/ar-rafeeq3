// الملف البرمجي الأساسي - الرفيق
document.addEventListener('DOMContentLoaded', () => {
    console.log("الرفيق يعمل بنجاح!");
    
    // هنا سنقوم لاحقاً بإضافة دالة تحديث الوقت 
    // وجلب بيانات الصلاة من واجهة برمجة التطبيقات (API)
});

// تفعيل العمل بدون إنترنت (PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Service Worker تم تسجيله بنجاح'))
        .catch((err) => console.log('فشل تسجيل الخدمة:', err));
}

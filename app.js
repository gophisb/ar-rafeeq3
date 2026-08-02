/* ============================================================
   الرفيق — theme.js
   الإصدار: 1.0.0
   نظام الوضع الليلي والنهاري
   - حفظ الوضع في LocalStorage
   - استعادة الوضع عند فتح التطبيق
   - يعمل بدون إنترنت
   - متوافق مع index.html الحالي
   ============================================================ */

'use strict';

const THEME_STORAGE_KEY = 'rafeeq_theme';

function applyTheme(theme) {
    const body = document.body;
    if (!body) return;

    if (theme === 'day') {
        body.classList.add('day-mode');
    } else {
        body.classList.remove('day-mode');
    }

    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        console.warn('تعذر حفظ إعدادات الوضع:', error);
    }

    if (window.AppBridge && typeof window.AppBridge.emit === 'function') {
        window.AppBridge.emit('theme-changed', theme);
    }
}

function getSavedTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'day' || savedTheme === 'night') {
            return savedTheme;
        }
    } catch (error) {
        console.warn('تعذر قراءة الوضع المحفوظ:', error);
    }
    return 'night';
}

function toggleTheme() {
    const body = document.body;
    if (!body) return;

    const isDay = body.classList.contains('day-mode');
    if (isDay) {
        applyTheme('night');
    } else {
        applyTheme('day');
    }
}

window.RafeeqTheme = {
    apply: applyTheme,
    toggle: toggleTheme,
    get: getSavedTheme
};

function initializeTheme() {
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
    console.log('🎨 الرفيق — الوضع الحالي:', savedTheme);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
    initializeTheme();
}

console.log('🚀 الرفيق — theme.js يعمل بنجاح');
// ============================================================
// الرفيق — app.js
// ============================================================

(function () {
    'use strict';

    // التحقق من وجود الوضع المظلم المخزن
    const savedTheme = localStorage.getItem('rafeeq-theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // إضافة زر تبديل الوضع المظلم
    const header = document.querySelector('.app-header');
    if (header) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle';
        toggleBtn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
        toggleBtn.setAttribute('aria-label', 'تبديل الوضع المظلم');
        toggleBtn.addEventListener('click', function () {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('rafeeq-theme', 'light');
                toggleBtn.textContent = '🌙';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('rafeeq-theme', 'dark');
                toggleBtn.textContent = '☀️';
            }
        });
        header.appendChild(toggleBtn);
    }

    console.log('🕌 الرفيق — جاهز');
})();

// theme.js - التحكم في الوضع النهاري/الليلي للتطبيق

(function() {
    'use strict';

    // ------------------------------------------------
    // 1. الثوابت
    // ------------------------------------------------

    const STORAGE_KEY = 'theme-preference';
    const DAY_CLASS = 'day-mode';

    // ------------------------------------------------
    // 2. عناصر DOM
    // ------------------------------------------------

    const body = document.body;

    // أيقونة الشمس/القمر في الشريط العلوي (آخر SVG في .topbar)
    const themeToggle = document.querySelector('.topbar svg:last-child');

    // ------------------------------------------------
    // 3. دوال التحكم في الموضوع
    // ------------------------------------------------

    /**
     * الحصول على الموضوع المفضل من التخزين المحلي أو تفضيل النظام
     * @returns {string} 'day' أو 'night'
     */
    function getPreferredTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'day') return 'day';
        if (saved === 'night') return 'night';
        // في حالة عدم وجود تفضيل محفوظ، نستخدم تفضيل النظام
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'day' : 'night';
    }

    /**
     * تطبيق الموضوع المحدد على الصفحة
     * @param {string} theme 'day' أو 'night'
     */
    function applyTheme(theme) {
        if (theme === 'day') {
            body.classList.add(DAY_CLASS);
        } else {
            body.classList.remove(DAY_CLASS);
        }
        localStorage.setItem(STORAGE_KEY, theme);

        // تحديث شكل الأيقونة حسب الوضع (اختياري)
        updateToggleIcon(theme);
    }

    /**
     * تبديل الموضوع بين النهاري والليلي
     */
    function toggleTheme() {
        const isDay = body.classList.contains(DAY_CLASS);
        applyTheme(isDay ? 'night' : 'day');
    }

    /**
     * تحديث أيقونة التبديل (شكل الشمس/القمر)
     * @param {string} theme
     */
    function updateToggleIcon(theme) {
        if (!themeToggle) return;
        // يمكن تغيير محتوى SVG حسب الوضع
        // لكننا سنكتفي بتغيير لونها أو إضافة تأثير بسيط
        // في هذا التطبيق، الأيقونة ثابتة ولكن يمكننا تغيير fill أو stroke
        const isDay = theme === 'day';
        // نغير لون الأيقونة قليلاً للإشارة
        const svgPaths = themeToggle.querySelectorAll('path, circle, line');
        svgPaths.forEach(el => {
            if (el.tagName === 'circle' && el.getAttribute('fill') === 'var(--gold)') {
                // دائرة الشمس يمكن تغيير لونها
                el.setAttribute('fill', isDay ? '#FDB813' : 'var(--gold)');
            }
        });
    }

    // ------------------------------------------------
    // 4. تهيئة التطبيق
    // ------------------------------------------------

    function init() {
        // تطبيق الموضوع المحفوظ أو تفضيل النظام
        const theme = getPreferredTheme();
        applyTheme(theme);

        // إضافة مستمع للزر إذا كان موجوداً
        if (themeToggle) {
            themeToggle.style.cursor = 'pointer';
            themeToggle.setAttribute('aria-label', 'تبديل المظهر (نهار/ليل)');
            themeToggle.addEventListener('click', toggleTheme);
        } else {
            console.warn('⚠️ لم يتم العثور على زر تبديل المظهر في الشريط العلوي');
        }

        // الاستماع لتغير تفضيل النظام أثناء تشغيل التطبيق
        // (فقط إذا لم يكن المستخدم قد حفظ تفضيلاً يدوياً)
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                // إذا لم يكن هناك تفضيل محفوظ، نتبع النظام
                applyTheme(e.matches ? 'day' : 'night');
            }
        });

        console.log('🎨 theme.js تم تهيئته بنجاح');
    }

    // ------------------------------------------------
    // 5. التشغيل عند تحميل DOM
    // ------------------------------------------------

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
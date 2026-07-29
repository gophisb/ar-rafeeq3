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


/* ============================================================
   1) إعدادات الوضع
   ============================================================ */

const THEME_STORAGE_KEY = 'rafeeq_theme';


/* ============================================================
   2) تطبيق الوضع على الصفحة
   ============================================================ */

function applyTheme(theme) {

    const body = document.body;

    if (!body) {
        return;
    }


    if (theme === 'day') {

        body.classList.add('day-mode');

    } else {

        body.classList.remove('day-mode');

    }


    // حفظ الوضع
    try {

        localStorage.setItem(
            THEME_STORAGE_KEY,
            theme
        );

    } catch (error) {

        console.warn(
            'تعذر حفظ إعدادات الوضع:',
            error
        );

    }


    // إرسال الحدث لباقي التطبيق
    if (
        window.AppBridge &&
        typeof window.AppBridge.emit === 'function'
    ) {

        window.AppBridge.emit(
            'theme-changed',
            theme
        );

    }

}


/* ============================================================
   3) قراءة الوضع المحفوظ
   ============================================================ */

function getSavedTheme() {

    try {

        const savedTheme =
            localStorage.getItem(
                THEME_STORAGE_KEY
            );


        if (
            savedTheme === 'day' ||
            savedTheme === 'night'
        ) {

            return savedTheme;

        }

    } catch (error) {

        console.warn(
            'تعذر قراءة الوضع المحفوظ:',
            error
        );

    }


    // الوضع الافتراضي
    return 'night';

}


/* ============================================================
   4) تبديل الوضع
   ============================================================ */

function toggleTheme() {

    const body =
        document.body;


    if (!body) {
        return;
    }


    const isDay =
        body.classList.contains(
            'day-mode'
        );


    if (isDay) {

        applyTheme('night');

    } else {

        applyTheme('day');

    }

}


/* ============================================================
   5) جعل الوظائف متاحة للتطبيق
   ============================================================ */

window.RafeeqTheme = {

    apply: applyTheme,

    toggle: toggleTheme,

    get: getSavedTheme

};


/* ============================================================
   6) تشغيل الوضع مبكرًا
   ============================================================ */

function initializeTheme() {

    const savedTheme =
        getSavedTheme();


    applyTheme(
        savedTheme
    );


    console.log(
        '🎨 الرفيق — الوضع الحالي:',
        savedTheme
    );

}


/* ============================================================
   7) تشغيل عند جاهزية الصفحة
   ============================================================ */

if (
    document.readyState ===
    'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        initializeTheme
    );

} else {

    initializeTheme();

}


/* ============================================================
   8) دعم زر تغيير الوضع
   ============================================================ */

/*
   يمكن لأي زر في التطبيق استدعاء:

   RafeeqTheme.toggle();

   مثال:

   <button onclick="RafeeqTheme.toggle()">
       تغيير الوضع
   </button>

*/


/* ============================================================
   نهاية theme.js
   ============================================================ */

console.log(
    '🚀 الرفيق — theme.js يعمل بنجاح'
);/* ============================================================
   الرفيق — theme.js
   الإصدار: 1.0.0

   نظام الوضع الليلي والنهاري
   - حفظ الوضع في LocalStorage
   - استعادة الوضع عند فتح التطبيق
   - يعمل بدون إنترنت
   - متوافق مع index.html الحالي
   ============================================================ */

'use strict';


/* ============================================================
   1) إعدادات الوضع
   ============================================================ */

const THEME_STORAGE_KEY = 'rafeeq_theme';


/* ============================================================
   2) تطبيق الوضع على الصفحة
   ============================================================ */

function applyTheme(theme) {

    const body = document.body;

    if (!body) {
        return;
    }


    if (theme === 'day') {

        body.classList.add('day-mode');

    } else {

        body.classList.remove('day-mode');

    }


    // حفظ الوضع
    try {

        localStorage.setItem(
            THEME_STORAGE_KEY,
            theme
        );

    } catch (error) {

        console.warn(
            'تعذر حفظ إعدادات الوضع:',
            error
        );

    }


    // إرسال الحدث لباقي التطبيق
    if (
        window.AppBridge &&
        typeof window.AppBridge.emit === 'function'
    ) {

        window.AppBridge.emit(
            'theme-changed',
            theme
        );

    }

}


/* ============================================================
   3) قراءة الوضع المحفوظ
   ============================================================ */

function getSavedTheme() {

    try {

        const savedTheme =
            localStorage.getItem(
                THEME_STORAGE_KEY
            );


        if (
            savedTheme === 'day' ||
            savedTheme === 'night'
        ) {

            return savedTheme;

        }

    } catch (error) {

        console.warn(
            'تعذر قراءة الوضع المحفوظ:',
            error
        );

    }


    // الوضع الافتراضي
    return 'night';

}


/* ============================================================
   4) تبديل الوضع
   ============================================================ */

function toggleTheme() {

    const body =
        document.body;


    if (!body) {
        return;
    }


    const isDay =
        body.classList.contains(
            'day-mode'
        );


    if (isDay) {

        applyTheme('night');

    } else {

        applyTheme('day');

    }

}


/* ============================================================
   5) جعل الوظائف متاحة للتطبيق
   ============================================================ */

window.RafeeqTheme = {

    apply: applyTheme,

    toggle: toggleTheme,

    get: getSavedTheme

};


/* ============================================================
   6) تشغيل الوضع مبكرًا
   ============================================================ */

function initializeTheme() {

    const savedTheme =
        getSavedTheme();


    applyTheme(
        savedTheme
    );


    console.log(
        '🎨 الرفيق — الوضع الحالي:',
        savedTheme
    );

}


/* ============================================================
   7) تشغيل عند جاهزية الصفحة
   ============================================================ */

if (
    document.readyState ===
    'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        initializeTheme
    );

} else {

    initializeTheme();

}


/* ============================================================
   8) دعم زر تغيير الوضع
   ============================================================ */

/*
   يمكن لأي زر في التطبيق استدعاء:

   RafeeqTheme.toggle();

   مثال:

   <button onclick="RafeeqTheme.toggle()">
       تغيير الوضع
   </button>

*/


/* ============================================================
   نهاية theme.js
   ============================================================ */

console.log(
    '🚀 الرفيق — theme.js يعمل بنجاح'
);
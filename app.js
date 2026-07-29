/* ============================================================
   الرفيق — app.js
   الإصدار: 2.0.0

   النظام الرئيسي للتطبيق

   الوظائف:
   - مواقيت الصلاة
   - اختيار الولاية / المدينة
   - التاريخ الهجري
   - التاريخ الميلادي
   - العد التنازلي للصلاة القادمة
   - الأذان اليدوي
   - التخزين المحلي
   - العمل بدون إنترنت عند توفر البيانات المحفوظة
   - PWA
   - تسجيل Service Worker
   - دعم التثبيت
   - AppBridge
   ============================================================ */

'use strict';


/* ============================================================
   1) AppBridge
   نظام اتصال داخلي بين أجزاء التطبيق
   ============================================================ */

window.AppBridge = window.AppBridge || {

    events: {},

    on(event, callback) {

        if (
            !this.events[event]
        ) {

            this.events[event] = [];

        }

        this.events[event].push(
            callback
        );

    },


    emit(event, data) {

        if (
            !this.events[event]
        ) {

            return;

        }


        this.events[event].forEach(

            callback => {

                try {

                    callback(data);

                } catch (error) {

                    console.error(
                        '❌ AppBridge Error:',
                        error
                    );

                }

            }

        );

    }

};


/* ============================================================
   2) حالة التطبيق
   ============================================================ */

window.appState = {

    deferredPrompt: null,

    currentCity:
        localStorage.getItem(
            'rafeeq_city'
        ) || 'Algiers',

    prayerData: null,

    prayerDate: null,

    nextPrayer: null,

    countdownTimer: null,

    clockTimer: null

};


/* ============================================================
   3) المدن والولايات الجزائرية
   ============================================================ */

const CITIES = [

    { name: 'الجزائر', api: 'Algiers' },

    { name: 'وهران', api: 'Oran' },

    { name: 'قسنطينة', api: 'Constantine' },

    { name: 'عنابة', api: 'Annaba' },

    { name: 'البليدة', api: 'Blida' },

    { name: 'سطيف', api: 'Setif' },

    { name: 'باتنة', api: 'Batna' },

    { name: 'بسكرة', api: 'Biskra' },

    { name: 'تلمسان', api: 'Tlemcen' },

    { name: 'بجاية', api: 'Bejaia' },

    { name: 'تيزي وزو', api: 'Tizi-Ouzou' },

    { name: 'جيجل', api: 'Jijel' },

    { name: 'سكيكدة', api: 'Skikda' },

    { name: 'قالمة', api: 'Guelma' },

    { name: 'سعيدة', api: 'Saida' },

    {
        name: 'سيدي بلعباس',
        api: 'Sidi Bel Abbes'
    },

    {
        name: 'مستغانم',
        api: 'Mostaganem'
    },

    { name: 'الشلف', api: 'Chlef' },

    { name: 'البويرة', api: 'Bouira' },

    {
        name: 'برج بوعريريج',
        api: 'Bordj Bou Arreridj'
    },

    { name: 'تبسة', api: 'Tebessa' },

    { name: 'خنشلة', api: 'Khenchela' },

    {
        name: 'أم البواقي',
        api: 'Oum El Bouaghi'
    },

    { name: 'ميلة', api: 'Mila' },

    { name: 'المدية', api: 'Medea' },

    {
        name: 'عين الدفلى',
        api: 'Ain Defla'
    },

    { name: 'تيبازة', api: 'Tipaza' },

    { name: 'بومرداس', api: 'Boumerdes' },

    { name: 'الوادي', api: 'El Oued' },

    { name: 'ورقلة', api: 'Ouargla' },

    { name: 'غرداية', api: 'Ghardaia' },

    { name: 'أدرار', api: 'Adrar' },

    { name: 'بشار', api: 'Bechar' },

    {
        name: 'تمنراست',
        api: 'Tamanrasset'
    },

    { name: 'إليزي', api: 'Illizi' },

    { name: 'تندوف', api: 'Tindouf' },

    { name: 'البيض', api: 'El Bayadh' },

    { name: 'النعامة', api: 'Naama' },

    {
        name: 'تيسمسيلت',
        api: 'Tissemsilt'
    },

    { name: 'الجلفة', api: 'Djelfa' },

    { name: 'الأغواط', api: 'Laghouat' },

    {
        name: 'عين تموشنت',
        api: 'Ain Temouchent'
    },

    { name: 'تيارت', api: 'Tiaret' },

    {
        name: 'سوق أهراس',
        api: 'Souk Ahras'
    },

    { name: 'الطارف', api: 'El Tarf' },

    {
        name: 'عين قزام',
        api: 'In Guezzam'
    },

    {
        name: 'برج باجي مختار',
        api: 'Bordj Badji Mokhtar'
    },

    {
        name: 'بني عباس',
        api: 'Beni Abbes'
    },

    {
        name: 'تيميمون',
        api: 'Timimoun'
    },

    {
        name: 'تقرت',
        api: 'Touggourt'
    },

    {
        name: 'المغير',
        api: 'El Mghair'
    },

    {
        name: 'المنيعة',
        api: 'El Meniaa'
    }

];


/* ============================================================
   4) أسماء الصلوات
   ============================================================ */

const PRAYER_NAMES = {

    Fajr: 'الفجر',

    Dhuhr: 'الظهر',

    Asr: 'العصر',

    Maghrib: 'المغرب',

    Isha: 'العشاء'

};


/* ============================================================
   5) تحويل الوقت إلى دقائق
   ============================================================ */

function timeToMinutes(time) {

    if (!time) {

        return null;

    }


    const clean =
        String(time)
            .replace(/[^\d:]/g, '');


    const parts =
        clean.split(':');


    if (
        parts.length < 2
    ) {

        return null;

    }


    const hours =
        Number(
            parts[0]
        );


    const minutes =
        Number(
            parts[1]
        );


    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {

        return null;

    }


    return (
        hours * 60 +
        minutes
    );

}


/* ============================================================
   6) تنظيف وقت API
   ============================================================ */

function cleanPrayerTime(time) {

    if (!time) {

        return '';

    }


    return String(time)

        .replace(
            /\s*\([^)]*\)/g,
            ''
        )

        .trim();

}


/* ============================================================
   7) الحصول على التاريخ الميلادي
   ============================================================ */

function getGregorianDate() {

    const now =
        new Date();


    try {

        return new Intl.DateTimeFormat(

            'ar-DZ',

            {

                weekday: 'long',

                year: 'numeric',

                month: 'long',

                day: 'numeric'

            }

        ).format(now);

    } catch (error) {

        return now.toLocaleDateString(
            'ar-DZ'
        );

    }

}


/* ============================================================
   8) الحصول على التاريخ الهجري
   ============================================================ */

function getHijriDate() {

    const now =
        new Date();


    try {

        return new Intl.DateTimeFormat(

            'ar-SA-u-ca-islamic-umalqura',

            {

                day: 'numeric',

                month: 'long',

                year: 'numeric'

            }

        ).format(now);

    } catch (error) {

        console.warn(

            '⚠️ تعذر حساب التاريخ الهجري:',

            error

        );


        /*
           بديل تقريبي عند عدم دعم
           المتصفح للتقويم الهجري
        */

        try {

            return new Intl.DateTimeFormat(

                'ar-SA-u-ca-islamic',

                {

                    day: 'numeric',

                    month: 'long',

                    year: 'numeric'

                }

            ).format(now);

        } catch (fallbackError) {

            return 'التاريخ الهجري غير متاح';

        }

    }

}


/* ============================================================
   9) عرض التاريخ الهجري والميلادي
   ============================================================ */

function updateDates() {

    const hijriElement =
        document.getElementById(
            'hijriPill'
        );


    if (!hijriElement) {

        console.warn(
            '⚠️ عنصر hijriPill غير موجود'
        );

        return;

    }


    const hijri =
        getHijriDate();


    const gregorian =
        getGregorianDate();


    hijriElement.innerHTML =

        '📅 ' +

        hijri +

        '<br>' +

        '<small>' +

        gregorian +

        '</small>';

}


/* ============================================================
   10) إعداد قائمة المدن
   ============================================================ */

function setupCitySelect() {

    const select =
        document.getElementById(
            'citySelect'
        );


    if (!select) {

        console.warn(
            '⚠️ عنصر citySelect غير موجود'
        );

        return;

    }


    select.innerHTML = '';


    CITIES.forEach(

        city => {

            const option =
                document.createElement(
                    'option'
                );


            option.value =
                city.api;


            option.textContent =
                city.name;


            if (
                city.api ===
                window.appState.currentCity
            ) {

                option.selected =
                    true;

            }


            select.appendChild(
                option
            );

        }

    );


    select.addEventListener(

        'change',

        async function () {

            window.appState.currentCity =
                this.value;


            localStorage.setItem(

                'rafeeq_city',

                this.value

            );


            /*
               عند تغيير الولاية:
               نحذف بيانات الولاية القديمة
               حتى لا نعرض مواقيت خاطئة.
            */

            window.appState.prayerData =
                null;


            await loadPrayerTimes();

        }

    );

}


/* ============================================================
   11) جلب مواقيت الصلاة من AlAdhan
   ============================================================ */

async function fetchPrayerTimes(city) {

    const today =
        new Date();


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            '0'
        );


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            '0'
        );


    const year =
        today.getFullYear();


    const url =

        'https://api.aladhan.com/v1/timingsByCity/' +

        day +

        '-' +

        month +

        '-' +

        year +

        '?city=' +

        encodeURIComponent(
            city
        ) +

        '&country=Algeria' +

        '&method=3';


    const response =
        await fetch(
            url
        );


    if (
        !response.ok
    ) {

        throw new Error(

            'HTTP Error ' +

            response.status

        );

    }


    const json =
        await response.json();


    if (
        !json.data ||
        !json.data.timings
    ) {

        throw new Error(

            'بيانات مواقيت الصلاة غير صحيحة'

        );

    }


    return json.data;

}


/* ============================================================
   12) حفظ مواقيت الصلاة
   ============================================================ */

function savePrayerData(data) {

    try {

        const today =
            new Date();


        const cache = {

            date:

                today
                    .toISOString()
                    .slice(
                        0,
                        10
                    ),

            city:

                window.appState
                    .currentCity,

            data:

                data

        };


        localStorage.setItem(

            'rafeeq_prayer_cache',

            JSON.stringify(
                cache
            )

        );

    } catch (error) {

        console.warn(

            '⚠️ تعذر حفظ مواقيت الصلاة:',

            error

        );

    }

}


/* ============================================================
   13) قراءة البيانات المحفوظة
   ============================================================ */

function getCachedPrayerData() {

    try {

        const saved =
            localStorage.getItem(

                'rafeeq_prayer_cache'

            );


        if (!saved) {

            return null;

        }


        const cache =
            JSON.parse(
                saved
            );


        if (
            !cache ||
            !cache.data
        ) {

            return null;

        }


        if (
            cache.city !==
            window.appState.currentCity
        ) {

            return null;

        }


        return cache.data;

    } catch (error) {

        console.warn(

            '⚠️ خطأ في قراءة البيانات المحلية:',

            error

        );


        return null;

    }

}


/* ============================================================
   14) تحميل مواقيت الصلاة
   ============================================================ */

async function loadPrayerTimes() {

    const status =
        document.getElementById(
            'status'
        );


    const prayerCard =
        document.getElementById(
            'prayerCard'
        );


    if (status) {

        status.hidden =
            false;


        status.textContent =

            'جاري تحميل مواقيت الصلاة...';

    }


    try {

        const data =
            await fetchPrayerTimes(

                window.appState
                    .currentCity

            );


        window.appState.prayerData =
            data;


        window.appState.prayerDate =
            new Date();


        savePrayerData(
            data
        );


        if (status) {

            status.hidden =
                true;

        }


        if (prayerCard) {

            prayerCard.hidden =
                false;

        }


        updatePrayerDisplay();


        console.log(

            '✅ تم تحميل مواقيت الصلاة من الإنترنت'

        );

    } catch (error) {

        console.error(

            '❌ فشل تحميل مواقيت الصلاة:',

            error

        );


        /*
           محاولة استخدام النسخة المحفوظة
        */

        const cached =
            getCachedPrayerData();


        if (cached) {

            window.appState.prayerData =
                cached;


            if (status) {

                status.hidden =
                    true;

            }


            if (prayerCard) {

                prayerCard.hidden =
                    false;

            }


            updatePrayerDisplay();


            console.log(

                '📴 تم استخدام مواقيت الصلاة المحفوظة محليًا'

            );

        } else {

            if (status) {

                status.hidden =
                    false;


                status.textContent =

                    'تعذر تحميل مواقيت الصلاة. افتح التطبيق مع الإنترنت مرة واحدة لحفظ المواقيت.';

            }

        }

    }

}


/* ============================================================
   15) تحديد الصلاة القادمة
   ============================================================ */

function getNextPrayer() {

    const data =
        window.appState
            .prayerData;


    if (!data) {

        return null;

    }


    const prayerKeys = [

        'Fajr',

        'Dhuhr',

        'Asr',

        'Maghrib',

        'Isha'

    ];


    const now =
        new Date();


    const currentMinutes =

        now.getHours() * 60 +

        now.getMinutes();


    for (
        const key of prayerKeys
    ) {

        const time =
            cleanPrayerTime(

                data.timings[key]

            );


        const minutes =
            timeToMinutes(
                time
            );


        if (

            minutes !== null &&

            minutes >

                currentMinutes

        ) {

            return {

                key:

                    key,

                name:

                    PRAYER_NAMES[key],

                time:

                    time,

                minutes:

                    minutes,

                tomorrow:

                    false

            };

        }

    }


    /*
       إذا انتهت صلوات اليوم
       فالصلاة القادمة فجر الغد
    */

    const fajr =
        cleanPrayerTime(

            data.timings.Fajr

        );


    const fajrMinutes =
        timeToMinutes(
            fajr
        );


    return {

        key:

            'Fajr',

        name:

            'الفجر',

        time:

            fajr,

        minutes:

            fajrMinutes !== null

                ? fajrMinutes + 1440

                : 1440,

        tomorrow:

            true

    };

}


/* ============================================================
   16) تحديث الصلاة القادمة
   ============================================================ */

function updatePrayerDisplay() {

    const next =
        getNextPrayer();


    if (!next) {

        return;

    }


    window.appState.nextPrayer =
        next;


    const name =
        document.getElementById(
            'nextName'
        );


    const time =
        document.getElementById(
            'nextTime'
        );


    if (name) {

        name.textContent =
            next.name;

    }


    if (time) {

        time.textContent =
            next.time;

    }


    const adhanTimeLabel =
        document.getElementById(

            'adhanTimeLabel'

        );


    if (adhanTimeLabel) {

        adhanTimeLabel.textContent =

            next.name +

            ' — ' +

            next.time;

    }


    updateCountdown();

}


/* ============================================================
   17) حساب العد التنازلي
   ============================================================ */

function updateCountdown() {

    const countdown =
        document.getElementById(
            'countdown'
        );


    const progressBar =
        document.getElementById(
            'progressBar'
        );


    const next =
        window.appState
            .nextPrayer;


    if (
        !countdown ||
        !next
    ) {

        return;

    }


    const now =
        new Date();


    const target =
        new Date();


    let targetMinutes =
        next.minutes;


    /*
       إذا كانت الصلاة فجر الغد
       فإن minutes تحتوي على +1440
    */

    if (
        next.tomorrow &&
        targetMinutes < 1440
    ) {

        targetMinutes +=
            1440;

    }


    const targetHours =

        Math.floor(

            targetMinutes / 60

        ) % 24;


    const targetMins =

        targetMinutes % 60;


    target.setHours(

        targetHours,

        targetMins,

        0,

        0

    );


    /*
       إذا كان الهدف قد مر
       ننتقل إلى اليوم التالي
    */

    if (
        target <= now
    ) {

        target.setDate(

            target.getDate() + 1

        );

    }


    const difference =

        target.getTime() -

        now.getTime();


    if (
        difference <= 0
    ) {

        updatePrayerDisplay();

        return;

    }


    const totalSeconds =

        Math.floor(

            difference / 1000

        );


    const hours =

        Math.floor(

            totalSeconds / 3600

        );


    const minutes =

        Math.floor(

            (totalSeconds % 3600) / 60

        );


    const seconds =

        totalSeconds % 60;


    countdown.textContent =

        String(hours)

            .padStart(
                2,
                '0'
            ) +

        ':' +

        String(minutes)

            .padStart(
                2,
                '0'
            ) +

        ':' +

        String(seconds)

            .padStart(
                2,
                '0'
            );


    /*
       شريط التقدم الأساسي
       سيتم تطويره لاحقًا ليحسب
       نسبة الوقت بين الصلاتين
    */

    if (progressBar) {

        progressBar.style.width =
            '100%';

    }

}


/* ============================================================
   18) تشغيل الساعة والتاريخ
   ============================================================ */

function startClock() {

    if (
        window.appState
            .clockTimer
    ) {

        clearInterval(

            window.appState
                .clockTimer

        );

    }


    updateDates();


    window.appState.clockTimer =

        setInterval(

            () => {

                updateDates();

                updateCountdown();

            },

            1000

        );

}


/* ============================================================
   19) نظام الأذان اليدوي
   ============================================================ */

function setupAdhan() {

    const audio =
        document.getElementById(

            'adhanAudio'

        );


    const button =
        document.getElementById(

            'adhanPlayBtn'

        );


    const playIcon =
        document.getElementById(

            'playIcon'

        );


    const pauseIcon =
        document.getElementById(

            'pauseIcon'

        );


    if (
        !audio ||
        !button
    ) {

        console.warn(

            '⚠️ عناصر الأذان غير موجودة'

        );

        return;

    }


    button.addEventListener(

        'click',

        async () => {

            try {

                if (
                    audio.paused
                ) {

                    await audio.play();


                    if (playIcon) {

                        playIcon.style.display =

                            'none';

                    }


                    if (pauseIcon) {

                        pauseIcon.style.display =

                            'block';

                    }


                    console.log(

                        '🔊 بدأ تشغيل الأذان'

                    );

                } else {

                    audio.pause();


                    if (playIcon) {

                        playIcon.style.display =

                            'block';

                    }


                    if (pauseIcon) {

                        pauseIcon.style.display =

                            'none';

                    }


                    console.log(

                        '⏸️ تم إيقاف الأذان'

                    );

                }

            } catch (error) {

                console.error(

                    '❌ تعذر تشغيل الأذان:',

                    error

                );


                alert(

                    'تعذر تشغيل الأذان. تأكد من وجود ملف adhan.mp3 داخل مجلد التطبيق.'

                );

            }

        }

    );


    audio.addEventListener(

        'ended',

        () => {

            if (playIcon) {

                playIcon.style.display =

                    'block';

            }


            if (pauseIcon) {

                pauseIcon.style.display =

                    'none';

            }

        }

    );


    audio.addEventListener(

        'error',

        () => {

            console.error(

                '❌ خطأ في ملف adhan.mp3:',

                audio.error

            );

        }

    );

}


/* ============================================================
   20) PWA — التقاط طلب التثبيت
   ============================================================ */

window.addEventListener(

    'beforeinstallprompt',

    event => {

        event.preventDefault();


        window.appState.deferredPrompt =
            event;


        window.AppBridge.emit(

            'app-can-install'

        );


        console.log(

            '📱 الرفيق جاهز للتثبيت'

        );

    }

);


/* ============================================================
   21) تنفيذ تثبيت التطبيق
   ============================================================ */

window.installApp =

    async function () {

        const promptEvent =

            window.appState
                .deferredPrompt;


        if (!promptEvent) {

            console.warn(

                '⚠️ طلب التثبيت غير متاح حاليًا'

            );


            return 'not-ready';

        }


        try {

            promptEvent.prompt();


            const result =

                await promptEvent.userChoice;


            window.appState
                .deferredPrompt = null;


            if (
                result.outcome ===
                'accepted'
            ) {

                console.log(

                    '✅ وافق المستخدم على تثبيت التطبيق'

                );

            } else {

                console.log(

                    'ℹ️ تم إلغاء تثبيت التطبيق'

                );

            }


            return result.outcome;

        } catch (error) {

            console.error(

                '❌ خطأ أثناء تثبيت التطبيق:',

                error

            );


            return 'failed';

        }

    };


/* ============================================================
   22) عند تثبيت التطبيق
   ============================================================ */

window.addEventListener(

    'appinstalled',

    () => {

        window.appState
            .deferredPrompt = null;


        window.AppBridge.emit(

            'app-installed-success'

        );


        console.log(

            '✅ تم تثبيت الرفيق بنجاح'

        );

    }

);


/* ============================================================
   23) تسجيل Service Worker
   ============================================================ */

function registerServiceWorker() {

    if (
        !('serviceWorker' in navigator)
    ) {

        console.warn(

            '⚠️ المتصفح لا يدعم Service Worker'

        );

        return;

    }


    window.addEventListener(

        'load',

        () => {

            navigator.serviceWorker

                .register(

                    './sw.js',

                    {

                        scope:
                            './'

                    }

                )

                .then(

                    registration => {

                        console.log(

                            '✅ تم تسجيل Service Worker بنجاح:',

                            registration.scope

                        );


                        /*
                           مراقبة وجود نسخة جديدة
                        */

                        registration.addEventListener(

                            'updatefound',

                            () => {

                                const newWorker =

                                    registration
                                        .installing;


                                if (!newWorker) {

                                    return;

                                }


                                newWorker.addEventListener(

                                    'statechange',

                                    () => {

                                        if (

                                            newWorker.state ===

                                            'installed' &&

                                            navigator.serviceWorker
                                                .controller

                                        ) {

                                            console.log(

                                                '🔄 توجد نسخة جديدة من التطبيق'

                                            );

                                        }

                                    }

                                );

                            }

                        );

                    }

                )

                .catch(

                    error => {

                        console.error(

                            '❌ فشل تسجيل Service Worker:',

                            error

                        );

                    }

                );

        }

    );

}


/* ============================================================
   24) تشغيل التطبيق
   ============================================================ */

document.addEventListener(

    'DOMContentLoaded',

    async () => {

        console.log(

            '🚀 الرفيق — app.js v2.0.0 يعمل بنجاح'

        );


        /*
           1. إعداد المدن
        */

        setupCitySelect();


        /*
           2. إعداد الأذان
        */

        setupAdhan();


        /*
           3. تشغيل الساعة والتاريخ
        */

        startClock();


        /*
           4. تسجيل Service Worker
        */

        registerServiceWorker();


        /*
           5. تحميل مواقيت الصلاة
        */

        await loadPrayerTimes();


        console.log(

            '✅ تم تشغيل جميع أنظمة الرفيق'

        );

    }

);


/* ============================================================
   نهاية app.js
   ============================================================ */
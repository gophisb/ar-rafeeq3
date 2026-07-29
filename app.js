/* ============================================================
   الرفيق — app.js
   الإصدار: 2.0.0

   نظام:
   ✅ مواقيت الصلاة
   ✅ التاريخ الهجري والميلادي
   ✅ العد التنازلي
   ✅ اختيار الولاية / المدينة
   ✅ العمل بدون إنترنت بعد تحميل البيانات
   ✅ حفظ آخر مواقيت محليًا
   ✅ تحديث تلقائي عند عودة الإنترنت
   ✅ الأذان اليدوي
   ✅ PWA والتثبيت
   ============================================================ */

'use strict';


/* ============================================================
   1) AppBridge
   ============================================================ */

window.AppBridge = {

    events: {},

    on(event, callback) {

        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback);

    },

    emit(event, data) {

        if (!this.events[event]) {
            return;
        }

        this.events[event].forEach(callback => {

            try {
                callback(data);
            } catch (error) {
                console.error(
                    '❌ AppBridge Error:',
                    error
                );
            }

        });

    }

};


/* ============================================================
   2) حالة التطبيق
   ============================================================ */

window.appState = {

    deferredPrompt: null,

    currentCity:
        localStorage.getItem('rafeeq_city') ||
        'Algiers',

    prayerData: null,

    prayerDate: null,

    nextPrayer: null,

    countdownTimer: null,

    clockTimer: null,

    isOnline:
        navigator.onLine

};


/* ============================================================
   3) المدن والولايات
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
    { name: 'سيدي بلعباس', api: 'Sidi Bel Abbes' },
    { name: 'مستغانم', api: 'Mostaganem' },
    { name: 'الشلف', api: 'Chlef' },
    { name: 'البويرة', api: 'Bouira' },
    { name: 'برج بوعريريج', api: 'Bordj Bou Arreridj' },
    { name: 'تبسة', api: 'Tebessa' },
    { name: 'خنشلة', api: 'Khenchela' },
    { name: 'أم البواقي', api: 'Oum El Bouaghi' },
    { name: 'ميلة', api: 'Mila' },
    { name: 'المدية', api: 'Medea' },
    { name: 'عين الدفلى', api: 'Ain Defla' },
    { name: 'تيبازة', api: 'Tipaza' },
    { name: 'بومرداس', api: 'Boumerdes' },
    { name: 'الوادي', api: 'El Oued' },
    { name: 'ورقلة', api: 'Ouargla' },
    { name: 'غرداية', api: 'Ghardaia' },
    { name: 'أدرار', api: 'Adrar' },
    { name: 'بشار', api: 'Bechar' },
    { name: 'تمنراست', api: 'Tamanrasset' },
    { name: 'إليزي', api: 'Illizi' },
    { name: 'تندوف', api: 'Tindouf' },
    { name: 'البيض', api: 'El Bayadh' },
    { name: 'النعامة', api: 'Naama' },
    { name: 'تيسمسيلت', api: 'Tissemsilt' },
    { name: 'الجلفة', api: 'Djelfa' },
    { name: 'الأغواط', api: 'Laghouat' },
    { name: 'عين تموشنت', api: 'Ain Temouchent' },
    { name: 'تيارت', api: 'Tiaret' },
    { name: 'سوق أهراس', api: 'Souk Ahras' },
    { name: 'الطارف', api: 'El Tarf' },
    { name: 'عين قزام', api: 'In Guezzam' },
    { name: 'برج باجي مختار', api: 'Bordj Badji Mokhtar' },
    { name: 'بني عباس', api: 'Beni Abbes' },
    { name: 'تيميمون', api: 'Timimoun' },
    { name: 'تقرت', api: 'Touggourt' },
    { name: 'المغير', api: 'El Mghair' },
    { name: 'المنيعة', api: 'El Meniaa' }

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
   5) الحصول على التاريخ المحلي بصيغة YYYY-MM-DD
   ============================================================ */

function getLocalDateKey(date = new Date()) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, '0');

    const day =
        String(
            date.getDate()
        ).padStart(2, '0');

    return `${year}-${month}-${day}`;

}


/* ============================================================
   6) تحويل الوقت إلى دقائق
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

    if (parts.length < 2) {
        return null;
    }

    const hours =
        Number(parts[0]);

    const minutes =
        Number(parts[1]);

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
   7) تنظيف وقت API
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
   8) التاريخ الميلادي
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

        console.warn(
            'تعذر عرض التاريخ الميلادي',
            error
        );

        return now.toLocaleDateString(
            'ar-DZ'
        );

    }

}


/* ============================================================
   9) التاريخ الهجري
   ============================================================ */

function getHijriDate() {

    const now =
        new Date();

    const calendars = [

        'ar-SA-u-ca-islamic-umalqura',

        'ar-SA-u-ca-islamic',

        'ar-DZ-u-ca-islamic'

    ];


    for (
        const locale of calendars
    ) {

        try {

            const result =
                new Intl.DateTimeFormat(
                    locale,
                    {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }
                ).format(now);

            if (result) {

                return result;

            }

        } catch (error) {

            console.warn(
                'تعذر استخدام التقويم:',
                locale
            );

        }

    }


    return 'التاريخ الهجري غير متاح';

}


/* ============================================================
   10) عرض التاريخ الهجري والميلادي
   ============================================================ */

function updateDates() {

    const element =
        document.getElementById(
            'hijriPill'
        );


    if (!element) {

        console.warn(
            '⚠️ hijriPill غير موجود'
        );

        return;

    }


    const hijri =
        getHijriDate();

    const gregorian =
        getGregorianDate();


    element.innerHTML =

        '🌙 ' +
        hijri +

        '<br>' +

        '<small>' +
        '📅 ' +
        gregorian +
        '</small>';

}


/* ============================================================
   11) إنشاء قائمة الولايات
   ============================================================ */

function setupCitySelect() {

    const select =
        document.getElementById(
            'citySelect'
        );


    if (!select) {

        console.warn(
            '⚠️ citySelect غير موجود'
        );

        return;

    }


    select.innerHTML = '';


    CITIES.forEach(city => {

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

    });


    select.addEventListener(
        'change',
        async function () {

            const selectedCity =
                this.value;


            window.appState.currentCity =
                selectedCity;


            localStorage.setItem(
                'rafeeq_city',
                selectedCity
            );


            window.appState.prayerData =
                null;


            await loadPrayerTimes(
                true
            );

        }
    );

}


/* ============================================================
   12) جلب مواقيت الصلاة
   ============================================================ */

async function fetchPrayerTimes(city) {

    const today =
        new Date();


    const day =
        String(
            today.getDate()
        ).padStart(2, '0');


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, '0');


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

        encodeURIComponent(city) +

        '&country=Algeria' +

        '&method=3';


    const response =
        await fetch(
            url,
            {
                method: 'GET',
                cache: 'no-store'
            }
        );


    if (!response.ok) {

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
   13) حفظ مواقيت الصلاة
   ============================================================ */

function savePrayerData(data) {

    try {

        const cache = {

            date:
                getLocalDateKey(),

            city:
                window.appState.currentCity,

            data:
                data

        };


        localStorage.setItem(
            'rafeeq_prayer_cache',
            JSON.stringify(cache)
        );


        console.log(
            '💾 تم حفظ مواقيت الصلاة محليًا'
        );


    } catch (error) {

        console.warn(
            'تعذر حفظ المواقيت:',
            error
        );

    }

}


/* ============================================================
   14) قراءة المواقيت المحفوظة
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
            JSON.parse(saved);


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
            'خطأ في قراءة التخزين المحلي:',
            error
        );

        return null;

    }

}


/* ============================================================
   15) تحميل مواقيت الصلاة
   ============================================================ */

async function loadPrayerTimes(forceRefresh = false) {

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

        let data =
            null;


        /*
         * عند وجود إنترنت:
         * نحاول جلب البيانات الجديدة
         */

        if (
            navigator.onLine ||
            forceRefresh
        ) {

            try {

                data =
                    await fetchPrayerTimes(
                        window.appState.currentCity
                    );


                savePrayerData(
                    data
                );


                console.log(
                    '🌐 تم تحميل المواقيت من الإنترنت'
                );


            } catch (networkError) {

                console.warn(
                    'تعذر الاتصال بالخادم:',
                    networkError
                );

            }

        }


        /*
         * إذا فشل الإنترنت:
         * نستخدم النسخة المحلية
         */

        if (!data) {

            data =
                getCachedPrayerData();

        }


        /*
         * لا توجد بيانات
         */

        if (!data) {

            throw new Error(
                'لا توجد بيانات محفوظة للمواقيت'
            );

        }


        window.appState.prayerData =
            data;


        window.appState.prayerDate =
            getLocalDateKey();


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
            '✅ مواقيت الصلاة جاهزة'
        );


    } catch (error) {

        console.error(
            '❌ فشل تحميل مواقيت الصلاة:',
            error
        );


        if (status) {

            status.hidden =
                false;

            status.textContent =
                navigator.onLine

                    ? 'تعذر تحميل مواقيت الصلاة.'

                    : 'أنت غير متصل بالإنترنت. افتح التطبيق مرة واحدة مع الإنترنت لحفظ المواقيت.';

        }

    }

}


/* ============================================================
   16) تحديد الصلاة القادمة
   ============================================================ */

function getNextPrayer() {

    const data =
        window.appState.prayerData;


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

        now.getMinutes() +

        (
            now.getSeconds() / 60
        );


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
            minutes > currentMinutes
        ) {

            return {

                key,

                name:
                    PRAYER_NAMES[key],

                time,

                minutes,

                tomorrow:
                    false

            };

        }

    }


    /*
     * انتهت صلوات اليوم
     * الصلاة القادمة هي فجر الغد
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

        key: 'Fajr',

        name: 'الفجر',

        time: fajr,

        minutes:
            fajrMinutes !== null
                ? fajrMinutes
                : 0,

        tomorrow: true

    };

}


/* ============================================================
   17) إنشاء وقت الهدف للصلاة
   ============================================================ */

function getPrayerTargetDate(prayer) {

    const now =
        new Date();


    const target =
        new Date();


    const minutes =
        prayer.minutes;


    const hours =
        Math.floor(
            minutes / 60
        );


    const mins =
        minutes % 60;


    target.setHours(
        hours,
        mins,
        0,
        0
    );


    if (
        prayer.tomorrow ||
        target <= now
    ) {

        target.setDate(
            target.getDate() + 1
        );

    }


    return target;

}


/* ============================================================
   18) تحديث الصلاة القادمة
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


    const adhanTimeLabel =
        document.getElementById(
            'adhanTimeLabel'
        );


    if (name) {

        name.textContent =
            next.name;

    }


    if (time) {

        time.textContent =
            next.time;

    }


    if (adhanTimeLabel) {

        adhanTimeLabel.textContent =

            next.name +

            ' — ' +

            next.time;

    }


    updateCountdown();

}


/* ============================================================
   19) العد التنازلي
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
        window.appState.nextPrayer;


    if (
        !countdown ||
        !next
    ) {

        return;

    }


    const target =
        getPrayerTargetDate(
            next
        );


    const now =
        new Date();


    const difference =

        target.getTime() -

        now.getTime();


    /*
     * إذا انتهى العد:
     * نعيد حساب الصلاة القادمة
     */

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
            (
                totalSeconds % 3600
            ) / 60
        );


    const seconds =

        totalSeconds % 60;


    countdown.textContent =

        String(hours)
            .padStart(2, '0') +

        ':' +

        String(minutes)
            .padStart(2, '0') +

        ':' +

        String(seconds)
            .padStart(2, '0');


    /*
     * شريط تقدم تقريبي
     */

    if (progressBar) {

        progressBar.style.width =
            '100%';

    }

}


/* ============================================================
   20) تشغيل الساعة والتاريخ
   ============================================================ */

function startClock() {

    if (
        window.appState.clockTimer
    ) {

        clearInterval(
            window.appState.clockTimer
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
   21) نظام الأذان
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

}


/* ============================================================
   22) مراقبة الإنترنت
   ============================================================ */

window.addEventListener(
    'online',
    async () => {

        window.appState.isOnline =
            true;


        console.log(
            '🌐 عاد الاتصال بالإنترنت'
        );


        /*
         * تحديث المواقيت تلقائيًا
         */

        await loadPrayerTimes(
            true
        );


        window.AppBridge.emit(
            'online'
        );

    }
);


window.addEventListener(
    'offline',
    () => {

        window.appState.isOnline =
            false;


        console.log(
            '📴 التطبيق يعمل الآن بدون إنترنت'
        );


        window.AppBridge.emit(
            'offline'
        );

    }
);


/* ============================================================
   23) PWA — طلب التثبيت
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
   24) PWA — تنفيذ التثبيت
   ============================================================ */

window.installApp =
    async function () {

        const promptEvent =
            window.appState.deferredPrompt;


        if (!promptEvent) {

            console.warn(
                '⚠️ التثبيت غير متاح حاليًا'
            );

            return 'not-ready';

        }


        try {

            promptEvent.prompt();


            const result =
                await promptEvent.userChoice;


            window.appState.deferredPrompt =
                null;


            if (
                result.outcome ===
                'accepted'
            ) {

                window.AppBridge.emit(
                    'app-installed-success'
                );

            }


            return result.outcome;


        } catch (error) {

            console.error(
                '❌ خطأ في تثبيت التطبيق:',
                error
            );


            return 'failed';

        }

    };


/* ============================================================
   25) بعد تثبيت التطبيق
   ============================================================ */

window.addEventListener(
    'appinstalled',
    () => {

        window.appState.deferredPrompt =
            null;


        window.AppBridge.emit(
            'app-installed-success'
        );


        console.log(
            '✅ تم تثبيت الرفيق بنجاح'
        );

    }
);


/* ============================================================
   26) تشغيل التطبيق
   ============================================================ */

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        console.log(
            '🚀 الرفيق — app.js v2.0.0 يعمل'
        );


        setupCitySelect();


        setupAdhan();


        startClock();


        /*
         * تحميل المواقيت:
         * من الإنترنت أو من التخزين المحلي
         */

        await loadPrayerTimes();


        /*
         * تحديث الصلاة القادمة
         * كل دقيقة لضمان الانتقال الصحيح
         */

        if (
            window.appState.countdownTimer
        ) {

            clearInterval(
                window.appState.countdownTimer
            );

        }


        window.appState.countdownTimer =

            setInterval(
                () => {

                    const currentDate =
                        getLocalDateKey();


                    /*
                     * إذا تغير اليوم
                     * نعيد تحميل مواقيت اليوم
                     */

                    if (
                        window.appState.prayerDate !==
                        currentDate
                    ) {

                        loadPrayerTimes(
                            true
                        );

                        return;

                    }


                    updatePrayerDisplay();

                },
                60000
            );

    }
);


/* ============================================================
   27) تنظيف المؤقتات عند إغلاق الصفحة
   ============================================================ */

window.addEventListener(
    'pagehide',
    () => {

        if (
            window.appState.clockTimer
        ) {

            clearInterval(
                window.appState.clockTimer
            );

        }


        if (
            window.appState.countdownTimer
        ) {

            clearInterval(
                window.appState.countdownTimer
            );

        }

    }
);


/* ============================================================
   نهاية app.js
   ============================================================ */

console.log(
    '✅ الرفيق — app.js تم تحميله بنجاح'
);
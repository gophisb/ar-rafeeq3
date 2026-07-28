// ============================================================
// الرفيق — app.js
// مواقيت الصلاة + العد التنازلي + التاريخ الهجري
// اختيار الولاية + الأذان اليدوي + PWA
// ============================================================

'use strict';


// ============================================================
// AppBridge
// ============================================================

window.AppBridge = {

    events: {},

    on(event, callback) {
        (this.events[event] = this.events[event] || []).push(callback);
    },

    emit(event, data) {

        if (!this.events[event]) return;

        this.events[event].forEach(callback => {

            try {
                callback(data);
            } catch (error) {
                console.error('❌ AppBridge Error:', error);
            }

        });

    }

};


// ============================================================
// حالة التطبيق
// ============================================================

window.appState = {

    deferredPrompt: null,

    currentState: null,

    prayerTimes: null,

    city: null,

    country: 'Algeria',

    timezone: 'Africa/Algiers',

    nextPrayer: null,

    countdownTimer: null,

    refreshTimer: null

};


// ============================================================
// الولايات الجزائرية
// ============================================================

const ALGERIA_CITIES = [

    { name: 'أدرار', api: 'Adrar' },
    { name: 'الشلف', api: 'Chlef' },
    { name: 'الأغواط', api: 'Laghouat' },
    { name: 'أم البواقي', api: 'Oum El Bouaghi' },
    { name: 'باتنة', api: 'Batna' },
    { name: 'بجاية', api: 'Bejaia' },
    { name: 'بسكرة', api: 'Biskra' },
    { name: 'بشار', api: 'Bechar' },
    { name: 'البليدة', api: 'Blida' },
    { name: 'البويرة', api: 'Bouira' },
    { name: 'تمنراست', api: 'Tamanrasset' },
    { name: 'تبسة', api: 'Tebessa' },
    { name: 'تلمسان', api: 'Tlemcen' },
    { name: 'تيارت', api: 'Tiaret' },
    { name: 'تيزي وزو', api: 'Tizi Ouzou' },
    { name: 'الجزائر', api: 'Algiers' },
    { name: 'الجلفة', api: 'Djelfa' },
    { name: 'جيجل', api: 'Jijel' },
    { name: 'سطيف', api: 'Setif' },
    { name: 'سعيدة', api: 'Saida' },
    { name: 'سكيكدة', api: 'Skikda' },
    { name: 'سيدي بلعباس', api: 'Sidi Bel Abbes' },
    { name: 'عنابة', api: 'Annaba' },
    { name: 'قالمة', api: 'Guelma' },
    { name: 'قسنطينة', api: 'Constantine' },
    { name: 'المدية', api: 'Medea' },
    { name: 'مستغانم', api: 'Mostaganem' },
    { name: 'المسيلة', api: 'Msila' },
    { name: 'معسكر', api: 'Mascara' },
    { name: 'ورقلة', api: 'Ouargla' },
    { name: 'وهران', api: 'Oran' },
    { name: 'البيض', api: 'El Bayadh' },
    { name: 'إليزي', api: 'Illizi' },
    { name: 'برج بوعريريج', api: 'Bordj Bou Arreridj' },
    { name: 'بومرداس', api: 'Boumerdes' },
    { name: 'الطارف', api: 'El Tarf' },
    { name: 'تندوف', api: 'Tindouf' },
    { name: 'تيسمسيلت', api: 'Tissemsilt' },
    { name: 'الوادي', api: 'El Oued' },
    { name: 'خنشلة', api: 'Khenchela' },
    { name: 'سوق أهراس', api: 'Souk Ahras' },
    { name: 'تيبازة', api: 'Tipaza' },
    { name: 'ميلة', api: 'Mila' },
    { name: 'عين الدفلى', api: 'Ain Defla' },
    { name: 'النعامة', api: 'Naama' },
    { name: 'عين تموشنت', api: 'Ain Temouchent' },
    { name: 'غرداية', api: 'Ghardaia' },
    { name: 'غليزان', api: 'Relizane' },
    { name: 'تيميمون', api: 'Timimoun' },
    { name: 'برج باجي مختار', api: 'Bordj Badji Mokhtar' },
    { name: 'أولاد جلال', api: 'Ouled Djellal' },
    { name: 'بني عباس', api: 'Beni Abbes' },
    { name: 'إن صالح', api: 'In Salah' },
    { name: 'إن قزام', api: 'In Guezzam' },
    { name: 'تقرت', api: 'Touggourt' },
    { name: 'جانت', api: 'Djanet' },
    { name: 'المغير', api: 'El Mghair' },
    { name: 'المنيعة', api: 'El Meniaa' }

];


// ============================================================
// أسماء الصلوات
// ============================================================

const PRAYER_NAMES = {

    Fajr: 'الفجر',

    Sunrise: 'الشروق',

    Dhuhr: 'الظهر',

    Asr: 'العصر',

    Maghrib: 'المغرب',

    Isha: 'العشاء'

};


// ============================================================
// الصلوات المعتمدة للحساب
// ============================================================

const MAIN_PRAYERS = [

    'Fajr',

    'Dhuhr',

    'Asr',

    'Maghrib',

    'Isha'

];


// ============================================================
// تهيئة قائمة الولايات
// ============================================================

function initCitySelect() {

    const select = document.getElementById('citySelect');

    if (!select) {

        console.error('❌ لم يتم العثور على citySelect');

        return;

    }


    select.innerHTML = '';


    ALGERIA_CITIES.forEach(city => {

        const option = document.createElement('option');

        option.value = city.api;

        option.textContent = city.name;

        select.appendChild(option);

    });


    // محاولة قراءة الولاية المحفوظة

    const savedCity = localStorage.getItem('rafeeq_city');


    if (savedCity) {

        const exists = ALGERIA_CITIES.some(
            city => city.api === savedCity
        );

        if (exists) {

            select.value = savedCity;

        }

    }


    // إذا لم توجد ولاية محفوظة

    if (!select.value) {

        select.value = 'Algiers';

    }


    window.appState.city = select.value;


    select.addEventListener(

        'change',

        () => {

            const city = select.value;

            window.appState.city = city;

            localStorage.setItem(
                'rafeeq_city',
                city
            );


            loadPrayerTimes(city);

        }

    );

}


// ============================================================
// جلب مواقيت الصلاة من AlAdhan API
// ============================================================

async function loadPrayerTimes(city) {

    const status = document.getElementById('status');

    const prayerCard = document.getElementById('prayerCard');


    if (status) {

        status.hidden = false;

        status.textContent =
            'جاري تحميل مواقيت الصلاة...';

    }


    if (prayerCard) {

        prayerCard.hidden = true;

    }


    try {

        const today = new Date();


        const day =
            String(today.getDate()).padStart(2, '0');

        const month =
            String(today.getMonth() + 1).padStart(2, '0');

        const year =
            today.getFullYear();


        const url =
            `https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}` +
            `?city=${encodeURIComponent(city)}` +
            `&country=Algeria` +
            `&method=3`;


        console.log(
            '🌐 طلب مواقيت الصلاة:',
            url
        );


        const response = await fetch(url);


        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }


        const data = await response.json();


        if (
            !data ||
            data.code !== 200 ||
            !data.data ||
            !data.data.timings
        ) {

            throw new Error(
                'بيانات مواقيت الصلاة غير صالحة'
            );

        }


        window.appState.prayerTimes =
            data.data.timings;


        window.appState.currentState =
            data.data;


        // تحديث التاريخ الهجري

        updateHijriDate(
            data.data.date
        );


        // إظهار بطاقة الصلاة

        if (prayerCard) {

            prayerCard.hidden = false;

        }


        if (status) {

            status.hidden = true;

        }


        console.log(
            '✅ تم تحميل مواقيت الصلاة بنجاح',
            data.data.timings
        );


        updatePrayerUI();


        startCountdown();


    } catch (error) {

        console.error(
            '❌ خطأ في تحميل مواقيت الصلاة:',
            error
        );


        if (status) {

            status.hidden = false;

            status.textContent =
                'تعذر تحميل مواقيت الصلاة. تحقق من اتصال الإنترنت ثم أعد المحاولة.';

        }


        if (prayerCard) {

            prayerCard.hidden = true;

        }

    }

}


// ============================================================
// تحديث التاريخ الهجري
// ============================================================

function updateHijriDate(dateData) {

    const hijriPill =
        document.getElementById('hijriPill');


    if (!hijriPill) return;


    if (
        dateData &&
        dateData.hijri
    ) {

        const hijri =
            dateData.hijri;


        const day =
            hijri.day || '—';

        const month =
            hijri.month?.ar ||
            hijri.month?.en ||
            '—';

        const year =
            hijri.year || '—';


        hijriPill.textContent =
            `📅 ${day} ${month} ${year} هـ`;


        return;

    }


    // احتياط إذا كانت البيانات مختلفة

    hijriPill.textContent =
        '📅 التاريخ الهجري غير متاح';

}


// ============================================================
// تحويل وقت الصلاة إلى Date
// ============================================================

function prayerTimeToDate(timeString, baseDate) {

    if (!timeString) return null;


    const cleanTime =
        String(timeString)
            .replace(/\s*\(.*?\)\s*/g, '')
            .trim();


    const match =
        cleanTime.match(
            /^(\d{1,2}):(\d{2})/
        );


    if (!match) return null;


    const hours =
        Number(match[1]);

    const minutes =
        Number(match[2]);


    const date =
        new Date(baseDate);


    date.setHours(
        hours,
        minutes,
        0,
        0
    );


    return date;

}


// ============================================================
// الحصول على الصلاة القادمة
// ============================================================

function getNextPrayer() {

    const times =
        window.appState.prayerTimes;


    if (!times) return null;


    const now =
        new Date();


    for (
        const prayerKey of MAIN_PRAYERS
    ) {

        const prayerDate =
            prayerTimeToDate(
                times[prayerKey],
                now
            );


        if (
            prayerDate &&
            prayerDate > now
        ) {

            return {

                key: prayerKey,

                name:
                    PRAYER_NAMES[prayerKey],

                time:
                    times[prayerKey],

                date:
                    prayerDate

            };

        }

    }


    // إذا انتهت صلاة العشاء
    // ننتقل إلى فجر الغد

    const tomorrow =
        new Date(now);


    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    const fajrDate =
        prayerTimeToDate(
            times.Fajr,
            tomorrow
        );


    if (fajrDate) {

        return {

            key: 'Fajr',

            name: PRAYER_NAMES.Fajr,

            time: times.Fajr,

            date: fajrDate

        };

    }


    return null;

}


// ============================================================
// تحديث واجهة الصلاة القادمة
// ============================================================

function updatePrayerUI() {

    const next =
        getNextPrayer();


    if (!next) {

        console.warn(
            '⚠️ لم يتم العثور على الصلاة القادمة'
        );

        return;

    }


    window.appState.nextPrayer =
        next;


    const nextName =
        document.getElementById('nextName');


    const nextTime =
        document.getElementById('nextTime');


    const adhanTimeLabel =
        document.getElementById(
            'adhanTimeLabel'
        );


    if (nextName) {

        nextName.textContent =
            next.name;

    }


    if (nextTime) {

        nextTime.textContent =
            formatTime(next.time);

    }


    if (adhanTimeLabel) {

        adhanTimeLabel.textContent =
            `${next.name} — ${formatTime(next.time)}`;

    }


    updateCountdown();


    updateProgress();

}


// ============================================================
// تحديث العد التنازلي
// ============================================================

function updateCountdown() {

    const countdown =
        document.getElementById('countdown');


    const next =
        window.appState.nextPrayer;


    if (!countdown || !next) return;


    const now =
        new Date();


    let difference =
        next.date.getTime() -
        now.getTime();


    if (difference <= 0) {

        updatePrayerUI();

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
        `${String(hours).padStart(2, '0')}:` +
        `${String(minutes).padStart(2, '0')}:` +
        `${String(seconds).padStart(2, '0')}`;


}


// ============================================================
// تشغيل العد التنازلي كل ثانية
// ============================================================

function startCountdown() {

    if (
        window.appState.countdownTimer
    ) {

        clearInterval(
            window.appState.countdownTimer
        );

    }


    updatePrayerUI();


    window.appState.countdownTimer =
        setInterval(

            () => {

                updateCountdown();

            },

            1000

        );

}


// ============================================================
// تحديث شريط التقدم
// ============================================================

function updateProgress() {

    const progressBar =
        document.getElementById(
            'progressBar'
        );


    const progressRing =
        document.getElementById(
            'progressRing'
        );


    const next =
        window.appState.nextPrayer;


    if (
        !next ||
        !window.appState.prayerTimes
    ) {

        return;

    }


    const now =
        new Date();


    // البحث عن الصلاة السابقة

    let previousDate = null;


    for (
        let i = 0;
        i < MAIN_PRAYERS.length;
        i++
    ) {

        const key =
            MAIN_PRAYERS[i];


        const date =
            prayerTimeToDate(
                window.appState.prayerTimes[key],
                now
            );


        if (
            date &&
            date < next.date
        ) {

            previousDate = date;

        }

    }


    // إذا كانت الصلاة القادمة فجر الغد

    if (!previousDate) {

        previousDate =
            new Date(now);

        previousDate.setHours(
            0,
            0,
            0,
            0
        );

    }


    const total =
        next.date.getTime() -
        previousDate.getTime();


    const elapsed =
        now.getTime() -
        previousDate.getTime();


    let percent =
        (elapsed / total) * 100;


    percent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    if (progressBar) {

        progressBar.style.width =
            `${percent}%`;

    }


    if (progressRing) {

        const circumference =
            427.3;


        const offset =
            circumference -
            (percent / 100) *
            circumference;


        progressRing.style.strokeDashoffset =
            offset;

    }

}


// ============================================================
// تنسيق الوقت
// ============================================================

function formatTime(time) {

    if (!time) return '—';


    const match =
        String(time).match(
            /^(\d{1,2}):(\d{2})/
        );


    if (!match) {

        return time;

    }


    let hours =
        Number(match[1]);


    const minutes =
        match[2];


    const period =
        hours >= 12
            ? 'م'
            : 'ص';


    hours =
        hours % 12;


    if (hours === 0) {

        hours = 12;

    }


    return `${hours}:${minutes} ${period}`;

}


// ============================================================
// نظام الأذان اليدوي
// ============================================================

function initAdhan() {

    const audio =
        document.getElementById(
            'adhanAudio'
        );


    const playButton =
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


    if (!audio) {

        console.warn(
            '⚠️ عنصر adhanAudio غير موجود'
        );

        return;

    }


    if (!playButton) {

        console.warn(
            '⚠️ زر adhanPlayBtn غير موجود'
        );

        return;

    }


    playButton.addEventListener(

        'click',

        async () => {

            try {

                if (audio.paused) {

                    audio.currentTime = 0;

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
                    'تعذر تشغيل الأذان.\n\n' +
                    'تأكد من وجود ملف adhan.mp3 في مجلد المشروع.'
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
                '❌ خطأ في تحميل ملف adhan.mp3',
                audio.error
            );

        }

    );

}


// ============================================================
// PWA — طلب التثبيت
// ============================================================

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
            '📱 التطبيق جاهز للتثبيت'
        );

    }

);


// ============================================================
// PWA — تنفيذ التثبيت
// ============================================================

window.installApp = async function () {

    const promptEvent =
        window.appState.deferredPrompt;


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


        window.appState.deferredPrompt =
            null;


        window.AppBridge.emit(
            'app-installed-success'
        );


        console.log(
            '📱 نتيجة التثبيت:',
            result.outcome
        );


        return result.outcome;

    } catch (error) {

        console.error(
            '❌ خطأ أثناء التثبيت:',
            error
        );


        return 'failed';

    }

};


// ============================================================
// PWA — بعد التثبيت
// ============================================================

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


// ============================================================
// تحديث المواقيت تلقائيًا كل ساعة
// ============================================================

function startAutoRefresh() {

    if (
        window.appState.refreshTimer
    ) {

        clearInterval(
            window.appState.refreshTimer
        );

    }


    window.appState.refreshTimer =
        setInterval(

            () => {

                if (
                    window.appState.city
                ) {

                    loadPrayerTimes(
                        window.appState.city
                    );

                }

            },

            60 * 60 * 1000

        );

}


// ============================================================
// تشغيل التطبيق
// ============================================================

document.addEventListener(

    'DOMContentLoaded',

    () => {

        console.log(
            '🚀 الرفيق — بدء تشغيل التطبيق'
        );


        // 1. تهيئة الولايات

        initCitySelect();


        // 2. تهيئة الأذان

        initAdhan();


        // 3. تحميل مواقيت الصلاة

        const city =
            window.appState.city ||
            'Algiers';


        loadPrayerTimes(
            city
        );


        // 4. تحديث تلقائي

        startAutoRefresh();

    }

);


// ============================================================
// تسجيل أخطاء JavaScript
// ============================================================

window.addEventListener(

    'error',

    event => {

        console.error(

            '❌ JavaScript Error:',

            event.message,

            '| الملف:',

            event.filename,

            '| السطر:',

            event.lineno

        );

    }

);


// ============================================================
// نهاية app.js
// ============================================================

console.log(
    '✅ الرفيق — app.js تم تحميله بنجاح'
);
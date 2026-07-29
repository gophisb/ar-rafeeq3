// ============================================================
// الرفيق — app.js
// الإصدار: Offline Prayer Engine
// مواقيت الصلاة + التاريخ الهجري والميلادي + العد التنازلي
// الأذان + PWA + حفظ المدينة
// ============================================================

'use strict';

// ============================================================
// AppBridge
// ============================================================
window.AppBridge = {
    events: {},
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
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
    currentCity: null,
    prayerTimes: null,
    nextPrayer: null,
    timer: null,
    countdownTimer: null,
    initialized: false
};

// ============================================================
// المدن والولايات الجزائرية (الإحداثيات التقريبية)
// ============================================================
const ALGERIA_CITIES = [
    { name: 'الجزائر', lat: 36.7538, lon: 3.0588 },
    { name: 'أدرار', lat: 27.8743, lon: -0.2939 },
    { name: 'الشلف', lat: 36.1653, lon: 1.3345 },
    { name: 'الأغواط', lat: 33.8000, lon: 2.8651 },
    { name: 'أم البواقي', lat: 35.8727, lon: 7.1131 },
    { name: 'باتنة', lat: 35.5559, lon: 6.1741 },
    { name: 'بجاية', lat: 36.7509, lon: 5.0567 },
    { name: 'بسكرة', lat: 34.8504, lon: 5.7281 },
    { name: 'بشار', lat: 31.6167, lon: -2.2167 },
    { name: 'البليدة', lat: 36.4700, lon: 2.8277 },
    { name: 'البويرة', lat: 36.3749, lon: 3.9020 },
    { name: 'تمنراست', lat: 22.7850, lon: 5.5228 },
    { name: 'تبسة', lat: 35.4042, lon: 8.1240 },
    { name: 'تلمسان', lat: 34.8828, lon: -1.3167 },
    { name: 'تيارت', lat: 35.3710, lon: 1.3160 },
    { name: 'تيزي وزو', lat: 36.7118, lon: 4.0459 },
    { name: 'الجلفة', lat: 34.6728, lon: 3.2630 },
    { name: 'جيجل', lat: 36.8206, lon: 5.7667 },
    { name: 'سطيف', lat: 36.1905, lon: 5.4137 },
    { name: 'سعيدة', lat: 34.8303, lon: 0.1517 },
    { name: 'سكيكدة', lat: 36.8762, lon: 6.9092 },
    { name: 'سيدي بلعباس', lat: 35.1899, lon: -0.6309 },
    { name: 'عنابة', lat: 36.9025, lon: 7.7556 },
    { name: 'قالمة', lat: 36.4621, lon: 7.4261 },
    { name: 'قسنطينة', lat: 36.3650, lon: 6.6147 },
    { name: 'المدية', lat: 36.2642, lon: 2.7539 },
    { name: 'مستغانم', lat: 35.9311, lon: 0.0892 },
    { name: 'المسيلة', lat: 35.7058, lon: 4.5419 },
    { name: 'معسكر', lat: 35.3966, lon: 0.1403 },
    { name: 'ورقلة', lat: 31.9525, lon: 5.3333 },
    { name: 'وهران', lat: 35.6971, lon: -0.6308 },
    { name: 'البيض', lat: 33.6833, lon: 1.0167 },
    { name: 'إليزي', lat: 26.4833, lon: 8.4667 },
    { name: 'برج بوعريريج', lat: 36.0739, lon: 4.7611 },
    { name: 'بومرداس', lat: 36.7667, lon: 3.4833 },
    { name: 'الطارف', lat: 36.7672, lon: 8.3138 },
    { name: 'تندوف', lat: 27.6711, lon: -8.1474 },
    { name: 'تيسمسيلت', lat: 35.6072, lon: 1.8108 },
    { name: 'الوادي', lat: 33.3561, lon: 6.8632 },
    { name: 'خنشلة', lat: 35.4358, lon: 7.1433 },
    { name: 'سوق أهراس', lat: 36.2864, lon: 7.9511 },
    { name: 'تيبازة', lat: 36.5897, lon: 2.4475 },
    { name: 'ميلة', lat: 36.4503, lon: 6.2644 },
    { name: 'عين الدفلى', lat: 36.2641, lon: 1.9679 },
    { name: 'النعامة', lat: 33.2667, lon: -0.3167 },
    { name: 'عين تموشنت', lat: 35.2975, lon: -1.1403 },
    { name: 'غرداية', lat: 32.4909, lon: 3.6735 },
    { name: 'غليزان', lat: 35.7373, lon: 0.5558 },
    { name: 'تيميمون', lat: 29.2639, lon: 0.2306 },
    { name: 'برج باجي مختار', lat: 21.3289, lon: 0.9481 },
    { name: 'أولاد جلال', lat: 34.4333, lon: 5.0667 },
    { name: 'بني عباس', lat: 30.1333, lon: -2.1667 },
    { name: 'عين صالح', lat: 27.1936, lon: 2.4607 },
    { name: 'عين قزام', lat: 19.5667, lon: 5.7667 },
    { name: 'تقرت', lat: 33.1053, lon: 6.0579 },
    { name: 'جانت', lat: 24.5553, lon: 9.4849 },
    { name: 'المغير', lat: 33.9500, lon: 5.9333 },
    { name: 'المنيعة', lat: 30.5833, lon: 2.8833 }
];

// ============================================================
// عناصر الصفحة
// ============================================================
let citySelect;
let hijriPill;
let gregorianDateElement;
let hijriDateElement;
let statusElement;
let prayerCard;
let nextNameElement;
let nextTimeElement;
let countdownElement;
let progressBar;
let progressRing;
let adhanTimeLabel;

// ============================================================
// تهيئة عناصر الصفحة
// ============================================================
function getElements() {
    citySelect = document.getElementById('citySelect');
    hijriPill = document.getElementById('hijriPill');
    gregorianDateElement = document.getElementById('gregorianDate');
    hijriDateElement = document.getElementById('hijriDate');
    statusElement = document.getElementById('status');
    prayerCard = document.getElementById('prayerCard');
    nextNameElement = document.getElementById('nextName');
    nextTimeElement = document.getElementById('nextTime');
    countdownElement = document.getElementById('countdown');
    progressBar = document.getElementById('progressBar');
    progressRing = document.getElementById('progressRing');
    adhanTimeLabel = document.getElementById('adhanTimeLabel');
}

// ============================================================
// إنشاء قائمة الولايات
// ============================================================
function populateCities() {
    if (!citySelect) return;
    citySelect.innerHTML = '';
    ALGERIA_CITIES.forEach((city, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = city.name;
        citySelect.appendChild(option);
    });

    const savedCity = localStorage.getItem('rafeeq_city_index');
    if (savedCity !== null && ALGERIA_CITIES[Number(savedCity)]) {
        citySelect.value = savedCity;
    } else {
        const algiersIndex = ALGERIA_CITIES.findIndex(city => city.name === 'الجزائر');
        citySelect.value = String(algiersIndex >= 0 ? algiersIndex : 0);
    }
}

// ============================================================
// الحصول على المدينة الحالية
// ============================================================
function getCurrentCity() {
    if (!citySelect) return ALGERIA_CITIES[0];
    const index = Number(citySelect.value);
    return ALGERIA_CITIES[index] || ALGERIA_CITIES[0];
}

// ============================================================
// التاريخ الميلادي
// ============================================================
function updateGregorianDate() {
    if (!gregorianDateElement) return;
    const now = new Date();
    const formatted = new Intl.DateTimeFormat('ar-DZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(now);
    gregorianDateElement.textContent = '📅 ' + formatted;
}

// ============================================================
// التاريخ الهجري
// ============================================================
function updateHijriDate() {
    const now = new Date();
    let formatted;
    try {
        formatted = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(now);
    } catch (error) {
        console.error('❌ خطأ في التاريخ الهجري:', error);
        formatted = 'التاريخ الهجري غير متاح';
    }

    if (hijriDateElement) {
        hijriDateElement.textContent = '🌙 ' + formatted;
    }
    if (hijriPill && !hijriDateElement) {
        hijriPill.textContent = '🌙 ' + formatted;
    }
}

// ============================================================
// تحديث التاريخ
// ============================================================
function updateDates() {
    updateGregorianDate();
    updateHijriDate();
}

// ============================================================
// حساب الوقت الشمسي (خوارزمية محلية مبسطة)
// ============================================================
function calculatePrayerTimes(date, latitude, longitude) {
    const dayOfYear = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 86400000);
    const radians = Math.PI / 180;

    const declination = 23.45 * Math.sin(radians * (360 * (284 + dayOfYear) / 365));
    const B = radians * (360 * (dayOfYear - 81) / 364);
    const equationOfTime = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

    const timezone = 1;
    const solarNoon = 720 - 4 * longitude - equationOfTime + timezone * 60;

    function hourAngle(altitude) {
        const cosH = (Math.sin(altitude * radians) - Math.sin(latitude * radians) * Math.sin(declination * radians)) /
                     (Math.cos(latitude * radians) * Math.cos(declination * radians));
        return Math.acos(Math.max(-1, Math.min(1, cosH))) / radians;
    }

    function solarTime(angle, morning) {
        return morning ? solarNoon - 4 * angle : solarNoon + 4 * angle;
    }

    const fajrAngle = hourAngle(-18);
    const sunriseAngle = hourAngle(-0.833);
    const sunsetAngle = sunriseAngle;
    const ishaAngle = hourAngle(-18);

    const dhuhr = solarNoon;
    const sunrise = solarTime(sunriseAngle, true);
    const sunset = solarTime(sunsetAngle, false);
    const fajr = solarTime(fajrAngle, true);
    const isha = solarTime(ishaAngle, false);

    const asrFactor = 1;
    const asrAltitude = -Math.atan(1 / (asrFactor + Math.tan(Math.abs(latitude - declination) * radians))) / radians;
    const asrAngle = hourAngle(asrAltitude);
    const asr = solarTime(asrAngle, false);

    return {
        Fajr: minutesToTime(fajr),
        Sunrise: minutesToTime(sunrise),
        Dhuhr: minutesToTime(dhuhr),
        Asr: minutesToTime(asr),
        Maghrib: minutesToTime(sunset),
        Isha: minutesToTime(isha)
    };
}

function minutesToTime(minutes) {
    minutes = (minutes % 1440 + 1440) % 1440;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0');
}

function timeToMinutes(time) {
    const parts = time.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
}

const PRAYER_NAMES = {
    Fajr: 'الفجر',
    Sunrise: 'الشروق',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء'
};

// ============================================================
// حساب مواقيت اليوم
// ============================================================
function loadPrayerTimes() {
    const city = getCurrentCity();
    window.appState.currentCity = city;

    const today = new Date();
    const times = calculatePrayerTimes(today, city.lat, city.lon);
    window.appState.prayerTimes = times;

    localStorage.setItem('rafeeq_city_index', citySelect.value);

    if (statusElement) {
        statusElement.textContent = 'تم تحديث مواقيت الصلاة';
        statusElement.style.display = 'none';
    }

    if (prayerCard) prayerCard.hidden = false;

    updateNextPrayer();
}

// ============================================================
// البحث عن الصلاة القادمة
// ============================================================
function updateNextPrayer() {
    const times = window.appState.prayerTimes;
    if (!times) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const prayers = Object.keys(times);
    let next = null;

    for (let i = 0; i < prayers.length; i++) {
        const key = prayers[i];
        const minutes = timeToMinutes(times[key]);
        if (minutes > currentMinutes) {
            next = { key, name: PRAYER_NAMES[key], time: times[key], minutes };
            break;
        }
    }

    if (!next) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const city = window.appState.currentCity;
        const tomorrowTimes = calculatePrayerTimes(tomorrow, city.lat, city.lon);
        next = { key: 'Fajr', name: 'الفجر', time: tomorrowTimes.Fajr, minutes: timeToMinutes(tomorrowTimes.Fajr), tomorrow: true };
    }

    window.appState.nextPrayer = next;

    if (nextNameElement) nextNameElement.textContent = next.name;
    if (nextTimeElement) nextTimeElement.textContent = next.time;
    if (adhanTimeLabel) adhanTimeLabel.textContent = next.name + ' — ' + next.time;

    updateCountdown();
}

// ============================================================
// العد التنازلي
// ============================================================
function updateCountdown() {
    const next = window.appState.nextPrayer;
    if (!next || !countdownElement) return;

    const now = new Date();
    let target = new Date(now);
    const parts = next.time.split(':');
    target.setHours(Number(parts[0]), Number(parts[1]), 0, 0);

    if (next.tomorrow || target <= now) {
        target.setDate(target.getDate() + 1);
    }

    const difference = target.getTime() - now.getTime();
    if (difference <= 0) {
        updateNextPrayer();
        return;
    }

    const totalSeconds = Math.floor(difference / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdownElement.textContent =
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');

    updateProgress();
}

// ============================================================
// شريط التقدم
// ============================================================
function updateProgress() {
    const times = window.appState.prayerTimes;
    const next = window.appState.nextPrayer;
    if (!times || !next) return;

    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    const nextMinutes = next.minutes;

    const prayerKeys = Object.keys(times);
    let previousMinutes = 0;
    for (let i = 0; i < prayerKeys.length; i++) {
        const minutes = timeToMinutes(times[prayerKeys[i]]);
        if (minutes < nextMinutes) previousMinutes = minutes;
    }

    const total = nextMinutes - previousMinutes;
    const elapsed = current - previousMinutes;
    let percent = (elapsed / total) * 100;
    percent = Math.max(0, Math.min(100, percent));

    if (progressBar) progressBar.style.width = percent + '%';
    if (progressRing) {
        const circumference = 427.3;
        const offset = circumference - (circumference * percent / 100);
        progressRing.style.strokeDashoffset = offset;
    }
}

// ============================================================
// تغيير المدينة
// ============================================================
function setupCitySelector() {
    if (!citySelect) return;
    citySelect.addEventListener('change', () => {
        localStorage.setItem('rafeeq_city_index', citySelect.value);
        loadPrayerTimes();
    });
}

// ============================================================
// PWA — طلب تثبيت التطبيق
// ============================================================
window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    window.appState.deferredPrompt = event;
    window.AppBridge.emit('app-can-install');
    console.log('📱 الرفيق جاهز للتثبيت');
});

window.installApp = async function () {
    const promptEvent = window.appState.deferredPrompt;
    if (!promptEvent) return 'not-ready';
    try {
        promptEvent.prompt();
        const result = await promptEvent.userChoice;
        window.appState.deferredPrompt = null;
        return result.outcome;
    } catch (error) {
        console.error('❌ خطأ في التثبيت:', error);
        return 'failed';
    }
};

window.addEventListener('appinstalled', () => {
    window.appState.deferredPrompt = null;
    window.AppBridge.emit('app-installed-success');
    console.log('✅ تم تثبيت الرفيق');
});

// ============================================================
// نظام الأذان
// ============================================================
function setupAdhan() {
    const audio = document.getElementById('adhanAudio');
    const playButton = document.getElementById('adhanPlayBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');

    if (!audio || !playButton) {
        console.warn('⚠️ عناصر الأذان غير موجودة');
        return;
    }

    playButton.addEventListener('click', async () => {
        try {
            if (audio.paused) {
                audio.currentTime = 0;
                await audio.play();
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'block';
            } else {
                audio.pause();
                if (playIcon) playIcon.style.display = 'block';
                if (pauseIcon) pauseIcon.style.display = 'none';
            }
        } catch (error) {
            console.error('❌ تعذر تشغيل الأذان:', error);
            alert('تعذر تشغيل الأذان.\n\nتأكد من وجود ملف adhan.mp3.');
        }
    });

    audio.addEventListener('ended', () => {
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
    });
}

// ============================================================
// تسجيل Service Worker
// ============================================================
function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ المتصفح لا يدعم Service Worker');
        return;
    }
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('✅ Service Worker يعمل:', registration.scope))
            .catch(error => console.error('❌ فشل تسجيل Service Worker:', error));
    });
}

// ============================================================
// تحديث التطبيق كل دقيقة
// ============================================================
function startClock() {
    if (window.appState.timer) clearInterval(window.appState.timer);
    window.appState.timer = setInterval(() => {
        updateDates();
        updateNextPrayer();
    }, 60000);

    window.appState.countdownTimer = setInterval(() => {
        updateCountdown();
    }, 1000);
}

// ============================================================
// تهيئة التطبيق
// ============================================================
function initializeApp() {
    if (window.appState.initialized) return;
    window.appState.initialized = true;
    console.log('🚀 بدء تشغيل الرفيق...');

    getElements();
    populateCities();
    setupCitySelector();
    updateDates();
    loadPrayerTimes();
    setupAdhan();
    registerServiceWorker();
    startClock();

    console.log('✅ الرفيق يعمل بنجاح');
}

// ============================================================
// تشغيل التطبيق
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ============================================================
// مراقبة أخطاء JavaScript
// ============================================================
window.addEventListener('error', event => {
    console.error('❌ JavaScript Error:', event.message, '| الملف:', event.filename, '| السطر:', event.lineno);
});

// ============================================================
// نهاية app.js
// ============================================================
// ============================================================
// app.js – الرفيق
// رفيقك إلى الصلاة والذكر والقرآن
// ============================================================

'use strict';

// ============================================================
// 1. التعريفات الأساسية
// ============================================================

// المدن الجزائرية
const CITIES = {
    'Algiers':     { lat: 36.7538, lng: 3.0588, timezone: 'Africa/Algiers' },
    'Oran':        { lat: 35.6969, lng: -0.6331, timezone: 'Africa/Algiers' },
    'Constantine': { lat: 36.3650, lng: 6.6147, timezone: 'Africa/Algiers' },
    'Setif':       { lat: 36.1911, lng: 5.4137, timezone: 'Africa/Algiers' },
    'Annaba':      { lat: 36.9022, lng: 7.7553, timezone: 'Africa/Algiers' },
    'Blida':       { lat: 36.4700, lng: 2.8277, timezone: 'Africa/Algiers' },
    'Batna':       { lat: 35.5520, lng: 6.1741, timezone: 'Africa/Algiers' },
    'Tlemcen':     { lat: 34.8828, lng: -1.3167, timezone: 'Africa/Algiers' }
};

// أسماء الصلوات مرتبة (ترتيب اليوم)
const PRAYER_NAMES = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_DISPLAY = {
    'Fajr': 'الفجر',
    'Sunrise': 'الشروق',
    'Dhuhr': 'الظهر',
    'Asr': 'العصر',
    'Maghrib': 'المغرب',
    'Isha': 'العشاء'
};

// ============================================================
// 2. عناصر DOM
// ============================================================

const citySelect = document.getElementById('citySelect');
const hijriPill = document.getElementById('hijriPill');
const statusDiv = document.getElementById('status');
const prayerCard = document.getElementById('prayerCard');
const nextName = document.getElementById('nextName');
const nextTime = document.getElementById('nextTime');
const countdown = document.getElementById('countdown');
const progressBar = document.getElementById('progressBar');
const progressRing = document.getElementById('progressRing');
const adhanTimeLabel = document.getElementById('adhanTimeLabel');
const adhanPlayBtn = document.getElementById('adhanPlayBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const adhanAudio = document.getElementById('adhanAudio');
const moodNote = document.getElementById('moodNote');

// ============================================================
// 3. حالة التطبيق
// ============================================================

let currentCity = null;
let prayerTimes = null;      // { Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha }
let hijriDate = null;
let nextPrayerIndex = 0;
let countdownInterval = null;
let isAdhanPlaying = false;
let isAudioLoaded = false;
let deferredPrompt = null;   // للتثبيت

// ============================================================
// 4. دوال مساعدة
// ============================================================

function toTimeString(date) {
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function toTimeStringEn(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function parseTimeToDate(hour, minute) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
}

function diffSeconds(date1, date2) {
    return Math.floor((date2 - date1) / 1000);
}

function formatCountdown(seconds) {
    if (seconds < 0) seconds = 0;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ============================================================
// 5. جلب مواقيت الصلاة (API)
// ============================================================

async function fetchPrayerTimes(cityKey) {
    const city = CITIES[cityKey];
    if (!city) return;

    const { lat, lng } = city;
    const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`;

    try {
        statusDiv.textContent = 'جاري تحميل مواقيت الصلاة...';
        const response = await fetch(url);
        if (!response.ok) throw new Error('فشل الاتصال بالخادم');
        const data = await response.json();

        if (data.code !== 200 || !data.data) throw new Error('بيانات غير صالحة');

        const timings = data.data.timings;
        prayerTimes = {
            Fajr: timings.Fajr,
            Sunrise: timings.Sunrise,
            Dhuhr: timings.Dhuhr,
            Asr: timings.Asr,
            Maghrib: timings.Maghrib,
            Isha: timings.Isha
        };

        const hijri = data.data.date.hijri;
        hijriDate = `${hijri.day} ${hijri.month.ar} ${hijri.year}`;

        // تحديث الواجهة
        updateHijriPill();
        updateNextPrayer();
        startCountdown();
        updateAdhanTimeLabel();

        statusDiv.textContent = '✅ تم تحديث المواقيت';
        prayerCard.hidden = false;

        // رسالة ترحيبية
        const now = new Date();
        const hour = now.getHours();
        let greeting = 'أهلاً بك في الرفيق 🌙';
        if (hour >= 5 && hour < 12) greeting = 'صباح الخير ☀️';
        else if (hour >= 12 && hour < 17) greeting = 'طاب نهارك 🌤️';
        else if (hour >= 17 && hour < 20) greeting = 'مساء الخير 🌅';
        else greeting = 'ليلة سعيدة 🌙';
        moodNote.textContent = `${greeting} – ${cityKey}`;

    } catch (error) {
        console.error(error);
        statusDiv.textContent = '⚠️ تعذر تحميل المواقيت، حاول مرة أخرى';
        prayerCard.hidden = true;
    }
}

// ============================================================
// 6. حساب الصلاة القادمة
// ============================================================

function getNextPrayerIndex() {
    if (!prayerTimes) return 0;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < PRAYER_NAMES.length; i++) {
        const name = PRAYER_NAMES[i];
        const timeStr = prayerTimes[name];
        if (!timeStr) continue;
        const [h, m] = timeStr.split(':').map(Number);
        const prayerMinutes = h * 60 + m;
        if (prayerMinutes > nowMinutes) {
            return i;
        }
    }
    return 0; // الفجر التالي
}

function getPrayerTimeAsDate(prayerName) {
    const timeStr = prayerTimes[prayerName];
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return parseTimeToDate(h, m);
}

function updateNextPrayer() {
    if (!prayerTimes) return;

    const idx = getNextPrayerIndex();
    nextPrayerIndex = idx;
    const name = PRAYER_NAMES[idx];
    const displayName = PRAYER_DISPLAY[name] || name;
    nextName.textContent = displayName;

    const timeDate = getPrayerTimeAsDate(name);
    if (timeDate) {
        nextTime.textContent = toTimeString(timeDate);
        updateCountdownAndProgress(timeDate);
    }
}

// ============================================================
// 7. العد التنازلي وشريط التقدم
// ============================================================

function updateCountdownAndProgress(targetDate) {
    const now = new Date();
    let diff = diffSeconds(now, targetDate);
    if (diff < 0) {
        updateNextPrayer();
        return;
    }

    countdown.textContent = formatCountdown(diff);

    // حساب النسبة المئوية للوقت المتبقي من اليوم (تقريبي)
    const totalDayMinutes = 1440;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = targetDate.getHours() * 60 + targetDate.getMinutes();
    const remaining = targetMinutes - nowMinutes;
    const progress = (remaining / totalDayMinutes) * 100;
    const clamped = Math.min(100, Math.max(0, progress));
    progressBar.style.width = `${100 - clamped}%`;

    // تحديث الدائرة
    const circumference = 427.3; // 2 * PI * 68
    const offset = circumference * (1 - (100 - clamped) / 100);
    progressRing.style.strokeDashoffset = offset;
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        if (!prayerTimes) return;
        const idx = getNextPrayerIndex();
        if (idx !== nextPrayerIndex) {
            updateNextPrayer();
            return;
        }
        const name = PRAYER_NAMES[nextPrayerIndex];
        const targetDate = getPrayerTimeAsDate(name);
        if (targetDate) {
            updateCountdownAndProgress(targetDate);
        }
    }, 1000);
}

// ============================================================
// 8. التاريخ الهجري
// ============================================================

function updateHijriPill() {
    if (hijriDate) {
        hijriPill.textContent = `📅 ${hijriDate}`;
    } else {
        hijriPill.textContent = '📅 —';
    }
}

// ============================================================
// 9. الأذان
// ============================================================

function updateAdhanTimeLabel() {
    if (!prayerTimes) {
        adhanTimeLabel.textContent = '—';
        return;
    }
    const idx = getNextPrayerIndex();
    const name = PRAYER_NAMES[idx];
    const displayName = PRAYER_DISPLAY[name] || name;
    const timeDate = getPrayerTimeAsDate(name);
    if (timeDate) {
        adhanTimeLabel.textContent = `${displayName} • ${toTimeString(timeDate)}`;
    } else {
        adhanTimeLabel.textContent = displayName;
    }
}

function toggleAdhan() {
    if (adhanAudio.paused) {
        adhanAudio.play().catch(err => {
            console.warn('تعذر تشغيل الأذان:', err);
        });
        isAdhanPlaying = true;
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        adhanAudio.pause();
        isAdhanPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

// عند انتهاء الأذان تلقائيًا
adhanAudio.addEventListener('ended', () => {
    isAdhanPlaying = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
});

function preloadAdhan() {
    if (!isAudioLoaded) {
        adhanAudio.load();
        isAudioLoaded = true;
    }
}

// ============================================================
// 10. التحكم في المدينة
// ============================================================

citySelect.addEventListener('change', function() {
    const city = this.value;
    if (city && CITIES[city]) {
        currentCity = city;
        fetchPrayerTimes(city);
        localStorage.setItem('preferredCity', city);
    } else {
        prayerCard.hidden = true;
        statusDiv.textContent = 'الرجاء اختيار مدينة';
    }
});

// ============================================================
// 11. PWA (التثبيت)
// ============================================================

window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    console.log('📱 الرفيق جاهز للتثبيت');
    // يمكن إظهار زر تثبيت مخصص في الواجهة
});

window.installApp = async function() {
    if (!deferredPrompt) {
        console.warn('⚠️ التثبيت غير متاح');
        return 'not-ready';
    }
    try {
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        deferredPrompt = null;
        console.log('📱 نتيجة التثبيت:', result.outcome);
        return result.outcome;
    } catch (error) {
        console.error('❌ خطأ أثناء التثبيت:', error);
        return 'failed';
    }
};

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    console.log('✅ تم تثبيت الرفيق بنجاح');
});

// اكتشاف وضع التطبيق المثبت
function detectAppMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator.standalone === true;
    if (isStandalone || isIOSStandalone) {
        console.log('📱 الرفيق يعمل بوضع التطبيق المثبت');
    }
}
detectAppMode();

// ============================================================
// 12. تهيئة التطبيق
// ============================================================

function init() {
    // استعادة المدينة المفضلة
    const saved = localStorage.getItem('preferredCity');
    if (saved && CITIES[saved]) {
        citySelect.value = saved;
        currentCity = saved;
        fetchPrayerTimes(saved);
    } else {
        citySelect.value = 'Algiers';
        currentCity = 'Algiers';
        fetchPrayerTimes('Algiers');
    }

    // مستمع زر الأذان
    adhanPlayBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        preloadAdhan();
        toggleAdhan();
    });

    // تحميل الصوت عند أول تفاعل
    document.addEventListener('click', preloadAdhan, { once: true });
    document.addEventListener('touchstart', preloadAdhan, { once: true });

    // تحديث كل دقيقة (للعد التنازلي)
    setInterval(() => {
        // يمكن إعادة جلب المواقيت إذا تغير اليوم (اختياري)
    }, 60000);
}

// بدء التطبيق
init();

// ============================================================
// 13. مراقبة الأخطاء
// ============================================================

window.addEventListener('error', event => {
    console.error('❌ JavaScript Error:', event.message, event.filename, event.lineno, event.colno);
});

window.addEventListener('unhandledrejection', event => {
    console.error('❌ Unhandled Promise Error:', event.reason);
});

console.log('🚀 الرفيق — app.js يعمل بنجاح');
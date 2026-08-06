/* ==========================================================
   الرفيق
   app.js
   الإصدار : 2.0.1
   المراحل 1+2+3 مدمجة + إصلاحات الأذان
   Core Engine + المدن + التاريخ + أوقات الصلاة

   ✔ بدون مكتبات
   ✔ يعمل Offline
   ✔ لا يعتمد على API
   ✔ قابل للتطوير
==========================================================*/

"use strict";

const APP = {
    name: "الرفيق",
    version: "2.0.1",
    build: "offline-core"
};

const Storage = {
    get(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (e) {
            console.warn("Storage GET:", e);
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn("Storage SET:", e);
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {}
    }
};

const State = {
    city: null,
    latitude: null,
    longitude: null,
    prayerTimes: null,
    nextPrayer: null,
    hijriDate: null,
    gregorianDate: new Date(),
    online: navigator.onLine,
    ready: false,
    adhanPlayedFor: null, // لحفظ اسم الصلاة التي شُغّل لها الأذان
    audioUnlocked: false  // جديد: هل تم فتح قفل الصوت بعد أول تفاعل؟
};

const Utils = {
    pad(value) {
        return String(value).padStart(2, "0");
    },
    minutes(time) {
        const p = time.split(":");
        return Number(p[0]) * 60 + Number(p[1]);
    },
    normalize(deg) {
        return ((deg % 360) + 360) % 360;
    }
};

const UI = {
    status: document.getElementById("status"),
    city: document.getElementById("citySelect"),
    hijri: document.getElementById("hijriPill"),
    gregorian: document.getElementById("gregorianDisplay"),
    prayerCard: document.getElementById("prayerCard"),
    nextName: document.getElementById("nextName"),
    nextTime: document.getElementById("nextTime"),
    countdown: document.getElementById("countdown"),
    progress: document.getElementById("progressBar"),
    adhanLabel: document.getElementById("adhanTimeLabel"),
    audio: document.getElementById("adhanAudio"),
    play: document.getElementById("playIcon"),
    pause: document.getElementById("pauseIcon"),
    playButton: document.getElementById("adhanPlayBtn")
};

function setStatus(text) {
    if (!UI.status) return;
    UI.status.textContent = text;
}

window.addEventListener("online", () => {
    State.online = true;
    setStatus("تم الاتصال بالإنترنت");
});
window.addEventListener("offline", () => {
    State.online = false;
    setStatus("يعمل بدون إنترنت");
});

/*==========================================================
  جديد: فتح قفل تشغيل الصوت عند أول تفاعل من المستخدم
  (المتصفحات تمنع audio.play() التلقائي بدون هذا)
==========================================================*/
function unlockAudio() {
    if (State.audioUnlocked || !UI.audio) return;
    UI.audio.muted = true;
    const p = UI.audio.play();
    if (p !== undefined) {
        p.then(() => {
            UI.audio.pause();
            UI.audio.currentTime = 0;
            UI.audio.muted = false;
            State.audioUnlocked = true;
            console.log("تم فتح قفل الصوت");
        }).catch(() => {
            UI.audio.muted = false;
        });
    }
}
document.addEventListener("click", unlockAudio, { once: true });
document.addEventListener("touchstart", unlockAudio, { once: true });

/*==========================================================
  جديد: إذن الإشعارات (طبقة تنبيه بديلة عند الشاشة المقفلة)
==========================================================*/
function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
}
document.addEventListener("click", requestNotificationPermission, { once: true });
document.addEventListener("touchstart", requestNotificationPermission, { once: true });

function showAdhanNotification(prayerName) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const options = {
        body: "حان الآن وقت الصلاة",
        icon: "./icons/icon-192.png", // ⚠️ عدّل المسار حسب أيقونة تطبيقك الفعلية
        vibrate: [500, 200, 500, 200, 500],
        tag: "adhan-notification",
        requireInteraction: true
    };
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(`حان وقت صلاة ${prayerName}`, options);
        });
    } else {
        try {
            new Notification(`حان وقت صلاة ${prayerName}`, options);
        } catch (e) {
            console.warn("تعذر إظهار الإشعار:", e);
        }
    }
}

const WILAYAS = [
    { code:"01", name:"أدرار", lat:27.87, lng:-0.28 },
    { code:"02", name:"الشلف", lat:36.16, lng:1.33 },
    { code:"03", name:"الأغواط", lat:33.80, lng:2.87 },
    { code:"04", name:"أم البواقي", lat:35.87, lng:7.11 },
    { code:"05", name:"باتنة", lat:35.55, lng:6.17 },
    { code:"06", name:"بجاية", lat:36.75, lng:5.07 },
    { code:"07", name:"بسكرة", lat:34.85, lng:5.73 },
    { code:"08", name:"بشار", lat:31.61, lng:-2.23 },
    { code:"09", name:"البليدة", lat:36.47, lng:2.83 },
    { code:"10", name:"البويرة", lat:36.37, lng:3.89 },
    { code:"11", name:"تمنراست", lat:22.79, lng:5.52 },
    { code:"12", name:"تبسة", lat:35.41, lng:8.12 },
    { code:"13", name:"تلمسان", lat:34.88, lng:-1.32 },
    { code:"14", name:"تيارت", lat:35.37, lng:1.32 },
    { code:"15", name:"تيزي وزو", lat:36.71, lng:4.05 },
    { code:"16", name:"الجزائر", lat:36.75, lng:3.04 },
    { code:"17", name:"الجلفة", lat:34.67, lng:3.26 },
    { code:"18", name:"جيجل", lat:36.82, lng:5.76 },
    { code:"19", name:"سطيف", lat:36.19, lng:5.41 },
    { code:"20", name:"سعيدة", lat:34.83, lng:0.15 },
    { code:"21", name:"سكيكدة", lat:36.87, lng:6.90 },
    { code:"22", name:"سيدي بلعباس", lat:35.19, lng:-0.63 },
    { code:"23", name:"عنابة", lat:36.90, lng:7.75 },
    { code:"24", name:"قالمة", lat:36.46, lng:7.43 },
    { code:"25", name:"قسنطينة", lat:36.36, lng:6.60 },
    { code:"26", name:"المدية", lat:36.26, lng:2.77 },
    { code:"27", name:"مستغانم", lat:35.94, lng:0.09 },
    { code:"28", name:"المسيلة", lat:35.70, lng:4.54 },
    { code:"29", name:"معسكر", lat:35.39, lng:0.13 },
    { code:"30", name:"ورقلة", lat:31.94, lng:5.32 },
    { code:"31", name:"وهران", lat:35.69, lng:-0.64 },
    { code:"32", name:"البيض", lat:33.68, lng:1.02 },
    { code:"33", name:"إليزي", lat:26.51, lng:8.48 },
    { code:"34", name:"برج بوعريريج", lat:36.07, lng:4.76 },
    { code:"35", name:"بومرداس", lat:36.76, lng:3.47 },
    { code:"36", name:"الطارف", lat:36.76, lng:8.31 },
    { code:"37", name:"تندوف", lat:27.67, lng:-8.14 },
    { code:"38", name:"تيسمسيلت", lat:35.60, lng:1.81 },
    { code:"39", name:"الوادي", lat:33.37, lng:6.86 },
    { code:"40", name:"خنشلة", lat:35.44, lng:7.14 },
    { code:"41", name:"سوق أهراس", lat:36.28, lng:7.95 },
    { code:"42", name:"تيبازة", lat:36.58, lng:2.44 },
    { code:"43", name:"ميلة", lat:36.45, lng:6.26 },
    { code:"44", name:"عين الدفلى", lat:36.26, lng:2.00 },
    { code:"45", name:"النعامة", lat:33.27, lng:-0.31 },
    { code:"46", name:"عين تموشنت", lat:35.30, lng:-1.14 },
    { code:"47", name:"غرداية", lat:32.49, lng:3.67 },
    { code:"48", name:"غليزان", lat:35.74, lng:0.56 },
    { code:"49", name:"تميمون", lat:29.26, lng:0.23 },
    { code:"50", name:"برج باجي مختار", lat:21.33, lng:0.95 },
    { code:"51", name:"أولاد جلال", lat:34.42, lng:5.06 },
    { code:"52", name:"بني عباس", lat:30.08, lng:-2.10 },
    { code:"53", name:"عين صالح", lat:27.19, lng:2.48 },
    { code:"54", name:"عين قزام", lat:19.57, lng:5.77 },
    { code:"55", name:"تقرت", lat:33.10, lng:6.06 },
    { code:"56", name:"جانت", lat:24.55, lng:9.48 },
    { code:"57", name:"المغير", lat:33.95, lng:5.93 },
    { code:"58", name:"المنيعة", lat:30.60, lng:2.88 }
];

function hijriDate(gregDate = new Date()) {
    const d = new Date(gregDate);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset() + 60);
    const jd = Math.floor((d.getTime() / 86400000) + 2440587.5);
    const l = jd - 1948439;
    const n = Math.floor(l / 10631);
    let rem = l % 10631;
    const years = n * 30;
    const kabisa = [2,5,7,10,13,15,18,21,24,26,29];
    let y = 0;
    let daysInYear;
    while (rem >= (daysInYear = kabisa.includes(y) ? 355 : 354)) {
        rem -= daysInYear;
        y++;
    }
    const year = years + y + 1;
    const monthLengths = [
        30, (kabisa.includes(y) ? 30 : 29), 30, 29, 30, 29,
        30, 29, 30, 29, 30, (kabisa.includes(y) ? 30 : 29)
    ];
    let m = 0;
    while (rem >= monthLengths[m]) {
        rem -= monthLengths[m];
        m++;
    }
    const month = m + 1;
    const day = rem + 1;
    return { year, month, day };
}

function formatHijri({ year, month, day }) {
    const monthNames = [
        "محرم","صفر","ربيع الأول","ربيع الثاني",
        "جمادى الأولى","جمادى الآخرة","رجب",
        "شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"
    ];
    return `${day} ${monthNames[month-1]} ${year}هـ`;
}

function updateDates() {
    const now = new Date();
    State.gregorianDate = now;
    const hijri = hijriDate(now);
    State.hijriDate = hijri;
    if (UI.hijri) {
        UI.hijri.textContent = formatHijri(hijri);
    }
    if (UI.gregorian) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        UI.gregorian.textContent = now.toLocaleDateString('ar-SA', options);
    }
}

function buildCityList() {
    if (!UI.city) return;
    UI.city.innerHTML = '';
    WILAYAS.forEach(w => {
        const option = document.createElement('option');
        option.value = w.code;
        option.textContent = w.name;
        UI.city.appendChild(option);
    });
    const savedCode = Storage.get('cityCode', '16');
    if (savedCode && WILAYAS.some(w => w.code === savedCode)) {
        UI.city.value = savedCode;
    } else {
        UI.city.value = '16';
    }
    applyCity(UI.city.value);
    UI.city.addEventListener('change', function(e) {
        const code = e.target.value;
        applyCity(code);
        Storage.set('cityCode', code);
        refreshPrayerTimes();
    });
}

function applyCity(code) {
    const city = WILAYAS.find(w => w.code === code);
    if (!city) return;
    State.city = city.name;
    State.latitude = city.lat;
    State.longitude = city.lng;
    if (UI.city) UI.city.value = code;
    setStatus(`المدينة: ${city.name}`);
}

const PRAYER_ANGLES = {
    fajr: -18,
    sunrise: -0.833,
    dhuhr: 0,
    asr: 1,
    maghrib: -0.833,
    isha: -17
};

function julianDate(date) {
    let y = date.getUTCFullYear();
    let m = date.getUTCMonth() + 1;
    let d = date.getUTCDate();
    if (m <= 2) { y--; m += 12; }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716))
         + Math.floor(30.6001 * (m + 1))
         + d + b - 1524.5;
}

function sunPosition(jd) {
    const d = jd - 2451545.0;
    const g = (357.529 + 0.98560028 * d) % 360;
    const q = (280.459 + 0.98564736 * d) % 360;
    const l = (q + 1.915 * Math.sin(g * Math.PI / 180)
                + 0.020 * Math.sin(2 * g * Math.PI / 180)) % 360;
    const e = 23.439 - 0.00000036 * d;
    const ra = Math.atan2(
        Math.cos(e * Math.PI / 180) * Math.sin(l * Math.PI / 180),
        Math.cos(l * Math.PI / 180)
    ) * 180 / Math.PI;
    const dec = Math.asin(
        Math.sin(e * Math.PI / 180) * Math.sin(l * Math.PI / 180)
    ) * 180 / Math.PI;
    const eqTime = (q - ra) / 15;
    return { dec, eqTime };
}

function hourAngle(lat, dec, angle) {
    const latRad = lat * Math.PI / 180;
    const decRad = dec * Math.PI / 180;
    const a = Math.sin(angle * Math.PI / 180);
    const b = Math.sin(latRad) * Math.sin(decRad);
    const c = Math.cos(latRad) * Math.cos(decRad);
    const cosH = (a - b) / c;
    if (cosH > 1) return 0;
    if (cosH < -1) return 12;
    return Math.acos(cosH) * 180 / Math.PI / 15;
}

function calcTime(lat, lng, jd, angle, isSunrise = false) {
    const { dec, eqTime } = sunPosition(jd);
    let ha = hourAngle(lat, dec, angle);
    if (isSunrise) ha = -ha;
    let noon = 12 - lng / 15 - eqTime;
    let time = noon + ha;
    time += 1; // UTC+1
    return time;
}

function computePrayerTimes(date = new Date()) {
    const lat = State.latitude;
    const lng = State.longitude;
    if (lat == null || lng == null) return null;
    const jd = julianDate(date);
    const times = {};

    let fajr = calcTime(lat, lng, jd, PRAYER_ANGLES.fajr);
    times.fajr = timeToString(fajr);

    let sunrise = calcTime(lat, lng, jd, PRAYER_ANGLES.sunrise, true);
    times.sunrise = timeToString(sunrise);

    let dhuhr = calcTime(lat, lng, jd, 0);
    times.dhuhr = timeToString(dhuhr);

    const { dec } = sunPosition(jd);
    const asrAngle = Math.atan(1 / (1 + Math.tan(
        (lat - dec) * Math.PI / 180
    ))) * 180 / Math.PI;
    let asr = calcTime(lat, lng, jd, asrAngle);
    times.asr = timeToString(asr);

    let maghrib = calcTime(lat, lng, jd, PRAYER_ANGLES.maghrib);
    times.maghrib = timeToString(maghrib);

    let isha = calcTime(lat, lng, jd, PRAYER_ANGLES.isha);
    times.isha = timeToString(isha);

    return times;
}

function timeToString(hours) {
    if (hours < 0) hours += 24;
    if (hours >= 24) hours -= 24;
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60 + 0.5);
    return `${Utils.pad(h)}:${Utils.pad(m)}`;
}

function getNextPrayer() {
    if (!State.prayerTimes) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const prayers = [
        { name: "الفجر", time: State.prayerTimes.fajr },
        { name: "الشروق", time: State.prayerTimes.sunrise },
        { name: "الظهر", time: State.prayerTimes.dhuhr },
        { name: "العصر", time: State.prayerTimes.asr },
        { name: "المغرب", time: State.prayerTimes.maghrib },
        { name: "العشاء", time: State.prayerTimes.isha }
    ];
    for (let p of prayers) {
        const pMin = Utils.minutes(p.time);
        if (pMin > currentMinutes) {
            const diff = pMin - currentMinutes;
            return {
                name: p.name,
                time: p.time,
                remaining: diff,
                total: diff
            };
        }
    }
    const fajrMin = Utils.minutes(State.prayerTimes.fajr);
    const diff = (24 * 60) - currentMinutes + fajrMin;
    return {
        name: "الفجر (غداً)",
        time: State.prayerTimes.fajr,
        remaining: diff,
        total: diff
    };
}

function updateNextPrayerUI() {
    const next = getNextPrayer();
    if (!next) return;
    State.nextPrayer = next;
    if (UI.nextName) UI.nextName.textContent = next.name;
    if (UI.nextTime) UI.nextTime.textContent = next.time;
    const hours = Math.floor(next.remaining / 60);
    const mins = next.remaining % 60;
    if (UI.countdown) UI.countdown.textContent =
        `${Utils.pad(hours)}:${Utils.pad(mins)}`;
    if (UI.progress) {
        const prayers = ["fajr","sunrise","dhuhr","asr","maghrib","isha"];
        let prevTime, nextTime;
        if (next.name.includes("الفجر")) {
            prevTime = State.prayerTimes.isha;
            nextTime = State.prayerTimes.fajr;
        } else {
            const idx = prayers.indexOf(
                Object.keys(State.prayerTimes).find(k => State.prayerTimes[k] === next.time)
            );
            const prevIdx = (idx - 1 + prayers.length) % prayers.length;
            prevTime = State.prayerTimes[prayers[prevIdx]];
            nextTime = State.prayerTimes[prayers[idx]];
        }
        const total = (Utils.minutes(nextTime) - Utils.minutes(prevTime) + 24*60) % (24*60);
        const elapsed = total - next.remaining;
        const percent = Math.min(100, Math.floor((elapsed / total) * 100));
        UI.progress.style.width = `${percent}%`;
    }
}

/*==========================================================
  الأذان — checkAdhan و playAdhan (مُصلَحة)
==========================================================*/

// جديد: نافذة مطابقة موسّعة (دقيقتان) بدل تطابق حرفي للدقيقة
// هذا يمنع تفويت الأذان إذا تأخر تنفيذ المؤقّت (مثلاً بسبب تجميد المتصفح)
const ADHAN_MATCH_WINDOW_MINUTES = 2;

function checkAdhan() {
    if (!State.prayerTimes) return;
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const adhanMap = {
        "الفجر": State.prayerTimes.fajr,
        "الظهر": State.prayerTimes.dhuhr,
        "العصر": State.prayerTimes.asr,
        "المغرب": State.prayerTimes.maghrib,
        "العشاء": State.prayerTimes.isha
    };

    for (const [name, time] of Object.entries(adhanMap)) {
        const targetMin = Utils.minutes(time);
        // نطبّق modulo لتفادي مشاكل التفاف منتصف الليل
        const diff = (currentMin - targetMin + 1440) % 1440;
        if (diff >= 0 && diff <= ADHAN_MATCH_WINDOW_MINUTES && State.adhanPlayedFor !== name) {
            playAdhan(name);
            break;
        }
    }
}

function playAdhan(prayerName) {
    if (!UI.audio) return;
    // منع التشغيل المتكرر لنفس الصلاة
    State.adhanPlayedFor = prayerName;

    // جديد: إشعار مرئي + اهتزاز يعمل حتى والشاشة مقفلة (طالما التطبيق لم يُغلق كليًا)
    showAdhanNotification(prayerName);

    UI.audio.currentTime = 0;
    const playPromise = UI.audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // تم التشغيل بنجاح
            if (UI.play) UI.play.style.display = 'none';
            if (UI.pause) UI.pause.style.display = 'inline';
        }).catch((err) => {
            // المتصفح منع التشغيل التلقائي – نظهر زر التشغيل اليدوي
            console.warn("تعذر التشغيل التلقائي للأذان:", err);
            if (UI.playButton) UI.playButton.style.display = 'block';
            if (UI.play) UI.play.style.display = 'inline';
            if (UI.pause) UI.pause.style.display = 'none';
        });
    }
}

// جديد: ربط زر التشغيل/الإيقاف اليدوي فعليًا (كان غائبًا تمامًا سابقًا)
function bindManualAdhanButton() {
    if (!UI.playButton || !UI.audio) return;
    UI.playButton.addEventListener('click', () => {
        if (UI.audio.paused) {
            UI.audio.play()
                .then(() => {
                    if (UI.play) UI.play.style.display = 'none';
                    if (UI.pause) UI.pause.style.display = 'inline';
                })
                .catch((err) => {
                    console.error('فشل تشغيل الأذان يدويًا:', err);
                    alert('تعذّر تشغيل الملف الصوتي — تحقق من مسار ملف الأذان (src) في HTML');
                });
        } else {
            UI.audio.pause();
            if (UI.play) UI.play.style.display = 'inline';
            if (UI.pause) UI.pause.style.display = 'none';
        }
    });
}

// إعادة تعيين adhanPlayedFor عند تغير الوقت أو اليوم
function resetAdhanFlagIfNewPrayer() {
    if (!State.prayerTimes || !State.nextPrayer) return;
    if (State.adhanPlayedFor && !State.nextPrayer.name.includes(State.adhanPlayedFor)) {
        State.adhanPlayedFor = null;
        if (UI.playButton) UI.playButton.style.display = 'none';
    }
}

let tickInterval = null;

function startTicking() {
    if (tickInterval) clearInterval(tickInterval);
    tickInterval = setInterval(() => {
        updateNextPrayerUI();
        resetAdhanFlagIfNewPrayer();
        checkAdhan();
    }, 1000);
}

function refreshPrayerTimes() {
    const times = computePrayerTimes();
    if (times) {
        State.prayerTimes = times;
        State.adhanPlayedFor = null;
        updateNextPrayerUI();
        if (UI.prayerCard) {
            UI.prayerCard.innerHTML = `
                <div>الفجر: ${times.fajr}</div>
                <div>الشروق: ${times.sunrise}</div>
                <div>الظهر: ${times.dhuhr}</div>
                <div>العصر: ${times.asr}</div>
                <div>المغرب: ${times.maghrib}</div>
                <div>العشاء: ${times.isha}</div>
            `;
        }
    }
}

function initPhase3() {
    if (State.latitude == null || State.longitude == null) {
        applyCity(Storage.get('cityCode', '16'));
    }
    refreshPrayerTimes();
    bindManualAdhanButton(); // جديد
    startTicking();
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    setTimeout(() => {
        refreshPrayerTimes();
        setInterval(refreshPrayerTimes, 24 * 60 * 60 * 1000);
    }, msToMidnight);
    console.log("المرحلة الثالثة جاهزة (أوقات الصلاة)");
}

function boot() {
    console.log(APP.name, APP.version, "بدأ التشغيل");
    State.ready = true;
    setStatus("جاري تهيئة النظام...");

    buildCityList();
    updateDates();
    setInterval(updateDates, 60000);
    console.log("المرحلة الثانية جاهزة");

    initPhase3();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}

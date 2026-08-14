/* ==========================================================
   الرفيق — app.js
   الإصدار : 3.0.0 (نسخة الدقة المتناهية)
   إصلاح مواقيت الصلاة + تحسين الأداء + دعم أندرويد
   ==========================================================*/

"use strict";

const APP = {
    name: "الرفيق",
    version: "3.0.0",
    build: "android-optimized"
};

const Storage = {
    get(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (e) { return fallback; }
    },
    set(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
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
    audioUnlocked: false,
    adhanPlayedFor: null
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
    audio: document.getElementById("adhanAudio"),
    playButton: document.getElementById("adhanPlayBtn"),
    playIcon: document.getElementById("playIcon"),
    pauseIcon: document.getElementById("pauseIcon")
};

const Utils = {
    pad: (n) => String(n).padStart(2, '0'),
    d2r: (d) => d * Math.PI / 180,
    r2d: (r) => r * 180 / Math.PI,
    normalize: (n, max) => ((n % max) + max) % max,
    timeToMin: (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    },
    minToTime: (m) => {
        m = Utils.normalize(m, 1440);
        const h = Math.floor(m / 60);
        const min = Math.floor(m % 60);
        return `${Utils.pad(h)}:${Utils.pad(min)}`;
    }
};

const PrayerCalc = {
    angles: { fajr: 18, isha: 17, maghrib: 0.833, sunrise: 0.833 },
    compute(date, lat, lng, timezone = 1) {
        const jd = this.getJulian(date) - lng / (15 * 24);
        const sun = this.sunPosition(jd);
        const noon = this.midDay(jd, sun.eqTime);
        const times = {
            fajr: noon - this.hourAngle(lat, sun.dec, this.angles.fajr),
            sunrise: noon - this.hourAngle(lat, sun.dec, this.angles.sunrise),
            dhuhr: noon,
            asr: noon + this.asrAngle(lat, sun.dec),
            maghrib: noon + this.hourAngle(lat, sun.dec, this.angles.maghrib),
            isha: noon + this.hourAngle(lat, sun.dec, this.angles.isha)
        };
        const result = {};
        for (let i in times) {
            result[i] = Utils.minToTime(times[i] * 60 + timezone * 60);
        }
        return result;
    },
    getJulian(date) { return date.getTime() / 86400000 + 2440587.5; },
    sunPosition(jd) {
        const D = jd - 2451545.0;
        const g = Utils.normalize(357.529 + 0.98560028 * D, 360);
        const q = Utils.normalize(280.459 + 0.98564736 * D, 360);
        const L = Utils.normalize(q + 1.915 * Math.sin(Utils.d2r(g)) + 0.020 * Math.sin(Utils.d2r(2 * g)), 360);
        const e = 23.439 - 0.00000036 * D;
        const ra = Utils.r2d(Math.atan2(Math.cos(Utils.d2r(e)) * Math.sin(Utils.d2r(L)), Math.cos(Utils.d2r(L)))) / 15;
        const dec = Utils.r2d(Math.asin(Math.sin(Utils.d2r(e)) * Math.sin(Utils.d2r(L))));
        const eqTime = q / 15 - Utils.normalize(ra, 24);
        return { dec, eqTime };
    },
    midDay(jd, eqTime) { return Utils.normalize(12 - eqTime, 24); },
    hourAngle(lat, dec, angle) {
        const latR = Utils.d2r(lat);
        const decR = Utils.d2r(dec);
        const angR = Utils.d2r(angle);
        const cosH = (Math.sin(-angR) - Math.sin(latR) * Math.sin(decR)) / (Math.cos(latR) * Math.cos(decR));
        if (cosH > 1) return 0;
        if (cosH < -1) return 12;
        return Utils.r2d(Math.acos(cosH)) / 15;
    },
    asrAngle(lat, dec) {
        const latR = Utils.d2r(lat);
        const decR = Utils.d2r(dec);
        const s = Math.tan(Math.abs(latR - decR));
        const asrR = Math.atan(1 / (1 + s));
        const cosH = (Math.sin(asrR) - Math.sin(latR) * Math.sin(decR)) / (Math.cos(latR) * Math.cos(decR));
        return Utils.r2d(Math.acos(cosH)) / 15;
    }
};

const WILAYAS = [
    { code:"01", name:"أدرار", lat:27.87, lng:-0.28 }, { code:"02", name:"الشلف", lat:36.16, lng:1.33 },
    { code:"03", name:"الأغواط", lat:33.80, lng:2.87 }, { code:"04", name:"أم البواقي", lat:35.87, lng:7.11 },
    { code:"05", name:"باتنة", lat:35.55, lng:6.17 }, { code:"06", name:"بجاية", lat:36.75, lng:5.07 },
    { code:"07", name:"بسكرة", lat:34.85, lng:5.73 }, { code:"08", name:"بشار", lat:31.61, lng:-2.23 },
    { code:"09", name:"البليدة", lat:36.47, lng:2.83 }, { code:"10", name:"البويرة", lat:36.37, lng:3.89 },
    { code:"11", name:"تمنراست", lat:22.79, lng:5.52 }, { code:"12", name:"تبسة", lat:35.41, lng:8.12 },
    { code:"13", name:"تلمسان", lat:34.88, lng:-1.32 }, { code:"14", name:"تيارت", lat:35.37, lng:1.32 },
    { code:"15", name:"تيزي وزو", lat:36.71, lng:4.05 }, { code:"16", name:"الجزائر", lat:36.75, lng:3.04 },
    { code:"17", name:"الجلفة", lat:34.67, lng:3.26 }, { code:"18", name:"جيجل", lat:36.82, lng:5.76 },
    { code:"19", name:"سطيف", lat:36.19, lng:5.41 }, { code:"20", name:"سعيدة", lat:34.83, lng:0.15 },
    { code:"21", name:"سكيكدة", lat:36.87, lng:6.90 }, { code:"22", name:"سيدي بلعباس", lat:35.19, lng:-0.63 },
    { code:"23", name:"عنابة", lat:36.90, lng:7.75 }, { code:"24", name:"قالمة", lat:36.46, lng:7.43 },
    { code:"25", name:"قسنطينة", lat:36.36, lng:6.60 }, { code:"26", name:"المدية", lat:36.26, lng:2.77 },
    { code:"27", name:"مستغانم", lat:35.94, lng:0.09 }, { code:"28", name:"المسيلة", lat:35.70, lng:4.54 },
    { code:"29", name:"معسكر", lat:35.39, lng:0.13 }, { code:"30", name:"ورقلة", lat:31.94, lng:5.32 },
    { code:"31", name:"وهران", lat:35.69, lng:-0.64 }, { code:"32", name:"البيض", lat:33.68, lng:1.02 },
    { code:"33", name:"إليزي", lat:26.51, lng:8.48 }, { code:"34", name:"برج بوعريريج", lat:36.07, lng:4.76 },
    { code:"35", name:"بومرداس", lat:36.76, lng:3.47 }, { code:"36", name:"الطارف", lat:36.76, lng:8.31 },
    { code:"37", name:"تندوف", lat:27.67, lng:-8.14 }, { code:"38", name:"تيسمسيلت", lat:35.60, lng:1.81 },
    { code:"39", name:"الوادي", lat:33.37, lng:6.86 }, { code:"40", name:"خنشلة", lat:35.44, lng:7.14 },
    { code:"41", name:"سوق أهراس", lat:36.28, lng:7.95 }, { code:"42", name:"تيبازة", lat:36.58, lng:2.44 },
    { code:"43", name:"ميلة", lat:36.45, lng:6.26 }, { code:"44", name:"عين الدفلى", lat:36.26, lng:2.00 },
    { code:"45", name:"النعامة", lat:33.27, lng:-0.31 }, { code:"46", name:"عين تموشنت", lat:35.30, lng:-1.14 },
    { code:"47", name:"غرداية", lat:32.49, lng:3.67 }, { code:"48", name:"غليزان", lat:35.74, lng:0.56 },
    { code:"49", name:"تميمون", lat:29.26, lng:0.23 }, { code:"50", name:"برج باجي مختار", lat:21.33, lng:0.95 },
    { code:"51", name:"أولاد جلال", lat:34.42, lng:5.06 }, { code:"52", name:"بني عباس", lat:30.08, lng:-2.10 },
    { code:"53", name:"عين صالح", lat:27.19, lng:2.48 }, { code:"54", name:"عين قزام", lat:19.57, lng:5.77 },
    { code:"55", name:"تقرت", lat:33.10, lng:6.06 }, { code:"56", name:"جانت", lat:24.55, lng:9.48 },
    { code:"57", name:"المغير", lat:33.95, lng:5.93 }, { code:"58", name:"المنيعة", lat:30.60, lng:2.88 }
];

function updateDates() {
    const now = new Date();
    if (UI.gregorian) UI.gregorian.textContent = now.toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day:'numeric', month:'long', year:'numeric'}).format(now);
    if (UI.hijri) UI.hijri.textContent = hijri;
}

function applyCity(code) {
    const city = WILAYAS.find(w => w.code === code) || WILAYAS[15];
    State.city = city.name; State.latitude = city.lat; State.longitude = city.lng;
    Storage.set('cityCode', code); refreshPrayerTimes();
}

function refreshPrayerTimes() {
    if (State.latitude === null) return;
    const times = PrayerCalc.compute(new Date(), State.latitude, State.longitude);
    State.prayerTimes = times;
    const details = document.getElementById("prayerDetails");
    if (details) {
        details.innerHTML = `
            <div class="prayer-row"><span>الفجر</span> <span>${times.fajr}</span></div>
            <div class="prayer-row"><span>الشروق</span> <span>${times.sunrise}</span></div>
            <div class="prayer-row"><span>الظهر</span> <span>${times.dhuhr}</span></div>
            <div class="prayer-row"><span>العصر</span> <span>${times.asr}</span></div>
            <div class="prayer-row"><span>المغرب</span> <span>${times.maghrib}</span></div>
            <div class="prayer-row"><span>العشاء</span> <span>${times.isha}</span></div>
        `;
    }
    updateNextPrayerUI();
}

function getNextPrayer() {
    if (!State.prayerTimes) return null;
    const now = new Date(); const currentMin = now.getHours() * 60 + now.getMinutes();
    const prayers = [
        { name: "الفجر", id: "fajr", time: State.prayerTimes.fajr },
        { name: "الظهر", id: "dhuhr", time: State.prayerTimes.dhuhr },
        { name: "العصر", id: "asr", time: State.prayerTimes.asr },
        { name: "المغرب", id: "maghrib", time: State.prayerTimes.maghrib },
        { name: "العشاء", id: "isha", time: State.prayerTimes.isha }
    ];
    for (let p of prayers) {
        const pMin = Utils.timeToMin(p.time);
        if (pMin > currentMin) return { ...p, remaining: pMin - currentMin };
    }
    const fajrNext = Utils.timeToMin(State.prayerTimes.fajr) + 1440;
    return { ...prayers[0], remaining: fajrNext - currentMin };
}

function updateNextPrayerUI() {
    const next = getNextPrayer(); if (!next) return;
    State.nextPrayer = next;
    if (UI.nextName) UI.nextName.textContent = next.name;
    if (UI.nextTime) UI.nextTime.textContent = next.time;
    const h = Math.floor(next.remaining / 60); const m = next.remaining % 60;
    if (UI.countdown) UI.countdown.textContent = `${Utils.pad(h)}:${Utils.pad(m)}`;
    const adhanLabel = document.getElementById("adhanTimeLabel");
    if (adhanLabel) adhanLabel.textContent = next.time;
}

function boot() {
    const saved = Storage.get('cityCode', '16');
    if (UI.city) {
        WILAYAS.forEach(w => {
            const opt = document.createElement('option'); opt.value = w.code; opt.textContent = w.name; UI.city.appendChild(opt);
        });
        UI.city.value = saved; UI.city.onchange = (e) => applyCity(e.target.value);
    }
    applyCity(saved); updateDates();
    setInterval(() => { updateDates(); updateNextPrayerUI(); checkAdhan(); }, 60000);
}

function checkAdhan() {
    if (!State.prayerTimes) return;
    const now = new Date(); const currentStr = `${Utils.pad(now.getHours())}:${Utils.pad(now.getMinutes())}`;
    const adhanTimes = [State.prayerTimes.fajr, State.prayerTimes.dhuhr, State.prayerTimes.asr, State.prayerTimes.maghrib, State.prayerTimes.isha];
    if (adhanTimes.includes(currentStr) && State.adhanPlayedFor !== currentStr) {
        State.adhanPlayedFor = currentStr;
        if (UI.audio) UI.audio.play().catch(() => console.log("تفاعل مطلوب"));
    }
}
document.addEventListener("DOMContentLoaded", boot);

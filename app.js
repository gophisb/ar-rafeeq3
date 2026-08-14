/* ==========================================================
   الرفيق — app.js (نسخة الدقة المعتمدة v3.5)
   ========================================================== */
"use strict";
const Storage = {
    get(key, fallback = null) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
};
const State = { cityCode: Storage.get('cityCode', '16'), prayerTimes: null, nextPrayer: null, hijriDate: null };
const WILAYAS = [
    { code: "16", name: "الجزائر العاصمة", lat: 36.75, lng: 3.04 },
    { code: "31", name: "وهران", lat: 35.69, lng: -0.64 },
    { code: "25", name: "قسنطينة", lat: 36.36, lng: 6.60 },
    { code: "23", name: "عنابة", lat: 36.90, lng: 7.75 },
    { code: "05", name: "باتنة", lat: 35.55, lng: 6.17 },
    { code: "19", name: "سطيف", lat: 36.19, lng: 5.41 }
    // يمكن إضافة بقية الولايات هنا بنفس النمط
];
function calculatePrayerTimes(lat, lng) {
    const date = new Date();
    const jd = julianDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const timezone = 1; 
    const d = jd - 2451545.0;
    const g = (357.529 + 0.98560028 * d) % 360;
    const q = (280.459 + 0.98564736 * d) % 360;
    const l = (q + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180)) % 360;
    const e = 23.439 - 0.00000036 * d;
    const ra = Math.atan2(Math.cos(e * Math.PI / 180) * Math.sin(l * Math.PI / 180), Math.cos(l * Math.PI / 180)) * 180 / Math.PI;
    const dec = Math.asin(Math.sin(e * Math.PI / 180) * Math.sin(l * Math.PI / 180)) * 180 / Math.PI;
    const eqTime = (q - ra) / 15;
    const noon = 12 + timezone - lng / 15 - eqTime;
    const hourAngle = (angle) => {
        const r = Math.PI / 180;
        const cosH = (Math.sin(angle * r) - Math.sin(lat * r) * Math.sin(dec * r)) / (Math.cos(lat * r) * Math.cos(dec * r));
        if (cosH > 1) return 0; if (cosH < -1) return 12;
        return Math.acos(cosH) * 180 / Math.PI / 15;
    };
    const asrAngle = Math.atan(1 / (1 + Math.tan(Math.abs(lat - dec) * Math.PI / 180))) * 180 / Math.PI;
    return {
        fajr: formatTime(noon - hourAngle(-18)),
        sunrise: formatTime(noon - hourAngle(-0.833)),
        dhuhr: formatTime(noon),
        asr: formatTime(noon + hourAngle(asrAngle)),
        maghrib: formatTime(noon + hourAngle(-0.833)),
        isha: formatTime(noon + hourAngle(-17))
    };
}
function julianDate(y, m, d) { if (m <= 2) { y -= 1; m += 12; } const a = Math.floor(y / 100); const b = 2 - a + Math.floor(a / 4); return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5; }
function formatTime(h) { h = (h + 24) % 24; const hh = Math.floor(h); const mm = Math.floor((h - hh) * 60 + 0.5); return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`; }
function getHijriDate() {
    const d = new Date(); const jd = Math.floor(d.getTime() / 86400000) + 2440587.5;
    const l = jd - 1948439, n = Math.floor(l / 10631), rem = l % 10631;
    let y = 0, remDays = rem, kabisa = [2,5,7,10,13,15,18,21,24,26,29];
    while (remDays >= (kabisa.includes(y) ? 355 : 354)) { remDays -= (kabisa.includes(y) ? 355 : 354); y++; }
    const mNames = ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
    const mLen = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]; if (kabisa.includes(y)) mLen[11] = 30;
    let m = 0; while (remDays >= mLen[m]) { remDays -= mLen[m]; m++; }
    return { day: remDays + 1, month: m + 1, monthName: mNames[m], year: n * 30 + y + 1 };
}
function updateUI() {
    const city = WILAYAS.find(w => w.code === State.cityCode) || WILAYAS[0];
    State.prayerTimes = calculatePrayerTimes(city.lat, city.lng);
    const hijri = getHijriDate();
    document.getElementById('hijriPill').textContent = `${hijri.day} ${hijri.monthName} ${hijri.year}هـ`;
    document.getElementById('prayerDetails').innerHTML = `
        <div class="prayer-row"><span>الفجر</span><span>${State.prayerTimes.fajr}</span></div>
        <div class="prayer-row"><span>الظهر</span><span>${State.prayerTimes.dhuhr}</span></div>
        <div class="prayer-row"><span>العصر</span><span>${State.prayerTimes.asr}</span></div>
        <div class="prayer-row"><span>المغرب</span><span>${State.prayerTimes.maghrib}</span></div>
        <div class="prayer-row"><span>العشاء</span><span>${State.prayerTimes.isha}</span></div>
    `;
    document.getElementById('ramadanSection').hidden = (hijri.month !== 9);
    findNextPrayer();
}
function findNextPrayer() {
    const now = new Date(); const curMin = now.getHours() * 60 + now.getMinutes();
    const list = [{ n: "الفجر", t: State.prayerTimes.fajr },{ n: "الظهر", t: State.prayerTimes.dhuhr },{ n: "العصر", t: State.prayerTimes.asr },{ n: "المغرب", t: State.prayerTimes.maghrib },{ n: "العشاء", t: State.prayerTimes.isha }];
    let next = list.find(p => { const [h, m] = p.t.split(':').map(Number); return (h * 60 + m) > curMin; }) || list[0];
    document.getElementById('nextName').textContent = next.n;
    document.getElementById('nextTime').textContent = next.t;
    State.nextPrayer = next;
}
function init() {
    const sel = document.getElementById('citySelect');
    WILAYAS.forEach(w => { const opt = document.createElement('option'); opt.value = w.code; opt.textContent = w.name; sel.appendChild(opt); });
    sel.value = State.cityCode;
    sel.onchange = (e) => { State.cityCode = e.target.value; Storage.set('cityCode', State.cityCode); updateUI(); };
    updateUI();
    setInterval(() => {
        if (!State.nextPrayer) return;
        const now = new Date(); const [h, m] = State.nextPrayer.t.split(':').map(Number);
        let target = new Date(now); target.setHours(h, m, 0, 0); if (target < now) target.setDate(target.getDate() + 1);
        const diff = target - now;
        const hh = Math.floor(diff/3600000), mm = Math.floor((diff%3600000)/60000), ss = Math.floor((diff%60000)/1000);
        document.getElementById('countdown').textContent = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
        if (diff < 1000) updateUI();
    }, 1000);
}
document.addEventListener('DOMContentLoaded', init);

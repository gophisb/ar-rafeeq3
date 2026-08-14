/* ==========================================================
   الرفيق — app.js (النسخة الدستورية v4.2 - تحديث الـ 69 ولاية)
   الالتزام بدقة المواقيت لـ 69 ولاية جزائرية ومنطق رمضان الذكي.
   ========================================================== */

"use strict";

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

/**
 * القائمة الرسمية الكاملة لولايات الجزائر الـ 69 المحدثة
 */
const WILAYAS = [
    { code: "01", name: "01 - أدرار", lat: 27.87, lng: -0.28 },
    { code: "02", name: "02 - الشلف", lat: 36.16, lng: 1.33 },
    { code: "03", name: "03 - الأغواط", lat: 33.80, lng: 2.87 },
    { code: "04", name: "04 - أم البواقي", lat: 35.87, lng: 7.11 },
    { code: "05", name: "05 - باتنة", lat: 35.55, lng: 6.17 },
    { code: "06", name: "06 - بجاية", lat: 36.75, lng: 5.07 },
    { code: "07", name: "07 - بسكرة", lat: 34.85, lng: 5.73 },
    { code: "08", name: "08 - بشار", lat: 31.61, lng: -2.23 },
    { code: "09", name: "09 - البليدة", lat: 36.47, lng: 2.83 },
    { code: "10", name: "10 - البويرة", lat: 36.37, lng: 3.89 },
    { code: "11", name: "11 - تمنراست", lat: 22.79, lng: 5.52 },
    { code: "12", name: "12 - تبسة", lat: 35.41, lng: 8.12 },
    { code: "13", name: "13 - تلمسان", lat: 34.88, lng: -1.32 },
    { code: "14", name: "14 - تيارت", lat: 35.37, lng: 1.32 },
    { code: "15", name: "15 - تيزي وزو", lat: 36.71, lng: 4.05 },
    { code: "16", name: "16 - الجزائر", lat: 36.75, lng: 3.04 },
    { code: "17", name: "17 - الجلفة", lat: 34.67, lng: 3.26 },
    { code: "18", name: "18 - جيجل", lat: 36.82, lng: 5.76 },
    { code: "19", name: "19 - سطيف", lat: 36.19, lng: 5.41 },
    { code: "20", name: "20 - سعيدة", lat: 34.83, lng: 0.15 },
    { code: "21", name: "21 - سكيكدة", lat: 36.87, lng: 6.90 },
    { code: "22", name: "22 - سيدي بلعباس", lat: 35.19, lng: -0.63 },
    { code: "23", name: "23 - عنابة", lat: 36.90, lng: 7.75 },
    { code: "24", name: "24 - قالمة", lat: 36.46, lng: 7.43 },
    { code: "25", name: "25 - قسنطينة", lat: 36.36, lng: 6.60 },
    { code: "26", name: "26 - المدية", lat: 36.26, lng: 2.77 },
    { code: "27", name: "27 - مستغانم", lat: 35.94, lng: 0.09 },
    { code: "28", name: "28 - المسيلة", lat: 35.70, lng: 4.54 },
    { code: "29", name: "29 - معسكر", lat: 35.39, lng: 0.13 },
    { code: "30", name: "30 - ورقلة", lat: 31.94, lng: 5.32 },
    { code: "31", name: "31 - وهران", lat: 35.69, lng: -0.64 },
    { code: "32", name: "32 - البيض", lat: 33.68, lng: 1.02 },
    { code: "33", name: "33 - إليزي", lat: 26.51, lng: 8.48 },
    { code: "34", name: "34 - برج بوعريريج", lat: 36.07, lng: 4.76 },
    { code: "35", name: "35 - بومرداس", lat: 36.76, lng: 3.47 },
    { code: "36", name: "36 - الطارف", lat: 36.76, lng: 8.31 },
    { code: "37", name: "37 - تندوف", lat: 27.67, lng: -8.14 },
    { code: "38", name: "38 - تيسمسيلت", lat: 35.60, lng: 1.81 },
    { code: "39", name: "39 - الوادي", lat: 33.37, lng: 6.86 },
    { code: "40", name: "40 - خنشلة", lat: 35.44, lng: 7.14 },
    { code: "41", name: "41 - سوق أهراس", lat: 36.28, lng: 7.95 },
    { code: "42", name: "42 - تيبازة", lat: 36.58, lng: 2.44 },
    { code: "43", name: "43 - ميلة", lat: 36.45, lng: 6.26 },
    { code: "44", name: "44 - عين الدفلى", lat: 36.26, lng: 2.00 },
    { code: "45", name: "45 - النعامة", lat: 33.27, lng: -0.31 },
    { code: "46", name: "46 - عين تموشنت", lat: 35.30, lng: -1.14 },
    { code: "47", name: "47 - غرداية", lat: 32.49, lng: 3.67 },
    { code: "48", name: "48 - غليزان", lat: 35.74, lng: 0.56 },
    { code: "49", name: "49 - تيميمون", lat: 29.26, lng: 0.23 },
    { code: "50", name: "50 - برج باجي مختار", lat: 21.33, lng: 0.92 },
    { code: "51", name: "51 - أولاد جلال", lat: 34.42, lng: 5.06 },
    { code: "52", name: "52 - بني عباس", lat: 30.08, lng: -2.17 },
    { code: "53", name: "53 - عين صالح", lat: 27.20, lng: 2.48 },
    { code: "54", name: "54 - عين قزام", lat: 19.67, lng: 5.77 },
    { code: "55", name: "55 - تقرت", lat: 33.10, lng: 6.06 },
    { code: "56", name: "56 - جانت", lat: 24.55, lng: 9.48 },
    { code: "57", name: "57 - المغير", lat: 33.95, lng: 5.92 },
    { code: "58", name: "58 - المنيعة", lat: 30.58, lng: 2.88 },
    { code: "59", name: "59 - آفلو", lat: 34.11, lng: 2.10 },
    { code: "60", name: "60 - بريكة", lat: 35.39, lng: 5.36 },
    { code: "61", name: "61 - قصر الشلالة", lat: 35.16, lng: 2.31 },
    { code: "62", name: "62 - مسعد", lat: 34.16, lng: 3.50 },
    { code: "63", name: "63 - عين وسارة", lat: 35.45, lng: 2.90 },
    { code: "64", name: "64 - القنطرة", lat: 35.22, lng: 5.70 },
    { code: "65", name: "65 - بئر العاتر", lat: 34.75, lng: 8.06 },
    { code: "66", name: "66 - ماقرة", lat: 35.60, lng: 5.06 },
    { code: "67", name: "67 - قصر البخاري", lat: 35.88, lng: 2.75 },
    { code: "68", name: "68 - بوسعادة", lat: 35.21, lng: 4.17 },
    { code: "69", name: "69 - الأبيض سيدي الشيخ", lat: 32.89, lng: 0.54 }
];

const PrayerEngine = {
    calculate(lat, lng, timezone = 1) {
        const date = new Date();
        const jd = this.getJulianDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
        const d = jd - 2451545.0;
        const g = (357.529 + 0.98560028 * d) % 360;
        const q = (280.459 + 0.98564736 * d) % 360;
        const l = (q + 1.915 * Math.sin(this.toRad(g)) + 0.020 * Math.sin(this.toRad(2 * g))) % 360;
        const e = 23.439 - 0.00000036 * d;
        const ra = Math.atan2(Math.cos(this.toRad(e)) * Math.sin(this.toRad(l)), Math.cos(this.toRad(l))) * 180 / Math.PI;
        const dec = Math.asin(Math.sin(this.toRad(e)) * Math.sin(this.toRad(l))) * 180 / Math.PI;
        const eqTime = (q - ra) / 15;
        const noon = 12 + timezone - lng / 15 - eqTime;
        const getHourAngle = (angle) => {
            const cosH = (Math.sin(this.toRad(angle)) - Math.sin(this.toRad(lat)) * Math.sin(this.toRad(dec))) / (Math.cos(this.toRad(lat)) * Math.cos(this.toRad(dec)));
            if (cosH > 1) return 0; if (cosH < -1) return 12;
            return Math.acos(cosH) * 180 / Math.PI / 15;
        };
        const asrAngle = Math.atan(1 / (1 + Math.tan(this.toRad(Math.abs(lat - dec))))) * 180 / Math.PI;
        const times = {
            fajr: noon - getHourAngle(-18),
            sunrise: noon - getHourAngle(-0.833),
            dhuhr: noon,
            asr: noon + getHourAngle(asrAngle),
            maghrib: noon + getHourAngle(-0.833),
            isha: noon + getHourAngle(-17)
        };
        times.imsak = times.fajr - (10 / 60);
        return times;
    },
    getJulianDate(y, m, d) {
        if (m <= 2) { y -= 1; m += 12; }
        const a = Math.floor(y / 100);
        const b = 2 - a + Math.floor(a / 4);
        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
    },
    toRad: (deg) => deg * Math.PI / 180,
    format: (h) => {
        h = (h + 24) % 24;
        const hh = Math.floor(h);
        const mm = Math.floor((h - hh) * 60 + 0.5);
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }
};

const HijriEngine = {
    get() {
        const d = new Date();
        const jd = Math.floor(d.getTime() / 86400000) + 2440587.5;
        const l = jd - 1948439, n = Math.floor(l / 10631), rem = l % 10631;
        let y = 0, remDays = rem, kabisa = [2,5,7,10,13,15,18,21,24,26,29];
        while (remDays >= (kabisa.includes(y) ? 355 : 354)) { remDays -= (kabisa.includes(y) ? 355 : 354); y++; }
        const mNames = ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"];
        const mLen = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]; if (kabisa.includes(y)) mLen[11] = 30;
        let m = 0; while (remDays >= mLen[m]) { remDays -= mLen[m]; m++; }
        return { day: remDays + 1, month: m + 1, monthName: mNames[m], year: n * 30 + y + 1 };
    }
};

const App = {
    state: { cityCode: Storage.get('cityCode', '16'), times: null, next: null, hijri: null },
    init() {
        this.buildWilayaSelector();
        this.update();
        setInterval(() => this.tick(), 1000);
    },
    buildWilayaSelector() {
        const sel = document.getElementById('citySelect');
        if (!sel) return;
        WILAYAS.forEach(w => {
            const opt = document.createElement('option');
            opt.value = w.code; opt.textContent = w.name;
            sel.appendChild(opt);
        });
        sel.value = this.state.cityCode;
        sel.onchange = (e) => {
            this.state.cityCode = e.target.value;
            Storage.set('cityCode', this.state.cityCode);
            this.update();
        };
    },
    update() {
        const city = WILAYAS.find(w => w.code === this.state.cityCode) || WILAYAS[15];
        const rawTimes = PrayerEngine.calculate(city.lat, city.lng);
        this.state.times = {
            fajr: PrayerEngine.format(rawTimes.fajr),
            sunrise: PrayerEngine.format(rawTimes.sunrise),
            dhuhr: PrayerEngine.format(rawTimes.dhuhr),
            asr: PrayerEngine.format(rawTimes.asr),
            maghrib: PrayerEngine.format(rawTimes.maghrib),
            isha: PrayerEngine.format(rawTimes.isha),
            imsak: PrayerEngine.format(rawTimes.imsak)
        };
        this.state.hijri = HijriEngine.get();
        this.render();
    },
    render() {
        const h = this.state.hijri;
        document.getElementById('hijriPill').textContent = `${h.day} ${h.monthName} ${h.year}هـ`;
        const t = this.state.times;
        document.getElementById('prayerDetails').innerHTML = `
            <div class="prayer-row"><span>الفجر</span><span>${t.fajr}</span></div>
            <div class="prayer-row"><span>الظهر</span><span>${t.dhuhr}</span></div>
            <div class="prayer-row"><span>العصر</span><span>${t.asr}</span></div>
            <div class="prayer-row"><span>المغرب</span><span>${t.maghrib}</span></div>
            <div class="prayer-row"><span>العشاء</span><span>${t.isha}</span></div>
        `;
        const ramadanSection = document.getElementById('ramadanSection');
        if (ramadanSection) {
            if (h.month === 9) {
                ramadanSection.hidden = false;
                ramadanSection.innerHTML = `
                    <div class="ramadan-card">
                        <div class="ramadan-icon">🌙</div>
                        <div class="ramadan-info">
                            <h3>رمضان مبارك</h3>
                            <div style="display:flex; gap:20px; margin-top:10px;">
                                <div><span style="color:var(--gold-soft); font-size:0.75rem;">السحور (الإمساك):</span> <b style="color:#fff; display:block; font-size:1.1rem;">${t.imsak}</b></div>
                                <div><span style="color:var(--gold-soft); font-size:0.75rem;">الإفطار (المغرب):</span> <b style="color:#fff; display:block; font-size:1.1rem;">${t.maghrib}</b></div>
                            </div>
                        </div>
                    </div>
                `;
            } else { ramadanSection.hidden = true; ramadanSection.innerHTML = ''; }
        }
        this.findNext();
    },
    findNext() {
        const now = new Date();
        const curMin = now.getHours() * 60 + now.getMinutes();
        const t = this.state.times;
        const list = [{ n: "الفجر", t: t.fajr }, { n: "الظهر", t: t.dhuhr }, { n: "العصر", t: t.asr }, { n: "المغرب", t: t.maghrib }, { n: "العشاء", t: t.isha }];
        let next = list.find(p => {
            const [h, m] = p.t.split(':').map(Number);
            return (h * 60 + m) > curMin;
        }) || list[0];
        this.state.next = next;
        document.getElementById('nextName').textContent = next.n;
        document.getElementById('nextTime').textContent = next.t;
    },
    tick() {
        if (!this.state.next) return;
        const now = new Date();
        const [h, m] = this.state.next.t.split(':').map(Number);
        let target = new Date(now); target.setHours(h, m, 0, 0);
        if (target < now) target.setDate(target.getDate() + 1);
        const diff = target - now;
        const hh = Math.floor(diff/3600000), mm = Math.floor((diff%3600000)/60000), ss = Math.floor((diff%60000)/1000);
        document.getElementById('countdown').textContent = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
        if (diff < 1000) this.update();
    }
};
document.addEventListener('DOMContentLoaded', () => App.init());

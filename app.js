<div style="position: relative;">
  <button onclick="copyCode()" style="position: absolute; top: 10px; left: 10px; z-index: 10; background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-family: Tahoma, sans-serif;">📋 نسخ الكود</button>
  <pre id="codeBlock" style="direction: ltr; text-align: left; background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.5;"><code>/* ==========================================================
   الرفيق 3 — app.js
   الإصدار: 5.0.0
   ----------------------------------------------------------
   محرك التطبيق الأساسي

   ✔ 69 ولاية جزائرية
   ✔ اختيار الولاية يدويًا
   ✔ مواقيت الصلاة
   ✔ التاريخ الهجري
   ✔ الصلاة القادمة
   ✔ العد التنازلي
   ✔ الأذان المحلي
   ✔ حفظ الإعدادات
   ✔ دعم الواجهة القديمة والجديدة
   ✔ لا يعتمد على API
   ✔ يعمل Offline
   ========================================================== */

"use strict";

/* ==========================================================
   STORAGE
   ========================================================== */

const Storage = {

    get(key, fallback = null) {

        try {

            const value =
                localStorage.getItem(key);

            return value !== null
                ? JSON.parse(value)
                : fallback;

        } catch (error) {

            console.warn(
                "[الرفيق] تعذر قراءة التخزين:",
                error
            );

            return fallback;
        }
    },

    set(key, value) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {

            console.warn(
                "[الرفيق] تعذر حفظ الإعداد:",
                error
            );

            return false;
        }
    }
};


/* ==========================================================
   الولايات الجزائرية
   ========================================================== */

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


/* ==========================================================
   محرك مواقيت الصلاة
   ========================================================== */

const PrayerEngine = {

    calculate(lat, lng, timezone = 1) {

        const date = new Date();

        const jd =
            this.getJulianDate(
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate()
            );

        const d =
            jd - 2451545.0;

        const g =
            (357.529 + 0.98560028 * d) % 360;

        const q =
            (280.459 + 0.98564736 * d) % 360;

        const l =
            (
                q +
                1.915 *
                Math.sin(this.toRad(g)) +
                0.020 *
                Math.sin(this.toRad(2 * g))
            ) % 360;

        const e =
            23.439 -
            0.00000036 * d;

        const ra =
            Math.atan2(
                Math.cos(this.toRad(e)) *
                Math.sin(this.toRad(l)),
                Math.cos(this.toRad(l))
            ) *
            180 /
            Math.PI;

        const dec =
            Math.asin(
                Math.sin(this.toRad(e)) *
                Math.sin(this.toRad(l))
            ) *
            180 /
            Math.PI;

        const eqTime =
            (q - ra) / 15;

        const noon =
            12 +
            timezone -
            lng / 15 -
            eqTime;


        const getHourAngle = (angle) => {

            const cosH =
                (
                    Math.sin(this.toRad(angle)) -
                    Math.sin(this.toRad(lat)) *
                    Math.sin(this.toRad(dec))
                ) /
                (
                    Math.cos(this.toRad(lat)) *
                    Math.cos(this.toRad(dec))
                );

            if (cosH > 1) {
                return 0;
            }

            if (cosH < -1) {
                return 12;
            }

            return (
                Math.acos(cosH) *
                180 /
                Math.PI /
                15
            );
        };


        /*
         * العصر:
         * مذهب الجمهور — ظل الشيء مثليه
         *
         * نحتفظ بالمعادلة الأصلية في الرفيق.
         */

        const asrAngle =
            Math.atan(
                1 /
                (
                    1 +
                    Math.tan(
                        this.toRad(
                            Math.abs(lat - dec)
                        )
                    )
                )
            ) *
            180 /
            Math.PI;


        const times = {

            fajr:
                noon -
                getHourAngle(-18),

            sunrise:
                noon -
                getHourAngle(-0.833),

            dhuhr:
                noon,

            asr:
                noon +
                getHourAngle(asrAngle),

            maghrib:
                noon +
                getHourAngle(-0.833),

            isha:
                noon +
                getHourAngle(-17)

        };


        /*
         * الإمساك:
         * ليس صلاة مستقلة.
         * هو تنبيه احتياطي قبل الفجر.
         */

        times.imsak =
            times.fajr -
            (10 / 60);


        return times;
    },


    getJulianDate(y, m, d) {

        if (m <= 2) {
            y -= 1;
            m += 12;
        }

        const a =
            Math.floor(y / 100);

        const b =
            2 -
            a +
            Math.floor(a / 4);

        return (
            Math.floor(
                365.25 *
                (y + 4716)
            ) +

            Math.floor(
                30.6001 *
                (m + 1)
            ) +

            d +
            b -
            1524.5
        );
    },


    toRad(deg) {

        return deg * Math.PI / 180;

    },


    format(hours) {

        if (!Number.isFinite(hours)) {
            return "--:--";
        }

        hours =
            (
                hours + 24
            ) % 24;

        let hh =
            Math.floor(hours);

        let mm =
            Math.floor(
                (
                    hours - hh
                ) * 60 +
                0.5
            );

        if (mm >= 60) {
            hh++;
            mm = 0;
        }

        hh %= 24;

        return (
            String(hh).padStart(2, "0") +
            ":" +
            String(mm).padStart(2, "0")
        );
    }
};


/* ==========================================================
   التاريخ الهجري
   ========================================================== */

const HijriEngine = {

    get(date = new Date()) {

        const jd =
            Math.floor(
                date.getTime() /
                86400000
            ) +
            2440587.5;

        const l =
            jd -
            1948439;

        const n =
            Math.floor(
                l / 10631
            );

        const rem =
            l % 10631;

        let y = 0;

        let remDays = rem;


        const kabisa = [
            2,
            5,
            7,
            10,
            13,
            15,
            18,
            21,
            24,
            26,
            29
        ];


        while (
            remDays >=
            (
                kabisa.includes(y)
                    ? 355
                    : 354
            )
        ) {

            remDays -=
                kabisa.includes(y)
                    ? 355
                    : 354;

            y++;
        }


        const monthNames = [
            "محرم",
            "صفر",
            "ربيع الأول",
            "ربيع الثاني",
            "جمادى الأولى",
            "جمادى الآخرة",
            "رجب",
            "شعبان",
            "رمضان",
            "شوال",
            "ذو القعدة",
            "ذو الحجة"
        ];


        const monthLength = [
            30,
            29,
            30,
            29,
            30,
            29,
            30,
            29,
            30,
            29,
            30,
            29
        ];


        if (kabisa.includes(y)) {
            monthLength[11] = 30;
        }


        let month = 0;


        while (
            month < 12 &&
            remDays >=
            monthLength[month]
        ) {

            remDays -=
                monthLength[month];

            month++;
        }


        return {

            day:
                remDays + 1,

            month:
                month + 1,

            monthName:
                monthNames[month],

            year:
                n * 30 +
                y +
                1
        };
    }
};


/* ==========================================================
   محرك الرفيق
   ========================================================== */

const App = {

    state: {

        cityCode:
            Storage.get(
                "cityCode",
                "16"
            ),

        times:
            null,

        rawTimes:
            null,

        next:
            null,

        hijri:
            null,

        adhanEnabled:
            Storage.get(
                "adhanEnabled",
                false
            ),

        muezzin:
            Storage.get(
                "muezzin",
                "mecca"
            ),

        audioContextUnlocked:
            false,

        lastAdhanPlayed:
            null
    },


    init() {

        this.buildWilayaSelector();

        this.update();

        this.updateAdhanUI();


        /*
         * تحديث الساعة كل ثانية.
         */

        setInterval(
            () => this.tick(),
            1000
        );


        /*
         * فتح إمكانية الصوت بعد أول تفاعل
         * مع الصفحة.
         */

        const unlockAudio = () => {

            this.state.audioContextUnlocked = true;

            document.removeEventListener(
                "click",
                unlockAudio
            );

            document.removeEventListener(
                "touchstart",
                unlockAudio
            );

        };


        document.addEventListener(
            "click",
            unlockAudio,
            {
                once: true,
                passive: true
            }
        );


        document.addEventListener(
            "touchstart",
            unlockAudio,
            {
                once: true,
                passive: true
            }
        );

    },


    /* ======================================================
       الولاية الحالية
       ====================================================== */

    getCurrentWilaya() {

        return (
            WILAYAS.find(
                w =>
                    w.code ===
                    this.state.cityCode
            ) ||
            WILAYAS.find(
                w =>
                    w.code === "16"
            )
        );
    },


    /* ======================================================
       بناء قائمة الولايات
       ====================================================== */

    buildWilayaSelector() {

        const select =
            document.getElementById(
                "citySelect"
            );

        if (!select) {
            return;
        }


        /*
         * لا نكرر الخيارات إذا أعيد تهيئة المحرك.
         */

        select.innerHTML = "";


        WILAYAS.forEach(
            (wilaya) => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    wilaya.code;

                option.textContent =
                    wilaya.name;

                select.appendChild(
                    option
                );
            }
        );


        select.value =
            this.state.cityCode;


        /*
         * إذا كانت القيمة المحفوظة
         * غير موجودة نرجع إلى الجزائر العاصمة.
         */

        if (
            select.value !==
            this.state.cityCode
        ) {

            this.state.cityCode =
                "16";

            select.value =
                "16";

            Storage.set(
                "cityCode",
                "16"
            );
        }


        select.onchange =
            (event) => {

                this.state.cityCode =
                    event.target.value;

                Storage.set(
                    "cityCode",
                    this.state.cityCode
                );

                this.update();
            };
    },


    /* ======================================================
       حساب المواقيت
       ====================================================== */

    update() {

        const city =
            this.getCurrentWilaya();


        const rawTimes =
            PrayerEngine.calculate(
                city.lat,
                city.lng,
                1
            );


        this.state.rawTimes =
            rawTimes;


        this.state.times = {

            fajr:
                PrayerEngine.format(
                    rawTimes.fajr
                ),

            sunrise:
                PrayerEngine.format(
                    rawTimes.sunrise
                ),

            dhuhr:
                PrayerEngine.format(
                    rawTimes.dhuhr
                ),

            asr:
                PrayerEngine.format(
                    rawTimes.asr
                ),

            maghrib:
                PrayerEngine.format(
                    rawTimes.maghrib
                ),

            isha:
                PrayerEngine.format(
                    rawTimes.isha
                ),

            imsak:
                PrayerEngine.format(
                    rawTimes.imsak
                )
        };


        this.state.hijri =
            HijriEngine.get();


        this.render();

        this.findNext();

    },


    /* ======================================================
       عرض البيانات
       ====================================================== */

    render() {

        const hijri =
            this.state.hijri;


        const hijriElement =
            document.getElementById(
                "hijriPill"
            );


        if (hijriElement) {

            hijriElement.textContent =
                `${hijri.day} ${hijri.monthName} ${hijri.year}هـ`;

        }


        /*
         * تحديث بطاقات المواقيت
         * دون استبدال HTML الخاص بالواجهة.
         */

        const times =
            this.state.times;


        document
            .querySelectorAll(
                "[data-prayer]"
            )
            .forEach(
                (element) => {

                    const key =
                        element.dataset.prayer;

                    if (
                        Object.prototype.hasOwnProperty.call(
                            times,
                            key
                        )
                    ) {

                        element.textContent =
                            times[key];

                    }
                }
            );


        /*
         * دعم الواجهة القديمة أيضًا.
         */

        const prayerDetails =
            document.getElementById(
                "prayerDetails"
            );


        if (
            prayerDetails &&
            !prayerDetails.querySelector(
                "[data-prayer]"
            )
        ) {

            const rows = [

                ["الفجر", times.fajr],
                ["الظهر", times.dhuhr],
                ["العصر", times.asr],
                ["المغرب", times.maghrib],
                ["العشاء", times.isha]

            ];


            prayerDetails.innerHTML =
                rows.map(
                    ([name, time]) => `
                        <div class="prayer-row">
                            <span>${name}</span>
                            <span dir="ltr">${time}</span>
                        </div>
                    `
                ).join("");

        }


        /*
         * رمضان
         */

        this.renderRamadan();

    },


    /* ======================================================
       رمضان
       ====================================================== */

    renderRamadan() {

        const section =
            document.getElementById(
                "ramadanSection"
            );

        if (!section) {
            return;
        }


        const hijri =
            this.state.hijri;

        const times =
            this.state.times;


        if (
            hijri &&
            hijri.month === 9
        ) {

            section.hidden = false;


            section.innerHTML = `

                <div class="ramadan-card">

                    <div class="ramadan-title">
                        🌙 رمضان مبارك
                    </div>

                    <div class="ramadan-times">

                        <div>
                            <span class="ramadan-time-label">
                                السحور — الإمساك
                            </span>

                            <span
                                class="ramadan-time-value"
                                dir="ltr">
                                ${times.imsak}
                            </span>
                        </div>

                        <div>
                            <span class="ramadan-time-label">
                                الإفطار — المغرب
                            </span>

                            <span
                                class="ramadan-time-value"
                                dir="ltr">
                                ${times.maghrib}
                            </span>
                        </div>

                    </div>

                </div>
            `;

        } else {

            section.hidden = true;

            section.innerHTML = "";
        }
    },


    /* ======================================================
       الصلاة القادمة
       ====================================================== */

    findNext() {

        const now =
            new Date();


        const currentMinutes =
            now.getHours() * 60 +
            now.getMinutes() +
            now.getSeconds() / 60;


        const times =
            this.state.times;


        const prayers = [

            {
                key: "fajr",
                name: "الفجر",
                time: times.fajr
            },

            {
                key: "dhuhr",
                name: "الظهر",
                time: times.dhuhr
            },

            {
                key: "asr",
                name: "العصر",
                time: times.asr
            },

            {
                key: "maghrib",
                name: "المغرب",
                time: times.maghrib
            },

            {
                key: "isha",
                name: "العشاء",
                time: times.isha
            }

        ];


        let next =
            prayers.find(
                prayer => {

                    const [h, m] =
                        prayer.time
                            .split(":")
                            .map(Number);

                    return (
                        h * 60 +
                        m >
                        currentMinutes
                    );
                }
            );


        /*
         * إذا انتهت صلوات اليوم
         * فالصلاة القادمة هي فجر الغد.
         */

        if (!next) {
            next = prayers[0];
        }


        this.state.next =
            next;


        const nextName =
            document.getElementById(
                "nextName"
            );


        const nextTime =
            document.getElementById(
                "nextTime"
            );


        if (nextName) {
            nextName.textContent =
                next.name;
        }


        if (nextTime) {
            nextTime.textContent =
                next.time;
        }
    },


    /* ======================================================
       العد التنازلي
       ====================================================== */

    tick() {

        if (!this.state.next) {
            this.findNext();
            return;
        }


        const now =
            new Date();


        /*
         * إعادة تحديد الصلاة القادمة
         * إذا تغيّرت الدقيقة.
         */

        const currentMinute =
            now.getHours() * 60 +
            now.getMinutes();


        const [nextHour, nextMinute] =
            this.state.next.time
                .split(":")
                .map(Number);


        const nextMinuteOfDay =
            nextHour * 60 +
            nextMinute;


        if (
            nextMinuteOfDay <=
            currentMinute
        ) {

            /*
             * لا نعيد حسابها في كل ثانية،
             * فقط إذا وصلنا إلى وقت الصلاة.
             */

            if (
                nextMinuteOfDay ===
                currentMinute
            ) {

                this.update();

            }
        }


        let target =
            new Date(now);


        target.setHours(
            nextHour,
            nextMinute,
            0,
            0
        );


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


        const hours =
            Math.floor(
                difference /
                3600000
            );


        const minutes =
            Math.floor(
                (
                    difference %
                    3600000
                ) /
                60000
            );


        const seconds =
            Math.floor(
                (
                    difference %
                    60000
                ) /
                1000
            );


        const countdown =
            document.getElementById(
                "countdown"
            );


        if (countdown) {

            countdown.textContent =
                `${String(hours).padStart(2, "0")}:` +
                `${String(minutes).padStart(2, "0")}:` +
                `${String(seconds).padStart(2, "0")}`;

        }


        /*
         * تشغيل الأذان.
         */

        this.checkAdhan(now);

    },


    /* ======================================================
       الأذان
       ====================================================== */

    checkAdhan(now) {

        if (!this.state.adhanEnabled) {
            return;
        }


        const currentTime =
            PrayerEngine.format(
                now.getHours() +
                now.getMinutes() / 60
            );


        const prayerKeys = [
            "fajr",
            "dhuhr",
            "asr",
            "maghrib",
            "isha"
        ];


        for (
            const key of prayerKeys
        ) {

            if (
                this.state.times[key] ===
                currentTime
            ) {

                const uniqueKey =
                    `${new Date().toDateString()}-${key}-${currentTime}`;


                if (
                    this.state.lastAdhanPlayed !==
                    uniqueKey
                ) {

                    this.state.lastAdhanPlayed =
                        uniqueKey;

                    this.playAdhan();
                }


                break;
            }
        }
    },


    /* ======================================================
       تشغيل الأذان
       ====================================================== */

    playAdhan() {

        /*
         * النسخة الحالية من المستودع تحتوي
         * ملف adhan.mp3 في الجذر.
         *
         * لذلك نستخدمه أولًا بدل المسار
         * غير الموجود ./audio/...
         */

        const sources = [
            "./adhan.mp3",
            "./audio/adhan_mecca.mp3"
        ];


        this.tryAudioSource(
            sources,
            0
        );
    },


    tryAudioSource(
        sources,
        index
    ) {

        if (
            index >=
            sources.length
        ) {

            console.warn(
                "[الرفيق] لم يتم العثور على ملف الأذان."
            );

            return;
        }


        const audio =
            new Audio();


        audio.preload =
            "auto";


        audio.src =
            sources[index];


        audio.addEventListener(
            "error",
            () => {

                this.tryAudioSource(
                    sources,
                    index + 1
                );

            },
            {
                once: true
            }
        );


        const promise =
            audio.play();


        if (
            promise &&
            typeof promise.catch ===
            "function"
        ) {

            promise.catch(
                (error) => {

                    console.warn(
                        "[الرفيق] تعذر تشغيل الأذان:",
                        error
                    );

                }
            );
        }
    },


    /* ======================================================
       مفتاح الأذان
       ====================================================== */

    toggleAdhan() {

        this.state.adhanEnabled =
            !this.state.adhanEnabled;


        Storage.set(
            "adhanEnabled",
            this.state.adhanEnabled
        );


        this.updateAdhanUI();

    },


    /* ======================================================
       اختيار المؤذن
       ====================================================== */

    changeMuezzin(
        value
    ) {

        if (!value) {
            return;
        }


        this.state.muezzin =
            value;


        Storage.set(
            "muezzin",
            value
        );


        this.updateAdhanUI();

    },


    /* ======================================================
       اختبار الأذان
       ====================================================== */

    testAdhan() {

        this.playAdhan();

    },


    /* ======================================================
       واجهة الأذان
       ====================================================== */

    updateAdhanUI() {

        const toggle =
            document.getElementById(
                "adhanToggle"
            );


        const settings =
            document.getElementById(
                "adhanSettings"
            );


        const status =
            document.getElementById(
                "adhanStatus"
            );


        if (toggle) {

            toggle.classList.toggle(
                "on",
                this.state.adhanEnabled
            );


            toggle.setAttribute(
                "aria-checked",
                String(
                    this.state.adhanEnabled
                )
            );
        }


        if (settings) {

            settings.style.display =
                this.state.adhanEnabled
                    ? "block"
                    : "none";
        }


        if (status) {

            status.textContent =
                this.state.adhanEnabled
                    ? "تنبيه الأذان مفعل"
                    : "تنبيه الأذان غير مفعل";
        }


        const select =
            document.getElementById(
                "muezzinSelect"
            );


        if (select) {

            select.value =
                this.state.muezzin;
        }


        /*
         * دعم أزرار المؤذنين في index.html.
         */

        document
            .querySelectorAll(
                "[data-muezzin]"
            )
            .forEach(
                (element) => {

                    element.classList.toggle(
                        "active",
                        element.dataset.muezzin ===
                        this.state.muezzin
                    );

                }
            );
    }
};


/* ==========================================================
   بدء التطبيق
   ========================================================== */

if (
    typeof window !== "undefined"
) {

    window.WILAYAS =
        WILAYAS;

    window.PrayerEngine =
        PrayerEngine;

    window.HijriEngine =
        HijriEngine;

    window.App =
        App;
}


/* ==========================================================
   DOM READY
   ========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        App.init();

    }
);</code></pre>
</div>

<script>
function copyCode() {
    const code = document.getElementById('codeBlock').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('✅ تم نسخ كود app.js بنجاح!');
    }).catch(() => {
        alert('❌ تعذر النسخ. يرجى النسخ يدويًا.');
    });
}
</script>
// =============================================
//  app.js — الرفيق (النسخة الإنتاجية النهائية)
//  المميزات:
//  - نظام زمني يعتمد على Date كامل (لا NaN بعد اليوم)
//  - تحديث تلقائي عند تغير اليوم
//  - حماية كاملة من NaN
//  - تسجيل Service Worker مرة واحدة فقط
//  - موثق بالكامل
// =============================================

/**
 * ================ توثيق API ================
 * method=19 : Egyptian General Authority of Survey
 *   - مناسبة للجزائر لأنها تعتمد زاوية 19.5° للفجر والعشاء
 *
 * tune=0,-7,0,-7,-7,-7,0,-7,0 :
 *   ترتيب القيم حسب API (Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha)
 *     Fajr    :  0  (لا تعديل)
 *     Dhuhr   : -7  (تقديم 7 دقائق للظهر)
 *     Asr     : -7  (تقديم 7 دقائق للعصر)
 *     Maghrib : -7  (تقديم 7 دقائق للمغرب)
 *     Isha    : -7  (تقديم 7 دقائق للعشاء)
 *   هذه القيم تحتاج مراجعة نهائية مع جهة رسمية قبل الاعتماد
 */

/** تحويل وقت الصلاة من نص إلى كائن Date كامل */
function prayerToDate(timeStr, referenceDate) {
    if (!timeStr) return null;
    var match = String(timeStr).match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    var hours = parseInt(match[1], 10);
    var minutes = parseInt(match[2], 10);
    var date = new Date(referenceDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
}

/** قائمة الولايات الجزائرية (69 ولاية) */
var WILAYAS = [
    { n: 1, name: 'أدرار', city: 'Adrar' },
    { n: 2, name: 'الشلف', city: 'Chlef' },
    { n: 3, name: 'الأغواط', city: 'Laghouat' },
    { n: 4, name: 'أم البواقي', city: 'Oum El Bouaghi' },
    { n: 5, name: 'باتنة', city: 'Batna' },
    { n: 6, name: 'بجاية', city: 'Bejaia' },
    { n: 7, name: 'بسكرة', city: 'Biskra' },
    { n: 8, name: 'بشار', city: 'Bechar' },
    { n: 9, name: 'البليدة', city: 'Blida' },
    { n: 10, name: 'البويرة', city: 'Bouira' },
    { n: 11, name: 'تمنراست', city: 'Tamanrasset' },
    { n: 12, name: 'تبسة', city: 'Tebessa' },
    { n: 13, name: 'تلمسان', city: 'Tlemcen' },
    { n: 14, name: 'تيارت', city: 'Tiaret' },
    { n: 15, name: 'تيزي وزو', city: 'Tizi Ouzou' },
    { n: 16, name: 'الجزائر العاصمة', city: 'Algiers' },
    { n: 17, name: 'الجلفة', city: 'Djelfa' },
    { n: 18, name: 'جيجل', city: 'Jijel' },
    { n: 19, name: 'سطيف', city: 'Setif' },
    { n: 20, name: 'سعيدة', city: 'Saida' },
    { n: 21, name: 'سكيكدة', city: 'Skikda' },
    { n: 22, name: 'سيدي بلعباس', city: 'Sidi Bel Abbes' },
    { n: 23, name: 'عنابة', city: 'Annaba' },
    { n: 24, name: 'قالمة', city: 'Guelma' },
    { n: 25, name: 'قسنطينة', city: 'Constantine' },
    { n: 26, name: 'المدية', city: 'Medea' },
    { n: 27, name: 'مستغانم', city: 'Mostaganem' },
    { n: 28, name: 'المسيلة', city: "M'Sila" },
    { n: 29, name: 'معسكر', city: 'Mascara' },
    { n: 30, name: 'ورقلة', city: 'Ouargla' },
    { n: 31, name: 'وهران', city: 'Oran' },
    { n: 32, name: 'البيض', city: 'El Bayadh' },
    { n: 33, name: 'إليزي', city: 'Illizi' },
    { n: 34, name: 'برج بوعريريج', city: 'Bordj Bou Arreridj' },
    { n: 35, name: 'بومرداس', city: 'Boumerdes' },
    { n: 36, name: 'الطارف', city: 'El Tarf' },
    { n: 37, name: 'تندوف', city: 'Tindouf' },
    { n: 38, name: 'تيسمسيلت', city: 'Tissemsilt' },
    { n: 39, name: 'الوادي', city: 'El Oued' },
    { n: 40, name: 'خنشلة', city: 'Khenchela' },
    { n: 41, name: 'سوق أهراس', city: 'Souk Ahras' },
    { n: 42, name: 'تيبازة', city: 'Tipaza' },
    { n: 43, name: 'ميلة', city: 'Mila' },
    { n: 44, name: 'عين الدفلى', city: 'Ain Defla' },
    { n: 45, name: 'النعامة', city: 'Naama' },
    { n: 46, name: 'عين تموشنت', city: 'Ain Temouchent' },
    { n: 47, name: 'غرداية', city: 'Ghardaia' },
    { n: 48, name: 'غليزان', city: 'Relizane' },
    { n: 49, name: 'تيميمون', city: 'Timimoun' },
    { n: 50, name: 'برج باجي مختار', city: 'Bordj Badji Mokhtar' },
    { n: 51, name: 'أولاد جلال', city: 'Ouled Djellal' },
    { n: 52, name: 'بني عباس', city: 'Beni Abbes' },
    { n: 53, name: 'عين صالح', city: 'In Salah' },
    { n: 54, name: 'عين قزام', city: 'In Guezzam' },
    { n: 55, name: 'تقرت', city: 'Touggourt' },
    { n: 56, name: 'جانت', city: 'Djanet' },
    { n: 57, name: 'المغير', city: "El M'Ghair" },
    { n: 58, name: 'المنيعة', city: 'El Meniaa' },
    { n: 59, name: 'آفلو', city: 'Aflou' },
    { n: 60, name: 'بريكة', city: 'Barika' },
    { n: 61, name: 'القنطرة', city: 'El Kantara' },
    { n: 62, name: 'بئر العاتر', city: 'Bir El Ater' },
    { n: 63, name: 'العريشة', city: 'El Aricha' },
    { n: 64, name: 'قصر الشلالة', city: 'Ksar Chellala' },
    { n: 65, name: 'عين وسارة', city: 'Ain Oussara' },
    { n: 66, name: 'مسعد', city: 'Messaad' },
    { n: 67, name: 'قصر البخاري', city: 'Ksar El Boukhari' },
    { n: 68, name: 'بوسعادة', city: 'Bou Saada' },
    { n: 69, name: 'الأبيض سيدي الشيخ', city: 'El Abiodh Sidi Cheikh' }
];

var SAVED_WILAYA_KEY = 'rafeeq_wilaya';
var currentWilaya = parseInt(localStorage.getItem(SAVED_WILAYA_KEY) || '16', 10);
var countdownInterval = null;
var dayChangeInterval = null;
var currentDay = null;
var currentTimings = null;

function buildCitySelect() {
    var sel = document.getElementById('citySelect');
    if (!sel) return;
    sel.innerHTML = '';
    WILAYAS.forEach(function (w) {
        var opt = document.createElement('option');
        opt.value = w.n;
        opt.textContent = '📍 ' + w.name;
        sel.appendChild(opt);
    });
    sel.value = currentWilaya;
    sel.addEventListener('change', function () {
        currentWilaya = parseInt(sel.value, 10);
        localStorage.setItem(SAVED_WILAYA_KEY, currentWilaya);
        loadPrayerTimes();
    });
}

function loadPrayerTimes() {
    document.getElementById('status').hidden = false;
    document.getElementById('status').textContent = 'جاري تحميل مواقيت الصلاة...';
    document.getElementById('prayerCard').hidden = true;

    var w = WILAYAS.find(function (x) { return x.n === currentWilaya; });
    var now = new Date();
    var monthKey = 'rafeeq_calendar_' + w.n + '_' + now.getFullYear() + '_' + (now.getMonth() + 1);

    var cached = localStorage.getItem(monthKey);
    if (cached) {
        try {
            var dayData = findTodayInCalendar(JSON.parse(cached), now);
            if (dayData) { currentTimings = dayData; render(); return; }
        } catch (e) {}
    }

    fetchMonthCalendar(w, now).then(function (calendar) {
        if (calendar) {
            localStorage.setItem(monthKey, JSON.stringify(calendar));
            var dayData = findTodayInCalendar(calendar, now);
            if (dayData) { currentTimings = dayData; render(); }
        } else {
            document.getElementById('status').textContent = 'لا توجد بيانات محلية. يرجى الاتصال بالإنترنت مرة واحدة.';
            document.getElementById('prayerCard').hidden = true;
        }
    });
}

function fetchMonthCalendar(w, date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var url = 'https://api.aladhan.com/v1/calendarByCity/' + year + '/' + month +
        '?city=' + encodeURIComponent(w.city) + '&country=Algeria&method=19' +
        '&tune=0,-7,0,-7,-7,-7,0,-7,0';
    return fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (d) { return d.code === 200 ? d.data : null; })
        .catch(function () { return null; });
}

function findTodayInCalendar(calendar, now) {
    var todayStr = String(now.getDate()).padStart(2, '0') + '-' +
                   String(now.getMonth() + 1).padStart(2, '0') + '-' +
                   now.getFullYear();
    return calendar.find(function (d) { return d.date.gregorian.date === todayStr; }) ||
           null;
}

/**
 * الدالة الأساسية: عرض المواقيت وبدء العد التنازلي
 * تستخدم كائنات Date كاملة لضمان دقة الحساب عبر الأيام
 */
function render() {
    if (!currentTimings) return;
    var t = currentTimings.timings;
    var hijri = currentTimings.date.hijri;

    var prayers = [
        { name: 'الفجر', key: 'Fajr' },
        { name: 'الظهر', key: 'Dhuhr' },
        { name: 'العصر', key: 'Asr' },
        { name: 'المغرب', key: 'Maghrib' },
        { name: 'العشاء', key: 'Isha' }
    ];

    var now = new Date();
    currentDay = now.getDate();

    // بناء كائنات Date لكل صلاة
    var prayerDates = [];
    var allValid = true;
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (var i = 0; i < prayers.length; i++) {
        var date = prayerToDate(t[prayers[i].key], today);
        if (!date) { allValid = false; break; }
        prayerDates.push(date);
    }

    if (!allValid) {
        document.getElementById('status').textContent = 'بيانات المواقيت غير صالحة. حاول مجدداً.';
        document.getElementById('prayerCard').hidden = true;
        return;
    }

    // البحث عن الصلاة القادمة
    var nextIdx = -1;
    for (var i = 0; i < prayerDates.length; i++) {
        if (prayerDates[i] > now) {
            nextIdx = i;
            break;
        }
    }

    // إذا كانت كل الصلوات قد فاتت، الفجر هو القادم (غداً)
    if (nextIdx === -1) {
        nextIdx = 0;
        prayerDates[0].setDate(prayerDates[0].getDate() + 1);
    }

    var nextPrayer = prayers[nextIdx];
    var nextDate = prayerDates[nextIdx];

    // الصلاة السابقة
    var prevIdx = nextIdx === 0 ? prayerDates.length - 1 : nextIdx - 1;
    var prevDate = new Date(prayerDates[prevIdx]);
    // إذا كانت الصلاة القادمة هي فجر الغد، فالصلاة السابقة هي عشاء اليوم
    if (nextIdx === 0 && nextDate.getDate() !== today.getDate()) {
        prevDate = new Date(prayerDates[prayerDates.length - 1]);
    }

    // عرض المعلومات
    var isRamadan = parseInt(hijri.month.number, 10) === 9;
    var isFriday = now.getDay() === 5;

    document.getElementById('hijriPill').textContent =
        '📅 ' + hijri.day + ' ' + hijri.month.ar + ' ' + hijri.year + ' هـ';
    document.getElementById('moodNote').textContent =
        isRamadan ? '🌙 رمضان مبارك' : (isFriday ? '🕌 جمعة مباركة' : '');

    document.getElementById('nextName').textContent = nextPrayer.name;
    document.getElementById('nextTime').textContent = t[nextPrayer.key];
    document.getElementById('adhanTimeLabel').textContent =
        nextPrayer.name + ' — ' + t[nextPrayer.key];

    // بدء العد التنازلي
    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(function () {
        var n = new Date();
        var diff = Math.floor((nextDate - n) / 1000); // فرق بالثواني
        if (diff < 0) diff = 0;

        var h = Math.floor(diff / 3600);
        var m = Math.floor((diff % 3600) / 60);
        var s = diff % 60;
        document.getElementById('countdown').textContent =
            String(h).padStart(2, '0') + ':' +
            String(m).padStart(2, '0') + ':' +
            String(s).padStart(2, '0');

        var total = Math.floor((nextDate - prevDate) / 1000);
        if (total > 0) {
            var elapsed = total - diff;
            var progress = Math.max(0, Math.min(1, elapsed / total));
            document.getElementById('progressBar').style.width = (progress * 100) + '%';
            var circle = document.getElementById('progressRing');
            if (circle) {
                var r = 68;
                var c = 2 * Math.PI * r;
                circle.style.strokeDasharray = c;
                circle.style.strokeDashoffset = c * (1 - progress);
            }
        }
    }, 1000);

    document.getElementById('status').hidden = true;
    document.getElementById('prayerCard').hidden = false;
}

/** مراقبة تغير اليوم لتحديث المواقيت تلقائياً */
function startDayChangeMonitor() {
    if (dayChangeInterval) clearInterval(dayChangeInterval);
    dayChangeInterval = setInterval(function () {
        var now = new Date();
        if (currentDay !== null && now.getDate() !== currentDay) {
            // تغير اليوم، إعادة تحميل المواقيت
            loadPrayerTimes();
        }
    }, 60000); // فحص كل دقيقة
}

// الأذان
var audio = document.getElementById('adhanAudio');
var playIcon = document.getElementById('playIcon');
var pauseIcon = document.getElementById('pauseIcon');
var adhanBtn = document.getElementById('adhanPlayBtn');
if (adhanBtn && audio) {
    adhanBtn.addEventListener('click', function () {
        if (audio.paused) {
            audio.play().catch(function () {});
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
        } else {
            audio.pause();
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
        }
    });
    audio.addEventListener('ended', function () {
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
    });
}

// بدء التشغيل
buildCitySelect();
loadPrayerTimes();
startDayChangeMonitor();

// تسجيل Service Worker (مرة واحدة فقط)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
}

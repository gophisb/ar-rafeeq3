// ============================================================
// الرفيق — app.js
// الإصدار الكامل
// مواقيت الصلاة + التاريخ الهجري + العد التنازلي
// الأذان اليدوي + PWA + اختيار الولاية
// ============================================================

'use strict';


// ============================================================
// 1. AppBridge
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


// ============================================================
// 2. حالة التطبيق
// ============================================================

window.appState = {

    deferredPrompt: null,

    currentState: null,

    selectedWilaya: null,

    prayerData: null,

    countdownTimer: null,

    refreshTimer: null

};


// ============================================================
// 3. الولايات الجزائرية
// ============================================================

const ALGERIA_WILAYAS = [

    {
        name: 'أدرار',
        city: 'Adrar',
        country: 'Algeria'
    },

    {
        name: 'الشلف',
        city: 'Chlef',
        country: 'Algeria'
    },

    {
        name: 'الأغواط',
        city: 'Laghouat',
        country: 'Algeria'
    },

    {
        name: 'أم البواقي',
        city: 'Oum El Bouaghi',
        country: 'Algeria'
    },

    {
        name: 'باتنة',
        city: 'Batna',
        country: 'Algeria'
    },

    {
        name: 'بجاية',
        city: 'Bejaia',
        country: 'Algeria'
    },

    {
        name: 'بسكرة',
        city: 'Biskra',
        country: 'Algeria'
    },

    {
        name: 'بشار',
        city: 'Bechar',
        country: 'Algeria'
    },

    {
        name: 'البليدة',
        city: 'Blida',
        country: 'Algeria'
    },

    {
        name: 'البويرة',
        city: 'Bouira',
        country: 'Algeria'
    },

    {
        name: 'تمنراست',
        city: 'Tamanrasset',
        country: 'Algeria'
    },

    {
        name: 'تبسة',
        city: 'Tebessa',
        country: 'Algeria'
    },

    {
        name: 'تلمسان',
        city: 'Tlemcen',
        country: 'Algeria'
    },

    {
        name: 'تيارت',
        city: 'Tiaret',
        country: 'Algeria'
    },

    {
        name: 'تيزي وزو',
        city: 'Tizi Ouzou',
        country: 'Algeria'
    },

    {
        name: 'الجزائر',
        city: 'Algiers',
        country: 'Algeria'
    },

    {
        name: 'الجلفة',
        city: 'Djelfa',
        country: 'Algeria'
    },

    {
        name: 'جيجل',
        city: 'Jijel',
        country: 'Algeria'
    },

    {
        name: 'سطيف',
        city: 'Setif',
        country: 'Algeria'
    },

    {
        name: 'سعيدة',
        city: 'Saida',
        country: 'Algeria'
    },

    {
        name: 'سكيكدة',
        city: 'Skikda',
        country: 'Algeria'
    },

    {
        name: 'سيدي بلعباس',
        city: 'Sidi Bel Abbes',
        country: 'Algeria'
    },

    {
        name: 'عنابة',
        city: 'Annaba',
        country: 'Algeria'
    },

    {
        name: 'قالمة',
        city: 'Guelma',
        country: 'Algeria'
    },

    {
        name: 'قسنطينة',
        city: 'Constantine',
        country: 'Algeria'
    },

    {
        name: 'المدية',
        city: 'Medea',
        country: 'Algeria'
    },

    {
        name: 'مستغانم',
        city: 'Mostaganem',
        country: 'Algeria'
    },

    {
        name: 'المسيلة',
        city: 'M'Sila',
        country: 'Algeria'
    },

    {
        name: 'معسكر',
        city: 'Mascara',
        country: 'Algeria'
    },

    {
        name: 'ورقلة',
        city: 'Ouargla',
        country: 'Algeria'
    },

    {
        name: 'وهران',
        city: 'Oran',
        country: 'Algeria'
    },

    {
        name: 'البيض',
        city: 'El Bayadh',
        country: 'Algeria'
    },

    {
        name: 'إليزي',
        city: 'Illizi',
        country: 'Algeria'
    },

    {
        name: 'برج بوعريريج',
        city: 'Bordj Bou Arreridj',
        country: 'Algeria'
    },

    {
        name: 'بومرداس',
        city: 'Boumerdes',
        country: 'Algeria'
    },

    {
        name: 'الطارف',
        city: 'El Tarf',
        country: 'Algeria'
    },

    {
        name: 'تندوف',
        city: 'Tindouf',
        country: 'Algeria'
    },

    {
        name: 'تيسمسيلت',
        city: 'Tissemsilt',
        country: 'Algeria'
    },

    {
        name: 'الوادي',
        city: 'El Oued',
        country: 'Algeria'
    },

    {
        name: 'خنشلة',
        city: 'Khenchela',
        country: 'Algeria'
    },

    {
        name: 'سوق أهراس',
        city: 'Souk Ahras',
        country: 'Algeria'
    },

    {
        name: 'تيبازة',
        city: 'Tipaza',
        country: 'Algeria'
    },

    {
        name: 'ميلة',
        city: 'Mila',
        country: 'Algeria'
    },

    {
        name: 'عين الدفلى',
        city: 'Ain Defla',
        country: 'Algeria'
    },

    {
        name: 'النعامة',
        city: 'Naama',
        country: 'Algeria'
    },

    {
        name: 'عين تموشنت',
        city: 'Ain Temouchent',
        country: 'Algeria'
    },

    {
        name: 'غرداية',
        city: 'Ghardaia',
        country: 'Algeria'
    },

    {
        name: 'غليزان',
        city: 'Relizane',
        country: 'Algeria'
    },

    {
        name: 'تيميمون',
        city: 'Timimoun',
        country: 'Algeria'
    },

    {
        name: 'برج باجي مختار',
        city: 'Bordj Badji Mokhtar',
        country: 'Algeria'
    },

    {
        name: 'أولاد جلال',
        city: 'Ouled Djellal',
        country: 'Algeria'
    },

    {
        name: 'بني عباس',
        city: 'Beni Abbes',
        country: 'Algeria'
    },

    {
        name: 'عين صالح',
        city: 'In Salah',
        country: 'Algeria'
    },

    {
        name: 'عين قزام',
        city: 'In Guezzam',
        country: 'Algeria'
    },

    {
        name: 'تقرت',
        city: 'Touggourt',
        country: 'Algeria'
    },

    {
        name: 'جانت',
        city: 'Djanet',
        country: 'Algeria'
    },

    {
        name: 'المغير',
        city: 'El Meghaier',
        country: 'Algeria'
    },

    {
        name: 'المنيعة',
        city: 'El Menia',
        country: 'Algeria'
    }

];


// ============================================================
// 4. أسماء الصلوات
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
// 5. أوقات الصلاة المعتمدة
// ============================================================

const PRAYER_KEYS = [

    'Fajr',

    'Dhuhr',

    'Asr',

    'Maghrib',

    'Isha'

];


// ============================================================
// 6. عناصر الصفحة
// ============================================================

function getElements() {

    return {

        citySelect:
            document.getElementById(
                'citySelect'
            ),

        hijriPill:
            document.getElementById(
                'hijriPill'
            ),

        status:
            document.getElementById(
                'status'
            ),

        prayerCard:
            document.getElementById(
                'prayerCard'
            ),

        nextName:
            document.getElementById(
                'nextName'
            ),

        nextTime:
            document.getElementById(
                'nextTime'
            ),

        countdown:
            document.getElementById(
                'countdown'
            ),

        progressBar:
            document.getElementById(
                'progressBar'
            ),

        progressRing:
            document.getElementById(
                'progressRing'
            ),

        moodNote:
            document.getElementById(
                'moodNote'
            ),

        adhanTimeLabel:
            document.getElementById(
                'adhanTimeLabel'
            ),

        audio:
            document.getElementById(
                'adhanAudio'
            ),

        playButton:
            document.getElementById(
                'adhanPlayBtn'
            ),

        playIcon:
            document.getElementById(
                'playIcon'
            ),

        pauseIcon:
            document.getElementById(
                'pauseIcon'
            )

    };

}


// ============================================================
// 7. تعبئة قائمة الولايات
// ============================================================

function populateWilayas() {

    const elements =
        getElements();

    const select =
        elements.citySelect;

    if (!select) {

        console.warn(
            '⚠️ citySelect غير موجود'
        );

        return;

    }

    select.innerHTML = '';

    ALGERIA_WILAYAS.forEach(
        (wilaya, index) => {

            const option =
                document.createElement(
                    'option'
                );

            option.value =
                String(index);

            option.textContent =
                wilaya.name;

            select.appendChild(
                option
            );

        }
    );

    const savedWilaya =
        localStorage.getItem(
            'rafeeqWilaya'
        );

    if (
        savedWilaya !== null &&
        ALGERIA_WILAYAS[
            Number(savedWilaya)
        ]
    ) {

        select.value =
            savedWilaya;

    } else {

        // الجزائر افتراضيًا
        const algiersIndex =
            ALGERIA_WILAYAS.findIndex(
                item =>
                    item.city === 'Algiers'
            );

        select.value =
            algiersIndex >= 0
                ? String(algiersIndex)
                : '15';

    }

}


// ============================================================
// 8. الحصول على الولاية الحالية
// ============================================================

function getSelectedWilaya() {

    const elements =
        getElements();

    if (!elements.citySelect) {
        return ALGERIA_WILAYAS[15];
    }

    const index =
        Number(
            elements.citySelect.value
        );

    return (
        ALGERIA_WILAYAS[index] ||
        ALGERIA_WILAYAS[15]
    );

}


// ============================================================
// 9. تحويل الوقت إلى دقائق
// ============================================================

function timeToMinutes(time) {

    if (!time) {
        return null;
    }

    const cleanTime =
        String(time)
            .replace(
                /\s*\([^)]*\)/g,
                ''
            )
            .trim();

    const parts =
        cleanTime.split(':');

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


// ============================================================
// 10. تحويل الوقت إلى نص نظيف
// ============================================================

function cleanTime(time) {

    if (!time) {
        return '--:--';
    }

    return String(time)
        .replace(
            /\s*\([^)]*\)/g,
            ''
        )
        .trim();

}


// ============================================================
// 11. إنشاء وقت الصلاة لهذا اليوم
// ============================================================

function createPrayerDate(time) {

    const clean =
        cleanTime(time);

    const parts =
        clean.split(':');

    if (parts.length < 2) {
        return null;
    }

    const hours =
        Number(parts[0]);

    const minutes =
        Number(parts[1]);

    const now =
        new Date();

    const date =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hours,
            minutes,
            0,
            0
        );

    return date;

}


// ============================================================
// 12. جلب مواقيت الصلاة من AlAdhan
// ============================================================

async function fetchPrayerTimes() {

    const elements =
        getElements();

    const wilaya =
        getSelectedWilaya();

    if (!wilaya) {
        return;
    }

    window.appState.selectedWilaya =
        wilaya;

    localStorage.setItem(
        'rafeeqWilaya',
        String(
            elements.citySelect
                ? elements.citySelect.value
                : '15'
        )
    );


    // عرض حالة التحميل

    if (elements.status) {

        elements.status.hidden =
            false;

        elements.status.textContent =
            'جاري تحميل مواقيت الصلاة...';

    }


    if (elements.prayerCard) {

        elements.prayerCard.hidden =
            true;

    }


    const today =
        new Date();

    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            '0'
        );

    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            '0'
        );

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
        encodeURIComponent(
            wilaya.city
        ) +
        '&country=' +
        encodeURIComponent(
            wilaya.country
        ) +
        '&method=3';


    try {

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
                'HTTP ' +
                response.status
            );

        }


        const result =
            await response.json();


        if (
            !result ||
            result.code !== 200 ||
            !result.data
        ) {

            throw new Error(
                'بيانات المواقيت غير صالحة'
            );

        }


        window.appState.prayerData =
            result.data;


        // عرض التاريخ الهجري

        updateHijriDate(
            result.data.date
        );


        // تحديث الصلاة القادمة

        updateNextPrayer();


        // إظهار البطاقة

        if (elements.status) {

            elements.status.hidden =
                true;

        }

        if (elements.prayerCard) {

            elements.prayerCard.hidden =
                false;

        }


        if (elements.moodNote) {

            elements.moodNote.textContent =
                'مواقيت الصلاة في ' +
                wilaya.name;

        }


        console.log(
            '✅ تم تحميل مواقيت الصلاة:',
            wilaya.name
        );


    } catch (error) {

        console.error(
            '❌ خطأ في جلب مواقيت الصلاة:',
            error
        );


        if (elements.status) {

            elements.status.hidden =
                false;

            elements.status.textContent =
                'تعذر تحميل مواقيت الصلاة. تحقق من اتصال الإنترنت ثم أعد المحاولة.';

        }


        if (elements.prayerCard) {

            elements.prayerCard.hidden =
                true;

        }

    }

}


// ============================================================
// 13. عرض التاريخ الهجري
// ============================================================

function updateHijriDate(dateData) {

    const elements =
        getElements();

    if (
        !elements.hijriPill ||
        !dateData ||
        !dateData.hijri
    ) {

        return;

    }

    const hijri =
        dateData.hijri;

    const day =
        hijri.day || '';

    const month =
        hijri.month &&
        hijri.month.ar
            ? hijri.month.ar
            : '';

    const year =
        hijri.year || '';


    elements.hijriPill.textContent =
        '📅 ' +
        day +
        ' ' +
        month +
        ' ' +
        year +
        ' هـ';

}


// ============================================================
// 14. البحث عن الصلاة القادمة
// ============================================================

function getNextPrayer() {

    const data =
        window.appState.prayerData;

    if (
        !data ||
        !data.timings
    ) {

        return null;

    }


    const now =
        new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes() +
        (
            now.getSeconds() /
            60
        );


    for (
        let i = 0;
        i < PRAYER_KEYS.length;
        i++
    ) {

        const key =
            PRAYER_KEYS[i];

        const time =
            cleanTime(
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

                key: key,

                name:
                    PRAYER_NAMES[key],

                time: time,

                date:
                    createPrayerDate(
                        time
                    ),

                minutes: minutes

            };

        }

    }


    // إذا انتهت جميع صلوات اليوم
    // الصلاة القادمة هي فجر الغد

    const fajrTime =
        cleanTime(
            data.timings.Fajr
        );

    const fajrDate =
        createPrayerDate(
            fajrTime
        );


    if (fajrDate) {

        fajrDate.setDate(
            fajrDate.getDate() + 1
        );

    }


    return {

        key: 'Fajr',

        name: 'الفجر',

        time: fajrTime,

        date: fajrDate,

        minutes:
            timeToMinutes(
                fajrTime
            ),

        tomorrow: true

    };

}


// ============================================================
// 15. تحديث الصلاة القادمة
// ============================================================

function updateNextPrayer() {

    const elements =
        getElements();

    const next =
        getNextPrayer();


    if (!next) {
        return;
    }


    if (elements.nextName) {

        elements.nextName.textContent =
            next.name;

    }


    if (elements.nextTime) {

        elements.nextTime.textContent =
            next.time;

    }


    if (elements.adhanTimeLabel) {

        elements.adhanTimeLabel.textContent =
            next.name +
            ' — ' +
            next.time;

    }


    updateCountdown();

}


// ============================================================
// 16. العد التنازلي
// ============================================================

function updateCountdown() {

    const elements =
        getElements();

    const next =
        getNextPrayer();


    if (
        !next ||
        !next.date
    ) {

        return;

    }


    const now =
        new Date();

    const difference =
        next.date.getTime() -
        now.getTime();


    // إذا انتهى الوقت
    // نعيد تحميل مواقيت اليوم

    if (
        difference <= 0
    ) {

        if (
            window.appState.refreshTimer
        ) {

            clearTimeout(
                window.appState.refreshTimer
            );

        }


        window.appState.refreshTimer =
            setTimeout(
                () => {

                    fetchPrayerTimes();

                },
                2000
            );

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


    const h =
        String(
            hours
        ).padStart(
            2,
            '0'
        );


    const m =
        String(
            minutes
        ).padStart(
            2,
            '0'
        );


    const s =
        String(
            seconds
        ).padStart(
            2,
            '0'
        );


    if (elements.countdown) {

        elements.countdown.textContent =
            h +
            ':' +
            m +
            ':' +
            s;

    }


    // --------------------------------------------------------
    // حساب التقدم
    // --------------------------------------------------------

    updateProgress(
        next
    );

}


// ============================================================
// 17. شريط التقدم والدائرة
// ============================================================

function updateProgress(next) {

    const elements =
        getElements();

    if (
        !next ||
        !next.date
    ) {

        return;

    }


    const now =
        new Date();


    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes() +
        (
            now.getSeconds() / 60
        );


    const nextMinutes =
        next.minutes;


    let previousMinutes =
        null;


    const data =
        window.appState.prayerData;


    if (
        data &&
        data.timings
    ) {

        const index =
            PRAYER_KEYS.indexOf(
                next.key
            );


        if (index > 0) {

            previousMinutes =
                timeToMinutes(
                    cleanTime(
                        data.timings[
                            PRAYER_KEYS[
                                index - 1
                            ]
                        ]
                    )
                );

        }

    }


    // بعد منتصف الليل
    // إذا كانت الصلاة القادمة فجر الغد

    if (
        next.tomorrow
    ) {

        previousMinutes =
            timeToMinutes(
                cleanTime(
                    data.timings.Isha
                )
            );

    }


    if (
        previousMinutes === null ||
        nextMinutes === null
    ) {

        return;

    }


    let progress =
        (
            currentMinutes -
            previousMinutes
        ) /
        (
            nextMinutes -
            previousMinutes
        );


    if (next.tomorrow) {

        progress =
            (
                currentMinutes +
                1440 -
                previousMinutes
            ) /
            (
                nextMinutes +
                1440 -
                previousMinutes
            );

    }


    progress =
        Math.max(
            0,
            Math.min(
                1,
                progress
            )
        );


    const percent =
        progress * 100;


    if (elements.progressBar) {

        elements.progressBar.style.width =
            percent +
            '%';

    }


    if (elements.progressRing) {

        const circumference =
            427.3;

        const offset =
            circumference -
            (
                progress *
                circumference
            );

        elements.progressRing.style.strokeDashoffset =
            offset;

    }

}


// ============================================================
// 18. تشغيل العد التنازلي كل ثانية
// ============================================================

function startCountdown() {

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

                if (
                    window.appState.prayerData
                ) {

                    updateCountdown();

                }

            },
            1000
        );

}


// ============================================================
// 19. نظام الأذان اليدوي
// ============================================================

function initAdhan() {

    const elements =
        getElements();


    const audio =
        elements.audio;

    const playButton =
        elements.playButton;


    if (
        !audio ||
        !playButton
    ) {

        console.warn(
            '⚠️ عناصر الأذان غير موجودة'
        );

        return;

    }


    playButton.addEventListener(
        'click',
        async () => {

            try {

                if (
                    audio.paused
                ) {

                    audio.currentTime =
                        0;

                    await audio.play();


                    if (
                        elements.playIcon
                    ) {

                        elements.playIcon.style.display =
                            'none';

                    }


                    if (
                        elements.pauseIcon
                    ) {

                        elements.pauseIcon.style.display =
                            'block';

                    }

                } else {

                    audio.pause();


                    if (
                        elements.playIcon
                    ) {

                        elements.playIcon.style.display =
                            'block';

                    }


                    if (
                        elements.pauseIcon
                    ) {

                        elements.pauseIcon.style.display =
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
                    'تأكد من وجود ملف adhan.mp3 بجانب index.html.'
                );

            }

        }
    );


    audio.addEventListener(
        'ended',
        () => {

            if (
                elements.playIcon
            ) {

                elements.playIcon.style.display =
                    'block';

            }


            if (
                elements.pauseIcon
            ) {

                elements.pauseIcon.style.display =
                    'none';

            }

        }
    );


    audio.addEventListener(
        'error',
        () => {

            console.error(
                '❌ خطأ في ملف adhan.mp3:',
                audio.error
            );

        }
    );

}


// ============================================================
// 20. تغيير الولاية
// ============================================================

function initWilayaSelector() {

    const elements =
        getElements();

    if (
        !elements.citySelect
    ) {

        return;

    }


    elements.citySelect.addEventListener(
        'change',
        () => {

            fetchPrayerTimes();

        }
    );

}


// ============================================================
// 21. PWA — beforeinstallprompt
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
            '📱 الرفيق جاهز للتثبيت'
        );

    }
);


// ============================================================
// 22. PWA — تثبيت التطبيق
// ============================================================

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


            window.AppBridge.emit(
                'app-installed-success'
            );


            return result.outcome;


        } catch (error) {

            console.error(
                '❌ خطأ في تثبيت التطبيق:',
                error
            );

            return 'failed';

        }

    };


// ============================================================
// 23. PWA — بعد التثبيت
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
// 24. تشغيل التطبيق
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        console.log(
            '🚀 بدء تشغيل الرفيق...'
        );


        // تعبئة الولايات

        populateWilayas();


        // تفعيل تغيير الولاية

        initWilayaSelector();


        // تفعيل الأذان

        initAdhan();


        // تحميل المواقيت

        await fetchPrayerTimes();


        // تشغيل العد التنازلي

        startCountdown();


        console.log(
            '✅ الرفيق يعمل بنجاح'
        );

    }
);


// ============================================================
// 25. أخطاء JavaScript
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
// 26. أخطاء Promise
// ============================================================

window.addEventListener(
    'unhandledrejection',
    event => {

        console.error(
            '❌ Unhandled Promise:',
            event.reason
        );

    }
);


// ============================================================
// نهاية app.js
// ============================================================
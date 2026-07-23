// ============================================================
// الرفيق — app.js
// نظام PWA + تشغيل الأذان اليدوي
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

    currentState: null

};


// ============================================================
// PWA — طلب تثبيت التطبيق
// ============================================================

window.addEventListener(
    'beforeinstallprompt',
    event => {

        event.preventDefault();

        window.appState.deferredPrompt = event;

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
            '❌ خطأ أثناء تثبيت التطبيق:',
            error
        );

        return 'failed';

    }

};


// ============================================================
// PWA — تم تثبيت التطبيق
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
// نظام الأذان
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

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


        // ----------------------------------------------------
        // التأكد من وجود عناصر الأذان
        // ----------------------------------------------------

        if (!audio) {

            console.warn(
                '⚠️ عنصر الصوت adhanAudio غير موجود في هذه الصفحة'
            );

            return;

        }


        if (!playButton) {

            console.warn(
                '⚠️ زر الأذان adhanPlayBtn غير موجود في هذه الصفحة'
            );

            return;

        }


        console.log(
            '🔊 نظام الأذان جاهز'
        );


        // ----------------------------------------------------
        // زر تشغيل / إيقاف الأذان
        // ----------------------------------------------------

        playButton.addEventListener(
            'click',
            async () => {

                try {

                    // إذا كان الأذان متوقفًا
                    if (audio.paused) {

                        audio.currentTime = 0;

                        await audio.play();


                        // إخفاء زر التشغيل
                        if (playIcon) {

                            playIcon.style.display =
                                'none';

                        }


                        // إظهار زر الإيقاف
                        if (pauseIcon) {

                            pauseIcon.style.display =
                                'block';

                        }


                        console.log(
                            '🔊 بدأ تشغيل الأذان'
                        );

                    }

                    // إذا كان الأذان يعمل
                    else {

                        audio.pause();


                        // إظهار زر التشغيل
                        if (playIcon) {

                            playIcon.style.display =
                                'block';

                        }


                        // إخفاء زر الإيقاف
                        if (pauseIcon) {

                            pauseIcon.style.display =
                                'none';

                        }


                        console.log(
                            '⏸️ تم إيقاف الأذان'
                        );

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


        // ----------------------------------------------------
        // عند انتهاء الأذان
        // ----------------------------------------------------

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

                console.log(
                    '✅ انتهى تشغيل الأذان'
                );

            }
        );


        // ----------------------------------------------------
        // مراقبة أخطاء ملف الصوت
        // ----------------------------------------------------

        audio.addEventListener(
            'error',
            () => {

                console.error(
                    '❌ حدث خطأ في تحميل adhan.mp3',
                    audio.error
                );

            }
        );

    }
);


// ============================================================
// تسجيل أخطاء JavaScript بدون إخفائها
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
    '🚀 الرفيق — app.js يعمل بنجاح'
);
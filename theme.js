// theme.js — الرفيق 3
// يُطبَّق في كل صفحة (index.html وباقي الصفحات) لضمان ثبات الوضع الليلي/النهاري
// عبر كامل التطبيق. يُقرأ من localStorage ويُطبَّق فوراً قبل الرسم لتفادي الوميض.
(function () {
  const KEY = 'rafeeq_theme'; // القيم الممكنة: 'day' أو 'night'
  const saved = localStorage.getItem(KEY);
  if (saved === 'day') {
    document.documentElement.classList.add('day-mode-pending');
  }
  // نطبّق الكلاس على body بمجرد توفره (قد يُستدعى هذا السكربت من <head> قبل وجود body)
  function apply() {
    if (localStorage.getItem(KEY) === 'day') {
      document.body.classList.add('day-mode');
    } else {
      document.body.classList.remove('day-mode');
    }
  }
  if (document.body) apply();
  else document.addEventListener('DOMContentLoaded', apply);

  // دالة عامة يستخدمها زر التبديل في more.html (وأي صفحة أخرى إن احتجنا)
  window.rafeeqToggleTheme = function () {
    const cur = localStorage.getItem(KEY) === 'day' ? 'day' : 'night';
    const next = cur === 'day' ? 'night' : 'day';
    localStorage.setItem(KEY, next);
    document.body.classList.toggle('day-mode', next === 'day');
    return next;
  };
})();

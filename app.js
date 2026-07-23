// app.js — الرفيق 3
// المنطق الكامل للصفحة الرئيسية: مواقيت الصلاة، العدّاد، التاريخ الهجري،
// تشغيل الأذان، وتحديد أقرب ولاية فعلياً عبر GPS (بدل قيمة ثابتة).

const WILAYAS=[{n:1,name:"أدرار",city:"Adrar",lat:27.87,lng:-0.29},{n:2,name:"الشلف",city:"Chlef",lat:36.165,lng:1.335},{n:3,name:"الأغواط",city:"Laghouat",lat:33.8,lng:2.865},{n:4,name:"أم البواقي",city:"Oum El Bouaghi",lat:35.87,lng:7.11},{n:5,name:"باتنة",city:"Batna",lat:35.556,lng:6.174},{n:6,name:"بجاية",city:"Bejaia",lat:36.75,lng:5.08},{n:7,name:"بسكرة",city:"Biskra",lat:34.85,lng:5.73},{n:8,name:"بشار",city:"Bechar",lat:31.615,lng:-2.215},{n:9,name:"البليدة",city:"Blida",lat:36.47,lng:2.83},{n:10,name:"البويرة",city:"Bouira",lat:36.373,lng:3.902},{n:11,name:"تمنراست",city:"Tamanrasset",lat:22.785,lng:5.522},{n:12,name:"تبسة",city:"Tebessa",lat:35.404,lng:8.124},{n:13,name:"تلمسان",city:"Tlemcen",lat:34.878,lng:-1.315},{n:14,name:"تيارت",city:"Tiaret",lat:35.371,lng:1.317},{n:15,name:"تيزي وزو",city:"Tizi Ouzou",lat:36.717,lng:4.045},{n:16,name:"الجزائر العاصمة",city:"Algiers",lat:36.753,lng:3.058},{n:17,name:"الجلفة",city:"Djelfa",lat:34.673,lng:3.263},{n:18,name:"جيجل",city:"Jijel",lat:36.82,lng:5.766},{n:19,name:"سطيف",city:"Setif",lat:36.19,lng:5.41},{n:20,name:"سعيدة",city:"Saida",lat:34.83,lng:0.15},{n:21,name:"سكيكدة",city:"Skikda",lat:36.879,lng:6.909},{n:22,name:"سيدي بلعباس",city:"Sidi Bel Abbes",lat:35.19,lng:-0.63},{n:23,name:"عنابة",city:"Annaba",lat:36.897,lng:7.765},{n:24,name:"قالمة",city:"Guelma",lat:36.462,lng:7.427},{n:25,name:"قسنطينة",city:"Constantine",lat:36.365,lng:6.615},{n:26,name:"المدية",city:"Medea",lat:36.264,lng:2.75},{n:27,name:"مستغانم",city:"Mostaganem",lat:35.935,lng:0.089},{n:28,name:"المسيلة",city:"M'Sila",lat:35.705,lng:4.541},{n:29,name:"معسكر",city:"Mascara",lat:35.397,lng:0.14},{n:30,name:"ورقلة",city:"Ouargla",lat:31.95,lng:5.33},{n:31,name:"وهران",city:"Oran",lat:35.699,lng:-0.634},{n:32,name:"البيض",city:"El Bayadh",lat:33.68,lng:1.02},{n:33,name:"إليزي",city:"Illizi",lat:26.48,lng:8.47},{n:34,name:"برج بوعريريج",city:"Bordj Bou Arreridj",lat:36.073,lng:4.76},{n:35,name:"بومرداس",city:"Boumerdes",lat:36.766,lng:3.477},{n:36,name:"الطارف",city:"El Tarf",lat:36.767,lng:8.313},{n:37,name:"تندوف",city:"Tindouf",lat:27.67,lng:-8.147},{n:38,name:"تيسمسيلت",city:"Tissemsilt",lat:35.607,lng:1.81},{n:39,name:"الوادي",city:"El Oued",lat:33.368,lng:6.867},{n:40,name:"خنشلة",city:"Khenchela",lat:35.436,lng:7.143},{n:41,name:"سوق أهراس",city:"Souk Ahras",lat:36.286,lng:7.951},{n:42,name:"تيبازة",city:"Tipaza",lat:36.589,lng:2.448},{n:43,name:"ميلة",city:"Mila",lat:36.45,lng:6.264},{n:44,name:"عين الدفلى",city:"Ain Defla",lat:36.264,lng:1.966},{n:45,name:"النعامة",city:"Naama",lat:33.266,lng:-0.311},{n:46,name:"عين تموشنت",city:"Ain Temouchent",lat:35.298,lng:-1.14},{n:47,name:"غرداية",city:"Ghardaia",lat:32.49,lng:3.673},{n:48,name:"غليزان",city:"Relizane",lat:35.737,lng:0.556},{n:49,name:"تيميمون",city:"Timimoun",lat:29.263,lng:0.231},{n:50,name:"برج باجي مختار",city:"Bordj Badji Mokhtar",lat:21.33,lng:0.95},{n:51,name:"أولاد جلال",city:"Ouled Djellal",lat:34.42,lng:5.07},{n:52,name:"بني عباس",city:"Beni Abbes",lat:30.13,lng:-2.17},{n:53,name:"عين صالح",city:"In Salah",lat:27.19,lng:2.48},{n:54,name:"عين قزام",city:"In Guezzam",lat:19.57,lng:5.77},{n:55,name:"تقرت",city:"Touggourt",lat:33.1,lng:6.06},{n:56,name:"جانت",city:"Djanet",lat:24.55,lng:9.48},{n:57,name:"المغير",city:"El M'Ghair",lat:33.95,lng:5.92},{n:58,name:"المنيعة",city:"El Meniaa",lat:30.58,lng:2.88},{n:59,name:"آفلو",city:"Aflou",lat:34.11,lng:2.1},{n:60,name:"بريكة",city:"Barika",lat:35.38,lng:5.37},{n:61,name:"القنطرة",city:"El Kantara",lat:35.22,lng:5.71},{n:62,name:"بئر العاتر",city:"Bir El Ater",lat:35.02,lng:8.06},{n:63,name:"العريشة",city:"El Aricha",lat:34.3,lng:-1.28},{n:64,name:"قصر الشلالة",city:"Ksar Chellala",lat:35.21,lng:2.31},{n:65,name:"عين وسارة",city:"Ain Oussara",lat:35.45,lng:2.9},{n:66,name:"مسعد",city:"Messaad",lat:34.15,lng:3.5},{n:67,name:"قصر البخاري",city:"Ksar El Boukhari",lat:35.86,lng:2.77},{n:68,name:"بوسعادة",city:"Bou Saada",lat:35.21,lng:4.19},{n:69,name:"الأبيض سيدي الشيخ",city:"El Abiodh Sidi Cheikh",lat:32.9,lng:0.53}];

const SAVED_WILAYA_KEY = 'rafeeq_wilaya';
const SAVED_WILAYA_SOURCE_KEY = 'rafeeq_wilaya_source'; // 'gps' أو 'manual'
let currentWilaya = parseInt(localStorage.getItem(SAVED_WILAYA_KEY) || '16', 10);

function toMinutes(t){ const [h,m] = t.split(':').map(Number); return h*60+m; }

// ===== حساب أقرب ولاية بالإحداثيات (Haversine) — يعمل محلياً بلا إنترنت =====
function haversineKm(lat1, lng1, lat2, lng2){
  const toRad = d => d*Math.PI/180;
  const R = 6371;
  const dLat = toRad(lat2-lat1), dLng = toRad(lng2-lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}

function nearestWilaya(lat, lng){
  let best = WILAYAS[0], bestDist = Infinity;
  for(const w of WILAYAS){
    const d = haversineKm(lat, lng, w.lat, w.lng);
    if(d < bestDist){ bestDist = d; best = w; }
  }
  return best;
}

// يحاول تحديد الولاية عبر GPS الحقيقي؛ يعمل كذلك بلا اتصال بالإنترنت لأن
// الحساب كله محلي (لا يحتاج استدعاء أي API لتحديد الولاية، فقط لمواقيت الصلاة لاحقاً)
function detectWilayaByGPS(onDone){
  if(!('geolocation' in navigator)){ onDone(false); return; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const w = nearestWilaya(pos.coords.latitude, pos.coords.longitude);
      currentWilaya = w.n;
      localStorage.setItem(SAVED_WILAYA_KEY, currentWilaya);
      localStorage.setItem(SAVED_WILAYA_SOURCE_KEY, 'gps');
      onDone(true, w);
    },
    () => onDone(false),
    { enableHighAccuracy:true, timeout:8000, maximumAge:600000 }
  );
}

function buildCitySelect(){
  const sel = document.getElementById('citySelect');
  WILAYAS.forEach(w=>{
    const opt = document.createElement('option');
    opt.value = w.n; opt.textContent = w.name;
    sel.appendChild(opt);
  });
  sel.value = currentWilaya;
  sel.addEventListener('change', ()=>{
    currentWilaya = parseInt(sel.value, 10);
    localStorage.setItem(SAVED_WILAYA_KEY, currentWilaya);
    localStorage.setItem(SAVED_WILAYA_SOURCE_KEY, 'manual'); // اختيار المستخدم يدوياً له الأولوية بعد ذلك
    loadPrayerTimes();
  });
}

function loadPrayerTimes(){
  const statusEl = document.getElementById('status');
  const cardEl = document.getElementById('prayerCard');
  statusEl.hidden = false;
  statusEl.textContent = 'جاري تحميل مواقيت الصلاة...';
  cardEl.hidden = true;

  const w = WILAYAS.find(x=>x.n===currentWilaya);
  const today = new Date();
  const cacheKey = `rafeeq_calendar_${w.n}_${today.getFullYear()}_${today.getMonth()+1}`;
  const cached = localStorage.getItem(cacheKey);

  if(cached){
    try{
      const found = findTodayInCalendar(JSON.parse(cached), today);
      if(found){ render(found); refreshCalendarInBackground(w, cacheKey, today); return; }
    }catch(e){}
  }

  fetchMonthCalendar(w, today).then(data=>{
    if(data){
      localStorage.setItem(cacheKey, JSON.stringify(data));
      render(findTodayInCalendar(data, today));
    } else {
      statusEl.textContent = 'لا توجد بيانات محلية لهذا الشهر. يرجى الاتصال بالإنترنت مرة واحدة لتحميل المواقيت.';
    }
  });
}

function fetchMonthCalendar(w, date){
  const url = `https://api.aladhan.com/v1/calendarByCity/${date.getFullYear()}/${date.getMonth()+1}?city=${encodeURIComponent(w.city)}&country=Algeria&method=19&tune=0,-7,0,-7,-7,-7,0,-7,0`;
  return fetch(url).then(r=>r.json()).then(d=> d.code===200 ? d.data : null).catch(()=>null);
}

function refreshCalendarInBackground(w, cacheKey, date){
  fetchMonthCalendar(w, date).then(d=>{ if(d) localStorage.setItem(cacheKey, JSON.stringify(d)); });
}

function findTodayInCalendar(data, date){
  const dstr = String(date.getDate()).padStart(2,'0')+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+date.getFullYear();
  return data.find(d=>d.date.gregorian.date===dstr) || data[date.getDate()-1] || null;
}

let countdownTimer = null;

function render(entry){
  const t = entry.timings;
  const hijri = entry.date.hijri;
  const isRamadan = parseInt(hijri.month.number,10)===9;
  const isFriday = new Date().getDay()===5;

  document.getElementById('hijriPill').textContent = `📅 ${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;
  document.getElementById('moodNote').textContent = isRamadan ? '🌙 رمضان مبارك'
    : isFriday ? '🕌 جمعة مباركة — أكثِر من الصلاة على النبي ﷺ' : '';

  const prayers = [
    {name:'الفجر', key:'Fajr'}, {name:'الظهر', key:'Dhuhr'}, {name:'العصر', key:'Asr'},
    {name:'المغرب', key:'Maghrib'}, {name:'العشاء', key:'Isha'}
  ];
  const now = new Date();
  const nowMin = now.getHours()*60 + now.getMinutes();
  let idx = prayers.findIndex(p => toMinutes(t[p.key]) > nowMin);
  let target, prevKey;
  if(idx === -1){ idx = 0; target = toMinutes(t.Fajr) + 1440; prevKey = toMinutes(t.Isha); }
  else{ target = toMinutes(t[prayers[idx].key]); prevKey = idx===0 ? toMinutes(t.Isha)-1440 : toMinutes(t[prayers[idx-1].key]); }

  document.getElementById('nextName').textContent = prayers[idx].name;
  document.getElementById('nextTime').textContent = t[prayers[idx].key];
  document.getElementById('adhanTimeLabel').textContent = `${prayers[idx].name} — ${t[prayers[idx].key]}`;

  if(countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(()=>{
    const n = new Date();
    const nowSec = n.getHours()*3600 + n.getMinutes()*60 + n.getSeconds();
    let diff = target*60 - nowSec;
    if(diff < 0) diff += 86400;
    const h = Math.floor(diff/3600), m = Math.floor(diff%3600/60), s = diff%60;
    document.getElementById('countdown').textContent =
      `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

    const totalSpan = 60*(target - prevKey);
    const elapsed = totalSpan - diff/60;
    const ratio = Math.max(0, Math.min(1, elapsed/totalSpan));
    document.getElementById('progressBar').style.width = (ratio*100)+'%';
  }, 1000);

  document.getElementById('status').hidden = true;
  document.getElementById('prayerCard').hidden = false;
}

// ===== الأذان =====
function initAdhan(){
  const audio = document.getElementById('adhanAudio');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  document.getElementById('adhanPlayBtn').addEventListener('click', ()=>{
    if(audio.paused){ audio.play().catch(()=>{}); playIcon.style.display='none'; pauseIcon.style.display='block'; }
    else{ audio.pause(); playIcon.style.display='block'; pauseIcon.style.display='none'; }
  });
  audio.addEventListener('ended', ()=>{ playIcon.style.display='block'; pauseIcon.style.display='none'; });
}

// ===== نقطة البداية =====
document.addEventListener('DOMContentLoaded', () => {
  buildCitySelect();

  // إن لم يختر المستخدم يدوياً من قبل، أو كان آخر مصدر هو GPS نفسه، نحاول تحديث الموقع تلقائياً
  const source = localStorage.getItem(SAVED_WILAYA_SOURCE_KEY);
  if(source !== 'manual'){
    detectWilayaByGPS((ok, w) => {
      if(ok){ document.getElementById('citySelect').value = w.n; }
      loadPrayerTimes();
    });
  } else {
    loadPrayerTimes();
  }

  initAdhan();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
});

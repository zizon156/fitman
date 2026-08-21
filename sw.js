/* 핏맨 서비스 워커 — 오프라인 지원 */
const V = "fitman-v2";
const CORE = ["./", "index.html", "manifest.webmanifest", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"];
const PHOTOS = ["Ab_Roller_0.jpg", "Ab_Roller_1.jpg", "Barbell_Curl_0.jpg", "Barbell_Curl_1.jpg", "Barbell_Hip_Thrust_0.jpg", "Barbell_Hip_Thrust_1.jpg", "Barbell_Squat_0.jpg", "Barbell_Squat_1.jpg", "Cable_Crossover_0.jpg", "Cable_Crossover_1.jpg", "Cable_Crunch_0.jpg", "Cable_Crunch_1.jpg", "Cable_Seated_Lateral_Raise_0.jpg", "Cable_Seated_Lateral_Raise_1.jpg", "Chin-Up_0.jpg", "Chin-Up_1.jpg", "Close-Grip_Push-Up_off_of_a_Dumbbell_0.jpg", "Close-Grip_Push-Up_off_of_a_Dumbbell_1.jpg", "Concentration_Curls_0.jpg", "Concentration_Curls_1.jpg", "Dead_Bug_0.jpg", "Dead_Bug_1.jpg", "Decline_Push-Up_0.jpg", "Decline_Push-Up_1.jpg", "Dips_-_Triceps_Version_0.jpg", "Dips_-_Triceps_Version_1.jpg", "Dumbbell_Flyes_0.jpg", "Dumbbell_Flyes_1.jpg", "Dumbbell_Shoulder_Press_0.jpg", "Dumbbell_Shoulder_Press_1.jpg", "Dumbbell_Shrug_0.jpg", "Dumbbell_Shrug_1.jpg", "EZ-Bar_Skullcrusher_0.jpg", "EZ-Bar_Skullcrusher_1.jpg", "Face_Pull_0.jpg", "Face_Pull_1.jpg", "Freehand_Jump_Squat_0.jpg", "Freehand_Jump_Squat_1.jpg", "Goblet_Squat_0.jpg", "Goblet_Squat_1.jpg", "Hammer_Curls_0.jpg", "Hammer_Curls_1.jpg", "Hanging_Leg_Raise_0.jpg", "Hanging_Leg_Raise_1.jpg", "Incline_Dumbbell_Curl_0.jpg", "Incline_Dumbbell_Curl_1.jpg", "Incline_Dumbbell_Press_0.jpg", "Incline_Dumbbell_Press_1.jpg", "Inverted_Row_0.jpg", "Inverted_Row_1.jpg", "Lateral_Raise_-_With_Bands_0.jpg", "Lateral_Raise_-_With_Bands_1.jpg", "Leg_Press_0.jpg", "Leg_Press_1.jpg", "Leverage_Chest_Press_0.jpg", "Leverage_Chest_Press_1.jpg", "One-Arm_Dumbbell_Row_0.jpg", "One-Arm_Dumbbell_Row_1.jpg", "Plank_0.jpg", "Plank_1.jpg", "Pullups_0.jpg", "Pullups_1.jpg", "Pushups_0.jpg", "Pushups_1.jpg", "Reverse_Machine_Flyes_0.jpg", "Reverse_Machine_Flyes_1.jpg", "Romanian_Deadlift_0.jpg", "Romanian_Deadlift_1.jpg", "Seated_Bent-Over_Rear_Delt_Raise_0.jpg", "Seated_Bent-Over_Rear_Delt_Raise_1.jpg", "Seated_Cable_Rows_0.jpg", "Seated_Cable_Rows_1.jpg", "Seated_Triceps_Press_0.jpg", "Seated_Triceps_Press_1.jpg", "Side_Bridge_0.jpg", "Side_Bridge_1.jpg", "Side_Lateral_Raise_0.jpg", "Side_Lateral_Raise_1.jpg", "Smith_Machine_Overhead_Shoulder_Press_0.jpg", "Smith_Machine_Overhead_Shoulder_Press_1.jpg", "Split_Squat_with_Dumbbells_0.jpg", "Split_Squat_with_Dumbbells_1.jpg", "Standing_Dumbbell_Upright_Row_0.jpg", "Standing_Dumbbell_Upright_Row_1.jpg", "Straight-Arm_Dumbbell_Pullover_0.jpg", "Straight-Arm_Dumbbell_Pullover_1.jpg", "Triceps_Pushdown_0.jpg", "Triceps_Pushdown_1.jpg", "Wide-Grip_Lat_Pulldown_0.jpg", "Wide-Grip_Lat_Pulldown_1.jpg"].map(n => "img/" + n);

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await c.addAll(CORE);                       // 앱 껍데기는 반드시 저장
    c.addAll(PHOTOS).catch(() => {});           // 사진은 되는 대로 (실패해도 설치 성공)
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // 웹폰트: 캐시 우선, 없으면 받아서 저장
  if (url.hostname.endsWith("gstatic.com") || url.hostname.endsWith("googleapis.com")) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(V).then(c => c.put(req, copy));
      return res;
    }).catch(() => r)));
    return;
  }

  if (url.origin !== location.origin) return;

  // 문서: 네트워크 우선(갱신 반영), 끊기면 캐시
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(V).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
    return;
  }

  // 나머지(사진·아이콘): 캐시 우선
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(V).then(c => c.put(req, copy));
    return res;
  })));
});

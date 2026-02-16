import allContent from '../data';

// Mulberry32: 균등 분포의 의사 난수 생성기
const mulberry32 = (seed) => {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// 시드 기반 Fisher-Yates 셔플 (편향 없는 무작위 정렬)
const seededShuffle = (arr, seed) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(mulberry32(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 날짜에서 결정론적 시드 생성 (같은 날짜 = 같은 결과)
const getSeedFromDate = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return year * 10000 + month * 100 + day;
};

// 카테고리별 분리
const bibleQuotes = allContent.filter(q => q.category === 'bible');
const otherQuotes = allContent.filter(q => q.category !== 'bible');

// 특정 날짜의 원본 5개 선택 (중복 제거 없는 기본 로직)
const _getRawDailyContent = (date) => {
  const seed = getSeedFromDate(date);
  const bibleCount = mulberry32(seed) > 0.5 ? 3 : 2;
  const otherCount = 5 - bibleCount;

  const shuffledBible = seededShuffle(bibleQuotes, seed);
  const shuffledOther = seededShuffle(otherQuotes, seed + 9999);

  const selected = [
    ...shuffledBible.slice(0, bibleCount),
    ...shuffledOther.slice(0, otherCount),
  ];

  return seededShuffle(selected, seed + 7777);
};

// 과거 N일간 사용된 콘텐츠 ID 집합 생성
const getRecentContentIds = (date, days = 7) => {
  const ids = new Set();
  for (let i = 1; i <= days; i++) {
    const pastDate = new Date(date);
    pastDate.setDate(pastDate.getDate() - i);
    _getRawDailyContent(pastDate).forEach(item => ids.add(item.id));
  }
  return ids;
};

// 7일 중복 제거가 적용된 일일 콘텐츠 선택
export const getDailyContent = (date = new Date()) => {
  const seed = getSeedFromDate(date);
  const recentIds = getRecentContentIds(date, 7);

  const bibleCount = mulberry32(seed) > 0.5 ? 3 : 2;
  const otherCount = 5 - bibleCount;

  // 셔플 후 최근 7일에 나왔던 항목 제외
  const shuffledBible = seededShuffle(bibleQuotes, seed);
  const shuffledOther = seededShuffle(otherQuotes, seed + 9999);

  const freshBible = shuffledBible.filter(q => !recentIds.has(q.id));
  const freshOther = shuffledOther.filter(q => !recentIds.has(q.id));

  // 폴백: 신선한 후보가 부족하면 셔플 순서대로 채움
  const safeBible = freshBible.length >= bibleCount
    ? freshBible
    : [...freshBible, ...shuffledBible.filter(q => recentIds.has(q.id))];
  const safeOther = freshOther.length >= otherCount
    ? freshOther
    : [...freshOther, ...shuffledOther.filter(q => recentIds.has(q.id))];

  const selected = [
    ...safeBible.slice(0, bibleCount),
    ...safeOther.slice(0, otherCount),
  ];

  return seededShuffle(selected, seed + 7777);
};

// "다시 만나는 글귀" — 8~14일 전 콘텐츠 중 오늘 미선택 항목 추천
export const getRevisitContent = (date = new Date(), count = 3) => {
  const seed = getSeedFromDate(date);
  const todayIds = new Set(getDailyContent(date).map(item => item.id));

  // 8~14일 전 콘텐츠 수집 (중복 제거)
  const revisitPool = new Map();
  for (let i = 8; i <= 14; i++) {
    const pastDate = new Date(date);
    pastDate.setDate(pastDate.getDate() - i);
    _getRawDailyContent(pastDate).forEach(item => {
      if (!todayIds.has(item.id) && !revisitPool.has(item.id)) {
        revisitPool.set(item.id, item);
      }
    });
  }

  // 시드 기반 셔플 후 count개 선택 (결정론적)
  const poolArray = Array.from(revisitPool.values());
  return seededShuffle(poolArray, seed + 5555).slice(0, count);
};

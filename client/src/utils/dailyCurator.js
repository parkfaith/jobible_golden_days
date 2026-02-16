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

export const getDailyContent = (date = new Date()) => {
  const seed = getSeedFromDate(date);

  // 성경 2~3개 + 명언/속담 2~3개 = 총 5개
  const bibleCount = mulberry32(seed) > 0.5 ? 3 : 2;
  const otherCount = 5 - bibleCount;

  // 각 카테고리를 시드 기반으로 셔플 후 앞에서 N개 선택
  const shuffledBible = seededShuffle(bibleQuotes, seed);
  const shuffledOther = seededShuffle(otherQuotes, seed + 9999);

  const selected = [
    ...shuffledBible.slice(0, bibleCount),
    ...shuffledOther.slice(0, otherCount),
  ];

  // 최종 5개를 다시 셔플하여 카테고리 순서 섞기
  return seededShuffle(selected, seed + 7777);
};

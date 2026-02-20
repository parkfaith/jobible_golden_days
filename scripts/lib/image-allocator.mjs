/**
 * 배경 이미지를 할당합니다.
 * 1순위: 미사용 이미지 (날씨 전용 bg-75~87 제외)
 * 2순위: 최소 사용 이미지 재사용
 *
 * @param {Array<Array>} allDataFiles - [bible, quotes, poems, writings] 배열
 * @param {number} count - 필요한 이미지 개수
 * @returns {string[]} bgImage 경로 배열 (예: ["/images/bg-29.jpg", ...])
 */
export function allocateImages(allDataFiles, count) {
  // 현재 사용 횟수 집계
  const usageCount = new Map();
  for (const items of allDataFiles) {
    for (const item of items) {
      const path = item.bgImage;
      usageCount.set(path, (usageCount.get(path) || 0) + 1);
    }
  }

  // 전체 이미지 목록 (bg-01 ~ bg-87)
  const allImages = Array.from({ length: 87 }, (_, i) =>
    `/images/bg-${String(i + 1).padStart(2, '0')}.jpg`
  );

  // 날씨 전용 이미지 제외 (bg-75 ~ bg-87)
  const weatherImages = new Set(
    Array.from({ length: 13 }, (_, i) =>
      `/images/bg-${String(75 + i).padStart(2, '0')}.jpg`
    )
  );

  // 깨진 이미지 제외 (29바이트 HTML 파일)
  const brokenImages = new Set([
    '/images/bg-12.jpg',
    '/images/bg-39.jpg',
    '/images/bg-40.jpg',
    '/images/bg-45.jpg',
  ]);

  const availableImages = allImages.filter(
    img => !weatherImages.has(img) && !brokenImages.has(img)
  );

  // 미사용 이미지 우선
  const unused = availableImages.filter(img => !usageCount.has(img));

  if (unused.length >= count) {
    return shuffleArray(unused).slice(0, count);
  }

  // 부족 시 최소 사용 이미지 추가
  const sorted = availableImages.sort(
    (a, b) => (usageCount.get(a) || 0) - (usageCount.get(b) || 0)
  );

  return sorted.slice(0, count);
}

/** 배열 랜덤 셔플 (Fisher-Yates) */
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 배경 이미지를 할당합니다.
 * 1순위: 미사용 이미지 (날씨 전용 bg-75~87 제외)
 * 2순위: 최소 사용 이미지 재사용
 *
 * 이미지 목록은 파일시스템에서 동적으로 스캔하여
 * 새 이미지 추가 시 자동으로 반영됩니다.
 *
 * @param {Array<Array>} allDataFiles - [bible, quotes, poems, writings] 배열
 * @param {number} count - 필요한 이미지 개수
 * @returns {string[]} bgImage 경로 배열 (예: ["/images/bg-29.jpg", ...])
 */

import { readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, '../../client/public/images');

export function allocateImages(allDataFiles, count) {
  // 현재 사용 횟수 집계
  const usageCount = new Map();
  for (const items of allDataFiles) {
    for (const item of items) {
      const path = item.bgImage;
      usageCount.set(path, (usageCount.get(path) || 0) + 1);
    }
  }

  // 파일시스템에서 실제 이미지 목록 동적 스캔
  let imageFiles = [];
  if (existsSync(IMAGES_DIR)) {
    imageFiles = readdirSync(IMAGES_DIR)
      .filter(f => /^bg-\d+\.jpg$/.test(f))
      .map(f => ({
        num: parseInt(f.match(/\d+/)[0]),
        path: `/images/${f}`,
      }))
      .sort((a, b) => a.num - b.num);
  }

  // 폴백: 파일시스템 스캔 실패 시 기존 87장 기준
  if (imageFiles.length === 0) {
    imageFiles = Array.from({ length: 87 }, (_, i) => ({
      num: i + 1,
      path: `/images/bg-${String(i + 1).padStart(2, '0')}.jpg`,
    }));
  }

  // 날씨 전용 이미지 제외 (bg-75~87)
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

  const availableImages = imageFiles
    .map(f => f.path)
    .filter(img => !weatherImages.has(img) && !brokenImages.has(img));

  // 미사용 이미지 우선
  const unused = availableImages.filter(img => !usageCount.has(img));

  if (unused.length >= count) {
    return shuffleArray(unused).slice(0, count);
  }

  // 부족 시 최소 사용 이미지 추가
  const sorted = [...availableImages].sort(
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

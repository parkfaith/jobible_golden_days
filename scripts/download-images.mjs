#!/usr/bin/env node

/**
 * Unsplash 배경 이미지 자동 다운로드 스크립트
 *
 * 매주 Unsplash API로 어르신 선호 화사한 이미지를 다운로드하여
 * client/public/images/ 에 bg-XX.jpg 형식으로 추가합니다.
 * 사진 출처는 credits.json에 기록합니다.
 *
 * 사용법:
 *   UNSPLASH_ACCESS_KEY=xxx node download-images.mjs
 */

import { readdirSync, existsSync } from 'fs';
import { writeFile, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { fetchRandomImages, downloadImageBuffer, triggerDownload } from './lib/unsplash-client.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, '../client/public/images');
const CREDITS_FILE = join(IMAGES_DIR, 'credits.json');
const IMAGES_PER_RUN = 4; // 회당 다운로드 이미지 수

// 어르신 선호 화사한 이미지 검색 쿼리 (주차별 순환)
const IMAGE_QUERIES = [
  'colorful tulip flowers spring',
  'vibrant sunflower field golden',
  'cherry blossom spring beautiful pink',
  'autumn leaves colorful red orange',
  'sunset golden hour beautiful landscape',
  'vibrant roses garden colorful',
  'spring garden flowers colorful bloom',
  'mountain sunrise colorful landscape',
  'wildflowers meadow colorful',
  'peony flowers vibrant pink',
];

async function main() {
  console.log('\n=== Unsplash 배경 이미지 자동 다운로드 시작 ===\n');

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error('오류: UNSPLASH_ACCESS_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  // 1. 현재 이미지 목록 스캔하여 최대 번호 확인
  const existingNums = readdirSync(IMAGES_DIR)
    .filter(f => /^bg-\d+\.jpg$/.test(f))
    .map(f => parseInt(f.match(/\d+/)[0]));

  const maxId = existingNums.length > 0 ? Math.max(...existingNums) : 87;
  console.log(`현재 이미지: ${existingNums.length}장 (최대 번호: bg-${String(maxId).padStart(2, '0')}.jpg)`);

  // 2. 기존 크레딧 로드
  let credits = [];
  if (existsSync(CREDITS_FILE)) {
    try {
      credits = JSON.parse(await readFile(CREDITS_FILE, 'utf-8'));
    } catch {
      credits = [];
    }
  }

  // 3. 이번 실행 쿼리 선택 (주차 기반 순환)
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const query = IMAGE_QUERIES[weekNumber % IMAGE_QUERIES.length];
  console.log(`검색 쿼리: "${query}"\n`);

  // 4. Unsplash API로 이미지 메타데이터 가져오기
  let photos;
  try {
    photos = await fetchRandomImages(accessKey, query, IMAGES_PER_RUN);
    console.log(`API 응답: ${photos.length}개 이미지 수신\n`);
  } catch (error) {
    console.error(`Unsplash API 오류: ${error.message}`);
    process.exit(1);
  }

  // 5. 이미지 다운로드
  let downloadCount = 0;
  let nextId = maxId + 1;

  for (const photo of photos) {
    const filename = `bg-${String(nextId).padStart(2, '0')}.jpg`;
    const filepath = join(IMAGES_DIR, filename);

    try {
      process.stdout.write(`다운로드: ${filename} (Photo by ${photo.user.name}) ... `);

      const buffer = await downloadImageBuffer(photo.urls.regular);
      await writeFile(filepath, buffer);

      // Unsplash ToS: 다운로드 이벤트 트리거
      await triggerDownload(accessKey, photo.id);

      // 크레딧 기록
      credits.push({
        filename,
        unsplashId: photo.id,
        photographer: photo.user.name,
        photographerUrl: `${photo.user.links.html}?utm_source=golden_days&utm_medium=referral`,
        unsplashUrl: `${photo.links.html}?utm_source=golden_days&utm_medium=referral`,
        downloadedAt: new Date().toISOString(),
        query,
      });

      downloadCount++;
      nextId++;
      console.log('완료');
    } catch (error) {
      console.log(`실패 (${error.message})`);
    }
  }

  // 6. 크레딧 파일 저장
  await writeFile(CREDITS_FILE, JSON.stringify(credits, null, 2), 'utf-8');

  // 7. 결과 요약
  console.log('\n=== 완료 ===');
  console.log(`${downloadCount}개 이미지 추가 (bg-${String(maxId + 1).padStart(2, '0')} ~ bg-${String(maxId + downloadCount).padStart(2, '0')}.jpg)`);
  console.log(`총 이미지: ${existingNums.length + downloadCount}장\n`);

  if (downloadCount === 0) {
    console.error('다운로드된 이미지가 없습니다.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('치명적 오류:', err);
  process.exit(1);
});

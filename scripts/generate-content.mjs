#!/usr/bin/env node

/**
 * 주간 자동 콘텐츠 생성 스크립트
 *
 * 매주 4개 카테고리(bible, quote, poem, writing)에 2개씩 총 8개의
 * 새 콘텐츠를 OpenAI API로 생성하고 JSON 파일에 추가합니다.
 *
 * 사용법:
 *   node generate-content.mjs                          # 실제 실행
 *   DRY_RUN=true node generate-content.mjs             # 더미 데이터로 테스트
 *   OPENAI_API_KEY=sk-... node generate-content.mjs    # API 키 지정
 */

import { readJSON, writeJSON } from './lib/json-updater.mjs';
import { generateContent, getDummyContent } from './lib/openai-client.mjs';
import { BIBLE_PROMPT, QUOTE_PROMPT, POEM_PROMPT, WRITING_PROMPT } from './lib/prompts.mjs';
import { getNextIds } from './lib/id-manager.mjs';
import { allocateImages } from './lib/image-allocator.mjs';
import { validateItems, checkDuplicates } from './lib/validator.mjs';

const DRY_RUN = process.env.DRY_RUN === 'true';

async function main() {
  console.log(`\n=== 주간 콘텐츠 자동 생성 시작 ${DRY_RUN ? '(DRY_RUN 모드)' : ''} ===\n`);

  // API 키 확인 (DRY_RUN 아닌 경우)
  if (!DRY_RUN && !process.env.OPENAI_API_KEY) {
    console.error('오류: OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  // 1. 기존 데이터 로드
  console.log('1. 기존 데이터 로드...');
  const bible = await readJSON('bible.json');
  const quotes = await readJSON('quotes.json');
  const poems = await readJSON('poems.json');
  const writings = await readJSON('writings.json');

  console.log(`   bible: ${bible.length}개, quotes: ${quotes.length}개, poems: ${poems.length}개, writings: ${writings.length}개`);
  console.log(`   총 ${bible.length + quotes.length + poems.length + writings.length}개 기존 콘텐츠\n`);

  // 2. ID + 이미지 할당 준비
  const allData = [bible, quotes, poems, writings];
  const nextIds = getNextIds(allData, 8);
  const images = allocateImages(allData, 8);

  console.log(`2. ID 할당: ${nextIds[0]}~${nextIds[nextIds.length - 1]}`);
  console.log(`   이미지 할당: ${images.join(', ')}\n`);

  // 3. 카테고리별 생성
  const categories = [
    { name: 'bible', file: 'bible.json', prompt: BIBLE_PROMPT, data: bible, extra: null },
    { name: 'quote', file: 'quotes.json', prompt: QUOTE_PROMPT, data: quotes, extra: null },
    { name: 'poem', file: 'poems.json', prompt: POEM_PROMPT, data: poems, extra: null },
    { name: 'writing', file: 'writings.json', prompt: WRITING_PROMPT, data: writings, extra: bible },
  ];

  let idIndex = 0;
  let totalAdded = 0;
  const allExisting = [...bible, ...quotes, ...poems, ...writings];

  for (const cat of categories) {
    console.log(`3-${categories.indexOf(cat) + 1}. [${cat.name}] 콘텐츠 생성 중...`);

    try {
      // OpenAI API 호출 또는 더미 데이터
      let generated;
      if (DRY_RUN) {
        generated = getDummyContent(cat.name);
        console.log(`   DRY_RUN: 더미 데이터 ${generated.length}개`);
      } else {
        generated = await generateContent(cat.prompt, cat.data, cat.extra);
        console.log(`   API 응답: ${generated.length}개 생성`);
      }

      // 스키마 검증
      const validated = validateItems(generated, cat.name);
      console.log(`   검증 통과: ${validated.length}개`);

      if (validated.length === 0) {
        console.warn(`   경고: 유효한 항목 없음, 건너뜀\n`);
        continue;
      }

      // 중복 검사
      const unique = checkDuplicates(validated, allExisting);
      console.log(`   중복 제거 후: ${unique.length}개`);

      if (unique.length === 0) {
        console.warn(`   경고: 모두 중복, 건너뜀\n`);
        continue;
      }

      // ID + 이미지 할당
      const enriched = unique.slice(0, 2).map(item => ({
        ...item,
        id: nextIds[idIndex],
        bgImage: images[idIndex++],
      }));

      // JSON 파일 업데이트
      const updated = [...cat.data, ...enriched];
      await writeJSON(cat.file, updated);

      // allExisting에도 추가 (이후 카테고리 중복 검사에 반영)
      allExisting.push(...enriched);

      totalAdded += enriched.length;
      console.log(`   ${enriched.length}개 추가 완료 (ID: ${enriched.map(e => e.id).join(', ')})\n`);

    } catch (error) {
      console.error(`   오류: ${error.message}`);
      console.warn(`   [${cat.name}] 건너뜀\n`);
    }
  }

  // 4. 결과 요약
  console.log('=== 완료 ===');
  console.log(`총 ${totalAdded}개 콘텐츠 추가됨`);
  console.log(`새 총 콘텐츠 수: ${bible.length + quotes.length + poems.length + writings.length + totalAdded}개\n`);

  if (totalAdded === 0) {
    console.log('추가된 콘텐츠가 없으므로 커밋 불필요');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('치명적 오류:', err);
  process.exit(1);
});

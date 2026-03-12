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
import { BIBLE_PROMPT, QUOTE_PROMPT, POEM_PROMPT, WRITING_PROMPT, WEATHER_PROMPT } from './lib/prompts.mjs';
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
        id: nextIds[idIndex],
        quote: item.quote,
        author: item.author,
        source: item.source,
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

  // 4. 날씨 콘텐츠 생성 (4가지 날씨 타입 중 1개를 순환)
  console.log('4. 날씨 콘텐츠 생성...');
  const weather = await readJSON('weather.json');
  console.log(`   weather: ${weather.length}개 기존 콘텐츠`);

  // 주차 번호로 날씨 타입 순환 (sunny → cloudy → rain → snow)
  const weatherTypes = ['sunny', 'cloudy', 'rain', 'snow'];
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const targetWeather = weatherTypes[weekNumber % 4];
  console.log(`   이번 주 날씨 타입: ${targetWeather}`);

  const weatherOfType = weather.filter(w => w.weather === targetWeather);

  // 날씨 전용 이미지 할당 (bg-75~87)
  const weatherImageMap = { rain: [75,76,77], snow: [78,79,80], cloudy: [81,82,83], sunny: [84,85,86,87] };
  const weatherImages = weatherImageMap[targetWeather].map(n => `/images/bg-${String(n).padStart(2, '0')}.jpg`);
  const usedWeatherImages = new Set(weatherOfType.map(w => w.bgImage));
  const availWeatherImages = weatherImages.filter(img => !usedWeatherImages.has(img));
  // 부족 시 최소 사용 이미지 재사용
  const weatherImgPool = availWeatherImages.length >= 2
    ? availWeatherImages
    : [...availWeatherImages, ...weatherImages.filter(img => usedWeatherImages.has(img))];

  // 다음 날씨 ID 계산 (w-sunny-XX 형식)
  const weatherIdNums = weatherOfType
    .map(w => parseInt(w.id.split('-').pop()))
    .filter(n => !isNaN(n));
  const nextWeatherNum = weatherIdNums.length > 0 ? Math.max(...weatherIdNums) + 1 : 1;

  try {
    let generated;
    if (DRY_RUN) {
      generated = [
        { quote: `[테스트] ${targetWeather} 날씨 구절 1`, author: '시편 1:1', source: '성경 개역한글', weather: targetWeather, explanation: '테스트 설명' },
        { quote: `[테스트] ${targetWeather} 날씨 구절 2`, author: '시편 2:1', source: '성경 개역한글', weather: targetWeather, explanation: '테스트 설명' },
      ];
      console.log(`   DRY_RUN: 더미 데이터 ${generated.length}개`);
    } else {
      // 날씨 프롬프트는 user(existing, weatherType) 형태로 호출
      const userMessage = WEATHER_PROMPT.user(weatherOfType, targetWeather);
      const response = await (await import('./lib/openai-client.mjs')).generateContent(
        { system: WEATHER_PROMPT.system, user: () => userMessage },
        weatherOfType
      );
      generated = response;
      console.log(`   API 응답: ${generated.length}개 생성`);
    }

    // 검증 (weather 카테고리는 bible 형식과 유사)
    const validated = generated.filter(item =>
      item.quote && item.quote.length >= 5 &&
      item.author && /^.+\s\d+:\d+/.test(item.author) &&
      item.source && item.weather === targetWeather && item.explanation
    );
    console.log(`   검증 통과: ${validated.length}개`);

    // 중복 검사
    const unique = checkDuplicates(validated, weather);
    console.log(`   중복 제거 후: ${unique.length}개`);

    if (unique.length > 0) {
      const enriched = unique.slice(0, 2).map((item, i) => ({
        id: `w-${targetWeather}-${String(nextWeatherNum + i).padStart(2, '0')}`,
        quote: item.quote,
        author: item.author,
        source: item.source,
        bgImage: weatherImgPool[i % weatherImgPool.length],
        weather: targetWeather,
        explanation: item.explanation,
      }));

      const updatedWeather = [...weather, ...enriched];
      await writeJSON('weather.json', updatedWeather);

      totalAdded += enriched.length;
      console.log(`   ${enriched.length}개 추가 완료 (ID: ${enriched.map(e => e.id).join(', ')})\n`);
    } else {
      console.log(`   추가할 항목 없음\n`);
    }
  } catch (error) {
    console.error(`   오류: ${error.message}`);
    console.warn(`   [weather] 건너뜀\n`);
  }

  // 5. 결과 요약
  console.log('=== 완료 ===');
  console.log(`총 ${totalAdded}개 콘텐츠 추가됨\n`);

  if (totalAdded === 0) {
    console.log('추가된 콘텐츠가 없으므로 커밋 불필요');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('치명적 오류:', err);
  process.exit(1);
});

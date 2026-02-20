/**
 * 생성된 콘텐츠의 스키마를 검증합니다.
 *
 * @param {Array} items - OpenAI가 생성한 항목 배열
 * @param {string} category - 카테고리 (bible, quote, poem, writing)
 * @returns {Array} 유효한 항목만 반환
 */
export function validateItems(items, category) {
  if (!Array.isArray(items)) return [];

  return items.filter(item => {
    // 필수 필드 검사
    if (!item.quote || typeof item.quote !== 'string' || item.quote.length < 5) {
      console.warn(`[${category}] 검증 실패 - quote 누락/짧음:`, item);
      return false;
    }
    if (!item.author || typeof item.author !== 'string') {
      console.warn(`[${category}] 검증 실패 - author 누락:`, item);
      return false;
    }
    if (!item.source || typeof item.source !== 'string') {
      console.warn(`[${category}] 검증 실패 - source 누락:`, item);
      return false;
    }

    // 카테고리별 형식 검증
    if (category === 'bible' || category === 'writing') {
      // author가 "권명 장:절" 형식인지
      if (!/^.+\s\d+:\d+/.test(item.author)) {
        console.warn(`[${category}] 검증 실패 - author 형식:`, item.author);
        return false;
      }
    }

    if (category === 'quote') {
      // source에 연도 정보 포함 확인
      if (!/\d{3,4}/.test(item.source)) {
        console.warn(`[${category}] 검증 실패 - source에 연도 없음:`, item.source);
        return false;
      }
    }

    return true;
  });
}

/**
 * 기존 콘텐츠와 중복 여부를 검사합니다.
 *
 * @param {Array} newItems - 새로 생성된 항목
 * @param {Array} existingItems - 기존 전체 콘텐츠
 * @returns {Array} 중복이 아닌 항목만 반환
 */
export function checkDuplicates(newItems, existingItems) {
  const existingQuotes = existingItems.map(item => item.quote.trim());
  const existingAuthors = existingItems.map(item => item.author.trim());

  return newItems.filter(item => {
    const newQuote = item.quote.trim();
    const newAuthor = item.author.trim();

    // 1. 텍스트 완전 일치
    if (existingQuotes.includes(newQuote)) {
      console.warn(`[중복] 텍스트 완전 일치:`, newQuote.slice(0, 30));
      return false;
    }

    // 2. 부분 포함 검사 (기존 구절이 새 구절에 포함되거나 반대)
    for (const eq of existingQuotes) {
      if (newQuote.length > 10 && eq.length > 10) {
        if (newQuote.includes(eq) || eq.includes(newQuote)) {
          console.warn(`[중복] 부분 포함:`, newQuote.slice(0, 30));
          return false;
        }
      }
    }

    // 3. 동일 author(같은 장절) 검사 — 성경 구절일 때
    if (/\d+:\d+/.test(newAuthor) && existingAuthors.includes(newAuthor)) {
      console.warn(`[중복] 동일 장절:`, newAuthor);
      return false;
    }

    return true;
  });
}

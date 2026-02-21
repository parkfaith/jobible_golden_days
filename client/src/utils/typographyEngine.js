/**
 * 타이포그래피 결정 엔진
 * 카테고리/텍스트 길이 기반으로 폰트 크기, 정렬, 핵심어 하이라이트를 자동 결정
 * QuoteCard(React)와 captureCard(Canvas)에서 공유
 */

// 포인트 색상 — 어두운 배경 위 가독성 확보
export const HIGHLIGHT_COLOR = '#F5D78E';

// 카테고리별 기본 규칙
const CATEGORY_DEFAULTS = {
  bible:    { align: 'left',   maxSize: 40, minSize: 28 },
  quote:    { align: 'center', maxSize: 42, minSize: 32 },
  poem:     { align: 'center', maxSize: 38, minSize: 30 },
  writing:  { align: 'left',   maxSize: 40, minSize: 28 },
  weather:  { align: 'center', maxSize: 38, minSize: 30 },
  seasonal: { align: 'center', maxSize: 38, minSize: 30 },
};

// 하이라이트 핵심어 사전
const FAITH_KEYWORDS = [
  '여호와', '하나님', '예수', '그리스도', '주님', '주께서',
  '성령', '은혜', '사랑', '평강', '구원', '영생', '믿음',
  '소망', '감사', '찬송', '복', '빛', '생명', '천국',
];

const VIRTUE_KEYWORDS = [
  '믿음', '사랑', '기도', '감사', '은혜', '겸손',
  '소망', '평화', '자비', '용서', '인내', '십자가',
];

// 하이라이트 최대 개수 (과도한 강조 방지)
const MAX_HIGHLIGHTS = 3;

/**
 * 텍스트 길이 → px 단위 폰트 크기 계산 (선형 보간)
 */
function computeFontSize(textLength, category) {
  const defaults = CATEGORY_DEFAULTS[category] || CATEGORY_DEFAULTS.quote;
  const { maxSize, minSize } = defaults;

  const SHORT = 20;
  const LONG = 90;

  if (textLength <= SHORT) return maxSize;
  if (textLength >= LONG) return minSize;

  const ratio = (textLength - SHORT) / (LONG - SHORT);
  return Math.round(maxSize - ratio * (maxSize - minSize));
}

/**
 * 텍스트를 세그먼트로 파싱 (하이라이트 단어 분리)
 * @returns {Array<{text: string, highlight: boolean}>}
 */
function parseHighlights(quote, category) {
  // poem은 하이라이트 없음 (찬송가 리듬 유지)
  if (category === 'poem') {
    return [{ text: quote, highlight: false }];
  }

  const keywords = category === 'quote' ? VIRTUE_KEYWORDS : FAITH_KEYWORDS;

  // 최장 일치 우선 정렬
  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sorted.join('|')})`, 'g');

  const segments = [];
  let lastIndex = 0;
  let highlightCount = 0;
  let match;

  while ((match = pattern.exec(quote)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: quote.slice(lastIndex, match.index), highlight: false });
    }

    // 최대 3개까지만 하이라이트
    if (highlightCount < MAX_HIGHLIGHTS) {
      segments.push({ text: match[0], highlight: true });
      highlightCount++;
    } else {
      segments.push({ text: match[0], highlight: false });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < quote.length) {
    segments.push({ text: quote.slice(lastIndex), highlight: false });
  }

  return segments.length > 0 ? segments : [{ text: quote, highlight: false }];
}

/**
 * 메인 진입점 — content 객체 → 렌더링 스타일 결정
 * @param {Object} content - { category, quote, author, style? }
 * @returns {Object} 스타일 결정 결과
 */
export function resolveTypography(content) {
  const defaults = CATEGORY_DEFAULTS[content.category] || CATEGORY_DEFAULTS.quote;
  const overrides = content.style || {};

  const quoteFontSizePx = overrides.fontSize || computeFontSize(content.quote.length, content.category);
  const authorFontSizePx = Math.round(quoteFontSizePx * 0.6);
  const segments = parseHighlights(content.quote, content.category);

  return {
    align: overrides.align || defaults.align,
    quoteFontSizePx,
    authorFontSizePx,
    segments,
  };
}

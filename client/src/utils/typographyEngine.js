/**
 * 타이포그래피 결정 엔진
 * 카테고리/텍스트 길이 기반으로 폰트 크기, 정렬, 핵심어 하이라이트,
 * 카테고리별 색상 테마, 글로우 효과를 자동 결정
 * QuoteCard(React)와 captureCard(Canvas)에서 공유
 */

// 하위 호환용 기본 하이라이트 색상
export const HIGHLIGHT_COLOR = '#FFD700';

// 카테고리별 전체 스타일 시스템
const CATEGORY_STYLES = {
  bible: {
    align: 'left',
    maxSize: 40,
    minSize: 28,
    highlightColor: '#FFD700',        // Pure Gold — 경건하고 장엄한
    highlightScale: 1.0,
    highlightWeight: 800,
    overlayColor: 'rgba(10, 10, 30, 0.38)',
    accentColor: 'rgba(255, 215, 0, 0.25)',
    badgeBg: 'rgba(255, 215, 0, 0.20)',
    badgeText: '#FFD700',
    textShadow: { blur: 16, color: 'rgba(0,0,0,0.8)' },
    highlightGlow: { blur: 18, color: 'rgba(255,215,0,0.7)' },
    underlineHighlight: true,
  },
  quote: {
    align: 'center',
    maxSize: 42,
    minSize: 32,
    highlightColor: '#FF8C42',        // Warm Orange — 현대적이고 강렬한
    highlightScale: 1.0,
    highlightWeight: 800,
    overlayColor: 'rgba(20, 15, 10, 0.35)',
    accentColor: 'rgba(255, 140, 66, 0.25)',
    badgeBg: 'rgba(255, 140, 66, 0.20)',
    badgeText: '#FF8C42',
    textShadow: { blur: 16, color: 'rgba(0,0,0,0.8)' },
    highlightGlow: { blur: 16, color: 'rgba(255,140,66,0.7)' },
    underlineHighlight: true,
  },
  poem: {
    align: 'center',
    maxSize: 38,
    minSize: 30,
    highlightColor: null,             // 하이라이트 없음 (찬송가 리듬 유지)
    highlightScale: 1.0,
    highlightWeight: 700,
    overlayColor: 'rgba(15, 10, 25, 0.35)',
    accentColor: 'rgba(200, 180, 220, 0.25)',
    badgeBg: 'rgba(200, 180, 220, 0.20)',
    badgeText: '#C8B4DC',
    textShadow: { blur: 12, color: 'rgba(0,0,0,0.65)' },
    highlightGlow: null,
    underlineHighlight: false,
  },
  writing: {
    align: 'left',
    maxSize: 40,
    minSize: 28,
    highlightColor: '#87CEEB',        // Sky Blue — 담백하고 따뜻한
    highlightScale: 1.0,
    highlightWeight: 700,
    overlayColor: 'rgba(10, 15, 20, 0.35)',
    accentColor: 'rgba(135, 206, 235, 0.25)',
    badgeBg: 'rgba(135, 206, 235, 0.20)',
    badgeText: '#87CEEB',
    textShadow: { blur: 12, color: 'rgba(0,0,0,0.65)' },
    highlightGlow: { blur: 10, color: 'rgba(135,206,235,0.5)' },
    underlineHighlight: true,
  },
  weather: {
    align: 'center',
    maxSize: 38,
    minSize: 30,
    highlightColor: '#98FB98',        // Pale Green — 자연스럽고 생기 있는
    highlightScale: 1.0,
    highlightWeight: 700,
    overlayColor: 'rgba(10, 20, 10, 0.35)',
    accentColor: 'rgba(152, 251, 152, 0.25)',
    badgeBg: 'rgba(152, 251, 152, 0.20)',
    badgeText: '#98FB98',
    textShadow: { blur: 12, color: 'rgba(0,0,0,0.65)' },
    highlightGlow: { blur: 10, color: 'rgba(152,251,152,0.5)' },
    underlineHighlight: true,
  },
  seasonal: {
    align: 'center',
    maxSize: 38,
    minSize: 30,
    highlightColor: '#FF6B6B',        // Coral Red — 축제적이고 따뜻한
    highlightScale: 1.0,
    highlightWeight: 800,
    overlayColor: 'rgba(25, 10, 10, 0.35)',
    accentColor: 'rgba(255, 107, 107, 0.25)',
    badgeBg: 'rgba(255, 107, 107, 0.20)',
    badgeText: '#FF6B6B',
    textShadow: { blur: 16, color: 'rgba(0,0,0,0.8)' },
    highlightGlow: { blur: 18, color: 'rgba(255,107,107,0.7)' },
    underlineHighlight: true,
  },
};

// 하이라이트 핵심어 사전
const FAITH_KEYWORDS = [
  '여호와', '하나님', '예수', '그리스도', '주님', '주께서',
  '성령', '은혜', '사랑', '평강', '구원', '영생', '믿음',
  '소망', '감사', '찬송', '복', '빛', '생명', '천국',
  '말씀', '기쁨', '영광', '인자', '능력', '선하', '영원',
  '찬양', '언약', '진리', '의로',
];

const VIRTUE_KEYWORDS = [
  '믿음', '사랑', '기도', '감사', '은혜', '겸손',
  '소망', '평화', '자비', '용서', '인내', '십자가',
  '영혼', '영광', '기쁨', '말씀', '찬양', '진리',
];

// 하이라이트 최대 개수 (과도한 강조 방지)
const MAX_HIGHLIGHTS = 3;

/**
 * 텍스트 길이 → px 단위 폰트 크기 계산 (선형 보간)
 */
function computeFontSize(textLength, category) {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.quote;
  const { maxSize, minSize } = style;

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
 * @returns {Object} 스타일 결정 결과 (align, 폰트 크기, segments, style 테마)
 */
export function resolveTypography(content) {
  const catStyle = CATEGORY_STYLES[content.category] || CATEGORY_STYLES.quote;
  const overrides = content.style || {};

  const quoteFontSizePx = overrides.fontSize || computeFontSize(content.quote.length, content.category);
  const authorFontSizePx = Math.round(quoteFontSizePx * 0.6);
  const segments = parseHighlights(content.quote, content.category);

  return {
    align: overrides.align || catStyle.align,
    quoteFontSizePx,
    authorFontSizePx,
    segments,
    // 카테고리별 시각 테마
    style: {
      highlightColor: catStyle.highlightColor,
      highlightScale: catStyle.highlightScale,
      highlightWeight: catStyle.highlightWeight,
      overlayColor: catStyle.overlayColor,
      accentColor: catStyle.accentColor,
      badgeBg: catStyle.badgeBg,
      badgeText: catStyle.badgeText,
      textShadow: catStyle.textShadow,
      highlightGlow: catStyle.highlightGlow,
      underlineHighlight: catStyle.underlineHighlight,
    },
  };
}

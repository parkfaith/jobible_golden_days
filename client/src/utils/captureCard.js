import { resolveTypography } from './typographyEngine';

/**
 * Canvas API로 카드 이미지를 직접 그려서 Blob 생성
 * html-to-image/html2canvas 없이 동작 — iOS Safari/Chrome 완벽 호환
 *
 * @param {Object} params
 * @param {string} params.bgImage - 배경 이미지 경로
 * @param {string} params.quote - 본문 텍스트
 * @param {string} params.author - 저자
 * @param {string} params.category - 카테고리 (bible, quote, poem, writing 등)
 * @param {Object} [params.typography] - typographyEngine 결과 (없으면 내부 계산)
 * @returns {Promise<Blob>} JPEG Blob
 */
export const renderCardToBlob = async ({ bgImage, quote, author, category, typography }) => {
  // 모바일 화면 비율과 동일한 줄바꿈을 유도하기 위해 고해상도(1080x1920) 사용
  const W = 1080;
  const H = 1920;
  // 사용자 화면 너비를 가져와 실제 화면 UI와 100% 동일한 줄바꿈 비율 강제 계산
  const vw = typeof window !== 'undefined' ? window.innerWidth : 390;
  const SCALE = W / vw;

  // 타이포그래피 결정 (외부 전달 또는 자체 계산)
  const typo = typography || resolveTypography({ category, quote, author });

  // 1. 배경 이미지 로드
  const img = await loadImage(bgImage);

  // 2. Canvas 생성 및 그리기
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 배경 이미지 (cover 방식)
  drawImageCover(ctx, img, W, H);

  // 카테고리별 색조 오버레이
  ctx.fillStyle = typo.style.overlayColor;
  ctx.fillRect(0, 0, W, H);

  // 카테고리별 폰트 결정
  const isSerif = category === 'bible' || category === 'poem' || category === 'weather' || category === 'seasonal';
  // 폰트 이름을 쌍따옴표로 정확히 묶어 캔버스 로드 실패 방지
  const quoteFont = isSerif ? '"Nanum Myeongjo", serif' : '"Pretendard Variable", sans-serif';

  // 폰트 크기
  const quoteFontSize = typo.quoteFontSizePx * SCALE;
  const authorFontSize = typo.authorFontSizePx * SCALE;
  const highlightFontSize = quoteFontSize * typo.style.highlightScale;

  // 화면 UI의 max-w-2xl (672px) 제한과 좌우 p-8(32px*2=64px) 패딩을 고려한 정확한 렌더링 구역
  const align = typo.align;
  const actualContainerWidth = Math.min(vw - 64, 672);
  const maxWidth = actualContainerWidth * SCALE;
  const PAD = (W - maxWidth) / 2; // 남은 공간을 좌우로 분배
  const textX = align === 'left' ? PAD : align === 'right' ? W - PAD : W / 2;

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${quoteFontSize}px ${quoteFont}`;

  const wrappedQuote = `\u201C${quote}\u201D`;
  const lines = wrapText(ctx, wrappedQuote, maxWidth);
  const lineHeight = quoteFontSize * 1.65; // leading-relaxed (1.625)에 유사하게 맞춤

  const totalTextHeight = lines.length * lineHeight + authorFontSize + 80;
  const startY = (H - totalTextHeight) / 2; // middle baseline 원상복구

  // 장식용 큰 따옴표 (배경)
  ctx.save();
  ctx.fillStyle = typo.style.accentColor;
  ctx.font = 'bold 200px serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const quoteMarkX = align === 'center' ? W * 0.06 : PAD - 30;
  const quoteMarkY = startY - 60;
  ctx.fillText('\u201C', quoteMarkX, quoteMarkY);
  ctx.restore();

  // 텍스트 그림자 (카테고리별)
  ctx.shadowColor = typo.style.textShadow.color;
  ctx.shadowBlur = typo.style.textShadow.blur * SCALE;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3;

  // 본문 그리기 (하이라이트 포함)
  drawHighlightedLines(ctx, lines, typo.segments, {
    x: textX,
    startY,
    lineHeight,
    fontSize: quoteFontSize,
    highlightFontSize,
    font: quoteFont,
    align,
    maxWidth,
    highlightStyle: typo.style,
    scale: SCALE,
  });

  // 저자
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.font = `500 ${authorFontSize}px "Pretendard Variable", sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.textAlign = align;
  const authorY = startY + lines.length * lineHeight + 80;
  ctx.fillText(`- ${author}`, textX, authorY);

  // 워터마크 (항상 중앙 하단)
  ctx.textAlign = 'center';
  ctx.font = `400 ${14 * SCALE}px "Pretendard Variable", sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.letterSpacing = `${2 * SCALE}px`;
  ctx.fillText('joBiBle Golden Days', W / 2, H - (30 * SCALE));

  // 3. Canvas → Blob (JPEG 80% 품질로 용량 절감)
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.8);
  });
};

/**
 * 하이라이트가 적용된 텍스트를 Canvas 줄 단위로 그리기
 * 전략: 기본 흰색 전체 그리기 → 하이라이트 키워드를 색상+글로우+밑줄로 덮어 그리기
 */
function drawHighlightedLines(ctx, lines, segments, opts) {
  const { x, startY, lineHeight, fontSize, highlightFontSize, font, align, highlightStyle, scale } = opts;

  // 하이라이트할 키워드 목록 추출
  const keywords = segments.filter(s => s.highlight).map(s => s.text);

  lines.forEach((line, i) => {
    const lineY = startY + i * lineHeight + lineHeight / 2;

    // 1단계: 기본 흰색으로 전체 줄 그리기
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px ${font}`;
    ctx.textAlign = align;
    ctx.fillText(line, x, lineY);

    // 2단계: 하이라이트 키워드를 강렬하게 덮어 그리기
    if (keywords.length === 0 || !highlightStyle.highlightColor) return;

    // 줄 전체 너비와 시작 x좌표 계산
    const lineWidth = ctx.measureText(line).width;
    let lineStartX;
    if (align === 'center') lineStartX = x - lineWidth / 2;
    else if (align === 'right') lineStartX = x - lineWidth;
    else lineStartX = x;

    for (const keyword of keywords) {
      let searchFrom = 0;
      let idx;
      while ((idx = line.indexOf(keyword, searchFrom)) !== -1) {
        const beforeText = line.substring(0, idx);
        const beforeWidth = ctx.measureText(beforeText).width;
        const kwX = lineStartX + beforeWidth;

        // 글로우 효과 (하이라이트 전용)
        if (highlightStyle.highlightGlow) {
          ctx.save();
          ctx.shadowColor = highlightStyle.highlightGlow.color;
          ctx.shadowBlur = highlightStyle.highlightGlow.blur * scale;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        // 하이라이트 텍스트 덮어 그리기 (ExtraBold + 큰 크기 + 카테고리 색상)
        ctx.fillStyle = highlightStyle.highlightColor;
        ctx.font = `${highlightStyle.highlightWeight} ${highlightFontSize}px ${font}`;
        ctx.textAlign = 'left';
        ctx.fillText(keyword, kwX, lineY);

        if (highlightStyle.highlightGlow) {
          ctx.restore();
        }

        // 밑줄 장식 (웹 화면의 Tailwind border-b-2 와 유사한 간격)
        if (highlightStyle.underlineHighlight) {
          ctx.save();
          const kwWidth = ctx.measureText(keyword).width;
          ctx.fillStyle = highlightStyle.highlightColor;
          ctx.globalAlpha = 0.4;
          // middle 베이스라인에서 하단으로 살짝 내려서 밑줄 렌더링
          ctx.fillRect(kwX, lineY + highlightFontSize * 0.45, kwWidth, 1.5 * scale);
          ctx.restore();
        }

        // 복원
        ctx.font = `bold ${fontSize}px ${font}`;
        ctx.textAlign = align;
        ctx.fillStyle = '#ffffff';

        searchFrom = idx + keyword.length;
      }
    }
  });
}

/** 이미지 로드 헬퍼 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Canvas에 이미지를 object-fit: cover 방식으로 그리기 */
function drawImageCover(ctx, img, canvasW, canvasH) {
  const imgRatio = img.width / img.height;
  const canvasRatio = canvasW / canvasH;
  let sx, sy, sw, sh;

  if (imgRatio > canvasRatio) {
    sh = img.height;
    sw = img.height * canvasRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = img.width / canvasRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
}

/** 텍스트 줄바꿈 처리 — 단어(띄어쓰기) 단위로 줄바꿈, 단어 중간 잘림 방지 */
function wrapText(ctx, text, maxWidth) {
  const lines = [];
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        // 단어 자체가 maxWidth보다 긴 경우 글자 단위 폴백
        if (ctx.measureText(word).width > maxWidth) {
          let partial = '';
          for (const char of word) {
            if (ctx.measureText(partial + char).width > maxWidth && partial) {
              lines.push(partial);
              partial = char;
            } else {
              partial += char;
            }
          }
          currentLine = partial;
        } else {
          currentLine = word;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}

/**
 * Blob을 File 객체로 변환 (Web Share API용)
 */
export const blobToFile = (blob, filename = 'golden-days.jpg') => {
  return new File([blob], filename, { type: 'image/jpeg' });
};

/**
 * Blob을 이미지 파일로 다운로드 (폴백용)
 */
export const downloadBlob = (blob, filename = 'golden-days.jpg') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

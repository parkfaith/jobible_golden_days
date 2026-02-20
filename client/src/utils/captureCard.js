/**
 * Canvas API로 카드 이미지를 직접 그려서 Blob 생성
 * html-to-image/html2canvas 없이 동작 — iOS Safari/Chrome 완벽 호환
 *
 * @param {Object} params
 * @param {string} params.bgImage - 배경 이미지 경로
 * @param {string} params.quote - 본문 텍스트
 * @param {string} params.author - 저자
 * @param {string} params.category - 카테고리 (bible, quote, proverb, poem, writing)
 * @returns {Promise<Blob>} JPEG Blob
 */
export const renderCardToBlob = async ({ bgImage, quote, author, category }) => {
  const W = 720;
  const H = 1280;

  // 1. 배경 이미지 로드
  const img = await loadImage(bgImage);

  // 2. Canvas 생성 및 그리기
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 배경 이미지 (cover 방식)
  drawImageCover(ctx, img, W, H);

  // 어두운 오버레이
  ctx.fillStyle = 'rgba(0, 0, 0, 0.50)';
  ctx.fillRect(0, 0, W, H);

  // 카테고리별 폰트 결정
  const isSerif = category === 'bible' || category === 'poem' || category === 'weather' || category === 'seasonal';
  const quoteFont = isSerif ? 'Nanum Myeongjo' : 'Pretendard Variable, sans-serif';

  // 본문 텍스트 (화면 36px × 2배 = 72px)
  const quoteFontSize = 72;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${quoteFontSize}px ${quoteFont}`;

  const wrappedQuote = `\u201C${quote}\u201D`;
  const lines = wrapText(ctx, wrappedQuote, W - 200);
  const lineHeight = quoteFontSize * 1.5;

  const totalTextHeight = lines.length * lineHeight + 120; // 저자 영역 120px 포함
  const startY = (H - totalTextHeight) / 2;

  // 텍스트 그림자
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 3;

  // 본문 그리기
  ctx.font = `bold ${quoteFontSize}px ${quoteFont}`;
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, startY + i * lineHeight + lineHeight / 2);
  });

  // 저자 (화면 24px × 2배 = 48px)
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.font = `500 48px Pretendard Variable, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  const authorY = startY + lines.length * lineHeight + 80;
  ctx.fillText(`- ${author}`, W / 2, authorY);

  // 워터마크
  ctx.font = `400 16px Pretendard Variable, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.letterSpacing = '4px';
  ctx.fillText('joBiBle Golden Days', W / 2, H - 60);

  // 3. Canvas → Blob (JPEG 80% 품질로 용량 절감)
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.8);
  });
};

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

/** 텍스트 줄바꿈 처리 */
function wrapText(ctx, text, maxWidth) {
  const lines = [];
  // 먼저 명시적 줄바꿈(\n) 기준으로 분리
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    const words = paragraph.split('');
    let currentLine = '';

    for (const char of words) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
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

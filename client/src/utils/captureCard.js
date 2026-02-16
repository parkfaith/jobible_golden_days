import { toPng } from 'html-to-image';

/**
 * DOM 요소를 PNG Blob으로 캡처
 * iOS Safari에서는 첫 호출 시 이미지가 누락되는 문제가 있어 최대 3회 재시도
 * @param {HTMLElement} element - 캡처 대상 DOM 요소
 * @returns {Promise<Blob>} PNG Blob
 */
export const captureElementToBlob = async (element) => {
  await document.fonts.ready;

  const options = {
    pixelRatio: Math.min(window.devicePixelRatio || 2, 3),
    backgroundColor: '#000000',
    cacheBust: true,
    // Safari CORS 대응: 이미지를 inline data URL로 변환
    imagePlaceholder: undefined,
    skipAutoScale: true,
  };

  // iOS Safari 대응: 여러 번 호출해야 이미지가 제대로 렌더링됨
  let dataUrl;
  for (let i = 0; i < 3; i++) {
    dataUrl = await toPng(element, options);
  }

  const res = await fetch(dataUrl);
  return res.blob();
};

/**
 * Blob을 File 객체로 변환 (Web Share API용)
 * @param {Blob} blob - PNG Blob
 * @param {string} filename - 파일명
 * @returns {File}
 */
export const blobToFile = (blob, filename = 'golden-days.png') => {
  return new File([blob], filename, { type: 'image/png' });
};

/**
 * Blob을 이미지 파일로 다운로드 (폴백용)
 * @param {Blob} blob - PNG Blob
 * @param {string} filename - 파일명
 */
export const downloadBlob = (blob, filename = 'golden-days.png') => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

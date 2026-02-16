import html2canvas from 'html2canvas';

/**
 * DOM 요소를 PNG Blob으로 캡처
 * @param {HTMLElement} element - 캡처 대상 DOM 요소
 * @returns {Promise<Blob>} PNG Blob
 */
export const captureElementToBlob = async (element) => {
  // 폰트 로딩 완료 대기
  await document.fonts.ready;

  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: false,
    scale: Math.min(window.devicePixelRatio || 2, 3),
    backgroundColor: '#000000',
    scrollX: 0,
    scrollY: 0,
    width: element.offsetWidth,
    height: element.offsetHeight,
    logging: false,
    // backdrop-filter는 html2canvas가 지원하지 않으므로 복제 DOM에서 제거
    onclone: (clonedDoc) => {
      clonedDoc.querySelectorAll('[class*="backdrop-blur"]').forEach((el) => {
        el.style.backdropFilter = 'none';
        el.style.webkitBackdropFilter = 'none';
      });
    },
  });

  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png', 1.0);
  });
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

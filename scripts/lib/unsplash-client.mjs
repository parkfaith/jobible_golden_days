/**
 * Unsplash API 래퍼
 * - 랜덤 이미지 검색
 * - 이미지 다운로드
 * - 다운로드 이벤트 트리거 (Unsplash ToS 요구사항)
 */

const BASE_URL = 'https://api.unsplash.com';

/**
 * Unsplash에서 랜덤 이미지 메타데이터를 가져옵니다
 */
export async function fetchRandomImages(accessKey, query, count = 4) {
  const url = new URL(`${BASE_URL}/photos/random`);
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('count', String(count));
  url.searchParams.set('content_filter', 'high');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Client-ID ${accessKey}`,
      'Accept-Version': 'v1',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unsplash API 오류 (${response.status}): ${body}`);
  }

  return response.json();
}

/**
 * 이미지 URL을 다운로드하여 Buffer로 반환합니다
 * Unsplash CDN 최적화 파라미터 적용 (w=800, q=70)
 */
export async function downloadImageBuffer(imageUrl) {
  const url = new URL(imageUrl);
  url.searchParams.set('w', '800');
  url.searchParams.set('q', '70');
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'crop');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`이미지 다운로드 실패 (${response.status})`);
  }

  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
}

/**
 * Unsplash 다운로드 이벤트 트리거 (ToS 요구사항 - 통계 수집용)
 * 실패해도 전체 프로세스에 영향 없음
 */
export async function triggerDownload(accessKey, photoId) {
  try {
    await fetch(`${BASE_URL}/photos/${photoId}/download`, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });
  } catch {
    // 통계 트리거 실패는 무시
  }
}

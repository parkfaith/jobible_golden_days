/**
 * 전체 데이터에서 숫자 ID의 최대값을 구한 뒤, 다음 ID부터 순차 할당합니다.
 * seasonal/weather의 문자열 ID("s-*", "w-*")는 무시합니다.
 *
 * @param {Array<Array>} allDataFiles - [bible, quotes, poems, writings] 배열
 * @param {number} count - 필요한 ID 개수
 * @returns {number[]} 새 ID 배열
 */
export function getNextIds(allDataFiles, count) {
  const numericIds = allDataFiles
    .flat()
    .map(item => item.id)
    .filter(id => typeof id === 'number');

  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;

  return Array.from({ length: count }, (_, i) => maxId + 1 + i);
}

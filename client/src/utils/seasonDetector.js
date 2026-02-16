import { seasons, seasonalContent } from '../data';

// 날짜의 시간을 제거하여 자정 기준으로 비교
const toDateOnly = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// lunar_holiday 감지: 연도별 하드코딩된 양력 날짜 범위 비교
const isLunarHolidayActive = (season, date) => {
  const year = date.getFullYear().toString();
  const yearDates = season.dates[year];
  if (!yearDates) return false;

  const today = toDateOnly(date);
  const start = toDateOnly(yearDates.start);
  const end = toDateOnly(yearDates.end);

  return today >= start && today <= end;
};

// fixed_holiday 감지: month/day 기준 ±range일 범위 비교
const isFixedHolidayActive = (season, date) => {
  const year = date.getFullYear();
  const holiday = new Date(year, season.month - 1, season.day);
  holiday.setHours(0, 0, 0, 0);

  const today = toDateOnly(date);
  const diffMs = today.getTime() - holiday.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return Math.abs(diffDays) <= season.range;
};

/**
 * 현재 활성 절기를 감지합니다.
 * 우선순위: lunar_holiday(설날/추석) > fixed_holiday(어버이날/크리스마스/새해)
 * @param {Date} date - 감지 기준 날짜 (기본값: 오늘)
 * @returns {{ key, icon, label, color } | null} 활성 절기 정보 또는 null
 */
export const detectCurrentSeason = (date = new Date()) => {
  let lunarMatch = null;
  let fixedMatch = null;

  for (const [key, season] of Object.entries(seasons)) {
    const isActive =
      season.type === 'lunar_holiday'
        ? isLunarHolidayActive(season, date)
        : isFixedHolidayActive(season, date);

    if (isActive) {
      const result = { key, icon: season.icon, label: season.label, color: season.color };
      if (season.type === 'lunar_holiday') {
        lunarMatch = result;
      } else if (!fixedMatch) {
        fixedMatch = result;
      }
    }
  }

  // 명절(lunar) 우선
  return lunarMatch || fixedMatch || null;
};

/**
 * 해당 절기의 콘텐츠를 필터링합니다.
 * @param {string} seasonKey - 절기 키 (예: '설날', '추석')
 * @returns {Array} 해당 절기 콘텐츠 배열
 */
export const getSeasonalContent = (seasonKey) => {
  return seasonalContent.filter(item => item.season === seasonKey);
};

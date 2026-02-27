import { useState, useEffect } from 'react';

/**
 * 방문자 카운터 — counterapi.dev 사용
 * - /up 엔드포인트만 유효 (조회 전용 없음)
 * - localStorage로 오늘 이미 카운트 했는지 체크 (자정 리셋)
 * - 이미 카운트한 경우 localStorage 캐시 값 표시
 */
const VisitorCounter = () => {
  const [counts, setCounts] = useState({ today: null, total: null });

  useEffect(() => {
    let isMounted = true;

    const fetchCounts = async () => {
      try {
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const dateString = `${yyyy}_${mm}_${dd}`;

        // 오늘 날짜 기준 방문 여부 체크 (자정이 지나면 자동 리셋)
        const stored = JSON.parse(localStorage.getItem('golden-days-visitor') || '{}');
        const alreadyCounted = stored.date === dateString;

        if (alreadyCounted && stored.today != null && stored.total != null) {
          // 이미 오늘 카운트함 → 캐시된 값 표시
          if (isMounted) {
            setCounts({ today: stored.today, total: stored.total });
          }
          return;
        }

        // 첫 방문 → /up으로 카운트 증가 + 응답에서 count 읽기
        const [totalRes, dailyRes] = await Promise.all([
          fetch(`https://api.counterapi.dev/v1/ryan_project_golden_days/visits_total/up`),
          fetch(`https://api.counterapi.dev/v1/ryan_project_golden_days/visits_${dateString}/up`),
        ]);

        const totalData = await totalRes.json();
        const dailyData = await dailyRes.json();

        if (isMounted) {
          const result = { today: dailyData.count, total: totalData.count };
          setCounts(result);
          // 오늘 날짜와 함께 캐시 저장
          localStorage.setItem('golden-days-visitor', JSON.stringify({
            date: dateString,
            today: result.today,
            total: result.total,
          }));
        }
      } catch (error) {
        console.error('방문자 카운터 오류:', error);
      }
    };

    fetchCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (counts.today === null || counts.total === null) {
    return (
      <div className="flex items-center justify-center gap-3 text-text/40 text-[10px]">
        <span>오늘 ---</span>
        <span>|</span>
        <span>누적 ---</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 text-text/50 text-[11px] font-medium tracking-wide">
      <div className="flex items-center gap-1.5 bg-white/30 px-2 py-1 rounded-md">
        <span className="opacity-80">오늘</span>
        <span className="font-bold text-[#A7672A]">{counts.today.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-white/30 px-2 py-1 rounded-md">
        <span className="opacity-80">누적</span>
        <span className="font-bold text-[#A7672A]">{counts.total.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default VisitorCounter;

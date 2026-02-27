import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getDailyContent } from '../utils/dailyCurator';
import { detectCurrentSeason, getSeasonalContent } from '../utils/seasonDetector';
import { fetchCurrentWeather, getWeatherContent, WEATHER_META } from '../utils/weatherService';
import allContent, { weatherContent, seasonalContent } from '../data';
import { Heart } from 'lucide-react';
import CardViewer from '../components/CardViewer';
import TodayPreview from '../components/TodayPreview';
import CategoryGrid from '../components/CategoryGrid';
import SeasonalBanner from '../components/SeasonalBanner';
import WeatherBanner from '../components/WeatherBanner';
import InstallPrompt from '../components/InstallPrompt';
import VisitorCounter from '../components/VisitorCounter';

// 오늘 날짜 문자열 (YYYY-MM-DD) — 날짜 변경 감지용
const getDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

// 오늘 날짜를 한국어 형식으로 포맷 (예: "2026년 2월 26일 목요일")
const formatKoreanDate = () => {
  const d = new Date();
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}`;
};

// 카테고리 라벨 (즐겨찾기 목록에서 사용)
const CATEGORY_LABELS = {
  bible: '말씀',
  quote: '명언',
  poem: '시',
  writing: '글귀',
  weather: '날씨',
  seasonal: '특별',
};

// 즐겨찾기 localStorage 헬퍼 — ID를 문자열로 정규화하여 타입 불일치 방지
const getFavorites = () => {
  const raw = JSON.parse(localStorage.getItem('golden-days-favorites') || '[]');
  return raw.map(id => String(id));
};
const saveFavorites = (favs) => localStorage.setItem('golden-days-favorites', JSON.stringify(favs));

const Home = () => {
  const [favorites, setFavorites] = useState(() => getFavorites());
  const [view, setView] = useState('home');
  const [viewerContents, setViewerContents] = useState([]);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [todayContents, setTodayContents] = useState(() => getDailyContent());
  const [todayLabel, setTodayLabel] = useState(() => formatKoreanDate());

  // 절기 감지
  const [activeSeason, setActiveSeason] = useState(() => detectCurrentSeason());
  const seasonContents = useMemo(
    () => activeSeason ? getSeasonalContent(activeSeason.key) : [],
    [activeSeason]
  );

  // 날씨 상태
  const [weatherInfo, setWeatherInfo] = useState(null);

  // 날짜 변경 감지 ref — 현재 날짜 문자열 저장
  const dateRef = useRef(getDateString());

  // 모든 일일 데이터를 갱신하는 함수
  const refreshDailyData = useCallback(() => {
    setTodayContents(getDailyContent());
    setTodayLabel(formatKoreanDate());
    setActiveSeason(detectCurrentSeason());
    // 날씨도 다시 가져오기 (캐시가 만료되었을 수 있음)
    fetchCurrentWeather().then(result => {
      if (result) setWeatherInfo(result);
    });
  }, []);

  // 날짜 변경 감지 — visibilitychange + 주기적 체크
  useEffect(() => {
    const checkDateChange = () => {
      const now = getDateString();
      if (now !== dateRef.current) {
        dateRef.current = now;
        refreshDailyData();
      }
    };

    // 앱이 다시 포커스되었을 때 (백그라운드 → 포그라운드)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkDateChange();
      }
    };

    // 60초마다 날짜 변경 확인 (자정 전후 대비)
    const timer = setInterval(checkDateChange, 60_000);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshDailyData]);

  // 날씨 API 호출 (마운트 시 1회)
  useEffect(() => {
    let cancelled = false;
    fetchCurrentWeather().then(result => {
      if (!cancelled && result) setWeatherInfo(result);
    });
    return () => { cancelled = true; };
  }, []);

  const weatherMeta = weatherInfo ? WEATHER_META[weatherInfo.weather] : null;
  const weatherContents = weatherInfo
    ? getWeatherContent(weatherInfo.weather, weatherContent)
    : [];

  // 즐겨찾기 토글 — ID를 문자열로 정규화하여 숫자/문자열 혼재 방지
  const handleToggleFavorite = (id) => {
    const idStr = String(id);
    const current = getFavorites();
    const next = current.includes(idStr) ? current.filter(f => f !== idStr) : [...current, idStr];
    saveFavorites(next);
    setFavorites(next);
  };

  // 뷰어 열기 (pushState로 브라우저 뒤로가기 지원)
  const openViewer = useCallback((contents, startIndex = 0) => {
    setViewerContents(contents);
    setViewerStartIndex(startIndex);
    setView('viewer');
    window.history.pushState({ view: 'viewer' }, '');
  }, []);



  // 브라우저 뒤로가기 이벤트 처리
  useEffect(() => {
    const handlePopState = () => {
      if (view === 'viewer') {
        setView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [view]);

  // 뷰어에서 뒤로가기 버튼 클릭 시 history도 정리
  const handleViewerBack = useCallback(() => {
    window.history.back();
  }, []);

  // 즐겨찾기된 콘텐츠 목록 조회 (절기/날씨 포함 전체 검색)
  const favoriteItems = [...allContent, ...seasonalContent, ...weatherContent]
    .filter(item => favorites.includes(String(item.id)));

  return (
    <div className="w-full app-bg">
      {/* 헤더 (sticky) */}
      <header className="sticky top-0 z-30 px-5 py-4 bg-[#E5E1D8]/95 backdrop-blur-sm">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[#C8915A] text-sm font-light tracking-widest" style={{ textShadow: '0 0 4px rgba(0,0,0,0.1)' }}>joBiBle</span>
            <h1 className="text-[#A7672A] text-lg font-bold leading-tight" style={{ textShadow: '0 0 4px rgba(0,0,0,0.1)' }}>Golden Days</h1>
          </div>
          <p className="text-text text-base font-bold leading-tight pb-0.5">
            {todayLabel}
          </p>
        </div>
      </header>

      {/* 메인 콘텐츠 (세로 스크롤) */}
      <main className="pb-8">
        {/* 절기 배너 (해당 시기에만 표시) */}
        {activeSeason && seasonContents.length > 0 && (
          <SeasonalBanner
            season={activeSeason}
            contents={seasonContents}
            onTap={(contents) => openViewer(contents, 0)}
          />
        )}

        {/* 날씨 배너 (절기 배너가 없을 때만 표시) */}
        {!(activeSeason && seasonContents.length > 0) && weatherInfo && weatherContents.length > 0 && (
          <WeatherBanner
            weatherInfo={weatherInfo}
            weatherMeta={weatherMeta}
            contents={weatherContents}
            onTap={(contents) => openViewer(contents, 0)}
          />
        )}

        {/* 오늘의 이야기 */}
        <TodayPreview
          contents={todayContents}
          favorites={favorites}
          onCardTap={(idx) => openViewer(todayContents, idx)}
        />

        {/* 카테고리 그리드 */}
        <CategoryGrid
          onCategoryTap={(items) => openViewer(items, 0)}
        />

        {/* 즐겨찾기 섹션 (인라인) */}
        <section className="px-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={22} className="text-red-400" />
            <h2 className="text-2xl font-bold text-text">내가 저장한 글귀</h2>
            {favoriteItems.length > 0 && (
              <span className="text-base text-text/50">({favoriteItems.length})</span>
            )}
          </div>

          {favoriteItems.length === 0 ? (
            <div className="text-center text-text/50 py-12 text-xl bg-white/40 rounded-2xl">
              아직 저장한 글귀가 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/60 rounded-2xl p-5 cursor-pointer hover:bg-white/80 hover:shadow-md hover:scale-[1.01] transition-all duration-300 active:scale-[0.98] transform shadow-sm border border-transparent hover:border-white/50"
                  onClick={() => openViewer([item], 0)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block bg-primary/20 text-accent text-xs font-medium px-2.5 py-1 rounded-full mb-2">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>
                      <p className="text-text text-lg font-medium leading-snug line-clamp-2 break-keep">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <p className="text-text/60 text-base mt-1.5">- {item.author}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(item.id);
                      }}
                      className="text-red-400 hover:text-red-500 p-2 flex-shrink-0"
                      aria-label="즐겨찾기 해제"
                    >
                      <Heart size={22} fill="currentColor" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 하단 푸터 */}
      <footer className="px-5 py-6 flex flex-col items-center justify-center gap-3 text-center text-text/30 text-[10px]">
        <p>&copy; {new Date().getFullYear()} joBiBle Golden Days &middot; Made by JunHyoung Park</p>
        <div className="opacity-60 hover:opacity-100 transition-opacity duration-300">
          <VisitorCounter />
        </div>
      </footer>

      {/* PWA 설치 유도 배너 */}
      <InstallPrompt />

      {/* CardViewer 오버레이 (스크롤 위치 보존) */}
      {view === 'viewer' && (
        <div className="fixed inset-0 z-50">
          <CardViewer
            contents={viewerContents}
            startIndex={viewerStartIndex}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onBack={handleViewerBack}
          />
        </div>
      )}
    </div>
  );
};

export default Home;

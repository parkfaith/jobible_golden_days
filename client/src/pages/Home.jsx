import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getDailyContent, getRevisitContent } from '../utils/dailyCurator';
import { detectCurrentSeason, getSeasonalContent } from '../utils/seasonDetector';
import allContent from '../data';
import { Heart, Type } from 'lucide-react';
import CardViewer from '../components/CardViewer';
import TodayPreview from '../components/TodayPreview';
import CategoryGrid from '../components/CategoryGrid';
import SeasonalBanner from '../components/SeasonalBanner';
import RevisitSection from '../components/RevisitSection';

// 카테고리 라벨 (즐겨찾기 목록에서 사용)
const CATEGORY_LABELS = {
  bible: '말씀',
  quote: '명언',
  proverb: '속담',
  poem: '시',
  writing: '글귀',
};

// 즐겨찾기 localStorage 헬퍼
const getFavorites = () => JSON.parse(localStorage.getItem('golden-days-favorites') || '[]');
const saveFavorites = (favs) => localStorage.setItem('golden-days-favorites', JSON.stringify(favs));

// 폰트 크기 localStorage 헬퍼
const getSavedFontSize = () => localStorage.getItem('golden-days-font-size') || 'normal';

const Home = () => {
  const [favorites, setFavorites] = useState(() => getFavorites());
  const [fontSize, setFontSize] = useState(() => getSavedFontSize());
  const [view, setView] = useState('home');
  const [viewerContents, setViewerContents] = useState([]);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [todayContents] = useState(() => getDailyContent());
  const revisitContents = useMemo(() => getRevisitContent(), []);

  // 절기 감지 (날짜 기반, 렌더링마다 재계산할 필요 없음)
  const activeSeason = useMemo(() => detectCurrentSeason(), []);
  const seasonContents = useMemo(
    () => activeSeason ? getSeasonalContent(activeSeason.key) : [],
    [activeSeason]
  );

  // 즐겨찾기 토글
  const handleToggleFavorite = (id) => {
    const current = getFavorites();
    const next = current.includes(id) ? current.filter(f => f !== id) : [...current, id];
    saveFavorites(next);
    setFavorites(next);
  };

  // 폰트 크기 토글
  const handleToggleFontSize = () => {
    const next = fontSize === 'normal' ? 'large' : 'normal';
    localStorage.setItem('golden-days-font-size', next);
    setFontSize(next);
  };

  // 뷰어 열기 (pushState로 브라우저 뒤로가기 지원)
  const openViewer = useCallback((contents, startIndex = 0) => {
    setViewerContents(contents);
    setViewerStartIndex(startIndex);
    setView('viewer');
    window.history.pushState({ view: 'viewer' }, '');
  }, []);

  // 뷰어 닫기
  const closeViewer = useCallback(() => {
    setView('home');
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

  // 즐겨찾기된 콘텐츠 목록 조회
  const favoriteItems = allContent.filter(item => favorites.includes(item.id));

  return (
    <div className="w-full min-h-screen bg-secondary">
      {/* 헤더 (sticky) */}
      <header className="sticky top-0 z-30 px-5 py-4 flex justify-between items-center bg-secondary/95 backdrop-blur-sm">
        <div className="flex flex-col">
          <span className="text-[#C8915A] text-sm font-light tracking-widest" style={{ textShadow: '0 0 4px rgba(0,0,0,0.1)' }}>joBiBle</span>
          <h1 className="text-[#A7672A] text-lg font-bold leading-tight" style={{ textShadow: '0 0 4px rgba(0,0,0,0.1)' }}>Golden Days</h1>
        </div>
        <div className="flex items-center gap-1">
          {/* 글씨 크기 토글 */}
          <button
            onClick={handleToggleFontSize}
            className={`text-text p-3 hover:bg-black/5 rounded-full transition-colors ${fontSize === 'large' ? 'bg-black/10' : ''}`}
            aria-label="글씨 크기 변경"
          >
            <Type size={24} />
          </button>
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

        {/* 오늘의 이야기 미리보기 (가로 스크롤) */}
        <TodayPreview
          contents={todayContents}
          favorites={favorites}
          onCardTap={(idx) => openViewer(todayContents, idx)}
        />

        {/* 다시 만나는 글귀 (8~14일 전 콘텐츠 추천) */}
        {revisitContents.length > 0 && (
          <RevisitSection
            contents={revisitContents}
            onCardTap={(contents, idx) => openViewer(contents, idx)}
          />
        )}

        {/* 카테고리 그리드 */}
        <CategoryGrid
          onCategoryTap={(items) => openViewer(items, 0)}
        />

        {/* 즐겨찾기 섹션 (인라인) */}
        <section className="px-5">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={20} className="text-red-400" />
            <h2 className="text-xl font-bold text-text">내가 저장한 글귀</h2>
            {favoriteItems.length > 0 && (
              <span className="text-sm text-text/50">({favoriteItems.length})</span>
            )}
          </div>

          {favoriteItems.length === 0 ? (
            <div className="text-center text-text/50 py-12 text-lg bg-white/40 rounded-2xl">
              아직 저장한 글귀가 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/60 rounded-xl p-4 cursor-pointer hover:bg-white/80 transition-colors active:scale-[0.98] transform"
                  onClick={() => openViewer([item], 0)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block bg-primary/20 text-accent text-xs font-medium px-2 py-0.5 rounded-full mb-2">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>
                      <p className="text-text text-base font-medium leading-snug line-clamp-2 break-keep">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <p className="text-text/60 text-sm mt-1">- {item.author}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(item.id);
                      }}
                      className="text-red-400 hover:text-red-500 p-1 flex-shrink-0"
                      aria-label="즐겨찾기 해제"
                    >
                      <Heart size={18} fill="currentColor" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* CardViewer 오버레이 (스크롤 위치 보존) */}
      {view === 'viewer' && (
        <div className="fixed inset-0 z-50">
          <CardViewer
            contents={viewerContents}
            startIndex={viewerStartIndex}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            fontSize={fontSize}
            onBack={handleViewerBack}
          />
        </div>
      )}
    </div>
  );
};

export default Home;

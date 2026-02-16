import React, { useState, useRef } from 'react';
import { getDailyContent } from '../utils/dailyCurator';
import allContent from '../data';
import QuoteCard from '../components/QuoteCard';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Heart, Type, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';

// 카테고리 라벨 (즐겨찾기 목록에서 사용)
const CATEGORY_LABELS = {
  bible: '말씀',
  quote: '명언',
  proverb: '속담',
  poem: '시',
  writing: '글귀',
};

// 날짜를 한국어 형식으로 포맷
const formatDateLabel = (date) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const day = days[date.getDay()];
  return `${y}년 ${m}월 ${d}일 ${day}요일`;
};

// 즐겨찾기 localStorage 헬퍼
const getFavorites = () => JSON.parse(localStorage.getItem('golden-days-favorites') || '[]');
const saveFavorites = (favs) => localStorage.setItem('golden-days-favorites', JSON.stringify(favs));

// 폰트 크기 localStorage 헬퍼
const getSavedFontSize = () => localStorage.getItem('golden-days-font-size') || 'normal';

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [contents, setContents] = useState(() => getDailyContent());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState(() => getFavorites());
  const [fontSize, setFontSize] = useState(() => getSavedFontSize());

  // 스와이프 감지용
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % contents.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + contents.length) % contents.length);
  };

  // 스와이프 핸들러
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    const SWIPE_THRESHOLD = 50;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  const handleDateChange = (date) => {
    const newContent = getDailyContent(date);
    setSelectedDate(date);
    setContents(newContent);
    setCurrentIndex(0);
    setShowCalendar(false);
  };

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

  // 즐겨찾기 목록에서 항목 선택 시
  const handleFavoriteSelect = (item) => {
    // 현재 날짜의 콘텐츠에 포함되어 있으면 해당 인덱스로 이동
    const idx = contents.findIndex(c => c.id === item.id);
    if (idx !== -1) {
      setCurrentIndex(idx);
    } else {
      // 현재 날짜에 없으면 단독으로 표시
      setContents([item]);
      setCurrentIndex(0);
    }
    setShowFavorites(false);
  };

  // 즐겨찾기된 콘텐츠 목록 조회
  const favoriteItems = allContent.filter(item => favorites.includes(item.id));

  if (contents.length === 0) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="relative w-full h-screen bg-secondary overflow-hidden">
      {/* Header / Top Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-center bg-gradient-to-b from-black/20 to-transparent">
        <div className="flex flex-col">
          <span className="text-white/90 text-sm font-light tracking-widest drop-shadow-sm">joBiBle</span>
          <h1 className="text-white text-lg font-bold drop-shadow-sm opacity-80 leading-tight">Golden Days</h1>
        </div>
        <div className="flex items-center gap-1">
          {/* 글씨 크기 토글 */}
          <button
            onClick={handleToggleFontSize}
            className={`text-white p-3 hover:bg-white/10 rounded-full transition-colors ${fontSize === 'large' ? 'bg-white/15' : ''}`}
            aria-label="글씨 크기 변경"
          >
            <Type size={24} />
          </button>
          {/* 즐겨찾기 목록 */}
          <button
            onClick={() => setShowFavorites(true)}
            className="text-white p-3 hover:bg-white/10 rounded-full transition-colors relative"
            aria-label="즐겨찾기 목록"
          >
            <Heart size={24} />
            {favorites.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {favorites.length > 9 ? '9+' : favorites.length}
              </span>
            )}
          </button>
          {/* 달력 */}
          <button
            onClick={() => setShowCalendar(true)}
            className="text-white p-3 hover:bg-white/10 rounded-full transition-colors"
            aria-label="달력 열기"
          >
            <CalendarIcon size={28} />
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 (스와이프 가능) */}
      <div
        className="w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${contents[0].id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <QuoteCard
              content={contents[currentIndex]}
              dateLabel={formatDateLabel(selectedDate)}
              isFavorite={favorites.includes(contents[currentIndex].id)}
              onToggleFavorite={handleToggleFavorite}
              fontSize={fontSize}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls Area */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 pb-8 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between md:justify-center md:gap-12">
        <button
          onClick={handlePrev}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform active:scale-95 border border-white/10"
          aria-label="이전 글귀"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex gap-2">
          {contents.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/40'}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform active:scale-95 border border-white/10"
          aria-label="다음 글귀"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-secondary p-6 rounded-2xl w-full max-w-sm relative shadow-2xl">
              <button
                onClick={() => setShowCalendar(false)}
                className="absolute top-4 right-4 text-text/60 hover:text-text transition-colors"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold text-text mb-4 text-center">지난 영감 찾아보기</h2>
              <div className="calendar-container">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  maxDate={new Date()}
                  className="w-full rounded-lg border-none font-sans text-text"
                  calendarType="gregory"
                  formatDay={(locale, date) => date.getDate()}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites Modal */}
      <AnimatePresence>
        {showFavorites && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-secondary p-6 rounded-2xl w-full max-w-sm relative shadow-2xl max-h-[80vh] flex flex-col">
              <button
                onClick={() => setShowFavorites(false)}
                className="absolute top-4 right-4 text-text/60 hover:text-text transition-colors"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold text-text mb-4 text-center">내가 저장한 글귀</h2>

              {favoriteItems.length === 0 ? (
                <div className="text-center text-text/50 py-12 text-lg">
                  아직 저장한 글귀가 없습니다
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                  {favoriteItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/60 rounded-xl p-4 cursor-pointer hover:bg-white/80 transition-colors active:scale-[0.98] transform"
                      onClick={() => handleFavoriteSelect(item)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="inline-block bg-primary/20 text-accent text-xs font-medium px-2 py-0.5 rounded-full mb-2">
                            {CATEGORY_LABELS[item.category] || item.category}
                          </span>
                          <p className="text-text text-base font-medium leading-snug line-clamp-2 break-keep">
                            "{item.quote}"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

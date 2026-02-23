import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuoteCard from './QuoteCard';

// 날짜를 한국어 형식으로 포맷
const formatDateLabel = (date) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const day = days[date.getDay()];
  return `${y}년 ${m}월 ${d}일 ${day}요일`;
};

const CardViewer = ({ contents, startIndex = 0, favorites, onToggleFavorite, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

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

  const dateLabel = formatDateLabel(new Date());

  return (
    <div className="relative w-full h-screen bg-secondary overflow-hidden">
      {/* 뒤로가기 버튼 */}
      <div className="absolute top-0 left-0 z-40 p-4">
        <button
          onClick={onBack}
          className="p-3 bg-black/30 backdrop-blur-sm hover:bg-black/40 rounded-full text-white transition-all active:scale-95"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* 메인 콘텐츠 (스와이프 가능) */}
      <div
        className="w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${contents[currentIndex]?.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <QuoteCard
              content={contents[currentIndex]}
              dateLabel={dateLabel}
              isFavorite={favorites.includes(String(contents[currentIndex]?.id))}
              onToggleFavorite={onToggleFavorite}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 하단 컨트롤 */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-6 pb-8 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between md:justify-center md:gap-12">
        <button
          onClick={handlePrev}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform active:scale-95 border border-white/10"
          aria-label="이전 글귀"
        >
          <ChevronLeft size={24} />
        </button>

        {/* 인디케이터: 5개 이하면 dots, 초과면 숫자 표시 */}
        {contents.length <= 5 ? (
          <div className="flex gap-2">
            {contents.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-500 ease-out flex-shrink-0 ${idx === currentIndex ? 'bg-white w-6 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/40 w-2'}`}
              />
            ))}
          </div>
        ) : (
          <span className="text-white text-lg font-medium min-w-[60px] text-center">
            {currentIndex + 1} / {contents.length}
          </span>
        )}

        <button
          onClick={handleNext}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all transform active:scale-95 border border-white/10"
          aria-label="다음 글귀"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default CardViewer;

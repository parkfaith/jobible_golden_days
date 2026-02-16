import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Heart } from 'lucide-react';
import { renderCardToBlob, blobToFile, downloadBlob } from '../utils/captureCard';

const CATEGORY_LABELS = {
  bible: '말씀',
  quote: '명언',
  proverb: '속담',
  poem: '시',
  writing: '글귀',
};

// 카테고리별 폰트 클래스 매핑
const CATEGORY_FONTS = {
  bible: 'font-serif',      // 나눔명조 — 경건하고 격식 있는 느낌
  quote: 'font-sans',       // Pretendard — 깔끔하고 현대적
  proverb: 'font-sans',     // Pretendard — 가독성 우선
  poem: 'font-serif',       // 나눔명조 — 서정적, 문학적
  writing: 'font-sans',        // Pretendard — 어르신 가독성 우선
};

const QuoteCard = ({ content, dateLabel, isFavorite, onToggleFavorite, fontSize = 'normal' }) => {
  const [notification, setNotification] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // 알림 메시지 표시
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(false), 2500);
  };

  const handleShare = async () => {
    if (isCapturing) return;

    setIsCapturing(true);

    try {
      // 1단계: Canvas API로 카드 이미지 생성
      const blob = await renderCardToBlob({
        bgImage: content.bgImage,
        quote: content.quote,
        author: content.author,
        category: content.category,
      });

      if (!blob) {
        throw new Error('이미지 생성 실패');
      }

      const filename = `golden-days-${Date.now()}.png`;
      const file = blobToFile(blob, filename);

      // 2단계: Web Share API 파일 공유 시도 (모바일)
      // 비동기 캡처 후 user gesture가 만료될 수 있으므로 에러 시 다운로드 폴백
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Golden Days - 오늘의 영감',
            text: `"${content.quote}" - ${content.author}`,
            files: [file],
          });
          return;
        } catch (e) {
          if (e.name === 'AbortError') return;
          // NotAllowedError 등 — 다운로드 폴백으로 진행
        }
      }

      // 3단계: 폴백 - 이미지 다운로드
      downloadBlob(blob, filename);
      showNotification('이미지가 저장되었습니다');

    } catch (error) {
      console.error('이미지 공유 실패:', error);
      // 최종 폴백: 텍스트 클립보드 복사
      try {
        const shareText = `"${content.quote}"\n- ${content.author}\n\n✨ Golden Days`;
        await navigator.clipboard.writeText(shareText);
        showNotification('텍스트가 복사되었습니다');
      } catch (clipboardError) {
        showNotification('공유에 실패했습니다');
      }
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">

      {/* 배경 이미지 */}
      <img
        src={content.bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 가독성을 위한 어두운 오버레이 (명도 대비 7:1) */}
      <div className="absolute inset-0 bg-black/50 z-10" />

      {/* 날짜 및 카테고리 표시 */}
      <div className="absolute top-20 left-0 right-0 z-20 flex justify-center gap-3">
        {dateLabel && (
          <span className="text-white/70 text-sm font-medium drop-shadow-sm">
            {dateLabel}
          </span>
        )}
        {content.category && (
          <span className="bg-white/15 backdrop-blur-sm text-white/80 text-xs font-medium px-3 py-1 rounded-full">
            {CATEGORY_LABELS[content.category] || content.category}
          </span>
        )}
      </div>

      {/* 본문 콘텐츠 */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl w-full flex flex-col items-center gap-8">
          <p className={`text-white font-bold leading-relaxed drop-shadow-md break-keep ${CATEGORY_FONTS[content.category] || 'font-sans'} ${fontSize === 'large' ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'}`}>
            &ldquo;{content.quote}&rdquo;
          </p>
          <p className={`text-white/90 font-sans font-medium mt-4 ${fontSize === 'large' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
            - {content.author}
          </p>
        </div>
      </div>

      {/* 워터마크 (하단) */}
      <div className="absolute bottom-6 left-0 right-0 z-20 text-center">
        <span className="text-white/30 text-xs tracking-widest">joBiBle Golden Days</span>
      </div>

      {/* 즐겨찾기 & 공유 버튼 (캡처 영역 바깥) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="absolute bottom-28 right-6 z-30 flex flex-col gap-3"
      >
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(content.id)}
            className={`p-3 backdrop-blur-sm rounded-full transition-all active:scale-95 ${isFavorite ? 'bg-red-500/30 text-red-300' : 'bg-white/15 hover:bg-white/25 text-white'}`}
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
        <button
          onClick={handleShare}
          disabled={isCapturing}
          className={`p-3 backdrop-blur-sm rounded-full text-white transition-all active:scale-95 ${isCapturing ? 'bg-white/30 cursor-wait' : 'bg-white/15 hover:bg-white/25'}`}
          aria-label="이미지로 공유하기"
        >
          <Share2 size={22} />
        </button>
      </motion.div>

      {/* 캡처 중 로딩 오버레이 */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white text-2xl font-medium">이미지 생성 중...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 알림 토스트 */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-40 right-4 z-50 bg-black/70 text-white text-lg px-5 py-3 rounded-lg"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default QuoteCard;

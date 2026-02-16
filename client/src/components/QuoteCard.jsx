import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Heart } from 'lucide-react';

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
  writing: 'font-handwriting', // 나눔펜스크립트 — 캘리그래피 감성
};

const QuoteCard = ({ content, dateLabel, isFavorite, onToggleFavorite, fontSize = 'normal' }) => {
  const [shared, setShared] = useState(false);

  // 클립보드 복사 폴백
  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleShare = async () => {
    const shareText = `"${content.quote}"\n- ${content.author}\n\n✨ Golden Days`;

    // 1순위: 카카오톡 공유 (SDK 초기화된 경우)
    if (window.Kakao?.isInitialized()) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: 'Golden Days - 오늘의 영감',
            description: `"${content.quote}"\n- ${content.author}`,
            imageUrl: content.bgImage,
            link: {
              mobileWebUrl: window.location.origin,
              webUrl: window.location.origin,
            },
          },
          buttons: [
            {
              title: '오늘의 영감 보기',
              link: {
                mobileWebUrl: window.location.origin,
                webUrl: window.location.origin,
              },
            },
          ],
        });
        return;
      } catch (e) {
        console.error('카카오 공유 실패, 폴백 사용:', e);
      }
    }

    // 2순위: Web Share API (모바일 기본 공유 시트)
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Golden Days', text: shareText });
      } catch (e) {
        // 사용자가 공유 취소한 경우 무시
        if (e.name !== 'AbortError') console.error(e);
      }
      return;
    }

    // 3순위: 클립보드 복사
    await copyToClipboard(shareText);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 transition-opacity duration-1000"
        style={{ backgroundImage: `url(${content.bgImage})` }}
      />

      {/* 가독성을 위한 어두운 오버레이 (PRD: 명도 대비 7:1) */}
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
      <div className="relative z-20 p-8 text-center max-w-2xl w-full flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className={`text-white font-bold leading-relaxed drop-shadow-md break-keep ${CATEGORY_FONTS[content.category] || 'font-sans'} ${fontSize === 'large' ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'}`}>
            "{content.quote}"
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className={`text-white/90 font-sans font-medium mt-4 ${fontSize === 'large' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
            - {content.author}
          </p>
        </motion.div>
      </div>

      {/* 즐겨찾기 & 공유 버튼 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="absolute bottom-28 right-6 z-20 flex flex-col gap-3"
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
          className="p-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full text-white transition-all active:scale-95"
          aria-label="공유하기"
        >
          <Share2 size={22} />
        </button>
      </motion.div>

      {/* 클립보드 복사 완료 알림 */}
      <AnimatePresence>
        {shared && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-40 right-4 z-20 bg-black/70 text-white text-sm px-4 py-2 rounded-lg"
          >
            복사 완료!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default QuoteCard;

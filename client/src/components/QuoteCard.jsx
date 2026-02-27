import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Heart } from 'lucide-react';
import { renderCardToBlob, blobToFile, downloadBlob } from '../utils/captureCard';
import { resolveTypography } from '../utils/typographyEngine';

const CATEGORY_LABELS = {
  bible: '말씀',
  quote: '명언',
  poem: '시',
  writing: '글귀',
  weather: '날씨',
  seasonal: '특별',
};

// 카테고리별 폰트 클래스 매핑
const CATEGORY_FONTS = {
  bible: 'font-serif',      // 나눔명조 — 경건하고 격식 있는 느낌
  quote: 'font-sans',       // Pretendard — 깔끔하고 현대적
  poem: 'font-serif',       // 나눔명조 — 서정적, 문학적
  writing: 'font-sans',     // Pretendard — 어르신 가독성 우선
  weather: 'font-serif',    // 나눔명조 — 성경 구절
  seasonal: 'font-serif',   // 나눔명조 — 성경 구절
};

const QuoteCard = ({ content, dateLabel, isFavorite, onToggleFavorite }) => {
  const [notification, setNotification] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // 타이포그래피 엔진 — 카테고리/텍스트 길이 기반 자동 스타일 결정
  const typo = resolveTypography(content);

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
        typography: typo,
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

      // 3단계: 폴백 - 클립보드에 이미지 복사 시도, 실패 시 다운로드
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        showNotification('이미지가 복사되었습니다');
      } catch {
        downloadBlob(blob, filename);
        showNotification('이미지가 저장되었습니다');
      }

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

      {/* 배경 이미지 (천천히 확대되는 Slow Zoom 효과로 생동감 및 깊이감 부여) */}
      <motion.img
        src={content.bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0 origin-center"
        initial={{ scale: 1.0 }}
        animate={{ scale: 1.06 }}
        transition={{ duration: 20, ease: "linear" }}
      />

      {/* 카테고리별 색조 오버레이 (가독성 대비 7:1 유지) */}
      <div className="absolute inset-0 z-10" style={{ backgroundColor: typo.style.overlayColor }} />

      {/* 날짜 및 카테고리 표시 */}
      <div className="absolute top-20 left-0 right-0 z-20 flex justify-center gap-3">
        {dateLabel && (
          <span className="text-white/70 text-sm font-medium drop-shadow-sm">
            {dateLabel}
          </span>
        )}
        {content.category && (
          <span
            className="backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full"
            style={{ backgroundColor: typo.style.badgeBg, color: typo.style.badgeText }}
          >
            {CATEGORY_LABELS[content.category] || content.category}
          </span>
        )}
      </div>

      {/* 본문 콘텐츠 (은은하게 떠오르는 애니메이션 적용) */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.2, ease: "easeOut" }}
          className={`relative max-w-2xl w-full flex flex-col gap-8 ${typo.align === 'left' ? 'text-left items-start' :
              typo.align === 'right' ? 'text-right items-end' :
                'text-center items-center'
            }`}>
          {/* 장식용 큰 따옴표 (배경) */}
          <span
            className="absolute font-serif select-none pointer-events-none"
            style={{
              top: '-40px',
              left: typo.align === 'center' ? '-5%' : '-2%',
              fontSize: '120px',
              lineHeight: 1,
              color: typo.style.accentColor,
            }}
            aria-hidden="true"
          >
            &ldquo;
          </span>

          <p
            className={`text-white font-bold leading-relaxed break-keep ${CATEGORY_FONTS[content.category] || 'font-sans'}`}
            style={{
              fontSize: `${typo.quoteFontSizePx}px`,
              textShadow: `0 2px ${typo.style.textShadow.blur}px ${typo.style.textShadow.color}, 0 0 30px rgba(0,0,0,0.3)`,
            }}
          >
            &ldquo;{typo.segments.map((seg, i) =>
              seg.highlight ? (
                <span key={i} className="highlight-glow" style={{
                  color: typo.style.highlightColor,
                  fontSize: `${Math.round(typo.quoteFontSizePx * typo.style.highlightScale)}px`,
                  fontWeight: typo.style.highlightWeight,
                  textShadow: typo.style.highlightGlow
                    ? `0 0 ${typo.style.highlightGlow.blur}px ${typo.style.highlightGlow.color}, 0 0 ${typo.style.highlightGlow.blur * 2}px ${typo.style.highlightGlow.color}`
                    : 'none',
                  borderBottom: typo.style.underlineHighlight
                    ? `2px solid ${typo.style.highlightColor}66`
                    : 'none',
                  paddingBottom: typo.style.underlineHighlight ? '2px' : '0',
                }}>
                  {seg.text}
                </span>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}&rdquo;
          </p>
          <p
            className="text-white/90 font-sans font-medium mt-4"
            style={{ fontSize: `${typo.authorFontSizePx}px` }}
          >
            - {content.author}
          </p>
          {content.explanation && (
            <p className="text-white/70 font-sans mt-4 max-w-xl leading-relaxed"
              style={{ fontSize: `${Math.max(typo.authorFontSizePx - 4, 14)}px` }}
            >
              {content.explanation}
            </p>
          )}
        </motion.div>
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
            className={`p-3 backdrop-blur-md rounded-full transition-all duration-300 active:scale-90 hover:shadow-lg ${isFavorite ? 'bg-red-500/30 text-red-300 hover:bg-red-500/40 hover:shadow-red-500/30' : 'bg-white/15 hover:bg-white/30 hover:shadow-white/20 text-white'}`}
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
        <button
          onClick={handleShare}
          disabled={isCapturing}
          className={`p-3 backdrop-blur-md rounded-full text-white transition-all duration-300 active:scale-90 hover:shadow-lg ${isCapturing ? 'bg-white/30 cursor-wait' : 'bg-white/15 hover:bg-white/30 hover:shadow-white/20'}`}
          aria-label="이미지로 공유하기"
        >
          <Share2 size={24} />
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

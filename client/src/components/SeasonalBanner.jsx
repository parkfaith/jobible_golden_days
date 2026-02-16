import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const SeasonalBanner = ({ season, contents, onTap }) => {
  if (!season || contents.length === 0) return null;

  const bgImage = contents[0]?.bgImage;

  return (
    <section className="px-5 mb-6 mt-2">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onTap(contents)}
        className="relative w-full overflow-hidden rounded-2xl text-left"
        style={{ minHeight: '140px' }}
      >
        {/* 배경 이미지 */}
        {bgImage && (
          <img
            src={bgImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/55" />

        {/* 콘텐츠 */}
        <div className="relative z-10 h-full flex flex-col justify-end p-5" style={{ minHeight: '140px' }}>
          {/* 절기 배지 */}
          <span
            className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full w-fit mb-2"
            style={{ backgroundColor: season.color + '30', color: '#fff' }}
          >
            <span className="text-lg">{season.icon}</span>
            {season.label}
          </span>

          {/* 안내 문구 */}
          <div className="flex items-center justify-between">
            <p className="text-white/90 text-base font-medium">
              {contents.length}편의 특별 글귀 보기
            </p>
            <ChevronRight size={20} className="text-white/60" />
          </div>
        </div>
      </motion.button>
    </section>
  );
};

export default SeasonalBanner;

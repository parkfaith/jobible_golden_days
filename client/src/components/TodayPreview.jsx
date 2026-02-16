import React from 'react';
import { Heart } from 'lucide-react';

const CATEGORY_LABELS = {
  bible: '말씀',
  quote: '명언',
  proverb: '속담',
  poem: '시',
  writing: '글귀',
};

// 카테고리별 배지 배경색
const CATEGORY_COLORS = {
  bible: 'bg-amber-100 text-amber-800',
  quote: 'bg-blue-100 text-blue-800',
  proverb: 'bg-green-100 text-green-800',
  poem: 'bg-pink-100 text-pink-800',
  writing: 'bg-purple-100 text-purple-800',
};

const TodayPreview = ({ contents, favorites, onCardTap }) => {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-bold text-text px-5 mb-3">오늘의 이야기</h2>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-5 pb-2">
        {contents.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => onCardTap(idx)}
            className="relative flex-shrink-0 w-[160px] h-[220px] rounded-2xl overflow-hidden snap-start cursor-pointer active:scale-[0.97] transition-transform"
          >
            {/* 배경 이미지 */}
            <img
              src={item.bgImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* 어두운 오버레이 */}
            <div className="absolute inset-0 bg-black/45" />

            {/* 콘텐츠 */}
            <div className="relative z-10 h-full flex flex-col justify-between p-3">
              {/* 상단: 카테고리 배지 + 즐겨찾기 */}
              <div className="flex items-start justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-800'}`}>
                  {CATEGORY_LABELS[item.category] || item.category}
                </span>
                {favorites.includes(item.id) && (
                  <Heart size={14} className="text-red-400" fill="currentColor" />
                )}
              </div>

              {/* 하단: 인용문 + 저자 */}
              <div>
                <p className="text-white text-sm font-medium leading-snug line-clamp-3 break-keep mb-1">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <p className="text-white/70 text-xs truncate">
                  - {item.author}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TodayPreview;

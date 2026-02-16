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
    <section className="mb-8 pt-2">
      <h2 className="text-2xl font-bold text-text px-5 mb-4">오늘의 이야기</h2>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pl-5 pr-3 pb-2">
        {contents.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => onCardTap(idx)}
            className="relative flex-shrink-0 w-[200px] h-[260px] rounded-2xl overflow-hidden snap-start cursor-pointer active:scale-[0.97] transition-transform shadow-md"
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
            <div className="relative z-10 h-full flex flex-col justify-between p-4">
              {/* 상단: 카테고리 배지 + 즐겨찾기 */}
              <div className="flex items-start justify-between">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-800'}`}>
                  {CATEGORY_LABELS[item.category] || item.category}
                </span>
                {favorites.includes(item.id) && (
                  <Heart size={16} className="text-red-400" fill="currentColor" />
                )}
              </div>

              {/* 하단: 인용문 + 저자 */}
              <div>
                <p className="text-white text-base font-medium leading-snug line-clamp-3 break-keep mb-1.5">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <p className="text-white/70 text-sm truncate">
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

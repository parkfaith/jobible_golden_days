import React from 'react';
import { motion } from 'framer-motion';
import { categories } from '../data';

const CategoryGrid = ({ onCategoryTap }) => {
  // 빈 카테고리 필터링 (시, 글귀 등 콘텐츠 0개인 항목 숨김)
  const visibleCategories = categories.filter(cat => cat.items.length > 0);

  return (
    <section className="px-5 mb-8">
      <h2 className="text-2xl font-bold text-text mb-4">카테고리</h2>
      <div className="grid grid-cols-2 gap-3">
        {visibleCategories.map((cat) => (
          <motion.button
            key={cat.key}
            whileTap={{ scale: 0.97 }}
            onClick={() => onCategoryTap(cat.items)}
            className="relative overflow-hidden rounded-2xl text-left hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shadow-sm"
            style={{ minHeight: '120px' }}
          >
            {/* 배경 이미지 (첫 번째 항목의 bgImage) */}
            {cat.items[0]?.bgImage && (
              <img
                src={cat.items[0].bgImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {/* 어두운 오버레이 */}
            <div className="absolute inset-0 bg-black/55" />

            {/* 콘텐츠 */}
            <div className="relative z-10 h-full flex flex-col justify-end p-4" style={{ minHeight: '120px' }}>
              <span className="text-3xl mb-1">{cat.icon}</span>
              <span className="text-white text-lg font-bold">{cat.label}</span>
              <span className="text-white/60 text-sm">{cat.items.length}개</span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;

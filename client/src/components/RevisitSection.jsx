import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const CATEGORY_LABELS = {
  bible: '말씀',
  quote: '명언',
  proverb: '속담',
  poem: '시',
  writing: '글귀',
};

const CATEGORY_COLORS = {
  bible: 'bg-amber-100 text-amber-800',
  quote: 'bg-blue-100 text-blue-800',
  proverb: 'bg-green-100 text-green-800',
  poem: 'bg-pink-100 text-pink-800',
  writing: 'bg-purple-100 text-purple-800',
};

const RevisitSection = ({ contents, onCardTap }) => {
  if (!contents || contents.length === 0) return null;

  return (
    <section className="px-5 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <RotateCcw size={22} className="text-primary" />
        <h2 className="text-2xl font-bold text-text">다시 만나는 글귀</h2>
      </div>
      <div className="space-y-3">
        {contents.map((item, idx) => (
          <motion.div
            key={item.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCardTap(contents, idx)}
            className="relative overflow-hidden rounded-2xl cursor-pointer"
            style={{ minHeight: '100px' }}
          >
            <img
              src={item.bgImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />

            <div className="relative z-10 p-4 flex flex-col justify-end" style={{ minHeight: '110px' }}>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-2 ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-800'}`}>
                {CATEGORY_LABELS[item.category] || item.category}
              </span>
              <p className="text-white text-lg font-medium leading-snug line-clamp-2 break-keep">
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="text-white/70 text-base mt-1">- {item.author}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RevisitSection;

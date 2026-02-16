import bible from './bible.json';
import quotes from './quotes.json';
import proverbs from './proverbs.json';
import poems from './poems.json';
import writings from './writings.json';

// 카테고리 자동 부여
const withCategory = (items, category) =>
  items.map(item => ({ ...item, category }));

const allContent = [
  ...withCategory(bible, 'bible'),
  ...withCategory(quotes, 'quote'),
  ...withCategory(proverbs, 'proverb'),
  ...withCategory(poems, 'poem'),
  ...withCategory(writings, 'writing'),
];

// 카테고리 메타데이터 (CategoryGrid에서 사용)
export const categories = [
  { key: 'bible',   label: '말씀', icon: '📖', items: withCategory(bible, 'bible') },
  { key: 'quote',   label: '명언', icon: '💬', items: withCategory(quotes, 'quote') },
  { key: 'proverb', label: '속담', icon: '🌿', items: withCategory(proverbs, 'proverb') },
  { key: 'poem',    label: '시',   icon: '🌸', items: withCategory(poems, 'poem') },
  { key: 'writing', label: '글귀', icon: '✍️', items: withCategory(writings, 'writing') },
];

export default allContent;
export { bible, quotes, proverbs, poems, writings };

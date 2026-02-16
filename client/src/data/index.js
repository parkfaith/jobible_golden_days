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

export default allContent;
export { bible, quotes, proverbs, poems, writings };

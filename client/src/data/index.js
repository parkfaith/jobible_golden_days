import bible from './bible.json';
import quotes from './quotes.json';
import proverbs from './proverbs.json';
import poems from './poems.json';
import writings from './writings.json';
import seasonal from './seasonal.json';
import weather from './weather.json';
import seasons from './seasons.json';

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

// 절기 콘텐츠 (allContent에 포함하지 않음 — 일반 큐레이터 대상 아님)
export const seasonalContent = seasonal.map(item => ({ ...item, category: 'seasonal' }));
// 날씨 콘텐츠 (allContent에 포함하지 않음 — 날씨 배너 전용)
export const weatherContent = weather.map(item => ({ ...item, category: 'weather' }));
export { seasons };

export default allContent;
export { bible, quotes, proverbs, poems, writings };

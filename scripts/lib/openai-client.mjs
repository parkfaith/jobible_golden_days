import OpenAI from 'openai';

// DRY_RUN 모드에서는 OpenAI 클라이언트를 생성하지 않음
let client = null;
function getClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

const MAX_RETRIES = 3;

/**
 * OpenAI API를 호출하여 콘텐츠를 생성합니다.
 * 지수 백오프로 최대 3회 재시도합니다.
 *
 * @param {Object} promptConfig - { system, user } 프롬프트 설정
 * @param {Array} existing - 기존 콘텐츠 배열
 * @param {Array|null} extraContext - 추가 컨텍스트 (writing의 bible 교차 검사용)
 * @returns {Promise<Array>} 생성된 항목 배열
 */
export async function generateContent(promptConfig, existing, extraContext = null) {
  const userMessage = extraContext
    ? promptConfig.user(existing, extraContext)
    : promptConfig.user(existing);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await getClient().chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: promptConfig.system },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content.trim();

      // JSON 파싱 — 코드 블록으로 감싸진 경우 처리
      const jsonStr = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
      const parsed = JSON.parse(jsonStr);

      // OpenAI가 { items: [...] } 또는 [...] 형태로 반환할 수 있음
      const items = Array.isArray(parsed)
        ? parsed
        : (parsed.items || parsed.quotes || parsed.data || parsed.results || []);

      if (items.length >= 2) return items;

      console.warn(`  시도 ${attempt + 1}: ${items.length}개만 생성됨, 재시도...`);
    } catch (error) {
      console.error(`  시도 ${attempt + 1} 실패:`, error.message);
      if (attempt === MAX_RETRIES - 1) throw error;
      // 지수 백오프
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }

  return [];
}

/**
 * DRY_RUN 모드용 더미 데이터를 반환합니다.
 */
export function getDummyContent(category) {
  const dummies = {
    bible: [
      { quote: '[테스트] 여호와를 의지하는 자는 시온산이 요동치 아니하고 영원히 있음 같도다', author: '시편 125:1', source: '개역한글판' },
      { quote: '[테스트] 네 짐을 여호와께 맡기라 너를 붙드시리니 의인의 요동함을 영영히 허락지 아니하시리로다', author: '시편 55:22', source: '개역한글판' },
    ],
    quote: [
      { quote: '[테스트] 기도는 하나님과의 대화이며, 가장 높은 형태의 사랑입니다.', author: '아우구스티누스', source: '고백록, 공개 도메인 (354-430)' },
      { quote: '[테스트] 믿음이란 보이지 않는 것을 믿는 것이요, 그 보상은 믿는 것을 보게 되는 것이다.', author: '아우구스티누스', source: '설교집, 공개 도메인 (354-430)' },
    ],
    poem: [
      { quote: '[테스트] 내 주를 가까이 하게 함은 십자가 짐 같은 고생이나 내 일생 소원은 늘 찬송하면서 주께 더 가까이 가는 것', author: '사라 애덤스', source: '내 주를 가까이 하게 함은 (1841)' },
      { quote: '[테스트] 만세반석 열린 곳에 내가 숨으리 감사하는 이 마음을 늘 주께 드리리', author: '아우구스투스 톱레이디', source: '만세반석 (1763)' },
    ],
    writing: [
      { quote: '[테스트] 여호와를 경외하는 것이 지식의 근본이거늘 미련한 자는 지혜와 훈계를 멸시하느니라', author: '잠언 1:7', source: '성경 개역한글' },
      { quote: '[테스트] 범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라', author: '데살로니가전서 5:18', source: '성경 개역한글' },
    ],
  };

  return dummies[category] || [];
}

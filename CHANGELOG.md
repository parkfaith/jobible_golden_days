# Changelog

All notable changes to this project will be documented in this file.

## [2026-02-19]

### 캡처 이미지 폰트 화면 일치 (Fix Capture Font Mismatch)

- **캡처 이미지 폰트를 화면과 동일하게 수정**: `captureCard.js`의 폰트 매핑에서 `weather`/`seasonal` 카테고리가 빠져있어 화면(Nanum Myeongjo)과 캡처(Pretendard)가 불일치하던 문제 수정. `isSerif` 조건에 `weather`, `seasonal` 추가.

**수정 파일 목록 (Modified Files)**:

- `client/src/utils/captureCard.js` (isSerif 조건에 weather/seasonal 추가)
- `CHANGELOG.md`

### PC 공유 시 클립보드 이미지 복사 지원 (Add Clipboard Image Copy for PC)

- **Web Share API 미지원 시 클립보드 복사 우선**: PC 크롬 등에서 공유 버튼 클릭 시 `ClipboardItem` API로 이미지를 클립보드에 복사. 워드/카톡 등에 바로 `Ctrl+V`로 붙여넣기 가능. 클립보드 API 실패 시 기존 파일 다운로드로 폴백.

**수정 파일 목록 (Modified Files)**:

- `client/src/components/QuoteCard.jsx` (클립보드 이미지 복사 로직 추가)
- `CHANGELOG.md`

### 공유 이미지에서 설명(explanation) 제거 (Remove Explanation from Share Image)

- **캡처 이미지에서 explanation 텍스트 제거**: `captureCard.js`에서 explanation 렌더링 로직 및 높이 계산 제거. 공유 이미지는 본문 + 저자 + 워터마크만 포함하여 깔끔하게 정리.

**수정 파일 목록 (Modified Files)**:

- `client/src/utils/captureCard.js` (explanation 렌더링 제거)
- `client/src/components/QuoteCard.jsx` (explanation 파라미터 전달 제거)
- `CHANGELOG.md`

### 날씨 기반 콘텐츠 배너 추가 (Add Weather-Based Content Banner)

- **OpenWeatherMap API 연동**: 사용자 위치 기반 실시간 날씨 감지. 위치 권한 거부 시 서울 좌표 폴백. localStorage 캐시로 하루 1회만 API 호출 (자정/3시간 TTL 만료 시 갱신).
- **4가지 날씨 분류**: 맑음(sunny), 흐림(cloudy), 비(rain), 눈(snow). OWM 날씨 코드를 4가지로 매핑하여 해당 날씨에 어울리는 성경 구절 제공.
- **날씨별 성경 구절 13개**: sunny 4 + cloudy 3 + rain 3 + snow 3. 날씨 전용 배경 이미지 13장(bg-75~87) 추가 및 매칭.
- **WeatherBanner 컴포넌트**: SeasonalBanner와 동일한 레이아웃. 날씨 아이콘 + 도시명 + 온도 표시. 탭하면 해당 날씨 전체 콘텐츠를 CardViewer로 열기.
- **절기 우선 정책**: 설날/추석 등 절기 배너가 있으면 날씨 배너 숨김. 평상시에만 날씨 배너 표시.
- **graceful degradation**: API 키 미설정, 네트워크 오류, 오프라인 시 배너 자체를 숨겨서 UX 영향 없음.

**수정 파일 목록 (Modified Files)**:

- `client/src/data/weather.json` (신규 — 날씨별 성경 구절 13개)
- `client/src/utils/weatherService.js` (신규 — API 호출, 캐시, 분류 로직)
- `client/src/components/WeatherBanner.jsx` (신규 — 날씨 배너 UI)
- `client/src/data/index.js` (weatherContent export 추가)
- `client/src/pages/Home.jsx` (날씨 상태 관리 + 조건부 렌더링)
- `client/src/components/QuoteCard.jsx` (weather/seasonal 카테고리 라벨·폰트 추가)
- `client/.env`, `client/.env.example` (VITE_OPENWEATHER_API_KEY 추가)
- `CHANGELOG.md`, `CLAUDE.md`

### 날씨 전용 배경 이미지 13장 추가 (Add 13 Weather Background Images)

- **Unsplash 이미지 13장 추가**: bg-75~bg-87, 날씨 테마별 전용 이미지
  - 비(rain): bg-75(가로등+비), bg-76(유리창+빗방울), bg-77(풀잎+이슬)
  - 눈(snow): bg-78(눈+나무), bg-79(눈+나뭇가지), bg-80(눈덮인 숲)
  - 흐림(cloudy): bg-81(뭉게구름), bg-82(구름), bg-83(흐린하늘+몽생미셸)
  - 맑음(sunny): bg-84(호수풍경), bg-85(일출), bg-86(파란하늘+구름), bg-87(해변)
- **이미지 최적화**: 800px 리사이즈, JPEG q=70 — 총 1.1MB (13장)
- **weather.json 이미지 교체**: 기존 다른 카테고리 공유 이미지 → 날씨 전용 이미지로 전면 교체

**수정 파일 목록 (Modified Files)**:

- `client/public/images/bg-75.jpg ~ bg-87.jpg` (신규 13장)
- `client/src/data/weather.json` (bgImage 전면 교체)
- `CHANGELOG.md`, `CLAUDE.md`

### 명절 날짜 데이터 수정 (Fix Seasonal Holiday Date Ranges)

- **설날 2026 종료일 수정**: end `2026-02-19` → `2026-02-18` (연휴 다음날까지만 표시)
- **설날 2029/2030 날짜 보정**: 음력 변환 오류 수정 (2029: 2/11~2/15, 2030: 2/1~2/5)
- **추석 전체 연도 날짜 수정**: 2027년(`10/11~10/17` → `9/13~9/17`), 2030년(`10/7~10/13` → `9/10~9/14`) 등 음력 변환 오류 전면 수정. 나무위키 기준 정확한 양력 날짜로 교체
- **표시 범위 정책**: 법정 연휴(전날~다음날 3일) + 전후 하루 여유 = 총 5일간 배너 표시

**수정 파일 목록 (Modified Files)**:

- `client/src/data/seasons.json` (설날·추석 날짜 범위 전면 수정)
- `CHANGELOG.md`

## [2026-02-18]

### 공유 이미지 폰트 크기 개선 (Improve Share Image Font Size)

- **캡처 이미지 폰트 크기 화면과 동일하게 조정 (Match Capture Image Font Size with Screen)**: `captureCard.js`의 폰트 크기를 실제 화면 대비 정확한 비율(3배)로 조정. 본문 54px→108px (화면 36px×3), 저자 40px→72px (화면 24px×3), 설명 48px 추가 (화면 16px×3). Canvas 해상도 1080x1920 유지하여 파일 크기 최적화하면서도 화면과 동일한 시각적 경험 제공.
- **캡처 이미지에 설명 포함 (Include Explanation in Capture Image)**: seasonal 콘텐츠의 `explanation` 필드를 캡처 이미지에도 표시. 저자 이름 아래 작은 글씨로 렌더링하여 공유된 이미지에서도 명절과 구절의 연관성 확인 가능. `QuoteCard.jsx`에서 `renderCardToBlob` 호출 시 explanation 파라미터 전달.

**수정 파일 목록 (Modified Files)**:

- `client/src/utils/captureCard.js` (폰트 크기 3배 조정, explanation 렌더링 추가)
- `client/src/components/QuoteCard.jsx` (explanation 파라미터 전달)
- `CHANGELOG.md`

### 명절 콘텐츠 설명 추가 (Add Explanations for Seasonal Content)

- **명절 콘텐츠에 설명 필드 추가 (Add Explanation Field to Seasonal Content)**: `seasonal.json`의 모든 25개 항목에 `explanation` 필드 추가. 각 성경 구절과 명절의 연관성을 간략하게 설명하여 어르신들이 "왜 이 글귀가 이 명절에 나오는지" 쉽게 이해할 수 있도록 개선. 설날(새해 축복·건강·인도하심), 추석(감사·추수), 어버이날(부모 공경·효도), 크리스마스(예수 탄생·사랑), 새해(새로운 힘·새 일·우선순위) 등 명절 주제 명확화.
- **카드에 설명 표시 (Display Explanation on Card)**: `QuoteCard.jsx`에서 저자 이름 아래 설명을 작은 글씨(text-base/16px)로 표시. `content.explanation`이 있을 때만 조건부 렌더링하여 seasonal 콘텐츠에만 적용. 텍스트는 약간 투명(text-white/70)하게 처리하여 본문과 구분. 어르신 가독성을 위해 `leading-relaxed` 적용.

**수정 파일 목록 (Modified Files)**:

- `client/src/data/seasonal.json` (25개 항목 모두에 explanation 필드 추가)
- `client/src/components/QuoteCard.jsx` (설명 표시 로직 추가)
- `CHANGELOG.md`

### 프로젝트 규칙 및 명절 콘텐츠 기독교 테마 정책 확립 (Establish Christian Theme Policy for Project Rules & Seasonal Content)

- **CLAUDE.md에 컨텐츠 테마 정책 추가 (Add Content Theme Policy to Project Rules)**: 프로젝트 규칙에 "컨텐츠 테마 정책" 항목 신설. 모든 컨텐츠는 성경 말씀과 기독교 신앙에 기반해야 하며, 일반 명언/속담/비기독교 내용 금지 명시. 성경 구절(개역한글), 찬송가 가사, 기독교 사상가 명언만 허용. 저작권 확인 필수(저자 사망 후 70년 경과).
- **CLAUDE.md 전반 업데이트 (Update Project Documentation)**: Project Overview, Architecture, Key patterns, Technical Details, localStorage 키, 폰트 전략 섹션을 현재 상태에 맞게 전면 수정. 일일 콘텐츠 5개→7개, 폰트 크기 고정(large), 7일 중복 제거, proverbs 빈 배열, poems=찬송가, writings=성경 구절 반영.
- **명절/계절 컨텐츠 성경 구절로 전면 교체 (Replace All Seasonal Content with Bible Verses)**: `seasonal.json`의 비기독교 컨텐츠 13개를 성경 구절로 교체. 설날·새해(민수기 6:24, 시편 23:6, 잠언 3:5-6, 이사야 43:19, 빌립보서 4:4, 마태복음 6:33), 추석(데살로니가전서 5:18, 시편 107:1, 시편 106:1), 어버이날(잠언 1:8, 에베소서 6:1, 잠언 23:25), 크리스마스(요한일서 4:19)로 명절 의미에 맞는 성경 말씀 선정.
- **명절 콘텐츠 배경 이미지 재배치 (Rematch Seasonal Content Background Images)**: 각 성경 구절의 의미와 명절 분위기에 맞게 배경 이미지 11개 재배치. 설날(복→꽃bg-68, 여호와의 집→교회bg-58), 추석(감사→꽃bg-61/70, 성전 문→교회bg-57), 어버이날(부모 훈계/기쁨→꽃bg-62/66), 크리스마스(평화→겨울bg-73), 새해(독수리 날개→풍경bg-04, 기쁨→꽃bg-54, 그의 나라→교회bg-60). 구절 주제와 시각적 조화 강화.
- **전체 데이터 기독교 통일 완료 (Complete Christian Content Unification)**: 일반 데이터(bible 26개 + quotes 16개 + poems 15개 + writings 15개) + 명절 데이터(seasonal 25개) = 총 97개 콘텐츠 모두 성경/기독교 주제로 완전 통일. 프로젝트 정체성 확립.

**수정 파일 목록 (Modified Files)**:

- `CLAUDE.md` (컨텐츠 테마 정책 추가, 프로젝트 전반 현행화)
- `client/src/data/seasonal.json` (13개 비기독교 컨텐츠 → 성경 구절, 11개 배경 이미지 재배치)
- `CHANGELOG.md`

### 전체 콘텐츠 기독교 주제로 통일 (Unify All Content with Christian Theme)

- **속담 카테고리 완전 제거 (Remove Proverb Category)**: `proverbs.json`을 빈 배열로 변경. 속담 카테고리 및 관련 콘텐츠 완전 삭제. 카테고리 그리드에서 자동 숨김 처리됨.
- **시(poems)를 기독교 찬송시로 교체 (Replace Poems with Christian Hymns)**: 기존 한국 전통 시 15편을 기독교 찬송가 가사 15편으로 전면 교체. 어메이징 그레이스, 내 평생에 가는 길, 거룩 거룩 거룩, 내 주는 강한 성이요 등 저작권 만료된 전통 찬송가 수록.
- **글귀(writings)를 성경 구절로 교체 (Replace Writings with Bible Verses)**: 기존 일반 명언/지혜 글귀 15편을 성경 구절 15편으로 전면 교체. 시편, 잠언, 복음서, 서신서 등 위로와 소망의 말씀 중심. 개역한글판 사용 (저작권 만료).
- **콘텐츠 통일성 확보 (Ensure Content Consistency)**: 전체 콘텐츠가 성경(26개) + 기독교 명언(16개) + 찬송시(15개) + 성경 구절(15개) = 총 72개로 통일. 순수 기독교/성경 주제 PWA로 정체성 명확화.

**수정 파일 목록 (Modified Files)**:

- `client/src/data/proverbs.json` (빈 배열로 변경 - 속담 카테고리 제거)
- `client/src/data/poems.json` (15개 한국 시 → 15개 기독교 찬송시)
- `client/src/data/writings.json` (15개 일반 명언 → 15개 성경 구절)
- `CHANGELOG.md`

### UI 단순화 및 콘텐츠 확대 (Simplify UI & Expand Content)

- **일일 콘텐츠 7개로 확대 (Expand Daily Content to 7 Items)**: 기존 5개에서 7개로 증가. 성경 3~4개 + 명언/속담/시/글귀 3~4개로 카테고리 균형 유지. 어르신들께 충분한 영감 제공.
- **"다시 만나는 글귀" 섹션 제거 (Remove Revisit Section)**: 콘텐츠가 7개로 늘어남에 따라 중복 섹션 제거. 화면 단순화 및 스크롤 감소로 어르신 사용성 향상.
- **폰트 크기 조절 기능 제거 (Remove Font Size Toggle)**: 기본 폰트를 `text-4xl` (36px)로 크게 고정. 헤더의 폰트 조절 버튼 제거로 UI 단순화. 70대 이상 어르신께 최적화된 큰 폰트 제공.
- **오늘의 이야기 주석 업데이트 (Update Today's Story Comment)**: "가로 스크롤" → "세로 스택" 주석 정리.

**수정 파일 목록 (Modified Files)**:

- `client/src/utils/dailyCurator.js` (5개 → 7개 선택 로직)
- `client/src/pages/Home.jsx` (RevisitSection 제거, 폰트 조절 버튼 제거, fontSize 상태 제거)
- `client/src/components/CardViewer.jsx` (fontSize prop 제거)
- `client/src/components/QuoteCard.jsx` (fontSize prop 제거, 기본 폰트 text-4xl 고정)
- `CHANGELOG.md`

## [2026-02-17]

### 명언 콘텐츠 성경 주제로 전환 (Convert Quotes to Biblical Theme)

- **성경 관련 명언으로 전면 교체 (Replace with Biblical Quotes)**: 기존 일반 명언 16개를 기독교 역사상 위대한 성인, 신학자, 종교개혁가들의 명언으로 전면 교체. 신앙·사랑·기도·겸손·은혜 등 성경적 주제 중심. 모든 인물은 저작권 만료 (사후 70년 이상 경과).
- **명언 출처 인물 (Quote Authors)**: 아우구스티누스(고백록), 마틴 루터(종교개혁), 토마스 아퀴나스(신학대전), 찰스 스펄전(설교), 존 웨슬리(감리교), 이냐시오 로욜라(영신수련), 존 버니언(천로역정), 베르나르두스(클레르보), 아씨시의 프란치스코, 토마스 켐피스(그리스도를 본받아), 제롬(불가타), 윌리엄 템플(캔터베리), 요한 크리소스토무스(설교), 암브로시우스(밀라노), 그레고리우스 1세(교황), 성 패트릭(선교사).
- **배경 이미지 재매칭 (Rematch Background Images)**: 명언 내용에 맞게 배경 이미지를 성당/교회(bg-51,57~60,64,74), 꽃/자연(bg-62,63,65~66,68), 빛(bg-27) 이미지로 재배치. 신앙적 분위기와 조화.

**수정 파일 목록 (Modified Files)**:

- `client/src/data/quotes.json` (16개 명언 전면 교체 + bgImage 변경)
- `CHANGELOG.md`

### "오늘의 이야기" 레이아웃 개선 (Improve Today's Story Layout)

- **세로 스택 레이아웃으로 전환 (Switch to Vertical Stack Layout)**: 기존 가로 스크롤 방식을 세로 스택 레이아웃으로 전면 변경. "다시 만나는 글귀" 섹션과 동일한 스타일로 통일하여 UI 일관성 확보.
- **좌우 여백 문제 해결 (Fix Horizontal Padding Issue)**: 가로 스크롤 특성상 발생하던 카드가 화면 가장자리에 붙어 보이는 문제 완전 해결. 모든 섹션이 동일한 `px-5` (20px) 여백 적용.
- **카드 레이아웃 최적화 (Optimize Card Layout)**: 고정 크기(200x260px)에서 반응형 높이(최소 110px)로 변경. 인용문 라인 클램프 3줄 → 2줄로 조정하여 가독성 향상.
- **간편한 탐색 (Simplified Navigation)**: 5개 카드를 한눈에 확인 가능. 각 카드 탭 시 CardViewer에서 전체 내용 확인.

**수정 파일 목록 (Modified Files)**:

- `client/src/components/TodayPreview.jsx` (가로 스크롤 → 세로 스택 레이아웃 전환)
- `CHANGELOG.md`

## [2026-02-16]

### 배경 이미지 확충 + 글귀-이미지 테마 매칭 (Background Image Expansion & Quote-Image Matching)

- **새 배경 이미지 24장 추가 (Add 24 New Background Images)**: Unsplash 무료 이미지 24장을 `public/images/bg-51.jpg` ~ `bg-74.jpg`로 추가. 기존 풍경 위주에서 꽃(장미/목련/들꽃), 성당/교회 건축, 비/눈 자연 풍경 등 다양한 테마로 확장. 총 배경 이미지 74장.
- **글귀-이미지 테마 매칭 (Quote-Image Theme Matching)**: 글귀 내용과 이미지 분위기를 분석하여 최적 매칭 수행:
  - **성경 구절 → 성당/교회 이미지**: "여호와는 나의 목자시니" → 성당 회랑(bg-57), "하나님의 평강" → 교회 내부(bg-59), "나의 빛이요 나의 구원" → 빛이 드는 성당 창(bg-64), "감사함으로 그 문에 들어가며" → 스테인드글라스 성당(bg-74), "지존자의 은밀한 곳" → 중세 건물(bg-58) 등
  - **시 → 꽃/비/자연 이미지**: 진달래꽃 → 분홍 장미(bg-54), 산유화 → 만개한 들꽃(bg-55), 님의 침묵 → 비 맞는 흰 목련(bg-66), 꽃 → 밝은 핑크 장미(bg-68), 풀 → 빗방울 유리창 화분(bg-69), 겨울 편지 → 눈 덮인 단풍(bg-72) 등
  - **명언 → 분위기 매칭**: "가장 어두운 밤도 끝나고 해는 뜬다" → 눈 내리는 거리(bg-73), "인내는 쓰나 그 열매는 달다" → 진분홍 장미(bg-63) 등
  - **글귀 → 감성 매칭**: "행복은 습관이다" → 이슬 맺힌 빨강 장미(bg-62), "낙엽이 떨어지듯" → 붉은 꽃나무(bg-70) 등
  - **절기 콘텐츠 → 테마 매칭**: 크리스마스 → 성당/눈 이미지, 어버이날 → 꽃 이미지 등
- **기존 중복 이미지 해소 (Resolve Duplicate Images)**: 시/글귀 카테고리가 성경/명언과 동일 이미지를 재사용하던 문제 해소. 각 카테고리별 고유한 배경 이미지 확보.

**수정 파일 목록 (Modified Files)**:

- `client/public/images/bg-51.jpg` ~ `bg-74.jpg` (신규 24장)
- `client/src/data/bible.json` (8개 항목 bgImage 교체)
- `client/src/data/poems.json` (14개 항목 bgImage 교체)
- `client/src/data/writings.json` (6개 항목 bgImage 교체)
- `client/src/data/quotes.json` (6개 항목 bgImage 교체)
- `client/src/data/proverbs.json` (2개 항목 bgImage 교체)
- `client/src/data/seasonal.json` (6개 항목 bgImage 교체)
- `CHANGELOG.md`

### 콘텐츠 신선도 기능 (Content Freshness)

- **7일 중복 제거 (7-Day Deduplication)**: `dailyCurator.js`의 일일 콘텐츠 선택에 최근 7일 중복 방지 로직 추가. 과거 7일간 노출된 콘텐츠를 제외하고 새로운 항목 우선 선택. 폴백 안전장치 포함 (후보 부족 시 셔플 순서대로 채움). 결정론적 특성 유지 (localStorage 불필요, 순수 계산).
- **"다시 만나는 글귀" 섹션 (Revisit Section)**: 홈 화면에 8~14일 전 콘텐츠 중 오늘 미선택 항목 3개를 추천하는 섹션 추가. 배경 이미지 + 카테고리 배지 + 인용문 카드 형태. 탭 시 CardViewer 진입.
- **알고리즘 리팩토링 (Algorithm Refactoring)**: 기존 `getDailyContent` 내부 로직을 `_getRawDailyContent`(내부 함수)로 추출하여 과거 날짜 계산용으로 활용. `getRevisitContent` 신규 export 추가. 순환 참조 방지 설계 (과거 결과는 원본 로직으로 계산).

**수정 파일 목록 (Modified Files)**:

- `client/src/utils/dailyCurator.js` (7일 중복 제거 + getRevisitContent 추가)
- `client/src/components/RevisitSection.jsx` (신규 — "다시 만나는 글귀" UI)
- `client/src/pages/Home.jsx` (RevisitSection 통합)
- `CHANGELOG.md`

### Phase 2 Step 6: 시/좋은글 콘텐츠 확충 (Poems & Writings Content)

- **시(詩) 콘텐츠 15편 작성 (Add 15 Poems)**: 저작권 만료 한국 시인의 대표작 15편 추가 (ID 51~65). 김소월(3편), 윤동주(4편), 한용운(2편), 김영랑, 김춘수, 이상화, 김수영, 유치환, 이해인 각 1편. 진달래꽃, 서시, 별 헤는 밤, 님의 침묵, 꽃 등 어르신 세대에 친숙한 시 선정.
- **좋은글(글귀) 콘텐츠 15편 작성 (Add 15 Writings)**: 성경 구절 7편 + 전통 지혜/명언 8편 (ID 71~85). 시편 23편, 전도서 3장, 잠언, 이사야서 등 위로와 감사의 말씀. 세네카, 헬렌 켈러 등 저작권 만료 명언. 70대 이상 어르신에게 위로·감사·지혜를 전하는 글귀 중심.
- **카테고리 그리드 활성화 (Activate Category Grid)**: 기존 빈 배열이었던 시/글귀 카테고리에 콘텐츠가 추가되어 홈 화면 카테고리 그리드에 자동 표시. dailyCurator 일일 선택 풀에도 자동 포함.

**수정 파일 목록 (Modified Files)**:

- `client/src/data/poems.json` (빈 배열 → 15편)
- `client/src/data/writings.json` (빈 배열 → 15편)
- `CHANGELOG.md`

### Phase 2 Step 3+4: 절기 시스템 + 절기 콘텐츠 (Seasonal System & Content)

- **절기 자동 감지 (Auto Season Detection)**: 날짜 기반으로 5개 절기(설날, 추석, 어버이날, 크리스마스, 새해) 자동 감지. 음력 명절(설날/추석)은 2026~2030년 양력 날짜 하드코딩, 고정 기념일은 month/day ± range 계산. 우선순위: 명절 > 기념일.
- **절기 배너 (Seasonal Banner)**: 홈 상단에 절기 배너 자동 표시. 배경 이미지 + 아이콘 + 라벨 + 콘텐츠 수. 탭 시 CardViewer로 절기 전용 콘텐츠 탐색. 절기 없는 날에는 배너 숨김.
- **절기 콘텐츠 데이터 (Seasonal Content Data)**: 절기별 5편씩 총 25편 작성. 설날(덕담/성경), 추석(한가위 인사/성경), 어버이날(효도 명언/성경), 크리스마스(성탄 성경), 새해(소망 명언/성경). 기존 bg 이미지 재사용.
- **절기 달력 데이터 (Season Calendar Data)**: `seasons.json`에 5개 절기 정의. 음력 명절 2026~2030년 양력 변환 포함. 외부 API 불필요, 오프라인 지원.
- **seasonDetector 유틸리티 (Season Detector Utility)**: `detectCurrentSeason()` — 활성 절기 반환, `getSeasonalContent(key)` — 해당 절기 콘텐츠 필터링. allContent/dailyCurator에 영향 없음 (별도 관리).

**수정 파일 목록 (Modified Files)**:

- `client/src/data/seasons.json` (신규 — 절기 달력 데이터)
- `client/src/data/seasonal.json` (신규 — 절기 콘텐츠 25편)
- `client/src/data/index.js` (seasonal/seasons import + export 추가)
- `client/src/utils/seasonDetector.js` (신규 — 절기 감지 유틸리티)
- `client/src/components/SeasonalBanner.jsx` (신규 — 절기 배너 UI)
- `client/src/pages/Home.jsx` (배너 삽입 + useMemo)
- `CHANGELOG.md`

### Phase 2 Step 1~2: 카테고리 홈 & 오늘의 이야기 미리보기 (Category Hub & Today's Story Preview)

- **홈 화면 전면 재구성 (Redesign Home as Category Hub)**: 기존 전체화면 카드 뷰어를 세로 스크롤 카테고리 허브로 전환. 오늘의 이야기 미리보기 + 카테고리 그리드 + 즐겨찾기 섹션을 한 페이지에 배치.
- **CardViewer 분리 (Extract CardViewer Component)**: 전체화면 카드 뷰어를 별도 컴포넌트로 분리. 탭 시 fixed 오버레이로 표시하여 홈 스크롤 위치 보존. 뒤로가기 버튼 + 브라우저 뒤로가기(popstate) 지원.
- **오늘의 이야기 미리보기 (Today's Story Preview)**: 160x220px 가로 스크롤 미리보기 카드. snap 스크롤 + peek 효과(360px 뷰포트에서 1.8개 표시). 카테고리 배지 + 인용문 3줄 + 저자 표시.
- **카테고리 그리드 (Category Grid)**: 2열 그리드로 카테고리별 콘텐츠 탐색. 배경 이미지 + 어두운 오버레이 + 아이콘 + 라벨 + 콘텐츠 수 표시. 빈 카테고리(시, 글귀) 자동 숨김.
- **즐겨찾기 인라인 섹션 (Inline Favorites Section)**: 기존 모달 방식에서 홈 하단 인라인 섹션으로 변경. 저장된 글귀 목록을 바로 확인 가능.
- **달력 기능 제거 (Remove Calendar Feature)**: react-calendar 관련 코드 및 import 완전 제거. 단순화된 인터페이스.
- **categories 메타데이터 export (Add Categories Metadata)**: `data/index.js`에 `categories` 배열 export 추가. CategoryGrid에서 활용.
- **scrollbar-hide 유틸리티 (Add Scrollbar Hide Utility)**: 가로 스크롤 미리보기에서 스크롤바 숨김을 위한 CSS 유틸리티 추가.

**수정 파일 목록 (Modified Files)**:

- `client/src/components/CardViewer.jsx` (신규 — 전체화면 카드 뷰어)
- `client/src/components/TodayPreview.jsx` (신규 — 오늘의 이야기 가로 스크롤 미리보기)
- `client/src/components/CategoryGrid.jsx` (신규 — 카테고리 2열 그리드)
- `client/src/pages/Home.jsx` (전면 재작성 — 카테고리 허브 + view 상태 관리)
- `client/src/data/index.js` (categories export 추가)
- `client/src/index.css` (scrollbar-hide 유틸리티 추가)
- `CHANGELOG.md`

### 아이콘 & 로고 적용 (App Icon & Logo)

- **PWA 아이콘 적용 (Apply PWA Icons)**: 제공된 아이콘 이미지에서 PWA용 아이콘(192x192, 512x512), Apple Touch Icon(180x180), favicon(32x32) 생성 및 적용. 기존 favicon.svg 제거.
- **헤더 로고 이미지 교체 (Replace Header Logo)**: 기존 텍스트("joBiBle" + "Golden Days")를 로고 이미지(`logo.png`)로 교체.
- **PWA 설정 업데이트 (Update PWA Config)**: `vite.config.js`의 `includeAssets`에 favicon.png, logo.png, apple-touch-icon.png 추가. `index.html` favicon 경로를 PNG로 변경.

**수정 파일 목록 (Modified Files)**:

- `client/public/pwa-192x192.png` (신규 — PWA 아이콘 192x192)
- `client/public/pwa-512x512.png` (신규 — PWA 아이콘 512x512)
- `client/public/apple-touch-icon.png` (신규 — Apple Touch Icon 180x180)
- `client/public/favicon.png` (신규 — 파비콘 32x32)
- `client/public/logo.png` (신규 — 헤더 로고)
- `client/public/favicon.svg` (삭제)
- `client/src/pages/Home.jsx` (헤더 텍스트 → 로고 이미지)
- `client/vite.config.js` (includeAssets 업데이트)
- `client/index.html` (favicon 경로 변경)
- `CHANGELOG.md`

### 이미지 캡처 공유 기능 (Image Capture & Share)

- **이미지 캡처 공유 (Image Capture Share)**: 공유 버튼 탭 시 html2canvas로 카드 화면(배경 이미지 + 오버레이 + 글귀 + 저자)을 PNG 이미지로 캡처. Web Share API Level 2로 카카오톡/문자/갤러리 등에 이미지 파일 직접 공유 가능.
- **공유 폴백 체인 개선 (Improve Share Fallback Chain)**: 이미지 캡처 → Web Share API (파일 공유) → 이미지 다운로드 → 텍스트 클립보드 복사. 기존 카카오톡 SDK 직접 호출 제거 (Web Share API가 카카오톡 포함).
- **배경 이미지 방식 전환 (Switch Background to img Tag)**: CSS `background-image` → `<img>` 태그로 전환하여 html2canvas 호환성 확보.
- **캡처 영역 분리 (Separate Capture Area)**: 카드 콘텐츠(캡처 대상)와 UI 버튼(캡처 제외)을 구조적으로 분리. 캡처 이미지에 워터마크 "Golden Days" 추가.
- **로딩 오버레이 추가 (Add Loading Overlay)**: 캡처 진행 중 스피너 + "이미지 생성 중..." 메시지 표시. 중복 클릭 방지.
- **캡처 유틸리티 모듈 생성 (Create Capture Utility)**: `captureCard.js` — `captureElementToBlob`, `blobToFile`, `downloadBlob` 함수 분리.

**수정 파일 목록 (Modified Files)**:

- `client/src/utils/captureCard.js` (신규 — html2canvas 캡처 유틸리티)
- `client/src/components/QuoteCard.jsx` (공유 로직 재작성, 배경 img 전환, 캡처 영역 분리)
- `client/package.json` (html2canvas 의존성 추가)
- `CHANGELOG.md`

### 카테고리별 글자체 차별화 (Category-based Font Styling)

- **카테고리별 폰트 적용 (Apply Fonts per Category)**: 성경/시 → 나눔명조(Nanum Myeongjo, 격식·서정), 명언/속담 → Pretendard(기본, 가독성), 글귀 → 나눔펜스크립트(Nanum Pen Script, 캘리그래피). 저자 이름은 항상 Pretendard 유지.
- **Google Fonts CDN 추가 (Add Google Fonts)**: Nanum Myeongjo(400/700/800), Nanum Pen Script를 `index.css`에서 로드. Tailwind 테마에 `--font-serif`, `--font-handwriting` 변수 등록.

**수정 파일 목록 (Modified Files)**:

- `client/src/index.css` (Google Fonts import, 테마 변수 추가)
- `client/src/components/QuoteCard.jsx` (카테고리별 폰트 매핑 적용)
- `CHANGELOG.md`

### 즐겨찾기 & 폰트 크기 조절 기능 (Favorites & Font Size Adjustment)

- **즐겨찾기 기능 추가 (Add Favorites Feature)**: 카드 우하단에 하트 버튼 추가. 탭 시 localStorage에 저장/해제. 헤더에 즐겨찾기 목록 버튼(하트 아이콘 + 배지) 추가. 모달에서 저장된 글귀 목록 확인 및 선택 가능.
- **폰트 크기 토글 추가 (Add Font Size Toggle)**: 헤더에 글씨 크기 토글 버튼(Type 아이콘) 추가. 보통/크게 2단계. 설정은 localStorage에 저장되어 새로고침 후에도 유지.
- **헤더 레이아웃 개선 (Improve Header Layout)**: 우측에 글씨크기·즐겨찾기·달력 3개 버튼 나란히 배치.

**수정 파일 목록 (Modified Files)**:

- `client/src/pages/Home.jsx` (즐겨찾기 상태 관리, 헤더 버튼 3개, 즐겨찾기 모달)
- `client/src/components/QuoteCard.jsx` (하트 버튼 추가, fontSize prop 반영)
- `CHANGELOG.md`

### 콘텐츠 데이터 구조 개선 (Content Data Restructuring)

- **JSON 파일 카테고리별 분리 (Split JSON by Category)**: 기존 `quotes.json` 하나를 `bible.json`(26개), `quotes.json`(16개), `proverbs.json`(8개)으로 분리. 카테고리별 독립 관리 가능.
- **신규 카테고리 준비 (Add New Categories)**: `poems.json`(시), `writings.json`(글귀) 파일 생성 (빈 배열). 향후 콘텐츠 추가 시 해당 파일만 편집하면 됨.
- **데이터 병합 모듈 생성 (Create Data Index Module)**: `data/index.js`에서 전체 JSON을 병합하고 카테고리를 자동 부여. `dailyCurator.js`는 이 모듈에서 import.
- **카테고리 라벨 확장 (Extend Category Labels)**: QuoteCard에 '시', '글귀' 라벨 추가.

**수정 파일 목록 (Modified Files)**:

- `client/src/data/bible.json` (신규)
- `client/src/data/quotes.json` (명언만 분리)
- `client/src/data/proverbs.json` (신규)
- `client/src/data/poems.json` (신규, 빈 배열)
- `client/src/data/writings.json` (신규, 빈 배열)
- `client/src/data/index.js` (신규)
- `client/src/utils/dailyCurator.js` (import 경로 변경)
- `client/src/components/QuoteCard.jsx` (카테고리 라벨 추가)
- `CHANGELOG.md`

### 배경 이미지 로컬화 (Localize Background Images)

- **Unsplash 외부 이미지를 로컬 파일로 전환 (Replace External URLs with Local Images)**: 50개 배경 이미지를 Unsplash에서 다운로드(w=800, q=70)하여 `public/images/`에 저장. `quotes.json`의 `bgImage` 경로를 로컬 경로(`/images/bg-XX.jpg`)로 변경. 총 용량 약 5MB.
- **오프라인 완전 지원 (Full Offline Support)**: 이미지가 앱 번들에 포함되어 오프라인에서도 100% 표시. 구형 모바일 기기에서도 안정적으로 동작.
- **Workbox 런타임 캐싱 제거 (Remove Workbox Runtime Caching)**: 외부 URL 캐싱이 더 이상 불필요하여 `vite.config.js`에서 `workbox.runtimeCaching` 설정 제거.

**수정 파일 목록 (Modified Files)**:

- `client/src/data/quotes.json` (bgImage 경로 전환)
- `client/vite.config.js` (Workbox 런타임 캐싱 제거)
- `client/public/images/bg-01.jpg` ~ `bg-50.jpg` (신규 50개)
- `CHANGELOG.md`

### 카카오톡 공유 연동 (KakaoTalk Share Integration)

- **카카오톡 공유 기능 추가 (Add KakaoTalk Share)**: 카카오 JavaScript SDK 연동. Feed 템플릿으로 배경 이미지 + 명언 카드 형태 공유. 카카오 미연동 시 기존 Web Share API / 클립보드 복사로 폴백.
- **3단계 공유 폴백 구현 (Implement Share Fallback Chain)**: 카카오톡 → Web Share API → 클립보드 복사 순서로 폴백 처리.
- **환경변수 설정 (Add Environment Variable)**: `VITE_KAKAO_JS_KEY` 환경변수로 API 키 관리. `.env.example` 파일 생성.

**수정 파일 목록 (Modified Files)**:

- `client/src/components/QuoteCard.jsx`
- `client/src/main.jsx`
- `client/index.html`
- `client/.env.example` (New)
- `CHANGELOG.md`

## [2026-02-15]

### 콘텐츠 확충 (Content Expansion)

- **콘텐츠 데이터 대폭 확충 (Expand Content Data)**: `quotes.json`을 5개에서 50개로 확충. 성경 구절(개역한글판, 저작권 만료) 26개 + 명언/속담(저자 사후 70년 경과) 24개. 저작권 프리 콘텐츠만 사용하여 공유 기능 대비.
- **데이터 스키마 개선 (Improve Data Schema)**: `category` 필드 추가 (`bible`, `quote`, `proverb`), `source` 필드 추가 (출처 명시), `bgMusic` 필드 제거.
- **저작권 미달 명언 교체 (Replace Copyrighted Quotes)**: 잉그리드 버그만, 달라이 라마, 스티븐 코비 명언을 저작권 만료 명언으로 교체.

### 기능 개선 (Feature Improvements)

- **일일 콘텐츠 선택 로직 개선 (Improve Daily Curator Algorithm)**: 기존 단순 모듈러 해시를 Mulberry32 + Fisher-Yates 셔플로 교체. 카테고리 균형 보장 (성경 2~3개 + 명언/속담 2~3개). 50개 데이터에서 매일 다른 5개 조합 제공.
- **배경 음악 코드 제거 (Remove Background Music Code)**: Phase 1에서 음악 기능 제외. `QuoteCard.jsx`에서 `<audio>` 요소 삭제.

### 기본 완성도 개선 (Basic Completeness)

- **HTML 메타 정보 수정 (Fix HTML Meta Tags)**: `lang="en"` → `lang="ko"`, `<title>client</title>` → `<title>Golden Days</title>`, description·theme-color·Apple PWA 메타 태그 추가.
- **달력 버튼 접근성 개선 (Improve Calendar Button Accessibility)**: 터치 영역 확대 (`p-2` → `p-3`, 44px → 52px).

**수정 파일 목록 (Modified Files)**:

- `client/src/data/quotes.json` (전면 재작성)
- `client/src/utils/dailyCurator.js` (전면 재작성)
- `client/src/components/QuoteCard.jsx`
- `client/index.html`
- `client/src/pages/Home.jsx`
- `CHANGELOG.md`

### UX 개선 및 Phase 1 마무리 (UX Improvements & Phase 1 Finalization)

- **간편 공유 기능 추가 (Add Share Feature)**: Web Share API를 활용한 공유 버튼 추가. 미지원 브라우저에서는 클립보드 복사로 폴백. `QuoteCard.jsx`에 공유 버튼 구현.
- **스와이프 제스처 추가 (Add Swipe Gesture)**: 모바일에서 좌우 스와이프로 콘텐츠 전환 가능. 터치 이벤트 기반 50px 임계값 적용. `Home.jsx` 수정.
- **카테고리 태그 표시 (Show Category Tag)**: 콘텐츠 상단에 '말씀', '명언', '속담' 카테고리 태그 표시. `QuoteCard.jsx` 수정.
- **날짜 표시 추가 (Add Date Display)**: 현재 보고 있는 날짜를 "2026년 2월 15일 토요일" 형식으로 표시. `Home.jsx`, `QuoteCard.jsx` 수정.
- **명도 대비 강화 (Improve Contrast Ratio)**: 오버레이를 `bg-black/30`에서 `bg-black/50`으로 강화하여 PRD 명도 대비 7:1 기준에 근접.
- **달력 미래 날짜 제한 (Restrict Future Dates)**: `maxDate`를 오늘 날짜로 설정하여 미래 날짜 선택 방지. `Home.jsx` 수정.
- **CSS @import 순서 수정 (Fix CSS Import Order)**: Pretendard 폰트 import를 최상단으로 이동하여 빌드 경고 해소. `index.css` 수정.
- **PWA favicon 생성 (Create PWA Favicon)**: Golden Days 브랜드에 맞는 SVG favicon 생성. 기존 `vite.svg` 교체.
- **미사용 파일 정리 (Clean Up Unused Files)**: `assets/react.svg`, `public/vite.svg` 삭제.

**수정 파일 목록 (Modified Files)**:

- `client/src/components/QuoteCard.jsx`
- `client/src/pages/Home.jsx`
- `client/src/index.css`
- `client/index.html`
- `client/vite.config.js`
- `client/public/favicon.svg` (New)
- `client/public/vite.svg` (Deleted)
- `client/src/assets/react.svg` (Deleted)
- `CHANGELOG.md`

## [2026-02-14]

### 프로젝트 관리 (Project Management)

- **프로젝트 규칙 수립 (Established Project Rules)**: `PROJECT_RULES.md` 파일 생성. 언어, 주석, 설명, 변경 이력 관리에 대한 규칙 정의.
- **변경 이력 초기화 (Initialize Changelog)**: `CHANGELOG.md` 파일 생성 및 변경 이력 기록 시작.

**수정 파일 목록 (Modified Files)**:

- `PROJECT_RULES.md` (New)
- `CHANGELOG.md` (New)

### UI 개선 (UI Improvements)

- **네비게이션 버튼 위치 변경 (Relocate Navigation Buttons)**: 본문 텍스트 가림 방지를 위해 좌우 이동 버튼을 화면 하단 컨트롤 영역으로 이동. `Home.jsx` 수정.
- **달력 시작 요일 변경 (Calendar Start Day)**: 달력의 시작 요일을 일요일(Sunday)로 변경. `calendarType="gregory"` 적용.
- **달력 디자인 개선 (Calendar Redesign for Seniors)**: 어르신들이 보기 편하도록 폰트 크기 확대 및 명도 대비 개선. 날짜에서 '일' 글자 제거 (`formatDay` 적용). `calendar.css` 및 `Home.jsx` 수정.
- **헤더 타이틀 추가 (Add Header Title)**: 상단 'Golden Days' 위에 'joBiBle' 텍스트 추가.

**수정 파일 목록 (Modified Files)**:

- `client/src/pages/Home.jsx`
- `client/src/styles/calendar.css`

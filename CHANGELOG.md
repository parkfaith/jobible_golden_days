# Changelog

All notable changes to this project will be documented in this file.

## [2026-02-16]

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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Golden Days (joBiBle) — 70대 이상 어르신을 위한 일일 영감 PWA. 매일 성경 구절, 찬송가 가사, 기독교 명언을 아름다운 배경 이미지와 함께 제공. 모든 UI는 한국어이며 대형 텍스트, 고대비, 단순 네비게이션을 사용한다.

**컨텐츠 테마**: 모든 컨텐츠는 성경 말씀과 기독교 신앙에 기반합니다. 일반 명언, 속담, 비기독교 내용은 포함하지 않습니다.

## Commands

All commands run from `client/` directory:

```bash
cd client
npm run dev      # Vite 개발 서버 (HMR)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
npm run preview  # 프로덕션 빌드 미리보기
```

No test framework is configured yet.

### 자동화 스크립트 (`scripts/` directory)

```bash
cd scripts
npm install                                    # 의존성 설치 (openai)
node generate-content.mjs                      # 콘텐츠 자동 생성 (OPENAI_API_KEY 필요)
DRY_RUN=true node generate-content.mjs         # 더미 데이터로 테스트
```

GitHub Actions: 매주 월요일 09:00 KST 자동 실행 (`.github/workflows/weekly-content.yml`)

## Architecture

**Client-only SPA** — React 19 + Vite 7, no backend (Phase 2 planned for CMS).

```
client/src/
├── main.jsx              # 진입점
├── App.jsx               # Home 렌더링만 수행
├── pages/Home.jsx        # 메인 페이지 (상태 관리: view, favorites, todayContents, weather 등)
├── components/
│   ├── QuoteCard.jsx     # 명언 카드 + 즐겨찾기 + 공유 기능 (Canvas 캡처 → Web Share API → 클립보드 폴백)
│   ├── CardViewer.jsx    # 카드 뷰어 (좌우 스와이프)
│   ├── TodayPreview.jsx  # 오늘의 이야기 목록
│   ├── CategoryGrid.jsx  # 카테고리별 그리드
│   ├── SeasonalBanner.jsx # 명절/절기 배너
│   ├── WeatherBanner.jsx # 날씨 배너
│   └── InstallPrompt.jsx # PWA 설치 유도 배너
├── data/
│   ├── bible.json        # 성경 구절 - 주요 성경 말씀
│   ├── quotes.json       # 기독교 명언 - 기독교 사상가, 목사 명언
│   ├── poems.json        # 찬송가 가사 - 클래식 찬송가 (18-19세기)
│   ├── writings.json     # 성경 구절 - 추가 성경 말씀
│   ├── seasonal.json     # 명절/계절 컨텐츠 - 모두 성경 구절
│   ├── weather.json      # 날씨별 성경 구절 - 맑음/흐림/비/눈 4종
│   └── index.js          # 전체 병합 + 카테고리 자동 부여
├── utils/
│   ├── dailyCurator.js   # 날짜 기반 결정적 콘텐츠 선택 (Mulberry32 PRNG + Fisher-Yates 셔플)
│   ├── weatherService.js # OpenWeatherMap API 호출 + 날씨 분류 + localStorage 캐시
│   ├── captureCard.js    # Canvas 기반 카드 이미지 생성 (공유용)
│   └── seasonDetector.js # 명절/절기 감지
└── index.css             # Tailwind v4 테마 토큰 (@theme로 커스텀 색상 정의)

scripts/                    # 자동화 스크립트 (프론트엔드 런타임과 분리)
├── package.json            # openai 의존성
├── generate-content.mjs    # 메인 콘텐츠 생성 스크립트
└── lib/
    ├── openai-client.mjs   # OpenAI API 래퍼 (gpt-4o, 3회 재시도, DRY_RUN 지원)
    ├── prompts.mjs         # 카테고리별 시스템/유저 프롬프트
    ├── id-manager.mjs      # 전역 max ID + 1 순차 할당
    ├── image-allocator.mjs # 미사용 이미지 우선 할당 → 최소 사용 재사용
    ├── validator.mjs       # 스키마 검증 + 중복 검사 (텍스트/장절)
    └── json-updater.mjs    # JSON 읽기/쓰기 유틸

.github/workflows/
└── weekly-content.yml      # 매주 월요일 09:00 KST 자동 실행 (OpenAI → JSON 추가 → 커밋/푸시)
```

**Key patterns:**
- 라우팅 없음 — 단일 페이지, React Router 미사용
- 상태 관리 라이브러리 없음 — useState/useRef만 사용, 모든 상태는 Home.jsx에서 관리
- 즐겨찾기는 localStorage에 저장 (`golden-days-favorites`)
- 폰트 크기는 고정 (large, 36px) — 70대 이상 어르신 최적화
- `dailyCurator.js`가 날짜별로 동일한 7개 콘텐츠를 결정적으로 선택 (카테고리 균형: 성경 3~4개 + 기타 3~4개)
- 7일 중복 제거 — 최근 7일간 나왔던 콘텐츠 제외
- 배경 이미지는 로컬 파일 (`public/images/bg-XX.jpg`, 각 JSON의 `bgImage` 필드)

**Styling:** Tailwind CSS v4 (CSS-first config via `@theme` in `index.css`, not `tailwind.config.js`). 커스텀 색상: primary(`#8B9D83` Sage Green), secondary(`#E5E1D8` Sand Beige), accent(`#3A4D39`), text(`#2C3E50`). 폰트: Pretendard Variable(기본), Nanum Myeongjo(성경/시), Nanum Pen Script(글귀) — 카테고리별 차별화. Tailwind 변수: `--font-sans`, `--font-serif`, `--font-handwriting`.

**PWA:** `vite-plugin-pwa` with Workbox, `autoUpdate` 전략. manifest와 서비스 워커는 `vite.config.js`에서 설정.

**Environment:** `VITE_OPENWEATHER_API_KEY` — OpenWeatherMap API 키 (`.env` 파일, 미설정 시 날씨 배너 숨김). `OPENAI_API_KEY` — OpenAI API 키 (GitHub Secrets, 주간 콘텐츠 자동 생성용).

## Tech Stack

| 구분 | 기술 | 버전 |
|------|------|------|
| Framework | React | 19.2 |
| Build Tool | Vite | 7.3 |
| CSS | Tailwind CSS | 4.1 (CSS-first, `@theme`) |
| Animation | Framer Motion | 12.x |
| Icons | Lucide React | 0.564 |
| PWA | vite-plugin-pwa (Workbox) | 1.2 |
| Lint | ESLint | 9.x |
| 외부 API | OpenWeatherMap | 무료 tier (날씨 배너) |
| 자동화 | GitHub Actions + OpenAI API (gpt-4o) | 매주 월요일 콘텐츠 자동 생성 |

**사용하지 않는 것들:** React Router(라우팅 없음), 상태 관리 라이브러리(Redux/Zustand 등), 백엔드/DB(Phase 2 예정), 테스트 프레임워크(미설정)

## Technical Details

### 일일 콘텐츠 선택 알고리즘 (`dailyCurator.js`)
1. 날짜 → 시드 변환: `year * 10000 + month * 100 + day` (같은 날짜 = 같은 시드)
2. **Mulberry32** PRNG로 의사 난수 생성 (균등 분포, 결정론적)
3. **Fisher-Yates 셔플**로 카테고리별 콘텐츠 무작위 정렬 (편향 없음)
4. 성경 3~4개 + 기타(찬송가/명언) 3~4개 = 총 7개 선택
5. **7일 중복 제거**: 최근 7일간 나왔던 콘텐츠 제외하여 신선함 유지
6. 최종 7개를 다시 셔플하여 카테고리 순서 섞기

### 데이터 구조
- JSON 파일에 `category` 필드 없음 → `data/index.js`에서 import 시 자동 부여
- **일반 콘텐츠 스키마**: `{ id, quote, author, source, bgImage }`
- **명절 콘텐츠 스키마**: `{ id, quote, author, source, bgImage, season, explanation }`
  - `season`: 명절 이름 (설날, 추석, 어버이날, 크리스마스, 새해)
  - `explanation`: 해당 구절과 명절의 연관성 설명 (선택적, seasonal.json만 사용)
- **날씨 콘텐츠 스키마**: `{ id, quote, author, source, bgImage, weather, explanation }`
  - `weather`: 날씨 분류 (sunny, cloudy, rain, snow)
  - `explanation`: 날씨와 구절의 연관성 설명
- 카테고리 추가 시: 해당 JSON 파일에 항목 추가 → `data/index.js`에 import만 하면 자동 반영

### 공유 기능 폴백 체인 (`QuoteCard.jsx` + `captureCard.js`)
1. **Canvas 이미지 캡처** → `renderCardToBlob()`으로 카드 이미지 생성
2. **Web Share API** (`navigator.share`) — 모바일 기본 공유 시트 (이미지 첨부)
3. **클립보드 이미지 복사** (`navigator.clipboard.write`) — PC 폴백
4. **이미지 다운로드** — 최종 폴백

### localStorage 키
| 키 | 값 형식 | 용도 |
|---|---------|------|
| `golden-days-favorites` | `number[]` (id 배열) | 즐겨찾기 목록 |
| `golden-days-weather` | `{ timestamp, data: { weather, temp, description, city } }` | 날씨 API 캐시 (3시간/자정 만료) |
| `golden-days-install-dismissed` | `'true'` | PWA 설치 배너 닫기 상태 |

### 이미지
- 87장 로컬 저장 (`public/images/bg-01.jpg` ~ `bg-87.jpg`)
- Unsplash 원본에서 w=800, q=70으로 최적화 다운로드
- 테마: 풍경(bg-01~50), 꽃/장미/목련(bg-54~55,61~63,65~66,68,70), 성당/교회(bg-51,57~60,64,74), 비/눈/겨울(bg-52~53,56,67,69,71~73), 날씨 전용: 비(bg-75~77), 눈(bg-78~80), 흐림(bg-81~83), 맑음(bg-84~87)
- PWA precache에 포함되어 오프라인에서도 표시

### 폰트 전략
| Tailwind 클래스 | 폰트 | 적용 카테고리 |
|----------------|------|-------------|
| `font-sans` | Pretendard Variable | 명언(quotes), 저자 이름(전체) |
| `font-serif` | Nanum Myeongjo | 성경(bible), 찬송가(poems) |
| `font-handwriting` | Nanum Pen Script | 글귀(writings) |

**폰트 크기**: 모든 텍스트는 고정 large 사이즈 (text-4xl/36px) — 70대 이상 어르신 가독성 최적화

## Project Rules (필수 준수)

1. **언어**: 모든 응답과 코드 주석은 **한국어**로 작성. 기술 용어는 영어 병기 가능 (예: 변수(Variable))
2. **CHANGELOG.md**: 코드 수정 후 반드시 업데이트 — 날짜, 카테고리, 상세 내용, 수정 파일 목록 포함
3. **대상 사용자**: 70대 이상 어르신 — 터치 영역 44px+, 대형 텍스트(text-3xl/4xl), 고대비(7:1), 단순한 인터페이스
4. **컨텐츠 테마 정책**:
   - 모든 컨텐츠는 **성경 말씀**과 **기독교 신앙**에 기반해야 함
   - 허용되는 컨텐츠: 성경 구절(개역한글), 찬송가 가사, 기독교 사상가/목사 명언
   - 금지되는 컨텐츠: 일반 명언, 속담, 비기독교 종교/철학 내용
   - 새 컨텐츠 추가 시 저작권 확인 필수 (저자 사망 후 70년 경과 또는 퍼블릭 도메인)

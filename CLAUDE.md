# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Golden Days (joBiBle) — 70대 이상 어르신을 위한 일일 영감 PWA. 매일 성경 구절, 명언, 속담을 아름다운 배경 이미지와 함께 제공. 모든 UI는 한국어이며 대형 텍스트, 고대비, 단순 네비게이션을 사용한다.

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

## Architecture

**Client-only SPA** — React 19 + Vite 7, no backend (Phase 2 planned for CMS).

```
client/src/
├── main.jsx              # 진입점, Kakao SDK 초기화
├── App.jsx               # Home 렌더링만 수행
├── pages/Home.jsx        # 메인 페이지 (상태 관리: selectedDate, contents, currentIndex, showCalendar, favorites, fontSize)
├── components/QuoteCard.jsx  # 명언 카드 + 즐겨찾기 + 공유 기능 (카카오톡 → Web Share API → 클립보드 폴백)
├── data/
│   ├── bible.json        # 성경 구절 (26개)
│   ├── quotes.json       # 명언 (16개)
│   ├── proverbs.json     # 속담 (8개)
│   ├── poems.json        # 시 (확장용)
│   ├── writings.json     # 좋은 글귀 (확장용)
│   └── index.js          # 전체 병합 + 카테고리 자동 부여
├── utils/dailyCurator.js # 날짜 기반 결정적 콘텐츠 선택 (Mulberry32 PRNG + Fisher-Yates 셔플)
├── styles/calendar.css   # react-calendar 스타일 오버라이드
└── index.css             # Tailwind v4 테마 토큰 (@theme로 커스텀 색상 정의)
```

**Key patterns:**
- 라우팅 없음 — 단일 페이지, React Router 미사용
- 상태 관리 라이브러리 없음 — useState/useRef만 사용, 모든 상태는 Home.jsx에서 관리
- 즐겨찾기/폰트 크기 설정은 localStorage에 저장 (`golden-days-favorites`, `golden-days-font-size`)
- `dailyCurator.js`가 날짜별로 동일한 5개 콘텐츠를 결정적으로 선택 (카테고리 균형: 성경 2~3개 + 명언/속담 2~3개)
- 배경 이미지는 로컬 파일 (`public/images/bg-XX.jpg`, 각 JSON의 `bgImage` 필드)

**Styling:** Tailwind CSS v4 (CSS-first config via `@theme` in `index.css`, not `tailwind.config.js`). 커스텀 색상: primary(`#8B9D83` Sage Green), secondary(`#E5E1D8` Sand Beige), accent(`#3A4D39`), text(`#2C3E50`). 폰트: Pretendard Variable(기본), Nanum Myeongjo(성경/시), Nanum Pen Script(글귀) — 카테고리별 차별화. Tailwind 변수: `--font-sans`, `--font-serif`, `--font-handwriting`.

**PWA:** `vite-plugin-pwa` with Workbox, `autoUpdate` 전략. manifest와 서비스 워커는 `vite.config.js`에서 설정.

**Environment:** `VITE_KAKAO_JS_KEY` — 카카오톡 공유 SDK 키 (`.env` 파일).

## Tech Stack

| 구분 | 기술 | 버전 |
|------|------|------|
| Framework | React | 19.2 |
| Build Tool | Vite | 7.3 |
| CSS | Tailwind CSS | 4.1 (CSS-first, `@theme`) |
| Animation | Framer Motion | 12.x |
| Icons | Lucide React | 0.564 |
| Calendar | react-calendar | 6.0 |
| PWA | vite-plugin-pwa (Workbox) | 1.2 |
| Lint | ESLint | 9.x |
| 외부 SDK | Kakao JavaScript SDK | 2.7.4 (CDN) |

**사용하지 않는 것들:** React Router(라우팅 없음), 상태 관리 라이브러리(Redux/Zustand 등), 백엔드/DB(Phase 2 예정), 테스트 프레임워크(미설정)

## Technical Details

### 일일 콘텐츠 선택 알고리즘 (`dailyCurator.js`)
1. 날짜 → 시드 변환: `year * 10000 + month * 100 + day` (같은 날짜 = 같은 시드)
2. **Mulberry32** PRNG로 의사 난수 생성 (균등 분포, 결정론적)
3. **Fisher-Yates 셔플**로 카테고리별 콘텐츠 무작위 정렬 (편향 없음)
4. 성경 2~3개 + 기타(명언/속담) 2~3개 = 총 5개 선택
5. 최종 5개를 다시 셔플하여 카테고리 순서 섞기

### 데이터 구조
- JSON 파일에 `category` 필드 없음 → `data/index.js`에서 import 시 자동 부여
- 콘텐츠 스키마: `{ id, quote, author, source, bgImage }`
- 카테고리 추가 시: 해당 JSON 파일에 항목 추가 → `data/index.js`에 import만 하면 자동 반영

### 공유 기능 폴백 체인 (`QuoteCard.jsx`)
1. **카카오톡 SDK** (`window.Kakao.Share.sendDefault`) — Feed 템플릿
2. **Web Share API** (`navigator.share`) — 모바일 기본 공유 시트
3. **클립보드 복사** (`navigator.clipboard.writeText`) — 최종 폴백

### localStorage 키
| 키 | 값 형식 | 용도 |
|---|---------|------|
| `golden-days-favorites` | `number[]` (id 배열) | 즐겨찾기 목록 |
| `golden-days-font-size` | `"normal"` \| `"large"` | 폰트 크기 설정 |

### 이미지
- 74장 로컬 저장 (`public/images/bg-01.jpg` ~ `bg-74.jpg`)
- Unsplash 원본에서 w=800, q=70으로 최적화 다운로드
- 테마: 풍경(bg-01~50), 꽃/장미/목련(bg-54~55,61~63,65~66,68,70), 성당/교회(bg-51,57~60,64,74), 비/눈/겨울(bg-52~53,56,67,69,71~73)
- PWA precache에 포함되어 오프라인에서도 표시

### 폰트 전략
| Tailwind 클래스 | 폰트 | 적용 카테고리 |
|----------------|------|-------------|
| `font-sans` | Pretendard Variable | 명언, 속담, 저자 이름(전체) |
| `font-serif` | Nanum Myeongjo | 성경, 시 |
| `font-handwriting` | Nanum Pen Script | 글귀 |

## Project Rules (필수 준수)

1. **언어**: 모든 응답과 코드 주석은 **한국어**로 작성. 기술 용어는 영어 병기 가능 (예: 변수(Variable))
2. **CHANGELOG.md**: 코드 수정 후 반드시 업데이트 — 날짜, 카테고리, 상세 내용, 수정 파일 목록 포함
3. **대상 사용자**: 70대 이상 어르신 — 터치 영역 44px+, 대형 텍스트(text-3xl/4xl), 고대비(7:1), 단순한 인터페이스

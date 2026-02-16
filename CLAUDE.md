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

## Project Rules (필수 준수)

1. **언어**: 모든 응답과 코드 주석은 **한국어**로 작성. 기술 용어는 영어 병기 가능 (예: 변수(Variable))
2. **CHANGELOG.md**: 코드 수정 후 반드시 업데이트 — 날짜, 카테고리, 상세 내용, 수정 파일 목록 포함
3. **대상 사용자**: 70대 이상 어르신 — 터치 영역 44px+, 대형 텍스트(text-3xl/4xl), 고대비(7:1), 단순한 인터페이스

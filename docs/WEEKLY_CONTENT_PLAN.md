# 주간 자동 콘텐츠 생성 시스템 구현 계획

> 작성일: 2026-02-20

## Context
현재 콘텐츠 풀(72개)이 한정되어 있어 매일 7개씩 선택하면 반복이 빈번합니다. OpenAI API로 매주 카테고리별 2개씩(총 8개) 새 콘텐츠를 자동 생성하고, GitHub Actions가 JSON 파일을 업데이트 후 자동 커밋/푸시합니다.

---

## 신규 파일 구조

```
scripts/
├── package.json                  # openai 의존성
├── generate-content.mjs          # 메인 스크립트
└── lib/
    ├── openai-client.mjs         # OpenAI API 래퍼 (gpt-4o, 3회 재시도)
    ├── prompts.mjs               # 카테고리별 시스템/유저 프롬프트
    ├── id-manager.mjs            # 전역 max ID + 1 순차 할당
    ├── image-allocator.mjs       # 미사용 이미지 우선 → 최소 사용 재사용
    ├── validator.mjs             # 스키마 검증 + 중복 검사
    └── json-updater.mjs          # JSON 읽기/쓰기 유틸
.github/workflows/
└── weekly-content.yml            # 매주 월요일 09:00 KST 자동 실행
```

---

## 핵심 설계

### 실행 흐름
1. 4개 JSON 파일 로드 (bible, quotes, poems, writings)
2. 전역 최대 ID 계산 → 다음 ID 8개 예약
3. 미사용 이미지 목록 생성 (bg-75~87 날씨 전용 제외)
4. 카테고리별 OpenAI API 호출 (4회, 각 2개 생성)
5. 응답 파싱 → 스키마 검증 → 중복 검사
6. ID + 이미지 할당 → 각 JSON 파일에 append
7. GitHub Actions가 변경 감지 시 자동 커밋/푸시

### ID 전략
- 전체 JSON에서 숫자 ID만 수집 → max + 1부터 순차 할당
- 현재 max = 85, 첫 실행 시 86~93 할당
- 카테고리 간 충돌 없음

### 이미지 전략
- 미사용 이미지 ~27장 우선 할당 (bg-75~87 날씨 전용 제외)
- 소진 시(~3개월 후) 최소 사용 이미지 재사용

### 프롬프트 설계 (카테고리별)

| 카테고리 | 콘텐츠 | author 형식 | source 형식 |
|----------|--------|-------------|-------------|
| **bible** | 개역한글판 성경 구절 | "권명 장:절" (예: 시편 23:1) | "개역한글판" |
| **quote** | 기독교 사상가 명언 (사후 70년+) | "인물 이름" (예: 마틴 루터) | "출처, 공개 도메인 (생년-몰년)" |
| **poem** | 클래식 찬송가 가사 (저작권 만료) | "작사자 이름" (예: 존 뉴턴) | "찬송가 이름 (연도)" |
| **writing** | 개역한글판 성경 구절 (bible과 다른 구절) | "권명 장:절" | "성경 개역한글" |

- 각 프롬프트에 **기존 전체 콘텐츠 목록** 포함하여 중복 방지
- writing은 bible과 **교차 중복 검사** 수행

### 검증 로직
- **스키마 검증**: quote/author/source 필수, 카테고리별 형식 검증
- **중복 검사**: 텍스트 완전 일치 + 부분 포함 + 동일 author(장절) 검사
- **부분 실패 허용**: 4개 카테고리 중 일부만 성공해도 성공분만 커밋

### 에러 처리

| 시나리오 | 처리 방식 |
|----------|----------|
| API 키 미설정 | 프로세스 즉시 종료 (exit code 1) |
| API 호출 실패 | 지수 백오프 3회 재시도, 최종 실패 시 해당 카테고리 건너뜀 |
| 스키마 검증 실패 | 유효하지 않은 항목 제거, 유효한 것만 추가 |
| 중복 감지 | 중복 항목 제거, 부족분은 다음 주에 보충 |
| 0개 추가 | 커밋 건너뜀 (워크플로우는 성공 종료) |

---

## GitHub Actions 워크플로우

- **스케줄**: `cron: '0 0 * * 1'` (매주 월요일 00:00 UTC = KST 09:00)
- **수동 실행**: `workflow_dispatch` 지원 (Actions 탭에서 Run workflow)
- **Secrets 필요**: `OPENAI_API_KEY` (GitHub repo Settings → Secrets에 설정)
- **GITHUB_TOKEN**: 자동 제공 (`permissions: contents: write`)
- **커밋 형식**: `주간 콘텐츠 자동 추가 (2026-02-24)`

---

## 구현 순서

| 단계 | 작업 | 비고 |
|------|------|------|
| 1 | `scripts/package.json` 생성 | openai 의존성 |
| 2 | `scripts/lib/` 유틸 모듈 6개 생성 | 각각 단독 테스트 가능 |
| 3 | `scripts/generate-content.mjs` 메인 스크립트 | 전체 통합 |
| 4 | 로컬 DRY_RUN 테스트 | `DRY_RUN=true node scripts/generate-content.mjs` |
| 5 | 로컬 실제 테스트 | `OPENAI_API_KEY=... node scripts/generate-content.mjs` |
| 6 | `.github/workflows/weekly-content.yml` 생성 | GitHub Actions |
| 7 | CHANGELOG.md, CLAUDE.md 업데이트 | 문서 반영 |
| 8 | 커밋/푸시 후 GitHub Secrets 설정 | OPENAI_API_KEY |
| 9 | `workflow_dispatch`로 수동 테스트 | Actions 탭에서 실행 |

---

## 검증 체크리스트

- [ ] `DRY_RUN=true node scripts/generate-content.mjs` — 더미 데이터로 파일 쓰기 확인
- [ ] `OPENAI_API_KEY=... node scripts/generate-content.mjs` — 실제 API 호출 + JSON 업데이트 확인
- [ ] 생성된 콘텐츠의 ID가 기존과 충돌하지 않는지 확인
- [ ] 생성된 콘텐츠가 기존 콘텐츠와 중복되지 않는지 확인
- [ ] GitHub Actions 탭에서 `workflow_dispatch`로 수동 실행 테스트
- [ ] 자동 커밋 메시지 형식 확인

---

## 비용 및 제약

- **비용**: gpt-4o 주 4회 호출, 월 ~$1 이하
- **프롬프트 크기**: 기존 콘텐츠가 수백 개 초과 시 author만 전달하는 방식으로 전환 필요
- **정확도 한계**: LLM 특성상 개역한글판/찬송가 가사의 100% 정확도 보장 불가 → 주기적 사람 검수 권장
- **배포 연동**: 콘텐츠 커밋 후 사이트 재빌드/배포 파이프라인 필요 (별도 설정)

---

## 사전 준비 사항

1. **OpenAI API 키 발급**: https://platform.openai.com/api-keys
2. **GitHub Secrets 설정**: repo Settings → Secrets and variables → Actions → `OPENAI_API_KEY` 추가
3. **GitHub Actions 활성화**: repo Settings → Actions → General → Allow all actions

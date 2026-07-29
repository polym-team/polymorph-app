# DirectFeedback — 프로덕션 사이트 타겟팅 계획

스토리북 전용이던 DirectFeedback을 **실제 운영 서비스**에서도 쓸 수 있게 확장한다.
모든 요소가 아니라 **사용자가 그룹에 등록한 조건(도메인 + CSS 선택자)에 맞는 컴포넌트만**
코멘트/스냅샷 대상으로 삼는다.

## 배경 / 동기

- 예: `daum-ui`는 컴포넌트 클래스에 `daum-ui-<hash>-<component>__<part>` 프리픽스를 붙인다.
  엘리먼트 구조만으로는 컴포넌트 경계를 알 수 없지만, `[class*="daum-ui-"]`로 대상을 한정할 수 있다.
- 팀이 같은 사이트에 일관되게 피드백하려면 타겟 설정이 **팀 공유(그룹/서버)**여야 한다.

## 확정된 설계 결정 (2026-07-29)

1. **설정 위치 = 그룹(백엔드)**. 개인 로컬 설정(chrome.storage) 아님 — 팀 공유가 목적.
2. **주입 모델 = A 하이브리드**.
   - 스토리북(localhost/CDN): 기존 정적 `content_scripts` 그대로 (무회귀).
   - 프로덕션 임의 도메인: `activeTab` + `chrome.scripting.executeScript` **온디맨드 주입**.
   - 등록 도메인은 "주입 권한 목록"이 아니라 "어느 그룹·어떤 선택자인지" 조회용.
3. **음영 대신 선택 제한 + 아웃라인**. 전체 dim/스포트라이트는 후순위.
4. **타겟 단위 = 매칭 필터 + 방향키 순회**. 컴포넌트 경계 자동판별은 안 함.
   - hover = 커서 밑 최내측 매칭 요소(`el.closest(선택자)`), ↑/↓ = 매칭 조상/자식 체인만 순회.
   - `@polym-team/element-inspector` 재사용(skip = 비매칭).

## 데이터 모델 (Prisma, direct-feedback)

Group에 N개 붙는 신규 모델. urlKey는 스키마 변경 없음(프로덕션은 `origin+pathname` 폴백).

```
model SiteProfile {
  id, groupId (→ Group, onDelete: Cascade)
  name            // "Daum PC" 라벨
  domainPatterns  // comma-sep 호스트 패턴: "v.daum.net,*.daum.net"
  targetSelectors // newline-sep CSS 선택자(콤마 포함 가능 → 줄바꿈 구분)
  createdAt, updatedAt
  @@index([groupId])
}
```

- 런타임: `targetSelectors`를 콤마로 합쳐 `querySelectorAll`.
- 도메인 매칭: 정확 일치 또는 `*.` 접두(suffix). `v.daum.net`은 `*.daum.net`·`v.daum.net` 모두 매칭.

## API (direct-feedback)

- `GET/POST /api/groups/:id/site-profiles` — 그룹 멤버 CRUD(생성/수정은 OWNER).
- `PATCH/DELETE /api/site-profiles/:id`.
- **`GET /api/site-profiles/resolve?host=<hostname>`** — 확장 핵심.
  `getMyGroupIds` → 내 그룹들의 프로필 중 host 매칭 → `{ groupId, groupName, selectors[] }` (없으면 null).

## 확장 (directfeedback-extension)

- manifest: `activeTab` + `scripting` 권한 추가. 스토리북 정적 content_scripts 유지.
- background: 단축키/아이콘 → 정적 대상 아니면 `executeScript`로
  `vendor(rrweb, element-inspector) + selector.js + overlay.js + css` 주입(`DF.__overlayLoaded` 가드).
- resolve 호출 → 매칭 없으면 "미등록" 안내(+추가 버튼), 있으면 groupId·selectors 세팅 후 리뷰 모드.
- overlay.js: 프로필(selectors) 있으면 선택 제한 + 매칭 요소 아웃라인. hover=`closest(선택자)`,
  ↑/↓=매칭 체인. **스냅샷은 선택 요소 서브트리만** 직렬화.
- 프로필 없으면(스토리북) 기존 동작 그대로.

## UI (홈 그룹 카드)

`storybookBaseUrl` 옆에 "사이트 프로필" 섹션: 목록 + 추가/수정/삭제(도메인패턴·선택자 입력).
기존 인라인 `S` 스타일 재사용.

## 단계

- **Phase 1 (backend + UI)**: SiteProfile 모델·마이그레이션 + CRUD/resolve API + 그룹 설정 UI.
  확장 없이 UI로 검증.
- **Phase 2 (extension)**: activeTab 온디맨드 주입 + resolve + 선택 제한/아웃라인 + 서브트리 스냅샷.
  daum 샌드박스 QA → 배포.
- **후순위**: dim/스포트라이트, urlKey 사이트별 정규화, 컴포넌트 자동경계.

## 리스크

- **앵커 안정성**: `daum-ui-<hash>`의 hash가 빌드마다 바뀌면 cssPath 재탐색 drift. 텍스트 폴백으로 완충.
- **urlKey**: 프로덕션 URL의 쿼리/해시 → v1은 origin+pathname, 사이트별 정규화는 v2.
- **마이그레이션**: 로컬 DB == 운영 DB. SiteProfile은 신규 테이블(additive)이라 안전하지만
  `migrate dev`가 운영에 즉시 적용됨 → `--create-only`로 파일만 만들고 적용은 통제.

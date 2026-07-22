# @polym-team/element-inspector

프레임워크 무관 · DOM read-only 순수 계산 레이어. 엘리먼트 인스펙션에 필요한
**박스모델(padding/margin) · 자식 간 gap · DOM 트리 순회**를 "계산"만 하고,
오버레이 그리기와 이벤트 배선은 소비처가 소유합니다.

direct-feedback 편집기(iframe 안 rrweb DOM)와 directfeedback-extension(일반 페이지)이
같은 계산을 공유하기 위해 추출했습니다.

## 좌표 규약

모든 좌표는 대상 요소의 **뷰포트 상대**(`getBoundingClientRect` 기준) 값입니다.
스크롤 오프셋(`window.scrollX/Y`)이나 iframe 오프셋은 **렌더러가 더합니다** — 그래야
일반 페이지와 iframe 내부 양쪽에서 동일 계산을 재사용할 수 있습니다.

## API

```ts
import {
  boxModel, gaps, isRenderVisible,
  visibleParent, firstVisibleChild, nextVisibleSibling, prevVisibleSibling,
  ancestorsFrom,
} from '@polym-team/element-inspector';

const { padding, margin } = boxModel(el);        // InspectorBox[] ×2
const bands = gaps(el, { skip: isOurs });        // GapBand[]
const up = visibleParent(el);                    // ↑
const down = firstVisibleChild(el, { skip });    // ↓
const right = nextVisibleSibling(el, { skip });  // →
const left = prevVisibleSibling(el, { skip });   // ←
```

`skip(el)`은 오버레이 자신 등 순회/계산에서 제외할 노드를 걸러냅니다.

## 소비 방식

- **모노레포 앱(direct-feedback)**: `workspace:*` — raw TS 소스를 `transpilePackages`로 트랜스파일.
- **확장도구(별도 repo, 무빌드)**: 배포 tarball의 `dist/element-inspector.global.js`를
  `content/vendor/`에 복사 → content_scripts 로 로드하면 `globalThis.ElementInspector` 로 노출.

## 빌드

```bash
pnpm --filter @polym-team/element-inspector build
# dist/index.{js,mjs,d.ts}  (npm 소비자)
# dist/element-inspector.global.js  (확장도구 IIFE)
```

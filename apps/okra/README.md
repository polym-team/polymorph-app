# OKR 프로세스 가이드

Okra 앱의 OKR 프로세스 설계 문서. 모든 OKR 관련 개발은 이 문서를 기준으로 진행한다.

---

## 1. OKR 프로세스 개요

Okra의 OKR 프로세스는 5단계로 구성된다:

```
아이디어 → 목표 → 작업 → 진행 기록 → 회고
```

| 단계 | 설명 |
|---|---|
| **아이디어** | 팀원들이 작은 아이디어나 문제점을 자유롭게 제출. 비슷한 주제끼리 그룹핑 |
| **목표** | 아이디어들을 해결하면 이룰 수 있는 목표(Objective)를 설정 |
| **작업** | 목표 달성을 위한 구체적 작업(Task) 항목을 정의. 담당자와 기간 지정 가능 |
| **진행 기록** | OKR 1개당 하나의 단일 문서로 진행 내용을 에디터로 작성. 공동 편집 지원 |
| **회고** | OKR 전체에 대한 최종 결과 및 회고를 에디터로 작성 |

---

## 2. 핵심 개념 (도메인 모델)

| 개념 | 설명 |
|---|---|
| **OKR** | Space 안의 최상위 단위. title과 description으로 맥락을 설명 (예: "2026년 1분기 목표"). 여러 명의 Owner를 가질 수 있음 |
| **Idea (아이디어)** | 작은 아이디어/문제점. 비슷한 주제끼리 그룹핑 가능. 같은 OKR 안의 Objective와 암묵적으로 연결됨 (별도 매핑 없음) |
| **Objective (목표)** | 아이디어들을 해결하면 이룰 수 있는 목표. Idea와의 연결은 OKR 컨테이너를 통해 암묵적으로 표현 |
| **Task (작업)** | 목표 달성을 위한 구체적 작업 항목. 담당자 모드: ANYONE(기본, 누구나 수행 가능) 또는 ASSIGNED(특정 멤버 지정). 기간(옵션) |
| **진행 기록 (OKR.progressContent)** | OKR 1개당 하나의 Notion 스타일 단일 문서. 스페이스 멤버 누구나 공동 편집 가능. ACTIVE에서만 편집, REVIEW/ARCHIVED에서는 읽기 전용 |
| **Review (회고)** | OKR 전체에 대한 최종 평가 및 회고. OKR Owner만 작성 가능 (Owner별 1개). Owner 자격이 박탈되어도 글은 남지만 수정/삭제 불가 |

### 모델 관계도

```
Space
 └── OKR (컨테이너)
      ├── Idea (여러 개)
      ├── Objective (여러 개)
      │    └── Task (여러 개)
      ├── progressContent (단일 문서, JSON)
      └── Review (여러 개)
```

---

## 3. 라이프사이클

OKR은 4가지 상태를 가진다:

```
PLANNING → ACTIVE → REVIEW → ARCHIVED
(목표수립)   (진행)   (회고)   (아카이빙)
```

| 상태 | 설명 | 허용되는 행위 |
|---|---|---|
| **PLANNING** | 목표수립 단계 | Idea 생성/수정/삭제, Objective 생성/수정/삭제, Task 생성/수정/삭제 |
| **ACTIVE** | 진행 단계 | Task 추가/폐기, 진행 기록 편집 |
| **REVIEW** | 회고 단계 | Review 작성/수정/삭제 (Owner만, Owner별 1개) |
| **ARCHIVED** | 아카이빙 | 모든 내용 수정 불가 (읽기 전용) |

### 상태별 상세 규칙

**PLANNING (목표수립)**
- Idea, Objective, Task를 자유롭게 생성/수정/삭제 가능
- 아직 실행 전이므로 얼마든지 구조를 변경할 수 있음

**ACTIVE (진행)**
- Idea, Objective는 수정 불가 (목표수립 단계에서 확정됨)
- Task는 **추가만 가능** (기존 Task 수정/삭제 불가)
- Task **폐기(DISCARDED)** 처리 가능:
  - ASSIGNED 모드: 해당 담당자만 폐기 가능
  - ANYONE 모드: 스페이스 멤버 누구나 폐기 가능
  - 폐기된 Task는 UI에서 명확히 표시 (취소선 등)
  - Task가 폐기되면 UI에서 폐기 상태로 표시
- 진행 기록: OKR 단일 문서로 스페이스 멤버 누구나 편집 가능 (자동저장)

**REVIEW (회고)**
- Idea, Objective, Task 모두 수정 불가
- Review 작성/수정/삭제: OKR Owner만 가능 (Owner별 1개)
- Owner 자격이 박탈된 경우: 기존 Review는 남지만 수정/삭제 불가

**ARCHIVED (아카이빙)**
- 모든 내용 읽기 전용

### 상태 전환 규칙

- 모든 상태 전환은 **OKR Owner만** 가능
- **전진만 가능, 역방향 전환 불가** (프로세스 엄격 준수)
- `PLANNING → ACTIVE`: 최소 1개의 Objective와 Task가 있어야 전환 가능
- `ACTIVE → REVIEW`: 수동 전환
- `REVIEW → ARCHIVED`: 아카이빙 후 되돌릴 수 없음

> 역방향 전환이 필요한 경우: OKR 상세 페이지에서 **"복사해서 새로 생성"** 기능을 사용한다. 기존 OKR의 Idea/Objective/Task 구조를 복사하여 새 OKR(PLANNING 상태)을 생성. 기존 OKR은 그대로 아카이빙 처리한다.

### OKR Owner

- OKR Owner는 **여러 명**이 될 수 있다
- OKR을 생성한 사람이 최초 Owner
- Owner는 다른 스페이스 멤버를 Owner로 추가하거나 기존 Owner를 제거할 수 있다
- 단, 최소 1명의 Owner는 항상 유지되어야 한다 (마지막 Owner는 제거 불가)

---

## 4. 권한 모델

| 행위 | 권한 | 허용 상태 |
|---|---|---|
| OKR 생성 | 스페이스 멤버 누구나 | — |
| OKR 복사해서 새로 생성 | 스페이스 멤버 누구나 | ACTIVE, REVIEW, ARCHIVED |
| OKR 상태 전환 | OKR Owner만 | PLANNING, ACTIVE, REVIEW |
| OKR Owner 추가/제거 | OKR Owner만 | ARCHIVED 제외 |
| Idea 생성/수정/삭제 | 스페이스 멤버 누구나 | PLANNING |
| Objective 생성/수정/삭제 | 스페이스 멤버 누구나 | PLANNING |
| Task 생성/수정/삭제 | 스페이스 멤버 누구나 | PLANNING |
| Task 추가 | 스페이스 멤버 누구나 | ACTIVE |
| Task 폐기 | ASSIGNED: 담당자만 / ANYONE: 스페이스 멤버 누구나 | ACTIVE |
| Task 담당자 모드/지정 | 스페이스 멤버 누구나 | PLANNING, ACTIVE |
| 진행 기록 편집 | 스페이스 멤버 누구나 | ACTIVE |
| Review 작성/수정/삭제 | OKR Owner만 (본인 Review만, Owner별 1개) | REVIEW |
| ARCHIVED 후 수정 | 불가 (모든 내용 읽기 전용) | ARCHIVED |

---

## 5. 에디터 선택

진행 기록(OKR.progressContent)과 회고(Review)에 Notion 스타일 블록 에디터가 필요하다.

### 추천: BlockNote

[BlockNote](https://www.blocknotejs.org/)를 에디터로 채택한다.

**선택 이유:**
- Notion 스타일 블록 에디터를 목적으로 만든 라이브러리
- Yjs 기반 실시간 공동 편집 내장
- React 18 + Next.js 14 호환
- 셋업이 간단하고 TypeScript 지원 우수
- 슬래시 메뉴, 드래그 앤 드롭, 인라인 포맷팅 기본 제공

**대안:**
- **Plate**: 커스터마이징이 많이 필요한 경우. 설정이 복잡함
- **Tiptap**: 전통적 에디터 스타일. 블록 에디터가 아님

### 에디터 데이터 저장 (이중 저장)

- **Yjs 바이너리**: `apps/collab` (Hocuspocus) 서버가 `YjsDocument` 테이블에 저장. 실시간 동기화의 소스 오브 트루스
- **JSON**: `OKR.progressContent`에 BlockNote JSON 포맷으로 저장 (debounce 1초). REVIEW/ARCHIVED 읽기 전용 뷰에 사용
- 공동 편집: Yjs CRDT + Hocuspocus WebSocket (`apps/collab`). 상세 설명은 `apps/collab/README.md` 참조

---

## 6. 데이터 모델 (Prisma 스키마 변경 방향)

기존 스키마를 새 OKR 프로세스에 맞게 재설계한다.

### 변경 매핑

| 기존 모델 | 새 모델 | 주요 변경점 |
|---|---|---|
| `OKRCycle` | **`OKR`** | `ownerId` 제거 → `OKROwner` 조인 테이블, `description` 추가, `startDate`/`endDate` 옵션으로 변경 |
| `Objective` | **`Objective`** | `cycleId` → `okrId`로 변경 |
| `KeyResult` | **`Task`** | 수치 기반 필드 제거, `assigneeMode`/`assigneeId`/`dueDate`/`status` 추가 |
| `KeyResultUpdate` | **`TaskProgress`** | 수치 필드 제거, `content`(Json) 추가 |
| `Retrospective` | **`Review`** | `wentWell`/`toImprove`/`actionItems` → `content`(Json) 단일 필드, `@@unique([okrId, authorId])` |
| *(신규)* | **`Idea`** | `okrId`, `title`, `description`, `category` |
| *(신규)* | **`OKROwner`** | `okrId`, `userId` — OKR과 User의 다대다 조인 테이블 |

### 새 Enum

```prisma
enum OKRStatus {
  PLANNING
  ACTIVE
  REVIEW
  ARCHIVED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
  DISCARDED
}

enum TaskAssigneeMode {
  ANYONE
  ASSIGNED
}
```

### 새 모델 구조

```prisma
model OKR {
  id          String    @id @default(cuid())
  spaceId     String
  title       String
  description String?   @db.Text
  status      OKRStatus @default(PLANNING)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  space      Space       @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  owners     OKROwner[]
  ideas      Idea[]
  objectives Objective[]
  reviews    Review[]

  @@index([spaceId])
}

model OKROwner {
  id        String   @id @default(cuid())
  okrId     String
  userId    String
  createdAt DateTime @default(now())

  okr  OKR  @relation(fields: [okrId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([okrId, userId])
}

model Idea {
  id          String   @id @default(cuid())
  okrId       String
  authorId    String
  title       String
  description String?  @db.Text
  category    String?
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  okr    OKR  @relation(fields: [okrId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([okrId])
}

model Objective {
  id          String   @id @default(cuid())
  okrId       String
  ownerId     String
  title       String
  description String?  @db.Text
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  okr   OKR    @relation(fields: [okrId], references: [id], onDelete: Cascade)
  owner User   @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  tasks Task[]

  @@index([okrId])
  @@index([ownerId])
}

model Task {
  id           String             @id @default(cuid())
  objectiveId  String
  assigneeMode TaskAssigneeMode   @default(ANYONE)
  assigneeId   String?
  title        String
  description  String?            @db.Text
  status       TaskStatus         @default(TODO)
  dueDate      DateTime?
  sortOrder    Int                @default(0)
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  objective Objective      @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  assignee  User?          @relation(fields: [assigneeId], references: [id], onDelete: SetNull)
  progress  TaskProgress[]

  @@index([objectiveId])
  @@index([assigneeId])
}

model TaskProgress {
  id        String   @id @default(cuid())
  taskId    String
  authorId  String
  content   Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  task   Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([authorId])
}

model Review {
  id        String   @id @default(cuid())
  okrId     String
  authorId  String
  content   Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  okr    OKR  @relation(fields: [okrId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@unique([okrId, authorId])
}
```

### 삭제되는 모델/Enum

- `OKRCycle` → `OKR`로 대체
- `KeyResult` → `Task`로 대체
- `KeyResultUpdate` → `TaskProgress`로 대체
- `Retrospective` → `Review`로 대체
- `CycleStatus` → `OKRStatus`로 대체 (PLANNING/ACTIVE/REVIEW/ARCHIVED)
- `KeyResultType` → 삭제 (수치 기반 측정 제거)

---

## 7. 구현 단계

| Phase | 내용 | 상태 |
|---|---|---|
| **Phase 1** | GUIDE.md 작성 + 프로세스 확정 | 완료 |
| **Phase 2** | Prisma 스키마 재설계 + 에디터 패키지 설치 | 완료 |
| **Phase 3** | OKR CRUD (생성/목록/상세) | 완료 |
| **Phase 4** | 아이디어 → 목표 → 작업 작성 플로우 | 완료 |
| **Phase 5** | 진행 기록 (에디터 + 자동저장) | 완료 |
| **Phase 5b** | Yjs 실시간 공동 편집 (`apps/collab`) | 완료 |
| **Phase 6** | 회고 + 아카이빙 | **현재 단계** |

### Phase별 상세

**Phase 2: 스키마 + 에디터**
- 기존 OKRCycle/KeyResult/KeyResultUpdate/Retrospective 모델 제거
- 새 OKR/Idea/Task/TaskProgress/Review 모델 생성
- `@blocknote/core`, `@blocknote/react` 패키지 설치
- Prisma migration 실행

**Phase 3: OKR CRUD**
- OKR 생성 페이지 (제목, 기간 설정)
- OKR 목록 페이지 (스페이스별 필터, 상태별 필터)
- OKR 상세 페이지 (아이디어/목표/작업 전체 뷰)

**Phase 4: 아이디어→목표→작업 플로우**
- 아이디어 작성/수정/삭제
- 아이디어 그룹핑 (카테고리)
- Objective 작성 (아이디어와 연결)
- Task 작성 (담당자 지정, 기간 설정)
- 드래그 앤 드롭으로 정렬

**Phase 5: 진행 기록**
- BlockNote 에디터 통합
- OKR 단일 문서(progressContent)로 진행 기록 작성/자동저장

**Phase 5b: Yjs 실시간 공동 편집**
- `apps/collab`: Hocuspocus WebSocket 서버 (범용, 앱 비종속)
- JWT 인증 + MySQL 바이너리 영속화 (별도 DB)
- `CollaborativeEditor`: ACTIVE 상태에서 실시간 공동 편집 (커서 표시)
- 이중 저장: Yjs 바이너리(실시간) + JSON(읽기 전용)
- 기존 progressContent → Yjs 자동 마이그레이션

**Phase 6: 회고 + 아카이빙**
- Review 작성 (BlockNote 에디터, Owner별 1개)
- OKR 상태 전환 UI (PLANNING → ACTIVE → REVIEW → ARCHIVED, 전진만 가능)
- ARCHIVED 상태 시 읽기 전용 처리
- OKR "복사해서 새로 생성" 기능

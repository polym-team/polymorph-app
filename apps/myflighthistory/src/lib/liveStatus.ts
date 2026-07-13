/**
 * 실시간 운항 상태(실데이터) 파싱.
 *
 * 두 소스를 같은 LiveStatus 로 정규화한다:
 *  - airportal.go.kr (비공식, 전 공항/국내+국제) — 이 파일의 파서
 *  - 인천공항 공식 OpenAPI (ICN 국제선) — incheon.ts
 * 지연은 예정(schTime) 대비 실제/예상 시각 + status 로 판정.
 */

export interface LiveStatus {
  status: 'scheduled' | 'departed' | 'arrived' | 'delayed' | 'cancelled' | 'unknown';
  /** HH:MM (해당 일자 기준) */
  scheduledTime: string | null;
  estimatedTime: string | null;
  actualTime: string | null;
  /** 예정 대비 지연(분). 음수/미상은 null */
  delayMin: number | null;
  /** 지연 사유 등 비고 */
  remark: string | null;
  /** 기체 등록번호(HL…). 인천 API 만 제공, 국내선(airportal)은 null */
  registration?: string | null;
  source: 'airportal' | 'incheon';
}

/** airportal getFlightArrivalDepartureInfo.do 응답 item (필요 필드만). */
export interface AirportalItem {
  fpIata?: string; // 편명 (예: TW407)
  apIata?: string; // 상대 공항 IATA
  apKr?: string; // 상대 공항 한글
  alKr?: string; // 항공사 한글
  status?: string; // 출발/지연/도착/결항/""
  statusRemark?: string; // 지연 사유
  schTime?: string; // 예정 "11:05"
  expectedFlightTime?: string; // 예상 "11:34" 또는 ":"
  actualFlightTime?: string; // 실제 "11:34" 또는 ":"
  nature?: string; // 여객/화물/기타
}

/** "HH:MM" → 분. ":" 나 형식 불량은 null. */
function hhmmToMin(t: string | undefined): number | null {
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return +m[1] * 60 + +m[2];
}

function validTime(t: string | undefined): string | null {
  return hhmmToMin(t) === null ? null : (t as string);
}

function mapStatus(korStatus: string | undefined): LiveStatus['status'] {
  switch ((korStatus ?? '').trim()) {
    case '결항':
      return 'cancelled';
    case '지연':
      return 'delayed';
    case '출발':
      return 'departed';
    case '도착':
      return 'arrived';
    case '':
      return 'scheduled';
    default:
      return 'unknown';
  }
}

/** airportal item → LiveStatus. */
export function airportalItemToStatus(item: AirportalItem): LiveStatus {
  const scheduledTime = validTime(item.schTime);
  const estimatedTime = validTime(item.expectedFlightTime);
  const actualTime = validTime(item.actualFlightTime);

  const schMin = hhmmToMin(item.schTime);
  const effMin = hhmmToMin(item.actualFlightTime) ?? hhmmToMin(item.expectedFlightTime);
  let delayMin: number | null = null;
  if (schMin !== null && effMin !== null) {
    const d = effMin - schMin;
    delayMin = d > 0 ? d : 0;
  }

  let status = mapStatus(item.status);
  // status 가 비어있어도 실제/예상이 예정보다 늦으면 지연으로 승격
  if (status === 'scheduled' && delayMin !== null && delayMin >= 15) {
    status = 'delayed';
  }

  return {
    status,
    scheduledTime,
    estimatedTime,
    actualTime,
    delayMin,
    remark: item.statusRemark?.trim() || null,
    source: 'airportal',
  };
}

/** 편명 정규화(대문자·공백제거)로 airportal 목록에서 매칭 item 을 찾는다. */
export function matchAirportalFlight(
  items: AirportalItem[],
  flightNumber: string,
): AirportalItem | null {
  const target = flightNumber.toUpperCase().replace(/\s+/g, '');
  return (
    items.find((it) => (it.fpIata ?? '').toUpperCase().replace(/\s+/g, '') === target) ?? null
  );
}

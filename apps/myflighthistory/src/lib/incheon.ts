/**
 * 인천공항 공식 OpenAPI (statusOfAllFltDeOdp) 기반 실시간 출발 상태.
 * ICN 국제선 전용. flightId + searchDate 로 단건 조회. (일일 트래픽 500)
 */
import type { LiveStatus } from './liveStatus';

const BASE = 'https://apis.data.go.kr/B551177/statusOfAllFltDeOdp';

interface IncheonItem {
  flightId?: string;
  airport?: string; // 도착지 한글
  airportCode?: string; // 도착지 IATA
  scheduleDatetime?: string; // YYYYMMDDHHmm
  estimatedDatetime?: string; // YYYYMMDDHHmm
  remark?: string; // 출발/지연/결항/도착/...
  aircraftRegNo?: string; // 기체 등록번호 (HL…)
}

/** "YYYYMMDDHHmm" → { min(비교용), hhmm(표시용) }. 형식 불량은 null. */
function parseDt(s: string | undefined): { min: number; hhmm: string } | null {
  if (!s || !/^\d{12}$/.test(s)) return null;
  const y = +s.slice(0, 4);
  const mo = +s.slice(4, 6);
  const d = +s.slice(6, 8);
  return {
    min: Date.UTC(y, mo - 1, d, +s.slice(8, 10), +s.slice(10, 12)) / 60000,
    hhmm: `${s.slice(8, 10)}:${s.slice(10, 12)}`,
  };
}

function mapRemark(r: string | undefined): LiveStatus['status'] {
  const s = (r ?? '').trim();
  if (s.includes('결항')) return 'cancelled';
  if (s.includes('지연')) return 'delayed';
  if (s.includes('출발')) return 'departed';
  if (s.includes('도착')) return 'arrived';
  if (s === '') return 'scheduled';
  return 'unknown';
}

export function incheonItemToStatus(item: IncheonItem): LiveStatus {
  const sch = parseDt(item.scheduleDatetime);
  const est = parseDt(item.estimatedDatetime);
  let delayMin: number | null = null;
  if (sch && est) {
    const d = est.min - sch.min;
    delayMin = d > 0 ? d : 0;
  }

  let status = mapRemark(item.remark);
  if (status === 'scheduled' && delayMin !== null && delayMin >= 15) {
    status = 'delayed';
  }

  return {
    status,
    scheduledTime: sch?.hhmm ?? null,
    estimatedTime: est?.hhmm ?? null,
    actualTime: null,
    delayMin,
    remark: item.remark?.trim() || null,
    registration: item.aircraftRegNo?.trim() || null,
    source: 'incheon',
  };
}

const norm = (s: string | undefined) => (s ?? '').toUpperCase().replace(/\s+/g, '');

/**
 * ICN 출발편 실시간 상태. flightId(편명) + searchDate(YYYYMMDD).
 * 실패/미매칭/키 없음이면 null (호출부에서 휴리스틱 fallback).
 */
export async function fetchIncheonDeparture(
  flightNumber: string,
  searchDate: string,
): Promise<LiveStatus | null> {
  const key = process.env.DATAGO_SERVICE_KEY;
  if (!key) return null;

  const url =
    `${BASE}/getFltDeparturesDeOdp?serviceKey=${key}&type=json&pageNo=1&numOfRows=10` +
    `&searchDate=${searchDate}&flightId=${encodeURIComponent(norm(flightNumber))}`;

  let res: Response;
  try {
    res = await fetch(url, { cache: 'no-store' });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  const raw = data?.response?.body?.items?.item ?? [];
  const items: IncheonItem[] = Array.isArray(raw) ? raw : [raw];
  const match = items.find((it) => norm(it.flightId) === norm(flightNumber));
  return match ? incheonItemToStatus(match) : null;
}

/**
 * 항공편 지연 예측 엔진 (pluggable).
 *
 * 현재는 외부 데이터 없이 일반 패턴(시간대·요일·계절·국내/국제)에 기반한 **휴리스틱 추정**만
 * 제공한다. 이후 한국 공공데이터(data.go.kr) 기반 실통계 provider 를 같은 인터페이스 뒤로
 * 끼워 blended 예측으로 교체할 수 있다.
 *
 * 주의: 휴리스틱 값은 "정확한 확률"이 아니라 설명 가능한 추정치다. basis 로 근거를 노출한다.
 */

export interface PredictionInput {
  flightNumber: string | null;
  from: string | null;
  to: string | null;
  /** 출발 ISO(대개 +09:00 또는 KST 벽시계) */
  departure: string;
}

export interface DelayPrediction {
  /** 지연(통상 15분 초과) 발생 가능성 0..1 */
  delayProbability: number;
  /** 예상 지연(분) */
  expectedDelayMin: number;
  level: 'low' | 'moderate' | 'high';
  /** 근거 설명(사용자 노출용) */
  basis: string[];
  source: 'heuristic' | 'kr-stats' | 'blended';
}

/** 한국 국내선 공항/도시(도착·출발 양쪽이 여기 속하면 국내선으로 판정). */
const KR_DOMESTIC = new Set([
  '김포', '제주', '김해', '부산', '대구', '광주', '청주', '여수', '울산',
  '양양', '포항', '군산', '원주', '사천', '무안', '인천', '서울',
  'gmp', 'cju', 'pus', 'tae', 'kwj', 'cjj', 'rsu', 'usn', 'yny', 'khn',
  'kuv', 'wju', 'hin', 'muw', 'icn', 'gimpo', 'jeju', 'busan', 'gimhae',
  'seoul', 'incheon', 'daegu', 'gwangju', 'cheongju',
]);

/** 편명 앞 2자로 항공사명 추정. 미상이면 코드 그대로. */
const AIRLINE_NAMES: Record<string, string> = {
  OZ: '아시아나', KE: '대한항공', TW: '티웨이', BX: '에어부산',
  LJ: '진에어', RS: '에어서울', YP: '에어프레미아', ZE: '이스타',
  '7C': '제주항공', TG: '타이항공', SQ: '싱가포르항공', BR: '에바항공',
};

/** 편명 앞 2자로 항공사명. 매핑에 없으면 추측하지 않고 코드를 그대로 반환. */
export function airlineName(flightNumber: string | null): string | null {
  if (!flightNumber) return null;
  const code = flightNumber.slice(0, 2).toUpperCase();
  return AIRLINE_NAMES[code] ?? code;
}

function isDomestic(from: string | null, to: string | null): boolean {
  const hit = (p: string | null) =>
    !!p && KR_DOMESTIC.has(p.trim().toLowerCase());
  return hit(from) && hit(to);
}

/** ISO 문자열에서 벽시계 시(hour)·월·요일을 파싱(대략, KST 가정). */
function parseWallClock(iso: string): { hour: number; month: number; dow: number } | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mon, d, hh] = m;
  const dow = new Date(Date.UTC(+y, +mon - 1, +d)).getUTCDay(); // 0=일
  return { hour: hh ? +hh : 12, month: +mon, dow };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** 휴리스틱 예측. */
export function predictDelay(input: PredictionInput): DelayPrediction {
  const basis: string[] = [];
  const domestic = isDomestic(input.from, input.to);

  // 기저값: 국제선이 변동성 큼
  let prob = domestic ? 0.18 : 0.28;
  let mins = domestic ? 10 : 18;
  basis.push(domestic ? '국내선(기본 지연율 낮음)' : '국제선(변동성 큼)');

  const wc = parseWallClock(input.departure);
  if (wc) {
    // 시간대: 저녁 늦게 출발일수록 앞선 지연 누적
    if (wc.hour >= 20) {
      prob += 0.15;
      mins += 10;
      basis.push('야간 출발(누적 지연 위험 높음)');
    } else if (wc.hour >= 17) {
      prob += 0.08;
      mins += 6;
      basis.push('저녁 출발(지연 누적)');
    } else if (wc.hour < 9) {
      prob -= 0.05;
      mins -= 3;
      basis.push('이른 아침 출발(정시성 높음)');
    }

    // 요일: 금(5)·일(0) 혼잡
    if (wc.dow === 5 || wc.dow === 0) {
      prob += 0.05;
      basis.push('주말 전후(금·일) 혼잡');
    }

    // 계절: 7~8월 장마·태풍, 12~2월 겨울 기상(특히 제주)
    if (wc.month === 7 || wc.month === 8) {
      prob += 0.08;
      mins += 6;
      basis.push('여름 장마·태풍철');
    } else if (wc.month === 12 || wc.month <= 2) {
      prob += 0.06;
      mins += 5;
      basis.push('겨울 기상(강설·강풍)');
    }
  }

  prob = clamp(prob, 0.03, 0.9);
  mins = Math.max(0, Math.round(mins));

  const level: DelayPrediction['level'] =
    prob >= 0.4 || mins >= 25 ? 'high' : prob >= 0.22 ? 'moderate' : 'low';

  return {
    delayProbability: Math.round(prob * 100) / 100,
    expectedDelayMin: mins,
    level,
    basis,
    source: 'heuristic',
  };
}

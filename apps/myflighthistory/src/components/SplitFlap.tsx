'use client';

import { useEffect, useRef } from 'react';

/**
 * Solari 스플릿-플랩 디스플레이.
 *
 * 글자마다 풀에서 랜덤 문자를 몇 번 훑고("촤라라락") 최종값에 착지한다. 한글/영문/숫자 모두 지원
 * (순차 alphabet 방식 라이브러리와 달리 임의 유니코드 OK). animate=false 면 정적으로 즉시 표시.
 * prefers-reduced-motion 이면 애니메이션 생략.
 */

const HANGUL = '가나다라마바사아자차카타파하김포제주청주광주부산대구인천서울양양울산여수';
const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGIT = '0123456789';

function poolFor(ch: string): string | null {
  if (/[0-9]/.test(ch)) return DIGIT;
  if (/[A-Za-z]/.test(ch)) return LATIN + DIGIT;
  if (/[가-힣]/.test(ch)) return HANGUL;
  return null; // 구두점 등은 사이클 없이 바로
}

interface Props {
  value: string;
  /** 사이클링 애니메이션 여부 (지난 기록은 false 로 정적 표시) */
  animate?: boolean;
  /** 보드 전체 캐스케이드를 위한 시작 순번(타일 지연 기준) */
  order?: number;
  className?: string;
}

export function SplitFlap({ value, animate = true, order = 0, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const tiles = root.querySelectorAll<HTMLElement>('.tile[data-final]');
    const timers: ReturnType<typeof setTimeout>[] = [];

    tiles.forEach((tile, i) => {
      const final = tile.getAttribute('data-final') ?? '';
      const top = tile.querySelector<HTMLElement>('.top b');
      const bot = tile.querySelector<HTMLElement>('.bot b');
      if (!top || !bot) return;

      const put = (ch: string, flip: boolean) => {
        top.textContent = ch;
        bot.textContent = ch;
        if (flip) {
          tile.classList.remove('flip');
          void tile.offsetWidth; // reflow → 애니메이션 재시작
          tile.classList.add('flip');
        }
      };

      const pool = poolFor(final);
      if (!animate || reduce || !pool) {
        put(final, false);
        return;
      }

      put('', false); // 빈 칸에서 시작해 도착 느낌
      const steps = 6 + Math.floor(Math.random() * 9);
      let k = 0;
      const startTimer = setTimeout(function run() {
        if (k >= steps) {
          put(final, true);
          return;
        }
        put(pool[Math.floor(Math.random() * pool.length)], true);
        k += 1;
        timers.push(setTimeout(run, 105));
      }, (order + i) * 50);
      timers.push(startTimer);
    });

    return () => timers.forEach(clearTimeout);
  }, [value, animate, order]);

  return (
    <span className={`flaps ${className}`.trim()} ref={ref} aria-label={value}>
      {[...value].map((ch, i) =>
        ch === ' ' ? (
          <span key={i} className="tile sp" aria-hidden="true" />
        ) : (
          <span key={i} className="tile" data-final={ch} aria-hidden="true">
            <span className="h top">
              <b>{ch}</b>
            </span>
            <span className="h bot">
              <b>{ch}</b>
            </span>
          </span>
        ),
      )}
    </span>
  );
}

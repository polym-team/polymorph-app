'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import {
  CAUTIONS,
  CAUTIONS_WARNING,
  CAUTIONS_AGREE_LABEL,
  CAUTIONS_AGREE_SUB,
} from '@/lib/cautions';

interface Props {
  mode: 'migrate' | 'apply';
  email?: string;
  submitting?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onReject: () => void;
}

const COPY = {
  migrate: {
    eyebrow: '폴리모프 통합회원 전환',
    title: '기존 임직원몰 계정을 연결합니다',
    lede: 'polymorph 통합 계정으로 로그인했어요. 아래 계정과 연결하면 주문·정산 내역이 그대로 유지됩니다.',
    showChip: true,
    cta: '동의하고 연결하기',
    reject: '지금 안 함',
    hint: '"지금 안 함"을 누르면 로그아웃되고 메인으로 이동합니다.',
  },
  apply: {
    eyebrow: '임직원몰 가입 신청',
    title: '임직원몰 이용을 신청합니다',
    lede: '관리자 승인 후 이용할 수 있어요. 신청 전 아래 이용 주의사항을 확인·동의해 주세요.',
    showChip: false,
    cta: '동의하고 가입 신청',
    reject: '취소',
    hint: '신청 후 관리자 승인 대기 상태가 됩니다.',
  },
} as const;

export function MembershipGate({ mode, email, submitting, error, onConfirm, onReject }: Props) {
  const [agree, setAgree] = useState(false);
  const c = COPY[mode];

  return (
    <div className="min-h-[80vh] flex items-start justify-center py-6">
      <div className="w-full max-w-xl">
        <div className="bg-paper-card border border-line rounded-2xl shadow-lift overflow-hidden">
          {/* 헤드 */}
          <div className="px-7 pt-7 pb-5 border-b border-line-soft">
            <p className="font-serif text-[14px] text-clay-500 mb-2">{c.eyebrow}</p>
            <h1 className="font-serif text-[24px] leading-[1.25] tracking-tight text-ink-900 mb-3">
              {c.title}
            </h1>
            <p className="text-[13.5px] leading-relaxed text-ink-600">{c.lede}</p>
            {c.showChip && email && (
              <span className="inline-flex items-center gap-2 mt-3.5 bg-clay-50 text-clay-600 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                {email}
              </span>
            )}
          </div>

          {/* 본문 */}
          <div className="px-7 pt-5 pb-1">
            <div className="flex items-start gap-2.5 bg-terra-50 border border-terra-500/30 rounded-xl px-3.5 py-3 mb-5">
              <svg className="text-terra-500 flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p className="text-[13px] leading-snug text-terra-600 font-semibold">{CAUTIONS_WARNING}</p>
            </div>

            {CAUTIONS.map((sec) =>
              sec.critical ? (
                <div key={sec.title} className="bg-terra-50 border border-terra-500/40 rounded-2xl px-4 py-4 mb-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white bg-terra-500 rounded-full px-2 py-0.5">핵심</span>
                    <span className="font-serif text-[15px] text-terra-600">{sec.title}</span>
                  </div>
                  <p className="text-[15px] font-bold text-ink-900 mb-1.5 leading-snug">🚫 {sec.items[0]}</p>
                  {sec.items[1] && <p className="text-[12.5px] text-terra-600">{sec.items[1]}</p>}
                </div>
              ) : (
                <div key={sec.title} className="mb-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="font-serif text-[15px] tracking-tight text-ink-900">{sec.title}</span>
                    {sec.tag && (
                      <span className="text-[10px] tracking-[0.1em] uppercase text-ink-400 border border-line rounded-full px-2 py-0.5">
                        {sec.tag}
                      </span>
                    )}
                  </div>
                  <ul className="flex flex-col gap-2">
                    {sec.items.map((item) => (
                      <li key={item} className="relative pl-5 text-[13.5px] leading-snug text-ink-600">
                        <span className="absolute left-1 top-[7px] w-1.5 h-1.5 rounded-full bg-clay-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>

          {/* 푸터 — 체크박스 + 버튼 */}
          <div className="px-7 pt-5 pb-7 border-t border-line-soft mt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 w-[22px] h-[22px] rounded-[7px] accent-ink-900 flex-shrink-0"
              />
              <span className="text-[13px] leading-snug text-ink-900">
                {CAUTIONS_AGREE_LABEL}
                <span className="block text-[12px] text-ink-400 mt-0.5">{CAUTIONS_AGREE_SUB}</span>
              </span>
            </label>

            {error && <p className="text-[13px] text-terra-600 mt-3">{error}</p>}

            <div className="flex gap-2.5 mt-5">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={!agree || submitting}
                onClick={onConfirm}
              >
                {submitting ? '처리 중...' : c.cta}
              </Button>
              <Button variant="subtle" size="lg" onClick={onReject} disabled={submitting}>
                {c.reject}
              </Button>
            </div>
            <p className="text-center text-[11.5px] text-ink-400 mt-3.5">{c.hint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

export function Guide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-gray-600">이용 안내</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-gray-400 transition ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="border-t px-4 pb-4 pt-3 text-sm leading-relaxed text-gray-600">
          <ol className="list-decimal space-y-3 pl-4">
            <li>
              <strong>계정 등록</strong>
              <br />
              <a
                href="https://www.dhlottery.co.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lotto-600 underline"
              >
                동행복권 웹사이트
              </a>
              에서 가입한 계정 정보(아이디/비밀번호)를 등록해야 합니다.
              계정은 여러 개 등록할 수 있습니다.
            </li>
            <li>
              <strong>예치금 충전</strong>
              <br />
              로또 구매에는 예치금이 필요합니다. 1회 구매 시 5,000원(5게임)이
              차감되므로, 동행복권 사이트에서 미리 충전해주세요.
            </li>
            <li>
              <strong>자동구매</strong>
              <br />
              자동구매를 켜두면 <strong>매주 토요일 오전 10:00</strong>에
              설정한 번호로 자동 구매됩니다.
            </li>
            <li>
              <strong>구매 불가 시간</strong>
              <br />
              <strong>토요일 오전 11:00 ~ 자정</strong>까지는 추첨 시간으로
              수동/자동 모두 구매가 불가합니다.
            </li>
            <li>
              <strong>주간 리포트</strong>
              <br />
              <strong>매주 일요일 밤 11:00</strong>에 당첨 여부와 예치금 현황을
              가입한 이메일로 발송합니다.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

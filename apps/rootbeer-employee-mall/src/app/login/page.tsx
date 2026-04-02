'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-500 to-mint-500 bg-clip-text text-transparent mb-2">
          임직원몰
        </h1>
        <p className="text-gray-400 mb-8">임직원 할인 공동구매 서비스</p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="bg-accent-500 text-white px-8 py-3 rounded-full hover:bg-accent-600 transition-colors text-sm font-semibold shadow-lg shadow-accent-500/25"
        >
          Google 계정으로 로그인
        </button>
      </div>
    </div>
  );
}

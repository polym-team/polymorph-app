'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">임직원몰</h1>
        <p className="text-gray-500 mb-8">임직원 할인 공동구매 서비스</p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 text-sm"
        >
          Google 계정으로 로그인
        </button>
      </div>
    </div>
  );
}

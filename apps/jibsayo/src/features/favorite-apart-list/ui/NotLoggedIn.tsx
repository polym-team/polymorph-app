'use client';

import { redirectToLogin } from '@/shared/services/auth';

import { LogIn } from 'lucide-react';

import { Button } from '@package/ui';

export function NotLoggedIn() {
  return (
    <div className="flex flex-col items-center justify-center gap-y-4 px-4 py-12 lg:py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <LogIn size={24} className="text-gray-400" />
      </div>
      <div className="text-center">
        <p className="text-base font-medium text-gray-800">
          로그인이 필요합니다
        </p>
        <p className="mt-1 text-sm text-gray-500">
          관심 아파트를 저장하고 어디서든 확인해보세요
        </p>
      </div>
      <Button variant="primary" onClick={() => redirectToLogin()}>
        로그인하기
      </Button>
    </div>
  );
}

'use client';

import { login } from '@/components/AuthProvider';
import { Button } from '@/components/ui';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-[13px] tracking-[0.25em] text-clay-500 mb-3">EMPLOYEE BEAUTY</p>
        <h1 className="text-3xl font-bold text-ink-900 mb-2 tracking-tight">ROOTBEER MALL</h1>
        <p className="text-ink-400 mb-8">임직원 할인 공동구매</p>
        <Button
          variant="accent"
          size="lg"
          onClick={() => login('/')}
          className="shadow-lift"
        >
          Google 계정으로 로그인
        </Button>
      </div>
    </div>
  );
}

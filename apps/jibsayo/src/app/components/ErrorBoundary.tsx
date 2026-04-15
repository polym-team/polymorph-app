'use client';

import { Component, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/**
 * 글로벌 에러 바운더리
 * - 어딘가에서 throw 발생 시 흰 화면 대신 에러 메시지 표시
 * - 개발 환경에서는 스택까지 보여줘서 디버깅 편의성 확보
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
          <div className="w-full max-w-lg rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-base font-bold text-red-700">
              페이지를 표시하는 중 오류가 발생했어요
            </h2>
            <p className="mt-2 text-sm text-red-600">
              {this.state.error.message || '알 수 없는 오류'}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => this.setState({ error: null })}
                className="rounded bg-red-500 px-3 py-1.5 text-xs text-white hover:bg-red-600"
              >
                다시 시도
              </button>
              <a
                href="/"
                className="rounded border border-red-300 bg-white px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                홈으로
              </a>
            </div>
            {process.env.NODE_ENV !== 'production' && this.state.error.stack && (
              <pre className="mt-4 max-h-60 overflow-auto rounded bg-white p-3 text-[10px] text-gray-600">
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome to Polymorph Team',
  description: '폴리모프 팀에 오신 것을 환영합니다. 온보딩 가이드를 확인하세요.',
};

const steps = [
  {
    number: 1,
    title: 'GitHub Organization 초대 수락',
    description: '이메일로 받은 GitHub Organization 초대를 수락해주세요. 코드 저장소와 프로젝트에 접근할 수 있게 됩니다.',
  },
  {
    number: 2,
    title: 'Slack Workspace 참여',
    description: '이메일로 받은 Slack 초대를 통해 워크스페이스에 참여해주세요. 팀과의 소통 채널입니다.',
  },
  {
    number: 3,
    title: '개발 리소스 확인',
    description: '아래 링크에서 개발에 필요한 문서, 도구, 권한 정보 등을 확인하세요.',
    link: {
      href: 'https://bookmark-share.polymorph.co.kr/',
      label: 'Bookmark Share 바로가기',
    },
  },
];

const values = [
  {
    title: '검증된 전문성',
    description: '대기업과 빅테크에서 쌓은 실무 경험을 바탕으로 최적의 솔루션을 설계합니다.',
  },
  {
    title: '근본적인 문제 해결',
    description: '표면적 증상이 아닌 근본 원인을 파악하여 재발 없는 해결책을 제시합니다.',
  },
  {
    title: '명확한 커뮤니케이션',
    description: '기술적 복잡함을 명확한 언어로 전달하고, 진행 상황을 투명하게 공유합니다.',
  },
];

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 text-sm font-medium text-brand-500 bg-brand-500/10 rounded-full mb-6">
            Welcome
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="gradient-text">Polymorph</span> 팀에 오신 것을
            <br />환영합니다
          </h1>
          <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            기술로 비즈니스의 형태를 바꾸는 팀과 함께하게 되어 기쁩니다.
            <br />아래 가이드를 따라 온보딩을 완료해주세요.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-[var(--color-bg-secondary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">우리 팀이 추구하는 가치</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]"
              >
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-12">온보딩 가이드</h2>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative flex gap-6 p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] hover:border-brand-500/50 transition-colors"
              >
                {/* Step number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                  {step.number}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-[var(--color-text-secondary)] mb-4">
                    {step.description}
                  </p>
                  {step.link && (
                    <Link
                      href={step.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors"
                    >
                      {step.link.label}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>
                  )}
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[2.25rem] top-[4.5rem] w-0.5 h-6 bg-[var(--color-border)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            질문이 있으시면 Slack에서 편하게 물어봐주세요.
          </p>
        </div>
      </footer>
    </main>
  );
}

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

      {/* Infrastructure Section */}
      <section className="py-20 bg-[var(--color-bg-secondary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 text-sm font-medium text-brand-500 bg-brand-500/10 rounded-full mb-4">
              Infrastructure
            </span>
            <h2 className="text-2xl font-bold mb-4">개발/운영 환경</h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              별도의 Mac Mini에서 Kubernetes 클러스터가 운영되고 있으며,
              GitOps 기반으로 모든 배포가 자동화되어 있습니다.
            </p>
          </div>

          {/* Architecture Overview */}
          <div className="mb-10 p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)]">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              GitOps 배포 파이프라인
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-100">GitHub Push</span>
              <span className="text-[var(--color-text-muted)]">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-100">GitHub Actions</span>
              <span className="text-[var(--color-text-muted)]">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-100">Docker Registry</span>
              <span className="text-[var(--color-text-muted)]">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-400 font-medium">ArgoCD</span>
              <span className="text-[var(--color-text-muted)]">→</span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium">K8s Deploy</span>
            </div>
            <p className="mt-4 text-sm text-[var(--color-text-secondary)] text-center">
              App of Apps 패턴으로 새 앱 배포 시 네트워크/모니터링 설정이 자동으로 적용됩니다.
            </p>
          </div>

          {/* Free Resources Grid */}
          <h3 className="font-semibold mb-4 text-center">무료로 제공되는 리소스</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h4 className="font-medium text-sm">Kubernetes</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">컨테이너 오케스트레이션</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h4 className="font-medium text-sm">ArgoCD</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">GitOps 배포 자동화</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h4 className="font-medium text-sm">PostgreSQL</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">관계형 데이터베이스</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h4 className="font-medium text-sm">MinIO</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">S3 호환 오브젝트 스토리지</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h4 className="font-medium text-sm">Docker Registry</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">컨테이너 이미지 저장소</p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-medium text-sm">Grafana</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">모니터링 대시보드</p>
            </div>
          </div>

          <p className="mt-6 text-sm text-[var(--color-text-secondary)] text-center">
            모든 리소스는 팀 내부 인프라에서 운영되어 추가 비용 없이 사용할 수 있습니다.
          </p>
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

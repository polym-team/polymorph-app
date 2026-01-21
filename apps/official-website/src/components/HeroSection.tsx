import Link from 'next/link';

import { team, techStack } from '@/data/team';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow animation-delay-400" />

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02]" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)]" />
      </div>

      {/* Floating tech badges */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {techStack.slice(0, 8).map((tech, i) => (
          <div
            key={tech}
            className={`absolute px-3 py-1.5 text-xs font-mono rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/50 backdrop-blur-sm text-[var(--color-text-muted)] opacity-40 animate-float`}
            style={{
              top: `${15 + (i % 4) * 20}%`,
              left: i < 4 ? `${5 + i * 5}%` : 'auto',
              right: i >= 4 ? `${5 + (i - 4) * 5}%` : 'auto',
              animationDelay: `${i * 0.5}s`,
            }}
          >
            {tech}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)]/50 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-sm text-[var(--color-text-secondary)]">
              Since {team.founded}
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">{team.name}</span>
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl text-[var(--color-text-secondary)] font-light mb-6">
            {team.tagline}
          </p>

          <p className="max-w-2xl mx-auto text-[var(--color-text-muted)] text-lg leading-relaxed mb-10">
            {team.description}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#contact"
              className="group px-8 py-4 bg-gradient-to-r from-brand-500 to-emerald-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center gap-2">
                프로젝트 문의
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </Link>
            <Link
              href="#projects"
              className="px-8 py-4 border border-[var(--color-border)] rounded-xl hover:border-[var(--color-accent)] transition-all duration-300 hover:bg-[var(--color-bg-secondary)]"
            >
              프로젝트 보기
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-[var(--color-text-muted)]">
          <span className="text-xs">Scroll</span>
          <svg
            className="w-5 h-5 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

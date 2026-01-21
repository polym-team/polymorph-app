import { contact, team } from '@/data/team';

export function ContactSection() {
  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Section header */}
          <span className="inline-block px-4 py-1.5 text-sm font-medium text-brand-500 bg-brand-500/10 rounded-full mb-4">
            Contact
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Let&apos;s Work Together
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-10">
            프로젝트에 대해 상담하고 싶으시다면 언제든지 연락주세요.
          </p>

          {/* Contact card */}
          <div className="relative p-8 sm:p-10 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)]">
            {/* Gradient background */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/5 via-transparent to-emerald-500/5" />

            <div className="relative">
              {/* Email icon */}
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <p className="text-[var(--color-text-secondary)] mb-6">
                이메일로 문의해 주시면 빠르게 답변 드리겠습니다.
              </p>

              {/* Email button */}
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-medium bg-gradient-to-r from-brand-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>{contact.email}</span>
                <svg
                  className="w-5 h-5"
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
              </a>
            </div>
          </div>

          {/* Founded year */}
          <p className="mt-10 text-sm text-[var(--color-text-muted)]">
            Since {team.founded} &middot; Polymorph
          </p>
        </div>
      </div>
    </section>
  );
}

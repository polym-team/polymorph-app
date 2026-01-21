import Image from 'next/image';

import { members } from '@/data/team';

export function TeamSection() {
  return (
    <section className="py-24 sm:py-32 bg-[var(--color-bg-secondary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-sm font-medium text-brand-500 bg-brand-500/10 rounded-full mb-4">
            Team
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">Meet Our Team</h2>
          <p className="mt-4 text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            검증된 경험을 가진 시니어 개발자들이 함께합니다
          </p>
        </div>

        {/* Team grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {members.map((member) => (
            <div
              key={member.name}
              className="group p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] hover:border-brand-500/50 transition-all duration-300 text-center"
            >
              {/* Avatar */}
              {member.avatar ? (
                <div className="relative w-24 h-24 mx-auto mb-5">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover ring-4 ring-[var(--color-border)] group-hover:ring-brand-500/30 transition-all"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-br from-brand-500/20 to-emerald-500/20 flex items-center justify-center ring-4 ring-[var(--color-border)] group-hover:ring-brand-500/30 transition-all">
                  <span className="text-3xl font-bold text-brand-500">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Info */}
              <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
              <p className="text-sm text-brand-500 font-medium mb-3">
                {member.role}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

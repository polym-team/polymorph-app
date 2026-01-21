import Image from 'next/image';

import { apps } from '@/data/team';

const platformLabels = {
  web: 'Web',
  ios: 'iOS',
  android: 'Android',
  'cross-platform': 'Cross-platform',
};

export function AppsSection() {
  if (!apps || apps.length === 0) return null;

  return (
    <section id="apps" className="py-24 sm:py-32 bg-[var(--color-bg-secondary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-sm font-medium text-brand-500 bg-brand-500/10 rounded-full mb-4">
            Products
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">Our Apps</h2>
          <p className="mt-4 text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            직접 개발하고 운영 중인 서비스들입니다
          </p>
        </div>

        {/* Apps grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {apps.map((app) => (
            <a
              key={app.name}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-5 p-6 rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] hover:border-brand-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
            >
              {/* App icon */}
              {app.icon ? (
                <Image
                  src={app.icon}
                  alt={app.name}
                  width={64}
                  height={64}
                  className="rounded-2xl flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-8 h-8 text-brand-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
              )}

              {/* App info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{app.name}</h3>
                  <svg
                    className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-brand-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>

                <p className="text-[var(--color-text-secondary)] text-sm mb-3 line-clamp-2">
                  {app.description}
                </p>

                {/* Platform badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {app.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="px-2.5 py-1 text-xs font-medium rounded-full bg-brand-500/10 text-brand-500"
                    >
                      {platformLabels[platform]}
                    </span>
                  ))}
                </div>

                {/* History */}
                {app.history && app.history.length > 0 && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {app.history[app.history.length - 1]}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

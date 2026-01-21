import { projects } from '@/data/team';

export function ProjectsSection() {
  return (
    <section id="projects" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-sm font-medium text-brand-500 bg-brand-500/10 rounded-full mb-4">
            Portfolio
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">Our Projects</h2>
          <p className="mt-4 text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            다양한 기업과 함께한 프로젝트 경험
          </p>
        </div>

        {/* Projects list */}
        <div className="space-y-6">
          {projects.map((project, index) => (
            <div
              key={project.name}
              className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] hover:border-brand-500/50 transition-all duration-300"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative p-8">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Project number */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Project content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-5 group-hover:text-brand-500 transition-colors">
                      {project.name}
                    </h3>

                    {/* Description list */}
                    <ul className="space-y-3 mb-6">
                      {project.description.map((desc, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-[var(--color-text-secondary)]">
                            {desc}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 text-sm font-mono rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { services } from '@/data/team';

export function ServicesSection() {
  return (
    <section id="services" className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 text-sm font-medium text-brand-500 bg-brand-500/10 rounded-full mb-4">
            Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">What We Do</h2>
        </div>

        {/* Services grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] hover:border-brand-500/50 transition-all duration-500"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="relative p-8">
                {/* Service number */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 font-mono text-sm font-bold">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-border)] to-transparent" />
                </div>

                <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-2">
                  {service.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs font-mono rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] group-hover:border-brand-500/30 group-hover:text-brand-500 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="h-1 bg-gradient-to-r from-brand-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

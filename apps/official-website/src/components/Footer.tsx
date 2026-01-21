import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo and copyright */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo/logo_polymorph_mint.png"
              alt="Polymorph"
              width={24}
              height={24}
            />
            <span className="text-sm text-[var(--color-text-muted)]">
              Polymorph &copy; 2018 - {currentYear}
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
            <Link
              href="#about"
              className="hover:text-brand-500 transition-colors"
            >
              About
            </Link>
            <Link
              href="#services"
              className="hover:text-brand-500 transition-colors"
            >
              Services
            </Link>
            <Link
              href="#contact"
              className="hover:text-brand-500 transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

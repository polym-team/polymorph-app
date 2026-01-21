import {
  Header,
  HeroSection,
  ValuesSection,
  ServicesSection,
  AppsSection,
  ProjectsSection,
  TeamSection,
  ContactSection,
  Footer,
} from '@/components';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ValuesSection />
        <ServicesSection />
        <AppsSection />
        <ProjectsSection />
        <TeamSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}

import { Hero } from '../components/landing/Hero';
import { PainPoints } from '../components/landing/PainPoints';
import { Stats } from '../components/landing/Stats';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Features } from '../components/landing/Features';
import { Architecture } from '../components/landing/Architecture';
import { Pricing } from '../components/landing/Pricing';
import { Testimonials } from '../components/landing/Testimonials';
import { CTA } from '../components/landing/CTA';
import { PlatformOverview } from '../components/landing/PlatformOverview';
import { HardwareSection } from '../components/landing/HardwareSection';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export function Landing() {
  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navbar onSelectSection={scrollToSection} />
      <Hero />
      <section id="ai-era" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-stone-50 to-slate-50 px-8 py-14 text-center shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">The AI Era Problem</p>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            AI writes code faster than humans can review it.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Every day, AI-assisted development pushes more code, more commits, and more builds into
            your pipeline. Test infrastructure has not kept up. QA teams are the last line of defense,
            and they are drowning. TestForge closes the gap between development velocity and test coverage.
          </p>
        </div>
      </section>
      <PainPoints />
      <PlatformOverview />
      <Features />
      <HardwareSection />
      <Stats />
      <Architecture />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer onSelectSection={scrollToSection} />
    </div>
  );
}

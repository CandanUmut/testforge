import { Hero } from '../components/landing/Hero';
import { PainPoints } from '../components/landing/PainPoints';
import { Stats } from '../components/landing/Stats';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Features } from '../components/landing/Features';
import { Architecture } from '../components/landing/Architecture';
import { Pricing } from '../components/landing/Pricing';
import { Testimonials } from '../components/landing/Testimonials';
import { CTA } from '../components/landing/CTA';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <Hero />
      <Stats />
      <PainPoints />
      <HowItWorks />
      <Features />
      <Architecture />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

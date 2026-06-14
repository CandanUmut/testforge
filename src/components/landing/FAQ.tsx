import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Do I have to buy hardware or devices from you?',
    a: 'No. TestForge is software. You bring your own devices — phones, embedded boards, IoT hardware, custom DUTs — and TestForge becomes the control plane that tracks, orchestrates, and reports on the lab you already own.',
  },
  {
    q: 'Does it replace my test framework?',
    a: 'No, and that is the point. Keep pytest, Robot Framework, JUnit, or your custom harness. TestForge connects through a reporter script or REST API and replaces the operational chaos around the framework — device tracking, triage, dashboards, and alerts.',
  },
  {
    q: 'How is this different from BrowserStack or Sauce Labs?',
    a: 'Those are cloud device farms: you rent their browsers and phones to test web and mobile apps. They never touch custom hardware, firmware, or pre-release silicon. TestForge manages your in-house physical lab — the work cloud farms cannot do.',
  },
  {
    q: 'Where does my test data and device information live?',
    a: 'Your devices, your data. TestForge is built for teams under NDAs and working on pre-release hardware. Cloud and on-premise deployment options are available, and the Enterprise tier supports fully on-prem hosting.',
  },
  {
    q: 'What does the AI / agentic triage actually do?',
    a: 'Crashes are fingerprinted, deduplicated, and grouped automatically, then routed with context — turning a wall of noisy failures into a short, prioritized signal. Instead of a person reading logs every Monday, tickets arrive pre-triaged with the stack trace, device, and history attached.',
  },
  {
    q: 'How long does setup take?',
    a: 'Minutes for visibility. Point the reporter script or a CI job at the API and results start flowing into the dashboard immediately. The managed Pipeline tier, where we build your full flashing-to-reporting automation, is scoped per engagement.',
  },
  {
    q: 'Which frameworks and outputs are supported?',
    a: 'JUnit XML, pytest, Robot Framework, and custom scripts out of the box, plus a REST API for anything else. Outcomes connect to Slack and Jira so failures land where your team already works.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-slate-950">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="border-t border-gray-100 px-6 py-5 text-sm leading-7 text-slate-600">{a}</p>
      )}
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">FAQ</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            Questions hardware and firmware teams ask first.
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map(faq => (
            <FaqItem key={faq.q} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
}

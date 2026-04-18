import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 6, suffix: ' years', label: 'hands-on lab automation experience' },
  { value: 47, suffix: '', label: 'devices represented in the live demo' },
  { value: 90, suffix: ' days', label: 'of historical test data in demo mode' },
  { value: 23, suffix: '', label: 'active crashes visible in triage' },
];

function CountUp({ label, suffix, value }: { label: string; suffix: string; value: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) {
          return;
        }

        started.current = true;
        const start = performance.now();
        const duration = 1200;

        const tick = (timestamp: number) => {
          const progress = Math.min((timestamp - start) / duration, 1);
          setCount(Math.round(value * progress));
          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.45 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-card">
      <p className="text-4xl font-semibold tracking-[-0.04em] text-slate-950">
        {count}
        {suffix}
      </p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{label}</p>
    </div>
  );
}

export function Stats() {
  return (
    <section id="stats" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map(stat => (
            <CountUp key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

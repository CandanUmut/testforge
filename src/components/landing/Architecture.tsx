import { useState } from 'react';

interface Node {
  id: string;
  label: string;
  detail: string;
  top: string;
  left: string;
}

const nodes: Node[] = [
  { id: 'devices', label: 'Devices', detail: 'Android, embedded, IoT, web, and custom hardware under test.', top: '42%', left: '4%' },
  { id: 'agent', label: 'Reporter or Agent', detail: 'JUnit XML, heartbeats, and crash logs move through one ingestion path.', top: '42%', left: '27%' },
  { id: 'api', label: 'API Layer', detail: 'Auth, tenant isolation, and a standard payload format for every team.', top: '42%', left: '49%' },
  { id: 'triage', label: 'Crash Triage', detail: 'Fingerprinting, grouping, and routing failures with context.', top: '18%', left: '72%' },
  { id: 'ops', label: 'Lab Operations', detail: 'Device health, allocation, maintenance windows, and flashing queues.', top: '42%', left: '72%' },
  { id: 'dash', label: 'Dashboard', detail: 'Live visibility for runs, devices, trends, and weekly summaries.', top: '66%', left: '72%' },
];

const links = [
  ['devices', 'agent'],
  ['agent', 'api'],
  ['api', 'triage'],
  ['api', 'ops'],
  ['api', 'dash'],
] as const;

export function Architecture() {
  const [active, setActive] = useState<Node | null>(nodes[2]);

  return (
    <section id="architecture" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Architecture</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
            The product connects what the lab already does, then makes it visible.
          </h2>
        </div>

        <div className="mt-12 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_22px_54px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="relative min-h-[420px] rounded-[28px] bg-[#f8fafc] p-4">
              {links.map(([fromId, toId]) => {
                const from = nodes.find(node => node.id === fromId)!;
                const to = nodes.find(node => node.id === toId)!;

                return (
                  <div
                    key={`${fromId}-${toId}`}
                    className="absolute h-px bg-gradient-to-r from-indigo-200 to-slate-300"
                    style={{
                      top: `calc(${from.top} + 28px)`,
                      left: `calc(${from.left} + 88px)`,
                      width: `calc(${to.left} - ${from.left} - 88px)`,
                    }}
                  />
                );
              })}

              {nodes.map(node => (
                <button
                  key={node.id}
                  type="button"
                  onMouseEnter={() => setActive(node)}
                  onFocus={() => setActive(node)}
                  className={`absolute w-[170px] rounded-[24px] border px-4 py-4 text-left shadow-sm transition ${
                    active?.id === node.id
                      ? 'border-indigo-300 bg-white shadow-[0_18px_40px_rgba(79,70,229,0.10)]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                  style={{ top: node.top, left: node.left }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Node</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">{node.label}</p>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Selected Component</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{active?.label}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{active?.detail}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

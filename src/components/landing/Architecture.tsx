import { useState } from 'react';

interface NodeInfo {
  id: string;
  label: string;
  sublabel?: string;
  description: string;
  x: number;
  y: number;
  color: string;
  border: string;
}

const nodes: NodeInfo[] = [
  {
    id: 'devices',
    label: 'Client Devices',
    sublabel: 'Android · IoT · Embedded',
    description: 'Physical devices under test — connected via ADB, UART, SSH, USB, or WiFi. TestForge agent runs lightweight on-device or connects externally.',
    x: 8, y: 42,
    color: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  {
    id: 'agent',
    label: 'TestForge Agent',
    sublabel: 'Lightweight · Any platform',
    description: 'Lightweight agent deployed in your environment. Handles device communication, test execution, log collection, and result reporting.',
    x: 30, y: 42,
    color: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  {
    id: 'gateway',
    label: 'API Gateway',
    sublabel: 'REST · Webhooks · Auth',
    description: 'Secure API layer. Handles authentication, rate limiting, multi-tenant routing, and webhook ingestion from CI/CD systems.',
    x: 52, y: 42,
    color: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  {
    id: 'parser',
    label: 'Log Parser',
    sublabel: 'Pattern matching · AI',
    description: 'Ingests raw logs from all connected devices. Extracts errors, warnings, and anomalies. Runs pattern matching and anomaly detection.',
    x: 74, y: 18,
    color: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  {
    id: 'triage',
    label: 'Crash Triage AI',
    sublabel: 'Fingerprinting · Root cause',
    description: 'Groups crashes by fingerprint, identifies root causes, suggests fixes. Uses LLM-powered analysis on stack traces and log context.',
    x: 74, y: 42,
    color: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  {
    id: 'orchestrator',
    label: 'Test Orchestrator',
    sublabel: 'Parallel · Scheduling',
    description: 'Manages parallel test execution across multiple devices. Handles firmware flashing, power cycling, and test sequencing.',
    x: 74, y: 66,
    color: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  {
    id: 'dashboard',
    label: 'Live Dashboard',
    sublabel: 'Real-time · Shareable',
    description: 'Real-time web dashboard showing test results, device status, crash trends, and pass/fail rates. Built on Supabase real-time subscriptions.',
    x: 91, y: 18,
    color: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  {
    id: 'reports',
    label: 'Reports & Alerts',
    sublabel: 'Weekly · Slack · Email',
    description: 'Automated weekly and monthly quality reports. Real-time alerts via email, Slack, and webhook. Jira ticket creation for critical crashes.',
    x: 91, y: 42,
    color: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  {
    id: 'cicd',
    label: 'CI/CD Integration',
    sublabel: 'GitHub · Jenkins · GitLab',
    description: 'Native integrations with GitHub Actions, Jenkins, and GitLab CI. Block merges on test failure. Annotate PRs with test results.',
    x: 91, y: 66,
    color: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
];

const connections = [
  { from: 'devices', to: 'agent' },
  { from: 'agent', to: 'gateway' },
  { from: 'gateway', to: 'parser' },
  { from: 'gateway', to: 'triage' },
  { from: 'gateway', to: 'orchestrator' },
  { from: 'parser', to: 'dashboard' },
  { from: 'triage', to: 'reports' },
  { from: 'orchestrator', to: 'cicd' },
  { from: 'parser', to: 'reports' },
];

export function Architecture() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const hovered = nodes.find(n => n.id === hoveredNode);

  return (
    <section id="architecture" className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">
            Under the hood
          </p>
          <h2 className="section-title mb-4">
            Purpose-built architecture for{' '}
            <span className="text-gradient-blue">hardware test at scale.</span>
          </h2>
          <p className="section-subtitle">
            Hover any component to learn what it does. Every piece is designed for reliability, not complexity.
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8 overflow-hidden">
          {/* SVG Architecture Diagram */}
          <div className="relative w-full" style={{ paddingBottom: '55%' }}>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 85"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Animated connection lines */}
              {connections.map((conn, i) => {
                const from = nodes.find(n => n.id === conn.from)!;
                const to = nodes.find(n => n.id === conn.to)!;
                const x1 = from.x + 8;
                const y1 = from.y + 3;
                const x2 = to.x;
                const y2 = to.y + 3;
                const isHighlighted = hoveredNode === conn.from || hoveredNode === conn.to;

                return (
                  <g key={i}>
                    {/* Background line */}
                    <line
                      x1={`${x1}%`} y1={`${y1}%`}
                      x2={`${x2}%`} y2={`${y2}%`}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="0.5"
                    />
                    {/* Animated line */}
                    <line
                      x1={`${x1}%`} y1={`${y1}%`}
                      x2={`${x2}%`} y2={`${y2}%`}
                      stroke={isHighlighted ? '#3B82F6' : 'rgba(59,130,246,0.25)'}
                      strokeWidth={isHighlighted ? '0.8' : '0.4'}
                      strokeDasharray="3 2"
                      className="animated-dash"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(node => {
                const isHovered = hoveredNode === node.id;
                const isConnected = hoveredNode
                  ? connections.some(c => (c.from === hoveredNode && c.to === node.id) || (c.to === hoveredNode && c.from === node.id))
                  : false;

                return (
                  <foreignObject
                    key={node.id}
                    x={`${node.x}%`}
                    y={`${node.y}%`}
                    width="18%"
                    height="18%"
                    style={{ overflow: 'visible', cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <div
                      className={`
                        rounded-lg border px-2 py-1.5 text-center transition-all duration-200 select-none
                        ${node.color} ${node.border}
                        ${isHovered ? 'scale-105 shadow-lg' : ''}
                        ${isConnected ? 'opacity-100' : hoveredNode ? 'opacity-40' : 'opacity-100'}
                      `}
                    >
                      <p className="text-[9px] sm:text-[10px] font-semibold text-white leading-tight">{node.label}</p>
                      {node.sublabel && (
                        <p className="text-[7px] sm:text-[8px] text-gray-500 mt-0.5 hidden sm:block">{node.sublabel}</p>
                      )}
                    </div>
                  </foreignObject>
                );
              })}
            </svg>
          </div>

          {/* Tooltip panel */}
          <div className={`mt-6 p-4 rounded-lg border border-white/8 bg-white/3 transition-all duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`} style={{ minHeight: 72 }}>
            {hovered && (
              <div>
                <p className="text-sm font-semibold text-white mb-1">{hovered.label}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{hovered.description}</p>
              </div>
            )}
            {!hovered && (
              <p className="text-sm text-gray-600 text-center pt-3">Hover a component to see details</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

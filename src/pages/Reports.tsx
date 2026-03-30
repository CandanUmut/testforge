import { BarChart3, Download, Mail, Calendar, TrendingUp, CheckCircle, Bug, Activity } from 'lucide-react';
import { ComingSoonBadge } from '../components/common/Badge';
import { getDashboardStats } from '../utils/seedData';

const stats = getDashboardStats();

export function Reports() {
  const reportData = {
    period: 'March 17–23, 2024',
    testRuns: 47,
    passRate: stats.passRate,
    passRateDelta: +4.2,
    activeCrashes: stats.openCrashes,
    resolvedCrashes: 2,
    flakyTests: 3,
    totalDevices: 6,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Reports</h1>
          <p className="text-sm text-gray-400 mt-1">Quality reports and analytics</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
            <Mail className="w-4 h-4" />
            Email Report
          </button>
          <button className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Weekly summary */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h2 className="text-base font-semibold text-white">Weekly Report</h2>
            </div>
            <p className="text-sm text-gray-400">{reportData.period}</p>
          </div>
          <span className="badge text-blue-400 bg-blue-400/10 border-blue-400/20">Auto-generated</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: BarChart3, label: 'Test Runs', value: reportData.testRuns, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
            { icon: TrendingUp, label: 'Pass Rate', value: `${reportData.passRate}%`, sub: `+${reportData.passRateDelta}%`, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
            { icon: Bug, label: 'Open Crashes', value: reportData.activeCrashes, sub: `${reportData.resolvedCrashes} resolved`, color: 'text-red-400 bg-red-400/10 border-red-400/20' },
            { icon: Activity, label: 'Flaky Tests', value: reportData.flakyTests, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg border ${card.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.label}</p>
                {card.sub && <p className="text-xs text-emerald-400 mt-0.5">{card.sub}</p>}
              </div>
            );
          })}
        </div>

        {/* Key findings */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Key Findings</h3>
          <ul className="space-y-2">
            {[
              { type: 'good', text: 'Pass rate improved 4.2% week-over-week, driven by BLE stack stability fix (fw-3.1.3).' },
              { type: 'bad', text: 'Critical kernel panic crash on Pixel 8 Pro #1 — 12 occurrences, under investigation.' },
              { type: 'warn', text: '3 flaky tests detected in BLE connectivity suite — intermittent failures on feature/ble-v2 branch.' },
              { type: 'good', text: 'Watchdog reset crash resolved after 45 occurrences — fix deployed in fw-3.1.3.' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                <span className={`flex-shrink-0 mt-0.5 ${
                  item.type === 'good' ? 'text-emerald-400' :
                  item.type === 'bad' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {item.type === 'good' ? '↑' : item.type === 'bad' ? '✗' : '!'}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Automated reports config */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white mb-1">Automated Reports</h3>
            <p className="text-sm text-gray-400">Schedule automated delivery to your team</p>
          </div>
          <ComingSoonBadge />
        </div>
        <div className="grid md:grid-cols-3 gap-4 opacity-50 pointer-events-none">
          {[
            { title: 'Weekly Email Report', desc: 'Every Monday morning, summary of the past week', icon: Mail },
            { title: 'Monthly PDF Export', desc: 'Comprehensive monthly quality report for stakeholders', icon: Download },
            { title: 'Slack Digest', desc: 'Daily test summary posted to your Slack channel', icon: Activity },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4">
                <Icon className="w-5 h-5 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-white mb-1">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

const tiers = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'For individual engineers and small teams getting started.',
    cta: 'Get Started Free',
    ctaLink: '/signup',
    highlight: false,
    features: [
      'Up to 5 devices',
      '1,000 test results/month',
      'Basic dashboard',
      'Email alerts',
      '7-day log retention',
      'REST API access',
      'Community support',
    ],
  },
  {
    name: 'Professional',
    price: '$499',
    period: '/month',
    description: 'For product teams running continuous test automation.',
    cta: 'Start Free Trial',
    ctaLink: '/signup',
    highlight: true,
    badge: 'Most popular',
    features: [
      'Up to 50 devices',
      'Unlimited test results',
      'AI crash triage',
      'Advanced dashboards & reports',
      'Slack + Jira integration',
      'Full API access',
      '90-day log retention',
      'CI/CD integration',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For hardware companies with complex testing requirements.',
    cta: 'Contact Us',
    ctaLink: '/contact',
    highlight: false,
    features: [
      'Unlimited devices',
      'Dedicated test infrastructure',
      'Custom integrations',
      'On-premise deployment option',
      'Managed test pipeline setup',
      'Dedicated engineer support',
      'SLA guarantee (99.9%)',
      'Custom retention',
      'White-label ready',
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">
            Simple pricing
          </p>
          <h2 className="section-title mb-4">
            Pay for what you need.{' '}
            <span className="text-gradient-green">Scale as you grow.</span>
          </h2>
          <p className="section-subtitle">
            Start free. No credit card required. Upgrade when you're ready.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative glass-card p-8 flex flex-col ${
                tier.highlight
                  ? 'border-blue-500/40 bg-blue-500/5 glow-blue'
                  : 'hover:border-white/15 transition-all duration-300'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.period && <span className="text-gray-500 text-sm">{tier.period}</span>}
                </div>
                <p className="text-sm text-gray-400">{tier.description}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${tier.highlight ? 'text-blue-400' : 'text-emerald-400'}`} />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={tier.ctaLink}
                className={`flex items-center justify-center gap-2 font-medium py-3 px-6 rounded-lg transition-all duration-200 ${
                  tier.highlight
                    ? 'bg-blue-500 hover:bg-blue-400 text-white'
                    : 'bg-white/8 hover:bg-white/15 text-white border border-white/10'
                }`}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          All plans include a 14-day free trial of Professional features. No credit card required.
        </p>
      </div>
    </section>
  );
}

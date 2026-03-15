"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, X, Zap, Building2, Users, ArrowRight } from "lucide-react";
import { subscriptionsApi } from "@/lib/api";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { cn, CURRENCIES, type Currency } from "@/lib/utils";

const CURRENCY_SYMBOLS: Record<Currency, string> = { PKR: "₨", USD: "$", GBP: "£" };

// Hard-coded plan data (also fetched from API when available)
const PLANS = [
  {
    key: "free",
    name: "Free",
    tagline: "For individuals exploring opportunities",
    prices: { PKR: 0, USD: 0, GBP: 0 },
    highlight: false,
    icon: <Zap className="w-5 h-5" />,
    features: [
      { label: "10 tenders per month", included: true },
      { label: "Basic tender listings", included: true },
      { label: "Public data access", included: true },
      { label: "AI summaries", included: false },
      { label: "Word & PDF downloads", included: false },
      { label: "Sector alerts", included: false },
      { label: "Weekly digest", included: false },
      { label: "API access", included: false },
    ],
    cta: "Get Started Free",
    ctaHref: "/auth/signup",
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "For SMEs actively bidding on contracts",
    prices: { PKR: 4999, USD: 18, GBP: 14 },
    highlight: true,
    icon: <Building2 className="w-5 h-5" />,
    badge: "Most Popular",
    features: [
      { label: "Unlimited tenders", included: true },
      { label: "AI-powered summaries", included: true },
      { label: "Word & PDF report downloads", included: true },
      { label: "Sector & keyword alerts", included: true },
      { label: "Weekly digest email", included: true },
      { label: "Opportunity scoring (0-100)", included: true },
      { label: "SME insights & recommendations", included: true },
      { label: "API access", included: false },
    ],
    cta: "Start Pro Plan",
    ctaHref: "/dashboard?upgrade=pro",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline: "For consultancies and larger teams",
    prices: { PKR: 14999, USD: 54, GBP: 42 },
    highlight: false,
    icon: <Users className="w-5 h-5" />,
    features: [
      { label: "Everything in Pro", included: true },
      { label: "5 user seats", included: true },
      { label: "REST API access", included: true },
      { label: "Custom alert workflows", included: true },
      { label: "Priority email support", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "Custom sector reports", included: true },
      { label: "SLA guarantee", included: true },
    ],
    cta: "Start Enterprise Plan",
    ctaHref: "/dashboard?upgrade=enterprise",
  },
];

const FAQS = [
  {
    q: "How is the data collected?",
    a: "We use the official CKAN API from data.gov.pk to pull PPRA and other government procurement datasets daily. All data is publicly available.",
  },
  {
    q: "Can I pay in Pakistani Rupees?",
    a: "Yes! We accept PKR via Stripe (Visa, Mastercard, Amex) and Easypaisa mobile wallet for Pakistan-based users.",
  },
  {
    q: "What AI model powers the summaries?",
    a: "We use Anthropic's Claude — one of the world's most capable AI models — specifically prompted for Pakistan's procurement context.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Absolutely. Cancel any time from your dashboard. You'll keep access until the end of your billing period.",
  },
  {
    q: "Is there an annual discount?",
    a: "Yes — annual plans save you 20%. Contact us or select 'Annual' during checkout.",
  },
];

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>("PKR");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const annualMultiplier = billing === "annual" ? 0.8 : 1;

  function displayPrice(prices: Record<Currency, number>): string {
    const raw = prices[currency] * annualMultiplier;
    if (raw === 0) return "Free";
    const sym = CURRENCY_SYMBOLS[currency];
    if (currency === "PKR") return `${sym} ${Math.round(raw).toLocaleString("en-PK")}`;
    return `${sym} ${raw.toFixed(0)}`;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="py-16 bg-gray-50 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-bold font-display text-brand-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            Pay in PKR, USD, or GBP. Switch plans anytime. Cancel with one click.
          </p>

          {/* Currency switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex bg-white rounded-xl border border-gray-200 p-1">
              {CURRENCIES.map((c) => (
                <button key={c} onClick={() => setCurrency(c)}
                  className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                    currency === c
                      ? "bg-brand-900 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex bg-white rounded-xl border border-gray-200 p-1">
              {(["monthly", "annual"] as const).map((b) => (
                <button key={b} onClick={() => setBilling(b)}
                  className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize",
                    billing === b
                      ? "bg-brand-900 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}>
                  {b}
                  {b === "annual" && <span className="ml-1.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">−20%</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Plans grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan) => (
              <div key={plan.key}
                className={cn(
                  "rounded-2xl border-2 p-8 relative",
                  plan.highlight
                    ? "border-brand-900 shadow-card-hover scale-105"
                    : "border-gray-200 shadow-card"
                )}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-900 text-white text-xs font-bold px-4 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                  plan.highlight ? "bg-brand-900 text-white" : "bg-gray-100 text-gray-600")}>
                  {plan.icon}
                </div>

                <h2 className="text-xl font-bold text-gray-900 font-display">{plan.name}</h2>
                <p className="text-gray-500 text-sm mt-1 mb-5">{plan.tagline}</p>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-brand-900 font-display">
                    {displayPrice(plan.prices)}
                  </div>
                  {plan.prices[currency] > 0 && (
                    <div className="text-gray-400 text-sm mt-1">per user / {billing === "annual" ? "year" : "month"}</div>
                  )}
                </div>

                <Link href={plan.ctaHref}
                  className={cn("w-full py-3 px-6 rounded-lg font-semibold text-sm text-center flex items-center justify-center gap-2 transition-all",
                    plan.highlight
                      ? "bg-brand-900 text-white hover:bg-brand-800"
                      : "border-2 border-brand-900 text-brand-900 hover:bg-brand-50"
                  )}>
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
                  {plan.features.map((f) => (
                    <div key={f.label} className="flex items-center gap-3">
                      {f.included
                        ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : <X className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                      <span className={cn("text-sm", f.included ? "text-gray-700" : "text-gray-400")}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Payment methods */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm mb-4">Secure payments powered by</p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {["💳 Visa", "💳 Mastercard", "💳 American Express", "🏧 Easypaisa", "🏧 JazzCash"].map((method) => (
                <span key={method} className="bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-lg font-medium">
                  {method}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">All transactions are secured with 256-bit SSL encryption</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold font-display text-brand-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="card">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-900 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold font-display text-white mb-4">
            Ready to Win More Government Contracts?
          </h2>
          <p className="text-white/70 mb-8">Start with our free plan — no credit card required.</p>
          <Link href="/auth/signup"
            className="bg-gold-700 hover:bg-gold-600 text-white px-10 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-2 transition-all">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

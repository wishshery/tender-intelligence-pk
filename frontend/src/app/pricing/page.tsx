"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ChevronDown, ChevronUp, ArrowRight, Search, FileText, Bell, BarChart2, Users, Zap } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const FEATURES = [
  {
    icon: <Search className="w-5 h-5" />,
    title: "Full Tender Explorer",
    desc: "Search and filter the complete PPRA procurement database with advanced filters by sector, value, deadline, and ministry.",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "AI-Powered Summaries",
    desc: "Instantly understand any tender with plain-language AI summaries highlighting requirements, eligibility, and key deadlines.",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Sector Alerts",
    desc: "Get notified when new tenders matching your keywords and sectors are published — delivered to your inbox.",
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: "Opportunity Scoring",
    desc: "Each tender gets a 0–100 fit score based on your sector profile so you focus on the best opportunities.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "SME Intelligence",
    desc: "Tailored insights and bid strategy recommendations specifically designed for Pakistani small and medium enterprises.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Weekly Digest",
    desc: "A curated weekly email summary of top tenders in your sectors — stay informed without logging in every day.",
  },
];

const INCLUDED = [
  "Unlimited tender browsing",
  "AI summaries for every tender",
  "Sector & keyword alerts",
  "Weekly digest email",
  "Opportunity fit scoring",
  "Word & PDF report downloads",
  "SME bid strategy insights",
  "Data from official data.gov.pk sources",
];

const FAQS = [
  {
    q: "Is TenderIQ Pakistan really free?",
    a: "Yes — during our launch phase, all features are completely free for registered users. We're focused on helping Pakistani SMEs access procurement opportunities without barriers.",
  },
  {
    q: "Where does the tender data come from?",
    a: "All data is sourced from the official CKAN API at data.gov.pk, which publishes PPRA procurement notices as open government data. We refresh daily.",
  },
  {
    q: "What AI model powers the summaries?",
    a: "We use Anthropic's Claude — one of the world's leading AI models — specifically configured for Pakistan's government procurement context.",
  },
  {
    q: "Do I need a credit card to sign up?",
    a: "No. There is no payment required. Simply register with your email and you get full access immediately.",
  },
  {
    q: "Can I use TenderIQ for my consultancy firm?",
    a: "Absolutely. Multiple team members can register individually. If you need a shared team workspace or API access, contact us and we'll work something out.",
  },
  {
    q: "Will you charge in the future?",
    a: "We may introduce optional premium features down the road, but we're committed to keeping the core platform accessible. Early registrants will always be looked after.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-cream-100">
      <Navbar />

      {/* ── Hero ── */}
      <section className="py-24 bg-cream-100 text-center border-b border-cream-300">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs tracking-widest uppercase text-charcoal-700 mb-5 font-semibold">
            Access &amp; Pricing
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-charcoal-900 mb-6 leading-tight">
            Free for Pakistani SMEs
          </h1>
          <div className="w-12 h-px bg-charcoal-900 mx-auto mb-8" />
          <p className="text-lg text-charcoal-700 leading-relaxed max-w-xl mx-auto mb-10">
            TenderIQ Pakistan is completely free during our launch phase.
            Register today and get full access to AI-powered procurement intelligence — no credit card, no subscription.
          </p>
          <Link href="/auth/signup" className="btn-dark inline-flex items-center gap-3 text-sm tracking-widest uppercase">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── What's included ── */}
      <section className="py-24 bg-white border-b border-cream-300">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left: heading */}
            <div>
              <p className="text-xs tracking-widest uppercase text-charcoal-700 mb-4 font-semibold">Everything Included</p>
              <h2 className="font-serif text-4xl text-charcoal-900 mb-6 leading-tight">
                Full platform access.<br />No restrictions.
              </h2>
              <div className="w-10 h-px bg-charcoal-900 mb-8" />
              <p className="text-charcoal-700 leading-relaxed mb-10">
                Every registered user gets the complete TenderIQ platform. We believe Pakistani SMEs deserve the same procurement intelligence as large corporations — without the price tag.
              </p>
              <ul className="space-y-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-charcoal-800">
                    <CheckCircle className="w-4 h-4 text-forest-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: feature cards */}
            <div className="grid sm:grid-cols-2 gap-5">
              {FEATURES.map((f) => (
                <div key={f.title} className="border border-cream-300 bg-cream-50 p-6 hover:border-charcoal-900 hover:bg-charcoal-900 hover:text-white group transition-all duration-300">
                  <div className="w-9 h-9 border border-current flex items-center justify-center mb-4 text-charcoal-900 group-hover:text-white transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-sm text-charcoal-900 group-hover:text-white mb-2 transition-colors">{f.title}</h3>
                  <p className="text-xs text-charcoal-700 group-hover:text-cream-300 leading-relaxed transition-colors">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sign-up CTA strip ── */}
      <section className="py-16 bg-charcoal-900 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-serif text-3xl text-cream-100 mb-4">Start in under two minutes</h2>
          <p className="text-cream-400 text-sm mb-8 leading-relaxed">
            Register with your email, set your sectors and keywords, and receive your first tender alerts today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-dark bg-cream-100 text-charcoal-900 hover:bg-cream-200 inline-flex items-center gap-2 justify-center text-sm tracking-widest uppercase px-8 py-3 font-semibold transition-all">
              Get Free Access <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/tenders" className="btn-outline-dark border-cream-400 text-cream-200 hover:bg-cream-100 hover:text-charcoal-900 inline-flex items-center gap-2 justify-center text-sm tracking-widest uppercase px-8 py-3 font-semibold transition-all">
              Browse Tenders First
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-cream-100">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs tracking-widest uppercase text-charcoal-700 mb-4 font-semibold">Common Questions</p>
            <h2 className="font-serif text-4xl text-charcoal-900">Frequently Asked</h2>
            <div className="w-10 h-px bg-charcoal-900 mx-auto mt-6" />
          </div>

          <div className="space-y-0 border-t border-cream-300">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="border-b border-cream-300">
                <button
                  className="w-full text-left py-5 flex items-start justify-between gap-4 group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-sm text-charcoal-900 group-hover:text-charcoal-700 transition-colors leading-relaxed pr-4">
                    {faq.q}
                  </span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-charcoal-700 flex-shrink-0 mt-0.5" />
                    : <ChevronDown className="w-4 h-4 text-charcoal-700 flex-shrink-0 mt-0.5" />}
                </button>
                {openFaq === i && (
                  <p className="text-sm text-charcoal-700 leading-relaxed pb-5">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact strip ── */}
      <section className="py-16 bg-cream-200 border-t border-cream-300 text-center">
        <div className="max-w-xl mx-auto px-6">
          <p className="text-xs tracking-widest uppercase text-charcoal-700 mb-3 font-semibold">Still Have Questions?</p>
          <h3 className="font-serif text-2xl text-charcoal-900 mb-4">We&apos;re here to help</h3>
          <p className="text-sm text-charcoal-700 mb-6">
            Email us at{" "}
            <a href="mailto:support@tenderiq.pk" className="text-charcoal-900 underline underline-offset-2 font-medium hover:text-forest-700 transition-colors">
              support@tenderiq.pk
            </a>{" "}
            or reach out via the contact form on our homepage.
          </p>
          <Link href="/#contact" className="btn-outline-dark text-sm tracking-widest uppercase inline-flex items-center gap-2 px-8 py-3">
            Contact Us
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

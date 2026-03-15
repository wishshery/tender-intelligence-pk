"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Building2, Bell, FileText, TrendingUp, CheckCircle,
  ArrowRight, Star, Shield, Zap, Globe, Users, BarChart3
} from "lucide-react";
import { tendersApi } from "@/lib/api";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const SECTORS = [
  { icon: "🏗️", name: "Construction", count: "340+" },
  { icon: "💻", name: "IT & Digital", count: "210+" },
  { icon: "🏥", name: "Medical", count: "180+" },
  { icon: "⚡", name: "Infrastructure", count: "290+" },
  { icon: "📊", name: "Consulting", count: "150+" },
  { icon: "☀️", name: "Energy", count: "120+" },
];

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6 text-brand-900" />,
    title: "Daily CKAN Data Ingestion",
    desc: "Automatically pulls from data.gov.pk and PPRA every day. Never miss a new opportunity.",
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-brand-900" />,
    title: "AI-Powered Analysis",
    desc: "Claude AI reads every tender document and produces SME-friendly summaries, eligibility breakdowns, and opportunity scores.",
  },
  {
    icon: <Bell className="w-6 h-6 text-brand-900" />,
    title: "Smart Sector Alerts",
    desc: "Subscribe to sectors and keywords. Get instant email alerts when relevant tenders are published.",
  },
  {
    icon: <FileText className="w-6 h-6 text-brand-900" />,
    title: "Word & PDF Reports",
    desc: "One-click download of professionally formatted tender summaries. Share with your team instantly.",
  },
  {
    icon: <Globe className="w-6 h-6 text-brand-900" />,
    title: "Multi-Currency Pricing",
    desc: "Pay in PKR, USD, or GBP. Accept Visa, Mastercard, Amex, or Easypaisa.",
  },
  {
    icon: <Shield className="w-6 h-6 text-brand-900" />,
    title: "PPRA Focused",
    desc: "Specifically curated for Pakistan Public Procurement Regulatory Authority datasets and related government bodies.",
  },
];

const TESTIMONIALS = [
  {
    name: "Ahmed Raza",
    company: "TechBridge Solutions, Lahore",
    quote:
      "TenderIQ saved us 15+ hours per week. We used to manually browse PPRA websites. Now the alerts come to us.",
    rating: 5,
  },
  {
    name: "Sadia Khalil",
    company: "MedSupply Pakistan, Karachi",
    quote:
      "The AI summaries are remarkably accurate. We won a PKR 8M medical equipment contract we would have missed otherwise.",
    rating: 5,
  },
  {
    name: "Zubair Nawaz",
    company: "BuildRight Contractors, Islamabad",
    quote:
      "The PDF reports are professional enough to share with our board. Excellent product for the price.",
    rating: 5,
  },
];

export default function LandingPage() {
  const { data: stats } = useQuery({
    queryKey: ["tender-stats"],
    queryFn: () => tendersApi.stats().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-hero-pattern text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90">Live data from data.gov.pk · Updated daily</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-tight mb-6">
              Pakistan's Smartest
              <span className="text-gold-400"> Procurement Intelligence</span>
              <br />Platform
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              We turn PPRA &amp; Government tender data into actionable opportunities for
              Pakistani SMEs — powered by AI, delivered to your inbox.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn-gold text-lg px-8 py-4 flex items-center justify-center gap-2">
                Start Free Today <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/tenders" className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition text-lg flex items-center justify-center gap-2">
                Browse Tenders
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
              {[
                { label: "Active Tenders", value: stats?.active_tenders?.toLocaleString() ?? "1,200+" },
                { label: "Sectors Covered", value: "18" },
                { label: "High-Value Opportunities", value: stats?.high_value_tenders?.toLocaleString() ?? "240+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold font-display text-white">{stat.value}</div>
                  <div className="text-sm text-white/60 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full fill-white">
            <path d="M0,40 C300,80 900,0 1200,40 L1200,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ── Sectors ──────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-display text-brand-900">
              Coverage Across All Major Sectors
            </h2>
            <p className="text-gray-500 mt-2">
              From construction to IT — we track procurement across Pakistan's entire government ecosystem
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SECTORS.map((sector) => (
              <div key={sector.name}
                className="card-hover text-center py-5 px-3">
                <div className="text-3xl mb-2">{sector.icon}</div>
                <div className="font-semibold text-gray-800 text-sm">{sector.name}</div>
                <div className="text-xs text-brand-600 font-medium mt-1">{sector.count} tenders</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-brand-900">
              Everything You Need to Win More Contracts
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              TenderIQ replaces hours of manual research with a single intelligent dashboard
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="card">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-brand-900">
              How TenderIQ Works
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Data Ingestion", desc: "We pull from CKAN (data.gov.pk) every day — thousands of PPRA tender records automatically." },
              { step: "02", title: "AI Analysis", desc: "Claude AI reads each tender, writes a plain-English summary, and scores the opportunity for SMEs." },
              { step: "03", title: "Smart Alerts", desc: "You subscribe to sectors and keywords. We match tenders and notify you instantly." },
              { step: "04", title: "Download & Win", desc: "Download Word/PDF summaries, share with colleagues, and submit your bid with confidence." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-brand-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-20 bg-brand-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-white">
              Trusted by Pakistani SMEs
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-white/50 text-xs">{t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-display text-brand-900 mb-4">
            Start Winning Government Contracts Today
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Free to start. No credit card required. Upgrade when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/pricing" className="btn-outline text-lg px-8 py-4">
              View Pricing
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Free forever plan</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

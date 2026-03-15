"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2, Bell, FileText, TrendingUp, CheckCircle,
  ArrowRight, Star, Shield, Zap, Globe, Users, BarChart3,
  Play, ChevronRight, Database, Brain, Download, Trophy
} from "lucide-react";
import { tendersApi } from "@/lib/api";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

/* ─── Pakistan flag crescent + star SVG watermark ─── */
const PakFlagWatermark = () => (
  <svg
    viewBox="0 0 900 600"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0 w-full h-full pointer-events-none select-none"
    style={{ opacity: 0.06 }}
    aria-hidden="true"
  >
    {/* white left stripe */}
    <rect x="0" y="0" width="225" height="600" fill="white" />
    {/* green right */}
    <rect x="225" y="0" width="675" height="600" fill="#01411C" />
    {/* crescent moon */}
    <circle cx="540" cy="300" r="175" fill="white" />
    <circle cx="605" cy="265" r="148" fill="#01411C" />
    {/* star */}
    <g transform="translate(680,185) rotate(45)">
      <polygon
        points="0,-60 14,-20 55,-20 22,8 36,48 0,25 -36,48 -22,8 -55,-20 -14,-20"
        fill="white"
      />
    </g>
  </svg>
);

const SECTORS = [
  { icon: "🏗️", name: "Construction",   count: "340+" },
  { icon: "💻", name: "IT & Digital",    count: "210+" },
  { icon: "🏥", name: "Medical",         count: "180+" },
  { icon: "⚡", name: "Energy",          count: "120+" },
  { icon: "🚗", name: "Transport",       count: "95+"  },
  { icon: "📚", name: "Education",       count: "140+" },
  { icon: "💧", name: "Water & Sanit.",  count: "88+"  },
  { icon: "🌾", name: "Agriculture",     count: "75+"  },
  { icon: "📡", name: "Telecom",         count: "62+"  },
  { icon: "📊", name: "Consulting",      count: "150+" },
  { icon: "🛡️", name: "Security",        count: "44+"  },
  { icon: "🌳", name: "Environment",     count: "38+"  },
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
    desc: "Claude AI reads every tender and produces SME-friendly summaries, eligibility breakdowns, and 0-100 opportunity scores.",
  },
  {
    icon: <Bell className="w-6 h-6 text-brand-900" />,
    title: "Smart Sector Alerts",
    desc: "Subscribe to sectors and keywords. Get instant email alerts within 15 minutes of matching tenders going live.",
  },
  {
    icon: <FileText className="w-6 h-6 text-brand-900" />,
    title: "Word & PDF Reports",
    desc: "One-click download of professionally formatted tender summaries. Print-ready for board meetings.",
  },
  {
    icon: <Globe className="w-6 h-6 text-brand-900" />,
    title: "Multi-Currency Pricing",
    desc: "Pay in PKR, USD, or GBP. Accept Visa, Mastercard, Amex, or Easypaisa — whatever works for you.",
  },
  {
    icon: <Shield className="w-6 h-6 text-brand-900" />,
    title: "PPRA Focused",
    desc: "Built specifically for Pakistan Public Procurement Regulatory Authority datasets and related government bodies.",
  },
];

const TESTIMONIALS = [
  {
    name: "Ahmed Raza",
    company: "TechBridge Solutions, Lahore",
    quote: "TenderIQ saved us 15+ hours per week. We used to manually browse PPRA websites. Now the alerts come to us.",
    rating: 5,
  },
  {
    name: "Sadia Khalil",
    company: "MedSupply Pakistan, Karachi",
    quote: "The AI summaries are remarkably accurate. We won a PKR 8M medical equipment contract we would have missed otherwise.",
    rating: 5,
  },
  {
    name: "Zubair Nawaz",
    company: "BuildRight Contractors, Islamabad",
    quote: "The PDF reports are professional enough to share with our board. Excellent product for the price.",
    rating: 5,
  },
];

/* ─── Demo section tab data ─── */
const DEMO_TABS = [
  {
    id: "discover",
    label: "01 · Discover",
    icon: <Database className="w-4 h-4" />,
    title: "Live PPRA Tender Feed",
    desc: "Every day we pull thousands of tenders directly from data.gov.pk via the CKAN API. Instantly searchable, filterable by sector, deadline, and estimated value.",
    screen: (
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-brand-900 px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-white/60 text-xs ml-2 font-mono">tenderiq.pk/dashboard/tenders</span>
        </div>
        <div className="p-4 space-y-3">
          {[
            { title: "Supply of Solar Panels — Ministry of Energy", score: 87, sector: "⚡ Energy",    value: "PKR 48.5M", deadline: "30 Mar" },
            { title: "Medical Equipment for DHQ Hospitals (12 units)", score: 91, sector: "🏥 Medical",  value: "PKR 120M",  deadline: "25 Mar" },
            { title: "Integrated Tax System Development — FBR",         score: 74, sector: "💻 IT",       value: "PKR 85M",   deadline: "10 Apr" },
          ].map((t, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 leading-snug">{t.title}</p>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">{t.sector}</span>
                  <span className="text-[10px] text-gray-400">📅 {t.deadline}</span>
                  <span className="text-[10px] text-gray-400">💰 {t.value}</span>
                </div>
              </div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${t.score >= 85 ? "bg-emerald-500" : "bg-amber-500"}`}>
                {t.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "analyse",
    label: "02 · Analyse",
    icon: <Brain className="w-4 h-4" />,
    title: "Claude AI Does the Reading",
    desc: "Our AI model reads every tender document, extracts key requirements, scores SME suitability from 0-100, and writes a plain-English summary — so you don't have to.",
    screen: (
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-brand-900 px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-white/60 text-xs ml-2 font-mono">AI Analysis · Score 91/100</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-gradient-to-r from-brand-900 to-blue-600 text-white px-2 py-0.5 rounded">AI Summary</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">This tender seeks a qualified supplier for solar PV systems at 14 Federal Government buildings. Estimated PKR 48.5M. AEDB registration required. Joint ventures permitted with 51% lead stake. Pre-bid meeting 20 March.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[["📋 Eligibility","AEDB reg · PKR 25M turnover"],["⏰ Deadline","30 Mar · 15 days left"],["🏆 SME Score","87 / 100 · High Fit"]].map(([t,v],i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-2">
                <p className="text-[10px] font-bold text-gray-500">{t}</p>
                <p className="text-[10px] text-gray-700 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "alerts",
    label: "03 · Get Alerted",
    icon: <Bell className="w-4 h-4" />,
    title: "Instant Keyword & Sector Alerts",
    desc: "Set keywords like 'solar panels' or subscribe to entire sectors like Medical or IT. We match every new tender within 15 minutes and email you immediately.",
    screen: (
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-brand-900 px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-white/60 text-xs ml-2 font-mono">Alerts Inbox · 3 unread</span>
        </div>
        <div className="p-4 space-y-2">
          {[
            { kw: "solar panels",      title: "Ministry of Energy · PKR 48.5M", time: "2m ago",  score: 87, unread: true  },
            { kw: "medical equipment", title: "Punjab Health Dept · PKR 120M",  time: "1h ago",  score: 91, unread: true  },
            { kw: "IT sector alert",   title: "3 new tenders — FBR, NADRA, NTC",time: "3h ago",  score: null,unread: true },
            { kw: "weekly digest",     title: "28 tenders reviewed · 5 picks",  time: "Yesterday",score: null,unread: false},
          ].map((a,i) => (
            <div key={i} className={`rounded-lg border p-2.5 ${a.unread ? "bg-blue-50 border-blue-200":"bg-white border-gray-200"}`}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex gap-1.5">
                  {a.unread && <div className="w-2 h-2 bg-brand-900 rounded-full mt-1 flex-shrink-0" />}
                  <div>
                    <p className="text-[11px] font-bold text-gray-800">🔤 {a.kw}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{a.title}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "download",
    label: "04 · Download & Win",
    icon: <Download className="w-4 h-4" />,
    title: "One-Click Professional Reports",
    desc: "Generate branded Word or PDF tender analysis reports in seconds. Share with your team, use them for bid preparation, or present to your board.",
    screen: (
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-brand-900 px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="text-white/60 text-xs ml-2 font-mono">Reports · Download Centre</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-xs font-bold text-gray-700 mb-3">📥 Download Tender Report</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-brand-900 text-white text-[11px] font-semibold rounded-lg py-2 px-3 flex items-center justify-center gap-1.5">
                <FileText className="w-3 h-3" /> Word .docx
              </button>
              <button className="flex-1 bg-yellow-500 text-white text-[11px] font-semibold rounded-lg py-2 px-3 flex items-center justify-center gap-1.5">
                <FileText className="w-3 h-3" /> PDF Report
              </button>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-[11px] font-bold text-emerald-700">✅ Report generated successfully</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">TenderIQ_MOE_Solar_20260315.docx · 142 KB</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[["📄","12 Reports","This month"],["🏆","3 Bids","Submitted"],["💰","PKR 48M","In pipeline"]].map(([icon,v,l],i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-2">
                <div className="text-base">{icon}</div>
                <div className="text-[11px] font-bold text-gray-800">{v}</div>
                <div className="text-[9px] text-gray-400">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

export default function LandingPage() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["tender-stats"],
    queryFn: () => tendersApi.stats().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero with Pakistan flag watermark ────────────────── */}
      <section className="bg-hero-pattern text-white relative overflow-hidden">
        {/* Pakistan flag watermark */}
        <PakFlagWatermark />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90">Live data from data.gov.pk · Updated daily · 🇵🇰 Made for Pakistan</span>
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
              <button
                onClick={() => setVideoOpen(true)}
                className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition text-lg flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" /> Watch Demo
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
              {[
                { label: "Active Tenders",  value: stats?.active_tenders?.toLocaleString() ?? "2,400+" },
                { label: "Sectors Covered", value: "18" },
                { label: "High-Value",       value: stats?.high_value_tenders?.toLocaleString() ?? "143+" },
                { label: "PKR Value",         value: "340B+" },
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

      {/* ── Video modal ───────────────────────────────────────── */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-brand-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gold-400 rounded-lg flex items-center justify-center text-white font-bold">📋</div>
                <div>
                  <p className="text-white font-bold">TenderIQ Pakistan — Platform Overview</p>
                  <p className="text-white/60 text-xs">4 min walkthrough · AI-powered procurement intelligence</p>
                </div>
              </div>
              <button onClick={() => setVideoOpen(false)} className="text-white/60 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            {/* Embedded demo walkthrough inside the modal */}
            <div className="p-6 bg-gray-50">
              <div className="flex gap-2 mb-4 flex-wrap">
                {DEMO_TABS.map((tab, i) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveDemo(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeDemo === i
                        ? "bg-brand-900 text-white shadow"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-brand-900 hover:text-brand-900"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-4 items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{DEMO_TABS[activeDemo].title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{DEMO_TABS[activeDemo].desc}</p>
                  {activeDemo < DEMO_TABS.length - 1 ? (
                    <button
                      onClick={() => setActiveDemo(activeDemo + 1)}
                      className="btn-primary text-sm flex items-center gap-1.5"
                    >
                      Next step <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link href="/auth/signup" onClick={() => setVideoOpen(false)} className="btn-gold text-sm flex items-center gap-1.5 inline-flex">
                      Get Started Free <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
                <div>{DEMO_TABS[activeDemo].screen}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sectors ──────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-display text-brand-900">
              Coverage Across All 18 Sectors
            </h2>
            <p className="text-gray-500 mt-2">
              From construction to IT — we track procurement across Pakistan's entire government ecosystem
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {SECTORS.map((sector) => (
              <div key={sector.name} className="card-hover text-center py-5 px-3">
                <div className="text-3xl mb-2">{sector.icon}</div>
                <div className="font-semibold text-gray-800 text-sm">{sector.name}</div>
                <div className="text-xs text-brand-600 font-medium mt-1">{sector.count} tenders</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Demo Section ──────────────────────────── */}
      <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a3880 0%, #0D47A1 60%, #1565C0 100%)" }}>
        {/* Pakistan flag watermark */}
        <PakFlagWatermark />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 mb-4">
              <Play className="w-3.5 h-3.5 fill-white text-white" /> Interactive Product Tour
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-display mb-3">
              See TenderIQ in Action
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Walk through the full workflow — from live PPRA data to winning your next government contract.
            </p>
          </div>

          {/* Step tabs */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {DEMO_TABS.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveDemo(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeDemo === i
                    ? "bg-white text-brand-900 shadow-lg"
                    : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Demo content */}
          <div className="grid lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">{DEMO_TABS[activeDemo].title}</h3>
              <p className="text-white/75 text-base leading-relaxed mb-6">{DEMO_TABS[activeDemo].desc}</p>

              {/* Step indicators */}
              <div className="space-y-2 mb-6">
                {DEMO_TABS.map((tab, i) => (
                  <div key={tab.id} className={`flex items-center gap-3 transition-all ${i === activeDemo ? "opacity-100" : "opacity-40"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i <= activeDemo ? "bg-gold-400 text-white" : "bg-white/20 text-white"}`}>
                      {i < activeDemo ? "✓" : i + 1}
                    </div>
                    <span className={`text-sm font-medium ${i === activeDemo ? "text-white" : "text-white/60"}`}>{tab.title}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                {activeDemo > 0 && (
                  <button
                    onClick={() => setActiveDemo(activeDemo - 1)}
                    className="bg-white/10 border border-white/30 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/20 transition"
                  >
                    ← Back
                  </button>
                )}
                {activeDemo < DEMO_TABS.length - 1 ? (
                  <button
                    onClick={() => setActiveDemo(activeDemo + 1)}
                    className="btn-gold flex items-center gap-2"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link href="/auth/signup" className="btn-gold flex items-center gap-2">
                    Start for Free <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Screen preview */}
            <div className="lg:pl-4">
              <div className="shadow-2xl rounded-2xl overflow-hidden border-2 border-white/20">
                {DEMO_TABS[activeDemo].screen}
              </div>
            </div>
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
            <h2 className="text-3xl font-bold font-display text-brand-900">How TenderIQ Works</h2>
            <p className="text-gray-500 mt-2">From raw government data to a winning bid — in 4 simple steps</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: <Database className="w-6 h-6" />, title: "Data Ingestion",   desc: "We pull from CKAN (data.gov.pk) every day — thousands of PPRA tender records, automatically." },
              { step: "02", icon: <Brain className="w-6 h-6" />,    title: "AI Analysis",      desc: "Claude AI reads each tender, writes a plain-English summary, and scores the opportunity for SMEs." },
              { step: "03", icon: <Bell className="w-6 h-6" />,     title: "Smart Alerts",     desc: "You subscribe to sectors and keywords. We match tenders and notify you within 15 minutes." },
              { step: "04", icon: <Trophy className="w-6 h-6" />,   title: "Download & Win",   desc: "Download Word/PDF summaries, share with colleagues, and submit your bid with confidence." },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-16 h-16 bg-brand-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-500 transition-colors shadow-lg">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-brand-400 mb-1">{item.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-20 bg-brand-900 relative overflow-hidden">
        <PakFlagWatermark />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display text-white">Trusted by Pakistani SMEs 🇵🇰</h2>
            <p className="text-white/60 mt-2">Businesses across Pakistan are winning more contracts with TenderIQ</p>
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
          <div className="text-4xl mb-4">🇵🇰</div>
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
            <button
              onClick={() => setVideoOpen(true)}
              className="btn-outline text-lg px-8 py-4 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> Watch Demo
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Free forever plan</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Easypaisa supported</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

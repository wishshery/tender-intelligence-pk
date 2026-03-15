"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Search, Bell, FileText, Brain, CheckCircle, ChevronDown } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

/* ─── Pakistan flag watermark (subtle) ─── */
const PakFlagWatermark = () => (
  <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0 w-full h-full pointer-events-none select-none"
    style={{ opacity: 0.05 }} aria-hidden="true">
    <rect x="0"   y="0" width="225" height="600" fill="white" />
    <rect x="225" y="0" width="675" height="600" fill="#224D18" />
    <circle cx="540" cy="300" r="175" fill="white" />
    <circle cx="608" cy="262" r="148" fill="#224D18" />
    <g transform="translate(685,183) rotate(45)">
      <polygon points="0,-60 14,-20 55,-20 22,8 36,48 0,25 -36,48 -22,8 -55,-20 -14,-20" fill="white" />
    </g>
  </svg>
);

/* ─── Services ─── */
const SERVICES = [
  {
    number: "01",
    title: "Tender Discovery",
    desc: "Automatically pulls every tender from PPRA and data.gov.pk daily. Advanced search and filtering across 12+ sectors — never miss an opportunity.",
    img: "🔍",
  },
  {
    number: "02",
    title: "AI Analysis",
    desc: "Claude AI reads each tender and produces plain-language summaries, eligibility breakdowns, risk flags, and an opportunity score from 0–100.",
    img: "🤖",
  },
  {
    number: "03",
    title: "Smart Alerts",
    desc: "Subscribe to sectors and keywords. Get instant email alerts within 15 minutes of a matching tender going live. Never bid blind again.",
    img: "🔔",
  },
];

/* ─── Sectors ─── */
const SECTORS = [
  { icon: "🏗️", name: "Construction",  count: "340+" },
  { icon: "💻", name: "IT & Digital",  count: "210+" },
  { icon: "🏥", name: "Medical",       count: "180+" },
  { icon: "⚡", name: "Energy",        count: "120+" },
  { icon: "🚗", name: "Transport",     count: "95+"  },
  { icon: "📚", name: "Education",     count: "140+" },
  { icon: "💧", name: "Water",         count: "88+"  },
  { icon: "🌾", name: "Agriculture",   count: "75+"  },
  { icon: "📡", name: "Telecom",       count: "62+"  },
  { icon: "📊", name: "Consulting",    count: "150+" },
  { icon: "🛡️", name: "Security",      count: "44+"  },
  { icon: "🌳", name: "Environment",   count: "38+"  },
];

/* ─── How it works ─── */
const STEPS = [
  { n: "01", title: "Create Your Free Account", desc: "Sign up in under 60 seconds. No credit card required. Select your sectors of interest." },
  { n: "02", title: "Explore Live Tenders",     desc: "Browse thousands of PPRA and government tenders updated daily. Filter by sector, value, deadline." },
  { n: "03", title: "Get AI Insights",          desc: "Click any tender to get an AI-generated summary, eligibility checklist, and opportunity score." },
  { n: "04", title: "Set Alerts & Win",         desc: "Configure keyword and sector alerts. Download Word/PDF reports. Submit winning bids with confidence." },
];

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  {
    quote: "TenderIQ saved us weeks of manual searching. We found and won a PKR 45M construction contract within our first month.",
    name: "Ahmed Raza",
    role: "Director, Raza Construction Ltd — Lahore",
  },
  {
    quote: "The AI summaries are remarkable. What used to take our team half a day to analyse now takes five minutes.",
    name: "Fatima Malik",
    role: "CEO, Digital Solutions PK — Karachi",
  },
  {
    quote: "As a small IT consultancy we could never keep up with PPRA. TenderIQ gives us the same intelligence as large firms.",
    name: "Usman Khan",
    role: "Founder, TechBridge Consulting — Islamabad",
  },
];

/* ─── FAQ ─── */
const FAQS = [
  { q: "Is TenderIQ really free?", a: "Yes — the core platform is completely free. Create an account and start exploring tenders immediately, no credit card needed." },
  { q: "Where does the tender data come from?", a: "All data is pulled directly from data.gov.pk and PPRA via the official CKAN REST API. It is updated every 24 hours." },
  { q: "How does the AI analysis work?", a: "We use Anthropic's Claude AI to read each tender document and produce plain-language summaries, eligibility checks, and opportunity scores tailored for Pakistani SMEs." },
  { q: "Can I export tender reports?", a: "Yes. Any tender can be exported as a professionally formatted Word (.docx) or PDF report — ready to share with your board or bid committee." },
  { q: "How quickly do alerts arrive?", a: "Keyword and sector alerts are sent via email within 15 minutes of a matching tender being published on PPRA." },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-cream-100 text-charcoal-900">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════
          HERO — split layout, cream left / forest right
          ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] grid md:grid-cols-2 overflow-hidden">

        {/* Left — text */}
        <div className="relative flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 bg-cream-100">
          <PakFlagWatermark />
          <div className="relative z-10 max-w-xl">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-forest-600 mb-6">
              🟢 Live data from PPRA · Updated daily
            </p>
            <h1 className="font-serif text-5xl lg:text-6xl xl:text-7xl leading-[1.05] text-charcoal-900 mb-6">
              Pakistan's<br />
              <em className="not-italic text-forest-700">Smartest</em><br />
              Procurement<br />
              Intelligence
            </h1>
            <div className="w-16 h-px bg-charcoal-900 mb-6" />
            <p className="text-base text-charcoal-700 leading-relaxed mb-10 max-w-md">
              We turn PPRA &amp; Government tender data into actionable opportunities
              for Pakistani SMEs — powered by AI, delivered to your inbox.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/signup" className="btn-dark px-10 py-4 text-sm tracking-widest uppercase flex items-center gap-2 group">
                Start Free Today
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/#about" className="btn-outline-dark px-10 py-4 text-sm tracking-widest uppercase">
                Discover More
              </Link>
            </div>
            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-6 mt-14 pt-8 border-t border-cream-300">
              {[["2,400+","Active Tenders"],["12","Sectors"],["PKR 340B+","In Live Contracts"]].map(([v,l])=>(
                <div key={l}>
                  <p className="font-serif text-2xl text-charcoal-900">{v}</p>
                  <p className="text-xs text-charcoal-600 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — visual panel */}
        <div className="hidden md:flex flex-col justify-center bg-charcoal-900 relative overflow-hidden px-12 py-20">
          {/* Background grid */}
          <div className="absolute inset-0 opacity-10"
            style={{backgroundImage:"linear-gradient(rgba(248,241,228,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(248,241,228,0.3) 1px,transparent 1px)",backgroundSize:"48px 48px"}} />

          {/* Floating cards */}
          <div className="relative z-10 space-y-4 max-w-sm mx-auto">
            <div className="bg-cream-100/10 backdrop-blur border border-cream-300/20 p-5 rounded">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 flex-shrink-0 bg-forest-700 rounded flex items-center justify-center text-cream-100 text-lg">🏗️</span>
                <div>
                  <p className="text-cream-100 text-sm font-semibold">Road Construction Package — KPK</p>
                  <p className="text-cream-400 text-xs mt-0.5">PKR 125M · Deadline: 14 days</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-green-800/60 text-green-300 text-xs px-2 py-0.5 rounded">Score: 87/100</span>
                    <span className="bg-cream-400/20 text-cream-300 text-xs px-2 py-0.5 rounded">PPRA</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-cream-100/10 backdrop-blur border border-cream-300/20 p-5 rounded">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 flex-shrink-0 bg-forest-700 rounded flex items-center justify-center text-cream-100 text-lg">💻</span>
                <div>
                  <p className="text-cream-100 text-sm font-semibold">Software Development — FBR Portal</p>
                  <p className="text-cream-400 text-xs mt-0.5">PKR 32M · Deadline: 8 days</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-green-800/60 text-green-300 text-xs px-2 py-0.5 rounded">Score: 92/100</span>
                    <span className="bg-cream-400/20 text-cream-300 text-xs px-2 py-0.5 rounded">PPRA</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-cream-100/10 backdrop-blur border border-cream-300/20 p-5 rounded">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 flex-shrink-0 bg-forest-700 rounded flex items-center justify-center text-cream-100 text-lg">🏥</span>
                <div>
                  <p className="text-cream-100 text-sm font-semibold">Medical Equipment Supply — Punjab Health</p>
                  <p className="text-cream-400 text-xs mt-0.5">PKR 78M · Deadline: 21 days</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-amber-800/60 text-amber-300 text-xs px-2 py-0.5 rounded">Score: 74/100</span>
                    <span className="bg-cream-400/20 text-cream-300 text-xs px-2 py-0.5 rounded">PPRA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live indicator */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-cream-400 text-xs">Updating live from PPRA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT / EXPERTISE
          ═══════════════════════════════════════════════════ */}
      <section id="about" className="bg-cream-200 py-28 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-forest-600 mb-4">Our Expertise</p>
          <h2 className="font-serif text-4xl lg:text-5xl text-charcoal-900 mb-6">
            Built for Pakistani SMEs.<br />Powered by Public Data.
          </h2>
          <div className="w-12 h-px bg-charcoal-900 mx-auto mb-8" />
          <p className="text-charcoal-700 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            Pakistan's government awards over <strong>PKR 2 trillion</strong> in procurement contracts every year
            through PPRA. Yet most SMEs miss these opportunities simply because tender discovery is slow,
            manual, and overwhelming. TenderIQ changes that — making the full PPRA catalogue searchable,
            analysed, and alert-ready in seconds.
          </p>
          <Link href="/tenders" className="btn-dark inline-flex items-center gap-2 group tracking-widest uppercase text-sm">
            Explore Tenders
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SERVICES — 3 cards
          ═══════════════════════════════════════════════════ */}
      <section id="services" className="bg-cream-100 py-28 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-forest-600 mb-4">Our Services</p>
            <h2 className="font-serif text-4xl lg:text-5xl text-charcoal-900">
              Three pillars of<br />procurement intelligence
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-cream-300">
            {SERVICES.map((s) => (
              <div key={s.number} className="bg-cream-100 p-10 group hover:bg-charcoal-900 transition-colors duration-300">
                <div className="text-5xl mb-6">{s.img}</div>
                <p className="text-xs font-semibold tracking-[0.2em] text-charcoal-500 group-hover:text-cream-400 mb-3 transition-colors">
                  {s.number}
                </p>
                <h3 className="font-serif text-2xl text-charcoal-900 group-hover:text-cream-100 mb-4 transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-charcoal-600 group-hover:text-cream-300 leading-relaxed transition-colors">
                  {s.desc}
                </p>
                <div className="w-8 h-px bg-charcoal-900 group-hover:bg-cream-300 mt-8 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTORS GRID
          ═══════════════════════════════════════════════════ */}
      <section className="bg-cream-200 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-forest-600 mb-4">Coverage</p>
              <h2 className="font-serif text-4xl lg:text-5xl text-charcoal-900">12 Sectors.<br />Thousands of Opportunities.</h2>
            </div>
            <Link href="/tenders" className="btn-outline-dark text-sm px-8 py-3 tracking-widest uppercase self-start md:self-end whitespace-nowrap">
              Browse All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-cream-300">
            {SECTORS.map((s) => (
              <div key={s.name}
                className="bg-cream-100 p-6 hover:bg-charcoal-900 group transition-colors duration-200 cursor-pointer">
                <div className="text-3xl mb-3">{s.icon}</div>
                <p className="text-sm font-semibold text-charcoal-900 group-hover:text-cream-100 transition-colors">{s.name}</p>
                <p className="text-xs text-charcoal-500 group-hover:text-cream-400 transition-colors mt-0.5">{s.count} tenders</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS — 4-step split layout
          ═══════════════════════════════════════════════════ */}
      <section className="bg-charcoal-900 py-28 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-start">
            <div className="md:sticky md:top-24">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-forest-500 mb-4">How It Works</p>
              <h2 className="font-serif text-4xl lg:text-5xl text-cream-100 mb-6 leading-tight">
                From discovery<br />to winning bid<br />in four steps.
              </h2>
              <div className="w-12 h-px bg-cream-400 mb-8" />
              <p className="text-cream-400 leading-relaxed mb-10">
                TenderIQ handles the heavy lifting — so you can focus on crafting
                the best proposal, not hunting for opportunities.
              </p>
              <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-cream-100 text-charcoal-900 px-8 py-4 font-semibold text-sm tracking-widest uppercase hover:bg-cream-200 transition-colors group">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-0">
              {STEPS.map((step, i) => (
                <div key={step.n} className="border-t border-cream-400/20 py-10 group">
                  <div className="flex items-start gap-8">
                    <span className="font-serif text-4xl text-cream-400/40 group-hover:text-cream-300 transition-colors flex-shrink-0 leading-none">
                      {step.n}
                    </span>
                    <div>
                      <h3 className="font-serif text-xl text-cream-100 mb-3">{step.title}</h3>
                      <p className="text-sm text-cream-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t border-cream-400/20" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════════ */}
      <section className="bg-cream-200 py-28 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-forest-600 mb-4">Client Testimonials</p>
            <h2 className="font-serif text-4xl lg:text-5xl text-charcoal-900">What our clients say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-cream-300">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-cream-200 p-10">
                <div className="font-serif text-5xl text-charcoal-300 leading-none mb-6">"</div>
                <p className="text-charcoal-700 leading-relaxed mb-8 italic">{t.quote}</p>
                <div className="w-8 h-px bg-charcoal-400 mb-5" />
                <p className="font-semibold text-charcoal-900 text-sm">{t.name}</p>
                <p className="text-charcoal-500 text-xs mt-1">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════════ */}
      <section className="bg-cream-100 py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-forest-600 mb-4">FAQ</p>
            <h2 className="font-serif text-4xl text-charcoal-900">Common questions</h2>
          </div>
          <div className="divide-y divide-cream-300">
            {FAQS.map((f, i) => (
              <div key={i} className="py-5">
                <button
                  className="w-full flex items-center justify-between gap-4 text-left group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-charcoal-900 group-hover:text-forest-700 transition-colors">
                    {f.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-charcoal-500 flex-shrink-0 transition-transform ${openFaq===i?"rotate-180":""}`} />
                </button>
                {openFaq === i && (
                  <p className="text-sm text-charcoal-600 leading-relaxed mt-4 pb-1">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA / CONTACT
          ═══════════════════════════════════════════════════ */}
      <section id="contact" className="bg-charcoal-900 py-28 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-forest-500 mb-4">Get In Touch</p>
            <h2 className="font-serif text-4xl lg:text-5xl text-cream-100 mb-6 leading-tight">
              Ready to find your<br />next contract?
            </h2>
            <div className="w-12 h-px bg-cream-400 mb-8" />
            <p className="text-cream-400 leading-relaxed mb-10 max-w-md">
              Join thousands of Pakistani businesses already using TenderIQ.
              Create your free account in under a minute — no credit card required.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-cream-100 text-charcoal-900 px-10 py-4 font-semibold text-sm tracking-widest uppercase hover:bg-cream-200 transition-colors group">
                Create Free Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/tenders" className="inline-flex items-center gap-2 border border-cream-400/40 text-cream-300 px-10 py-4 font-semibold text-sm tracking-widest uppercase hover:border-cream-300 hover:text-cream-100 transition-colors">
                Browse Tenders
              </Link>
            </div>
          </div>

          {/* Contact card */}
          <div className="border border-cream-400/20 p-10">
            <h3 className="font-serif text-xl text-cream-100 mb-6">Send us a message</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs text-cream-400 mb-1.5 tracking-widest uppercase">Full Name</label>
                <input type="text" placeholder="Muhammad Ali"
                  className="w-full bg-transparent border border-cream-400/30 text-cream-100 placeholder-cream-500/40 px-4 py-3 text-sm focus:outline-none focus:border-cream-300 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-cream-400 mb-1.5 tracking-widest uppercase">Email</label>
                <input type="email" placeholder="ali@company.pk"
                  className="w-full bg-transparent border border-cream-400/30 text-cream-100 placeholder-cream-500/40 px-4 py-3 text-sm focus:outline-none focus:border-cream-300 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-cream-400 mb-1.5 tracking-widest uppercase">Message</label>
                <textarea rows={4} placeholder="How can we help?"
                  className="w-full bg-transparent border border-cream-400/30 text-cream-100 placeholder-cream-500/40 px-4 py-3 text-sm focus:outline-none focus:border-cream-300 transition-colors resize-none" />
              </div>
              <button type="submit"
                className="w-full bg-cream-100 text-charcoal-900 py-3.5 font-semibold text-sm tracking-widest uppercase hover:bg-cream-200 transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

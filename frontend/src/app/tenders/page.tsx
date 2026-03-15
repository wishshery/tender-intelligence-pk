"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, ArrowRight, Clock, Building, FileText, ChevronDown } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const SECTORS = [
  "All Sectors", "Construction", "IT & Digital", "Medical", "Energy",
  "Transport", "Education", "Water", "Agriculture", "Telecom", "Consulting",
];

const SAMPLE_TENDERS = [
  { id: 1, title: "Road Infrastructure Rehabilitation — KPK Highway Authority", sector: "Construction", value: "PKR 125M", deadline: "14 days", ministry: "KPK NHA", score: 87 },
  { id: 2, title: "Enterprise Software Development — FBR Tax Portal Upgrade", sector: "IT & Digital", value: "PKR 32M", deadline: "8 days", ministry: "FBR", score: 92 },
  { id: 3, title: "Medical Equipment Supply — Punjab Healthcare Commission", sector: "Medical", value: "PKR 78M", deadline: "21 days", ministry: "Punjab Health Dept", score: 74 },
  { id: 4, title: "Solar Energy Installation — NEPRA Grid Expansion", sector: "Energy", value: "PKR 215M", deadline: "30 days", ministry: "NEPRA", score: 81 },
  { id: 5, title: "School Furniture Supply — Federal Education Board", sector: "Education", value: "PKR 18M", deadline: "12 days", ministry: "Federal MOE", score: 68 },
  { id: 6, title: "Water Treatment Plant — WASA Lahore", sector: "Water", value: "PKR 340M", deadline: "45 days", ministry: "WASA Lahore", score: 76 },
  { id: 7, title: "Cybersecurity Audit Services — NITB", sector: "IT & Digital", value: "PKR 12M", deadline: "6 days", ministry: "NITB", score: 88 },
  { id: 8, title: "Agricultural Machinery — Punjab Agriculture Dept", sector: "Agriculture", value: "PKR 55M", deadline: "18 days", ministry: "Punjab Agri", score: 71 },
  { id: 9, title: "Telecommunications Infrastructure — PTCL Expansion", sector: "Telecom", value: "PKR 180M", deadline: "25 days", ministry: "PTCL", score: 83 },
];

export default function TendersPage() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All Sectors");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user has an auth token
    const token = typeof window !== "undefined" ? localStorage.getItem("tenderiq_token") : null;
    setIsLoggedIn(!!token);
  }, []);

  const filtered = SAMPLE_TENDERS.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.ministry.toLowerCase().includes(search.toLowerCase());
    const matchSector = sector === "All Sectors" || t.sector === sector;
    return matchSearch && matchSector;
  });

  return (
    <div className="min-h-screen bg-cream-100">
      <Navbar />

      {/* Header */}
      <section className="bg-charcoal-900 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-widest uppercase text-forest-500 mb-4 font-semibold">Live Database</p>
          <h1 className="font-serif text-4xl md:text-5xl text-cream-100 mb-4">Browse Tenders</h1>
          <div className="w-12 h-px bg-cream-400 mb-6" />
          <p className="text-cream-400 text-sm max-w-xl">
            Explore thousands of PPRA and government procurement tenders updated daily from data.gov.pk.
            {!isLoggedIn && " Sign in to view AI summaries, scores, and set alerts."}
          </p>
        </div>
      </section>

      {/* Search + Filter bar */}
      <section className="bg-cream-200 border-b border-cream-300 py-5 px-6 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
            <input
              type="text"
              placeholder="Search tenders, ministries, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-cream-300 bg-white text-sm text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-charcoal-900 transition-colors"
            />
          </div>
          <div className="relative">
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 border border-cream-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:border-charcoal-900 transition-colors min-w-[160px]"
            >
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500 pointer-events-none" />
          </div>
          {isLoggedIn ? (
            <Link href="/dashboard/tenders" className="btn-dark text-sm tracking-widest uppercase px-6 py-2.5 whitespace-nowrap flex items-center gap-2">
              My Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link href="/auth/signup" className="btn-dark text-sm tracking-widest uppercase px-6 py-2.5 whitespace-nowrap flex items-center gap-2">
              Sign Up Free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </section>

      {/* Tenders list */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-charcoal-500 mb-6 uppercase tracking-widest">
            Showing {filtered.length} tenders {sector !== "All Sectors" && `in ${sector}`}
          </p>

          <div className="space-y-px bg-cream-300">
            {filtered.map((tender) => (
              <div key={tender.id} className="bg-cream-100 p-6 md:p-8 hover:bg-white transition-colors group">
                <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-widest text-forest-600 bg-forest-500/10 px-2 py-0.5">
                        {tender.sector}
                      </span>
                      <span className="text-xs text-charcoal-500 flex items-center gap-1">
                        <Building className="w-3 h-3" /> {tender.ministry}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg text-charcoal-900 group-hover:text-forest-700 transition-colors leading-snug mb-3">
                      {tender.title}
                    </h3>
                    <div className="flex items-center gap-5 text-xs text-charcoal-500 flex-wrap">
                      <span className="font-semibold text-charcoal-800">{tender.value}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tender.deadline} left</span>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-3 flex-shrink-0">
                    {/* Score */}
                    <div className="text-center">
                      <div className={`text-2xl font-serif font-bold ${tender.score >= 80 ? "text-forest-600" : tender.score >= 70 ? "text-amber-600" : "text-charcoal-500"}`}>
                        {tender.score}
                      </div>
                      <div className="text-xs text-charcoal-400">fit score</div>
                    </div>

                    {isLoggedIn ? (
                      <Link href={`/dashboard/tenders/${tender.id}`}
                        className="btn-outline-dark text-xs tracking-widest uppercase px-5 py-2 flex items-center gap-1.5 whitespace-nowrap">
                        <FileText className="w-3.5 h-3.5" /> View Details
                      </Link>
                    ) : (
                      <Link href="/auth/signup"
                        className="btn-dark text-xs tracking-widest uppercase px-5 py-2 flex items-center gap-1.5 whitespace-nowrap">
                        <ArrowRight className="w-3.5 h-3.5" /> View & Analyse
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="font-serif text-2xl text-charcoal-400 mb-3">No tenders found</p>
              <p className="text-sm text-charcoal-500">Try a different keyword or sector filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Sign-up nudge for guests */}
      {!isLoggedIn && (
        <section className="bg-charcoal-900 py-14 px-6 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="font-serif text-3xl text-cream-100 mb-3">Get Full AI Analysis</h2>
            <p className="text-cream-400 text-sm mb-7">
              Sign up free to unlock AI-powered summaries, eligibility checks, opportunity scores, and personalised alerts for every tender.
            </p>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-cream-100 text-charcoal-900 px-10 py-3.5 font-semibold text-sm tracking-widest uppercase hover:bg-cream-200 transition-colors">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-cream-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-charcoal-900 text-sm font-bold font-serif">T</span>
              <span className="font-serif text-2xl text-cream-100 tracking-tight">TenderIQ Pakistan</span>
            </div>
            <p className="text-sm leading-relaxed text-cream-400 mb-6 max-w-sm">
              AI-powered government procurement intelligence for Pakistani SMEs.
              Discover, analyse, and win PPRA tender opportunities — powered by
              public data from data.gov.pk.
            </p>
            <div className="space-y-2 text-sm text-cream-400">
              <div className="flex items-center gap-2.5"><Mail className="w-3.5 h-3.5 flex-shrink-0" />support@tenderiq.pk</div>
              <div className="flex items-center gap-2.5"><Phone className="w-3.5 h-3.5 flex-shrink-0" />+92 (0) 51 234 5678</div>
              <div className="flex items-center gap-2.5"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />Islamabad, Pakistan</div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-cream-100 text-sm font-semibold tracking-widest uppercase mb-5">Platform</h4>
            <ul className="space-y-3 text-sm text-cream-400">
              {[["Tender Explorer","/tenders"],["Sector Intelligence","/#services"],["AI Summaries","/#services"],["Get Free Access","/auth/signup"],["API Access","/docs/api"]].map(([l,h])=>(
                <li key={l}><Link href={h} className="hover:text-cream-100 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-cream-100 text-sm font-semibold tracking-widest uppercase mb-5">Legal & Data</h4>
            <ul className="space-y-3 text-sm text-cream-400">
              {[["About Us","/about"],["Privacy Policy","/privacy"],["Terms of Use","/terms"],["Data Sources","/data-sources"],["Contact","/#contact"]].map(([l,h])=>(
                <li key={l}><Link href={h} className="hover:text-cream-100 transition-colors">{l}</Link></li>
              ))}
            </ul>
            <div className="mt-8 px-4 py-3 border border-cream-400/20 text-xs text-cream-400">
              Data sourced from{" "}
              <a href="https://data.gov.pk" target="_blank" rel="noopener noreferrer" className="text-cream-200 hover:text-white underline">data.gov.pk</a>
              {" "}via CKAN API. PPRA data is public domain.
            </div>
          </div>
        </div>

        <div className="border-t border-cream-400/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream-400">© {new Date().getFullYear()} TenderIQ Pakistan. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-cream-400">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-400 rounded-full" />All systems operational</span>
            <span>🇵🇰 Made for Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

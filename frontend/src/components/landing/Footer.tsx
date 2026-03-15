import Link from "next/link";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white font-display">TenderIQ Pakistan</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              AI-powered government procurement intelligence for Pakistani SMEs. Powered by public data from data.gov.pk.
            </p>
            <div className="flex flex-col gap-2 text-xs">
              <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> support@tenderiq.pk</span>
              <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +92 (0) 51 234 5678</span>
              <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Islamabad, Pakistan</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Tender Explorer", "/tenders"],
                ["Sector Intelligence", "/sectors"],
                ["AI Summaries", "/features"],
                ["Pricing", "/pricing"],
                ["API Access", "/docs/api"],
              ].map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["About Us", "/about"],
                ["Blog", "/blog"],
                ["Careers", "/careers"],
                ["Press", "/press"],
                ["Contact", "/contact"],
              ].map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Legal & Data</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Privacy Policy", "/privacy"],
                ["Terms of Service", "/terms"],
                ["Data Sources", "/data-sources"],
                ["Cookie Policy", "/cookies"],
              ].map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
            <div className="mt-6 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs">
                Data sourced from{" "}
                <a href="https://data.gov.pk" target="_blank" rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300">
                  data.gov.pk
                </a>{" "}
                via CKAN API. PPRA data is public domain.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">© {new Date().getFullYear()} TenderIQ Pakistan. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              All systems operational
            </span>
            <span>🇵🇰 Made for Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

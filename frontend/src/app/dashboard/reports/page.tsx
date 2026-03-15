"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import toast from "react-hot-toast";
import { FileText, Download, Star, Clock, Loader2, Lock } from "lucide-react";
import { tendersApi, subscriptionsApi } from "@/lib/api";
import { formatCurrency, formatDate, downloadBlob } from "@/lib/utils";

export default function ReportsPage() {
  const { data: sub } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => subscriptionsApi.my().then((r) => r.data),
  });
  const isPro = sub?.plan_name !== "free";

  const { data: tenders, isLoading } = useQuery({
    queryKey: ["tenders-for-reports"],
    queryFn: () => tendersApi.list({ page: 1, page_size: 12, status: "active", sort_by: "opportunity_score" }).then((r) => r.data),
  });

  async function download(tender: any, type: "word" | "pdf") {
    if (!isPro) { toast.error("Reports require Pro plan"); return; }
    const tid = toast.loading(`Generating ${type.toUpperCase()}...`);
    try {
      const res = type === "word"
        ? await tendersApi.downloadWord(tender.id)
        : await tendersApi.downloadPdf(tender.id);
      downloadBlob(res.data, `TenderIQ_${tender.title.slice(0, 30)}.${type === "word" ? "docx" : "pdf"}`);
      toast.success("Downloaded!", { id: tid });
    } catch {
      toast.error("Download failed.", { id: tid });
    }
  }

  if (!isPro) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Lock className="w-14 h-14 text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 font-display mb-2">Reports & Downloads</h2>
      <p className="text-gray-500 mb-6 max-w-sm">
        Download professionally formatted Word and PDF reports for any tender. Available on Pro plan.
      </p>
      <Link href="/pricing" className="btn-primary">Upgrade to Pro</Link>
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-gray-900">Reports & Downloads</h1>
        <p className="text-gray-500 text-sm mt-1">
          Generate professional Word (.docx) and PDF tender summaries for any opportunity
        </p>
      </div>

      {/* Info card */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-5 mb-6 flex gap-4">
        <FileText className="w-8 h-8 text-brand-700 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-brand-900 mb-1">AI-Generated Professional Reports</div>
          <p className="text-brand-700 text-sm leading-relaxed">
            Each report includes: full AI analysis, eligibility summary, SME insights, key deadlines, and branded cover page. Ready to share with your team or board.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-44 bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenders?.items.map((tender: any) => (
            <div key={tender.id} className="card flex flex-col gap-3">
              <div className="flex items-start gap-2">
                {tender.is_high_value && <span className="badge-gold text-xs flex-shrink-0">⭐ High Value</span>}
                {tender.sector_name && <span className="badge-blue text-xs">{tender.sector_name}</span>}
              </div>
              <Link href={`/dashboard/tenders/${tender.id}`}
                className="font-semibold text-gray-900 text-sm leading-tight hover:text-brand-900 transition line-clamp-3">
                {tender.title}
              </Link>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Due: {formatDate(tender.submission_deadline)}
              </div>
              {tender.opportunity_score != null && (
                <div className="text-xs text-brand-700 font-medium">
                  Score: {Math.round(tender.opportunity_score)}/100
                </div>
              )}
              <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                <button onClick={() => download(tender, "word")}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600">
                  <FileText className="w-3.5 h-3.5" /> Word
                </button>
                <button onClick={() => download(tender, "pdf")}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 bg-brand-900 text-white rounded-lg hover:bg-brand-800 transition">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

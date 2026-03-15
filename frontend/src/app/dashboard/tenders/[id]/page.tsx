"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft, Download, FileText, Clock, Building, Tag, Star,
  AlertCircle, Loader2, ExternalLink, Copy
} from "lucide-react";
import Link from "next/link";
import { tendersApi, subscriptionsApi } from "@/lib/api";
import { formatCurrency, formatDate, scoreBg, timeAgo } from "@/lib/utils";
import { downloadBlob } from "@/lib/utils";

export default function TenderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: tender, isLoading, error } = useQuery({
    queryKey: ["tender", id],
    queryFn: () => tendersApi.get(id).then((r) => r.data),
  });

  const { data: sub } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => subscriptionsApi.my().then((r) => r.data),
  });
  const isPro = sub?.plan_name !== "free";

  async function handleDownload(type: "word" | "pdf") {
    if (!isPro) { toast.error("Word/PDF downloads require Pro plan. Please upgrade."); return; }
    const toastId = toast.loading(`Generating ${type.toUpperCase()} report...`);
    try {
      const res = type === "word"
        ? await tendersApi.downloadWord(id)
        : await tendersApi.downloadPdf(id);
      const ext = type === "word" ? "docx" : "pdf";
      downloadBlob(res.data, `TenderIQ_${id.slice(0, 8)}.${ext}`);
      toast.success("Report downloaded!", { id: toastId });
    } catch {
      toast.error("Download failed. Please try again.", { id: toastId });
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
    </div>
  );

  if (error || !tender) return (
    <div className="p-8 text-center">
      <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <p className="text-gray-600">Tender not found or access denied.</p>
      <button onClick={() => router.back()} className="btn-outline mt-4 text-sm py-2">Go Back</button>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Explorer
      </button>

      {/* Title section */}
      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              {tender.is_high_value && <span className="badge-gold">⭐ High Value Opportunity</span>}
              {tender.sector_name && <span className="badge-blue">{tender.sector_name}</span>}
              <span className={`badge ${tender.status === "active" ? "badge-green" : "badge-gray"} capitalize`}>
                {tender.status}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 font-display leading-tight">
              {tender.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                {tender.issuing_authority}
              </span>
              {tender.reference_number && (
                <span className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  Ref: {tender.reference_number}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Published {formatDate(tender.published_date)}
              </span>
            </div>
          </div>

          {/* Download buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => handleDownload("word")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all
                ${isPro ? "border-brand-900 text-brand-900 hover:bg-brand-50" : "border-gray-200 text-gray-400 cursor-not-allowed"}`}>
              <FileText className="w-4 h-4" />
              .docx
            </button>
            <button onClick={() => handleDownload("pdf")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all
                ${isPro ? "bg-brand-900 text-white hover:bg-brand-800 border-brand-900" : "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"}`}>
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* AI Summary */}
          {tender.ai_processed && (
            <div className="card border-l-4 border-brand-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-brand-900 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
                <h2 className="font-bold text-gray-900">AI Executive Summary</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">{tender.ai_summary_short}</p>
            </div>
          )}

          {/* Detailed AI analysis (Pro) */}
          {tender.ai_summary_detailed && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3">📊 Detailed Analysis</h2>
              {isPro ? (
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {tender.ai_summary_detailed}
                </div>
              ) : (
                <div className="relative">
                  <div className="text-gray-700 text-sm leading-relaxed blur-sm select-none">
                    {tender.ai_summary_detailed.slice(0, 300)}...
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-lg p-5 text-center max-w-xs">
                      <Star className="w-7 h-7 text-amber-400 mx-auto mb-2" />
                      <p className="font-semibold text-gray-800 text-sm mb-3">Pro Plan Required</p>
                      <Link href="/pricing" className="btn-primary text-sm py-2 px-4 block">Upgrade to Pro</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Eligibility */}
          {tender.eligibility_criteria && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3">✅ Eligibility Criteria</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{tender.eligibility_criteria}</p>
            </div>
          )}

          {/* SME Insights */}
          {tender.sme_insights && isPro && (
            <div className="card bg-amber-50 border border-amber-200">
              <h2 className="font-bold text-amber-900 mb-3">💡 SME Insights & Recommendations</h2>
              <div className="space-y-2">
                {tender.sme_insights.split("\n").filter(Boolean).map((line: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-amber-800">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{line.replace(/^[•\-–]\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {tender.description && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3">📋 Original Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {tender.description}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Key facts */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Key Information</h3>
            <dl className="space-y-3">
              {[
                { label: "Estimated Value", value: formatCurrency(tender.estimated_value_pkr) },
                { label: "Submission Deadline", value: formatDate(tender.submission_deadline) },
                { label: "Opening Date", value: formatDate(tender.opening_date) },
                { label: "Published", value: formatDate(tender.published_date) },
                { label: "Authority Type", value: tender.issuing_authority_type ?? "N/A" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</dt>
                  <dd className="text-sm font-semibold text-gray-800 mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Opportunity Score */}
          {tender.opportunity_score != null && (
            <div className="card text-center">
              <h3 className="font-bold text-gray-900 mb-3">Opportunity Score</h3>
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={tender.opportunity_score >= 70 ? "#16a34a" : tender.opportunity_score >= 50 ? "#2563eb" : "#d97706"}
                    strokeWidth="10"
                    strokeDasharray={`${(tender.opportunity_score / 100) * 251.2} 251.2`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round(tender.opportunity_score)}
                  </span>
                </div>
              </div>
              <div className={`badge text-sm ${scoreBg(tender.opportunity_score)} mx-auto`}>
                {tender.opportunity_score >= 80 ? "Excellent" :
                 tender.opportunity_score >= 60 ? "Good" :
                 tender.opportunity_score >= 40 ? "Fair" : "Low"}
              </div>
            </div>
          )}

          {/* Industry tags */}
          {tender.industry_tags?.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-3">Industry Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tender.industry_tags.map((tag: string) => (
                  <span key={tag} className="badge-blue text-xs">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Source link */}
          {tender.source_url && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-3">Source Data</h3>
              <a href={tender.source_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-700 text-sm hover:text-brand-900 transition-colors">
                <ExternalLink className="w-4 h-4" />
                View on data.gov.pk
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

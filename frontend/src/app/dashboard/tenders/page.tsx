"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Star, Clock, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { tendersApi } from "@/lib/api";
import { formatCurrency, formatDate, scoreBg } from "@/lib/utils";

const SECTORS = [
  "All", "Construction", "IT & Digital", "Medical", "Infrastructure",
  "Consulting", "Education", "Energy", "Transport", "Agriculture",
];

export default function TenderExplorerPage() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [sector, setSector] = useState("All");
  const [highValue, setHighValue] = useState(false);
  const [sortBy, setSortBy] = useState("published_date");

  const { data, isLoading } = useQuery({
    queryKey: ["tenders", page, keyword, sector, highValue, sortBy],
    queryFn: () =>
      tendersApi
        .list({
          page,
          page_size: 15,
          keyword: keyword || undefined,
          sector_code: sector !== "All" ? sector : undefined,
          is_high_value: highValue || undefined,
          sort_by: sortBy,
          status: "active",
        })
        .then((r) => r.data),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setKeyword(inputVal);
    setPage(1);
  }

  const tenders = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-gray-900">Tender Explorer</h1>
        <p className="text-gray-500 text-sm mt-1">
          Browse {total.toLocaleString()} active procurement opportunities from data.gov.pk
        </p>
      </div>

      {/* Search and filters */}
      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search by title, authority, or keywords..."
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn-primary px-6 py-3 text-sm">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Filters:</span>
          </div>

          {/* Sector filter */}
          <div className="flex gap-1.5 flex-wrap">
            {SECTORS.slice(0, 6).map((s) => (
              <button key={s} onClick={() => { setSector(s); setPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border
                  ${sector === s
                    ? "bg-brand-900 text-white border-brand-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"}`}>
                {s}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <input type="checkbox" checked={highValue} onChange={(e) => { setHighValue(e.target.checked); setPage(1); }}
              className="rounded border-gray-300 text-brand-900" />
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500" /> High Value only
            </span>
          </label>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="published_date">Newest first</option>
            <option value="submission_deadline">Deadline soonest</option>
            <option value="opportunity_score">Highest score</option>
            <option value="estimated_value_pkr">Highest value</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-100" />
          ))}
        </div>
      ) : tenders.length === 0 ? (
        <div className="card text-center py-16">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No tenders found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tenders.map((tender: any) => (
            <Link key={tender.id} href={`/dashboard/tenders/${tender.id}`}
              className="card-hover block">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    {tender.is_high_value && (
                      <span className="badge-gold text-xs">⭐ High Value</span>
                    )}
                    {tender.sector_name && (
                      <span className="badge-blue text-xs">{tender.sector_name}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 leading-tight mb-1 line-clamp-2">
                    {tender.title}
                  </h3>
                  {tender.ai_summary_short && (
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                      {tender.ai_summary_short}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="font-medium text-gray-600">{tender.issuing_authority}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Deadline: {formatDate(tender.submission_deadline)}
                    </span>
                    <span>·</span>
                    <span>Published: {formatDate(tender.published_date)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {tender.opportunity_score != null && (
                    <span className={`badge font-bold ${scoreBg(tender.opportunity_score)}`}>
                      {Math.round(tender.opportunity_score)}/100
                    </span>
                  )}
                  <span className="text-sm font-semibold text-gray-700">
                    {formatCurrency(tender.estimated_value_pkr)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total.toLocaleString()} tenders
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page <= 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-3">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  TrendingUp, Bell, FileText, Search, ArrowRight,
  Star, Clock, AlertCircle, CheckCircle
} from "lucide-react";
import { tendersApi, alertsApi, subscriptionsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency, formatDate, scoreBg, timeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: recentTenders = [] } = useQuery({
    queryKey: ["recent-tenders"],
    queryFn: () => tendersApi.recent(6).then((r) => r.data),
  });

  const { data: highValueTenders = [] } = useQuery({
    queryKey: ["high-value-tenders"],
    queryFn: () => tendersApi.highValue(4).then((r) => r.data),
  });

  const { data: matches = [] } = useQuery({
    queryKey: ["alert-matches"],
    queryFn: () => alertsApi.matches({ unread_only: true, limit: 5 }).then((r) => r.data),
  });

  const { data: subscription } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => subscriptionsApi.my().then((r) => r.data),
  });

  const { data: tenderStats } = useQuery({
    queryKey: ["tender-stats"],
    queryFn: () => tendersApi.stats().then((r) => r.data),
  });

  const isPro = subscription?.plan_name !== "free";

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">
            Welcome back, {user?.full_name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's your procurement intelligence overview for today.
          </p>
        </div>
        <Link href="/dashboard/tenders" className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Search className="w-4 h-4" />
          Explore Tenders
        </Link>
      </div>

      {/* Plan banner */}
      {!isPro && (
        <div className="bg-gradient-to-r from-brand-900 to-brand-700 rounded-xl p-5 mb-6 flex items-center justify-between">
          <div>
            <div className="text-white font-semibold">Upgrade to Pro</div>
            <div className="text-white/70 text-sm">
              {subscription?.monthly_tender_limit ?? 10 - (subscription?.tenders_viewed_this_month ?? 0)} tenders remaining this month · Unlock AI summaries, PDF downloads, and sector alerts
            </div>
          </div>
          <Link href="/pricing" className="bg-gold-700 hover:bg-gold-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ml-4">
            Upgrade Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Active Tenders",
            value: tenderStats?.active_tenders?.toLocaleString() ?? "—",
            icon: <FileText className="w-5 h-5 text-brand-600" />,
            bg: "bg-blue-50",
          },
          {
            label: "High Value",
            value: tenderStats?.high_value_tenders?.toLocaleString() ?? "—",
            icon: <Star className="w-5 h-5 text-amber-500" />,
            bg: "bg-amber-50",
          },
          {
            label: "Unread Alerts",
            value: matches.length.toString(),
            icon: <Bell className="w-5 h-5 text-green-600" />,
            bg: "bg-green-50",
          },
          {
            label: "Tenders This Month",
            value: subscription?.tenders_viewed_this_month?.toString() ?? "0",
            icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
            bg: "bg-purple-50",
          },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 font-display">{stat.value}</div>
            <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent tenders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 font-display">Recently Published</h2>
            <Link href="/dashboard/tenders" className="text-brand-700 text-sm font-medium hover:text-brand-900 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentTenders.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tenders yet. Ingestion runs daily.</p>
              </div>
            ) : recentTenders.map((tender: any) => (
              <Link key={tender.id} href={`/dashboard/tenders/${tender.id}`}
                className="card-hover block">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {tender.is_high_value && (
                        <span className="badge-gold text-xs">⭐ High Value</span>
                      )}
                      <span className="text-xs text-gray-400">{tender.sector_name}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                      {tender.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{tender.issuing_authority}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {formatDate(tender.submission_deadline)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {tender.opportunity_score != null && (
                      <span className={`badge text-xs font-bold ${scoreBg(tender.opportunity_score)}`}>
                        {Math.round(tender.opportunity_score)}/100
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatCurrency(tender.estimated_value_pkr)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Alert matches */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 font-display">🔔 New Matches</h2>
              <Link href="/dashboard/alerts" className="text-brand-700 text-sm font-medium">
                View all
              </Link>
            </div>
            {!isPro ? (
              <div className="card text-center py-6">
                <Bell className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">Alert notifications require Pro plan</p>
                <Link href="/pricing" className="text-brand-700 text-xs font-semibold hover:underline">
                  Upgrade →
                </Link>
              </div>
            ) : matches.length === 0 ? (
              <div className="card text-center py-6">
                <CheckCircle className="w-7 h-7 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All caught up! No new matches.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {matches.slice(0, 4).map((m: any) => (
                  <div key={m.id} className="card py-3 px-4">
                    <div className="text-xs text-brand-700 font-semibold mb-1">{m.alert_name}</div>
                    <Link href={`/dashboard/tenders/${m.tender_id}`}
                      className="text-sm text-gray-800 font-medium hover:text-brand-900 line-clamp-2">
                      {m.tender_title}
                    </Link>
                    <div className="text-xs text-gray-400 mt-1">{timeAgo(m.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* High value */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 font-display">⭐ High Value</h2>
              <Link href="/dashboard/tenders?is_high_value=true" className="text-brand-700 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {highValueTenders.slice(0, 3).map((t: any) => (
                <Link key={t.id} href={`/dashboard/tenders/${t.id}`}
                  className="card-hover block py-3 px-4">
                  <div className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{t.title}</div>
                  <div className="text-xs text-gray-400">{formatCurrency(t.estimated_value_pkr)}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

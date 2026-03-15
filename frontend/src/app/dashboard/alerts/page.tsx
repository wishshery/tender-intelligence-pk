"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Bell, Plus, X, Trash2, CheckCircle, Edit3, Loader2 } from "lucide-react";
import Link from "next/link";
import { alertsApi, subscriptionsApi } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SECTOR_CODES = [
  { code: "CONST", name: "Construction" }, { code: "IT", name: "IT & Digital" },
  { code: "MED", name: "Medical" }, { code: "INFRA", name: "Infrastructure" },
  { code: "CONS", name: "Consulting" }, { code: "EDU", name: "Education" },
  { code: "ENERGY", name: "Energy" }, { code: "TRANS", name: "Transport" },
  { code: "AGRI", name: "Agriculture" }, { code: "TELE", name: "Telecom" },
];

export default function AlertsPage() {
  const qc = useQueryClient();
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newKeywords, setNewKeywords] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"alerts" | "sectors" | "matches">("matches");

  const { data: sub } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => subscriptionsApi.my().then((r) => r.data),
  });
  const isPro = sub?.plan_name !== "free";

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => alertsApi.list().then((r) => r.data),
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors"],
    queryFn: () => alertsApi.sectors().then((r) => r.data),
  });

  const { data: mySectors = [] } = useQuery({
    queryKey: ["my-sectors"],
    queryFn: () => alertsApi.mySectors().then((r) => r.data),
  });

  const { data: matches = [] } = useQuery({
    queryKey: ["alert-matches"],
    queryFn: () => alertsApi.matches({ limit: 20 }).then((r) => r.data),
  });

  const createAlert = useMutation({
    mutationFn: (data: any) => alertsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      toast.success("Alert created!");
      setShowNewAlert(false);
      setNewName("");
      setNewKeywords("");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail ?? "Failed to create alert"),
  });

  const deleteAlert = useMutation({
    mutationFn: (id: string) => alertsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alerts"] }); toast.success("Alert deleted"); },
  });

  const markAllRead = useMutation({
    mutationFn: () => alertsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alert-matches"] });
      qc.invalidateQueries({ queryKey: ["unread-count"] });
      toast.success("All notifications marked as read");
    },
  });

  const subscribeSectors = useMutation({
    mutationFn: (codes: string[]) => alertsApi.subscribeSectors(codes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-sectors"] });
      toast.success("Sector subscriptions updated!");
    },
  });

  function handleCreateAlert() {
    if (!newName.trim()) { toast.error("Please enter an alert name"); return; }
    const keywords = newKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    createAlert.mutate({ name: newName, keywords, sectors: [], email_notify: true, frequency: "instant" });
  }

  if (!isPro) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Bell className="w-14 h-14 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 font-display mb-2">Alerts Require Pro Plan</h2>
        <p className="text-gray-500 mb-6 max-w-sm">
          Get instant email and dashboard notifications when tenders matching your interests are published.
        </p>
        <Link href="/pricing" className="btn-primary">Upgrade to Pro</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Alert Centre</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your sector subscriptions and keyword alerts</p>
        </div>
        <button onClick={() => setShowNewAlert(true)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Plus className="w-4 h-4" /> New Alert
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {([["matches", "Notifications"], ["alerts", "My Alerts"], ["sectors", "Sector Subscriptions"]] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab ? "bg-white text-brand-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
            {label}
            {tab === "matches" && matches.filter((m: any) => !m.read).length > 0 && (
              <span className="ml-1.5 bg-brand-900 text-white text-xs rounded-full w-4 h-4 inline-flex items-center justify-center">
                {matches.filter((m: any) => !m.read).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* New Alert form */}
      {showNewAlert && (
        <div className="card mb-6 border-brand-200 bg-brand-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-brand-900">Create New Alert</h3>
            <button onClick={() => setShowNewAlert(false)}><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Alert Name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. IT Projects Karachi" className="input" />
            </div>
            <div>
              <label className="label">Keywords (comma separated)</label>
              <input value={newKeywords} onChange={(e) => setNewKeywords(e.target.value)}
                placeholder="e.g. software, cloud, digital" className="input" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowNewAlert(false)} className="btn-outline text-sm py-2 px-4">Cancel</button>
            <button onClick={handleCreateAlert} disabled={createAlert.isPending}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
              {createAlert.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Alert
            </button>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === "matches" && (
        <div>
          {matches.length > 0 && (
            <div className="flex justify-end mb-3">
              <button onClick={() => markAllRead.mutate()}
                className="text-sm text-brand-700 hover:text-brand-900 font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Mark all read
              </button>
            </div>
          )}
          {matches.length === 0 ? (
            <div className="card text-center py-12">
              <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No notifications yet. Alerts will appear here when new matching tenders are published.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((m: any) => (
                <div key={m.id} className={cn("card flex gap-4", !m.read && "border-brand-200 bg-brand-50")}>
                  <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", !m.read ? "bg-brand-600" : "bg-gray-300")} />
                  <div className="flex-1">
                    <div className="text-xs text-brand-700 font-semibold mb-1">{m.alert_name}</div>
                    <Link href={`/dashboard/tenders/${m.tender_id}`}
                      className="font-semibold text-gray-900 text-sm hover:text-brand-900 transition">
                      {m.tender_title}
                    </Link>
                    {m.matched_keywords?.length > 0 && (
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {m.matched_keywords.map((kw: string) => (
                          <span key={kw} className="badge-amber text-xs">{kw}</span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">{timeAgo(m.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Alerts tab */}
      {activeTab === "alerts" && (
        <div>
          {alerts.length === 0 ? (
            <div className="card text-center py-12">
              <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No keyword alerts yet.</p>
              <button onClick={() => setShowNewAlert(true)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" /> Create First Alert
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {alerts.map((alert: any) => (
                <div key={alert.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{alert.name}</h3>
                    <button onClick={() => deleteAlert.mutate(alert.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {alert.keywords?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {alert.keywords.map((kw: string) => (
                        <span key={kw} className="badge-blue text-xs">{kw}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className={cn("badge", alert.is_active ? "badge-green" : "badge-gray")}>
                      {alert.is_active ? "Active" : "Paused"}
                    </span>
                    <span>{alert.frequency} alerts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sectors tab */}
      {activeTab === "sectors" && (
        <div>
          <p className="text-gray-500 text-sm mb-5">
            Select sectors to receive email alerts when new tenders are published in those areas.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {sectors.map((sector: any) => {
              const subscribed = mySectors.some((s: any) => s.id === sector.id);
              return (
                <button key={sector.id}
                  onClick={() => {
                    const newSelected = subscribed
                      ? mySectors.filter((s: any) => s.id !== sector.id).map((s: any) => s.code)
                      : [...mySectors.map((s: any) => s.code), sector.code];
                    subscribeSectors.mutate(newSelected);
                  }}
                  className={cn("card py-4 text-center transition-all hover:shadow-card-hover",
                    subscribed ? "border-2 border-brand-600 bg-brand-50" : "border border-gray-200")}>
                  <div className="text-2xl mb-1">{sector.icon}</div>
                  <div className={cn("text-sm font-medium", subscribed ? "text-brand-900" : "text-gray-700")}>
                    {sector.name}
                  </div>
                  {subscribed && <div className="text-xs text-brand-600 font-semibold mt-1">✓ Subscribed</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

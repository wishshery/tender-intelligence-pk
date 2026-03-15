"use client";

import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "subscription", label: "Subscription", icon: CreditCard },
];

const PLAN_FEATURES: Record<string, string[]> = {
  Free: [
    "10 tender views/month",
    "1 keyword alert",
    "2 sector subscriptions",
    "Basic search",
  ],
  Professional: [
    "500 tender views/month",
    "10 keyword alerts",
    "All sectors",
    "AI summaries",
    "Download documents",
    "Weekly digest",
  ],
  Enterprise: [
    "Unlimited tender views",
    "Unlimited alerts",
    "Full AI analysis",
    "API access",
    "5 team members",
    "Priority support",
  ],
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({
    fullName: "Muhammad Ali Khan",
    email: "m.ali@example.pk",
    company: "Tech Solutions Pvt Ltd",
    phone: "+92 300 1234567",
    currency: "PKR",
    location: "Karachi, Pakistan",
  });

  // Notifications state
  const [notifs, setNotifs] = useState({
    emailAlerts: true,
    weeklyDigest: true,
    newTenders: true,
    deadlineReminders: true,
    systemUpdates: false,
    marketingEmails: false,
  });

  // Password form state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your profile, security, and subscription preferences.
        </p>
      </div>

      {/* Success banner */}
      {saved && (
        <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Changes saved successfully.</span>
        </div>
      )}

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sidebar tabs */}
        <nav className="md:w-52 flex-shrink-0">
          <ul className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-green-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {!active && (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content panel */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {/* ── PROFILE TAB ─────────────────────────────── */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" /> Profile Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) =>
                      setProfile({ ...profile, fullName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) =>
                      setProfile({ ...profile, company: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Currency
                  </label>
                  <select
                    value={profile.currency}
                    onChange={(e) =>
                      setProfile({ ...profile, currency: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  >
                    <option value="PKR">PKR — Pakistani Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ── SECURITY TAB ────────────────────────────── */}
          {activeTab === "security" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" /> Security Settings
              </h2>
              <div className="space-y-5 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      placeholder="Enter current password"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      placeholder="Minimum 8 characters"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {passwords.new.length > 0 && passwords.new.length < 8 && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Password must be at
                      least 8 characters
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    placeholder="Repeat new password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {passwords.confirm.length > 0 &&
                    passwords.new !== passwords.confirm && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Passwords do not
                        match
                      </p>
                    )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={
                    !passwords.current ||
                    passwords.new.length < 8 ||
                    passwords.new !== passwords.confirm
                  }
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Update Password
                </button>
              </div>

              {/* Session info */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Active Sessions
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Current session
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Chrome · Karachi, Pakistan · Just now
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ───────────────────────── */}
          {activeTab === "notifications" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-600" /> Notification
                Preferences
              </h2>
              <div className="space-y-4">
                {(
                  [
                    {
                      key: "emailAlerts",
                      label: "Email Alerts",
                      desc: "Receive email when your keyword alerts match new tenders",
                    },
                    {
                      key: "weeklyDigest",
                      label: "Weekly Digest",
                      desc: "A curated summary of top tenders every Monday morning",
                    },
                    {
                      key: "newTenders",
                      label: "New Tender Notifications",
                      desc: "Notify me when new tenders are published in my sectors",
                    },
                    {
                      key: "deadlineReminders",
                      label: "Deadline Reminders",
                      desc: "Remind me 3 days before submission deadlines",
                    },
                    {
                      key: "systemUpdates",
                      label: "System Updates",
                      desc: "Platform announcements and feature releases",
                    },
                    {
                      key: "marketingEmails",
                      label: "Marketing Emails",
                      desc: "Tips, case studies, and promotional content",
                    },
                  ] as const
                ).map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifs({ ...notifs, [key]: !notifs[key] })
                      }
                      className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors mt-0.5 ${
                        notifs[key] ? "bg-green-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          notifs[key] ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ── SUBSCRIPTION TAB ────────────────────────── */}
          {activeTab === "subscription" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" /> Subscription &
                Billing
              </h2>

              {/* Current plan badge */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                      Current Plan
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      Free
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Renews automatically · PKR 0/month
                    </p>
                  </div>
                  <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    ACTIVE
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {PLAN_FEATURES["Free"].map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-1.5 text-xs text-gray-600"
                    >
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade options */}
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Upgrade Your Plan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(
                  [
                    {
                      name: "Professional",
                      price: "PKR 2,999",
                      highlight: "Most Popular",
                    },
                    {
                      name: "Enterprise",
                      price: "PKR 7,999",
                      highlight: "Best Value",
                    },
                  ] as const
                ).map(({ name, price, highlight }) => (
                  <div
                    key={name}
                    className="border border-gray-200 rounded-xl p-4 hover:border-green-400 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">{name}</p>
                      <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
                        {highlight}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-green-700 mb-3">
                      {price}
                      <span className="text-sm font-normal text-gray-500">
                        /mo
                      </span>
                    </p>
                    <ul className="space-y-1.5 mb-4">
                      {PLAN_FEATURES[name].map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-1.5 text-xs text-gray-600"
                        >
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button className="w-full bg-green-600 group-hover:bg-green-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
                      Upgrade to {name}
                    </button>
                  </div>
                ))}
              </div>

              {/* Billing history */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Billing History
                </h3>
                <div className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
                  No invoices yet. They will appear here once you subscribe.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

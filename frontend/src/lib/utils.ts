import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null, currency = "PKR"): string {
  if (amount == null) return "Not specified";
  const symbols: Record<string, string> = { PKR: "₨", USD: "$", GBP: "£" };
  const sym = symbols[currency] || currency;
  if (currency === "PKR") return `${sym} ${amount.toLocaleString("en-PK")}`;
  return `${sym} ${amount.toFixed(2)}`;
}

export function formatDate(date: string | Date | null): string {
  if (!date) return "N/A";
  try {
    return format(new Date(date), "dd MMM yyyy");
  } catch {
    return "N/A";
  }
}

export function timeAgo(date: string | Date | null): string {
  if (!date) return "";
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
}

export function scoreColor(score: number | null): string {
  if (score == null) return "text-gray-400";
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-500";
}

export function scoreBg(score: number | null): string {
  if (score == null) return "bg-gray-100 text-gray-500";
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 60) return "bg-blue-100 text-blue-700";
  if (score >= 40) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

export function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const CURRENCIES = ["PKR", "USD", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_LABELS: Record<Currency, string> = {
  PKR: "Pakistani Rupee (PKR ₨)",
  USD: "US Dollar (USD $)",
  GBP: "British Pound (GBP £)",
};

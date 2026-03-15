"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Building2, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const { access_token, refresh_token, user } = res.data;
      setAuth(user, access_token, refresh_token);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Login failed. Please check your credentials.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-pattern flex-col justify-center items-center text-white p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-bold text-2xl font-display">TenderIQ</div>
              <div className="text-gold-400 text-sm font-medium">Pakistan</div>
            </div>
          </div>
          <h2 className="text-3xl font-bold font-display mb-4">
            Pakistan's Premier Procurement Intelligence Platform
          </h2>
          <p className="text-white/70 leading-relaxed">
            Sign in to access AI-powered PPRA tender summaries, sector alerts, and professional reports.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              ["🤖 AI Summaries", "Claude-powered analysis"],
              ["🔔 Smart Alerts", "Instant sector notifications"],
              ["📄 PDF Reports", "Professional downloads"],
              ["📊 Opportunity Score", "AI-rated opportunities"],
            ].map(([title, desc]) => (
              <div key={title} className="bg-white/10 rounded-xl p-4">
                <div className="font-semibold text-sm">{title}</div>
                <div className="text-white/60 text-xs mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-brand-900 font-display">TenderIQ Pakistan</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 font-display mb-1">Sign in to your account</h1>
          <p className="text-gray-500 text-sm mb-8">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-brand-700 font-medium hover:text-brand-900">
              Create one free
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@company.com"
                  className="input pl-10"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-brand-700 hover:text-brand-900">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  className="input pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="relative flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link href="/auth/signup" className="btn-outline w-full text-center block">
            Create Free Account
          </Link>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link> and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

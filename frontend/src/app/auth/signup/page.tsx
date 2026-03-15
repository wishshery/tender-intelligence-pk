"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Building2, Eye, EyeOff, Loader2, Lock, Mail, User, Briefcase, CheckCircle
} from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  company_name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

const PERKS = [
  "10 free tenders per month",
  "AI-generated summaries",
  "Sector intelligence pages",
  "No credit card required",
];

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.register({
        full_name: data.full_name,
        company_name: data.company_name,
        email: data.email,
        password: data.password,
      });
      // Auto-login after registration
      const loginRes = await authApi.login({ email: data.email, password: data.password });
      const { access_token, refresh_token, user } = loginRes.data;
      setAuth(user, access_token, refresh_token);
      toast.success("Account created! Welcome to TenderIQ 🎉");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Registration failed. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-pattern flex-col justify-center items-center text-white p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-bold text-2xl font-display">TenderIQ</div>
              <div className="text-gold-400 text-sm font-medium">Pakistan</div>
            </div>
          </div>
          <h2 className="text-3xl font-bold font-display mb-4">
            Start Discovering Government Contracts Today
          </h2>
          <p className="text-white/70 leading-relaxed mb-8">
            Join thousands of Pakistani SMEs who use TenderIQ to discover, analyse, and win government procurement opportunities.
          </p>
          <div className="space-y-3">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white/90 text-sm">{perk}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-white/10 rounded-xl p-5">
            <p className="text-white/80 text-sm italic">
              "We found and won a PKR 12M IT services contract within 3 weeks of joining TenderIQ."
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">A</div>
              <div>
                <div className="text-sm font-semibold text-white">Asim Iqbal</div>
                <div className="text-xs text-white/60">NetCraft Solutions, Islamabad</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-900 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-brand-900 font-display">TenderIQ Pakistan</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 font-display mb-1">Create your free account</h1>
          <p className="text-gray-500 text-sm mb-8">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-700 font-medium hover:text-brand-900">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="label">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input {...register("full_name")} placeholder="Muhammad Ahmed" className="input pl-10" />
                </div>
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="label">Company Name</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input {...register("company_name")} placeholder="Your Company Ltd." className="input pl-10" />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...register("email")} type="email" placeholder="you@company.com" className="input pl-10" autoComplete="email" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register("confirm_password")}
                  type="password"
                  placeholder="Re-enter your password"
                  className="input pl-10"
                />
              </div>
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-brand-700 underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="text-brand-700 underline">Privacy Policy</Link>.
            </p>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isSubmitting ? "Creating account..." : "Create Free Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

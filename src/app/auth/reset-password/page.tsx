"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Listen for the PASSWORD_RECOVERY event — Supabase client
    // automatically picks up the token from the URL hash and
    // establishes a session.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    // Also check if there's already a session (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch {
      setError("Connection failed. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-400">
              <polyline points="20,6 9,17 4,12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-3">Password updated</h2>
          <p className="text-surface-400 text-sm">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-4">
          <p className="text-surface-400 text-sm">Verifying reset link...</p>
          <p className="text-surface-600 text-xs">
            If this takes too long, your link may have expired.{" "}
            <Link href="/auth/forgot-password" className="text-accent-blue hover:text-accent-blue/80 transition-colors">
              Request a new one
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-teal/10 border border-accent-teal/20 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-teal">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="16" r="1"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Set new password</h1>
          <p className="text-surface-400 text-sm">Choose a new password for your account</p>
        </div>

        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8">
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">New password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-foreground placeholder-surface-500 text-sm focus:outline-none focus:border-accent-teal/60 focus:ring-1 focus:ring-accent-teal/30 transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Confirm password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-foreground placeholder-surface-500 text-sm focus:outline-none focus:border-accent-teal/60 focus:ring-1 focus:ring-accent-teal/30 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-teal hover:bg-accent-teal/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors text-sm"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

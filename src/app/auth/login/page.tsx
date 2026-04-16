"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Ensure researcher profile exists (handles users from main site)
      if (data.user) {
        const { data: existing } = await supabase
          .from("researchers")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!existing) {
          const meta = data.user.user_metadata || {};
          await supabase.from("researchers").insert({
            id: data.user.id,
            name: meta.name || email.split("@")[0],
            email,
            affiliation: meta.affiliation || null,
          });
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Connection failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-blue">
              <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10,17 15,12 10,7" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="15" y1="12" x2="3" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Sign in</h1>
          <p className="text-surface-400 text-sm">Access your research submissions</p>
        </div>

        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-foreground placeholder-surface-500 text-sm focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-surface-300">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-foreground placeholder-surface-500 text-sm focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30 transition-colors"
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
              className="w-full bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors text-sm"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-700 text-center">
            <p className="text-surface-400 text-sm">
              No account yet?{" "}
              <Link href="/auth/signup" className="text-accent-blue hover:text-accent-blue/80 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

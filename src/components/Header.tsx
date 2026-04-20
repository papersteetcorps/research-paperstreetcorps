"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { href: "/", label: "Papers" },
    ...(user
      ? [
          { href: "/submit", label: "Submit" },
          { href: "/dashboard", label: "My Submissions" },
          { href: "/profile", label: "Profile" },
        ]
      : []),
  ];

  return (
    <header className="border-b border-surface-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.jpeg" alt="Paper Street Corps" width={32} height={32} className="rounded-full" />
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-foreground text-sm">Paper Street Corps</span>
            <span className="text-xs text-surface-500">Research</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                pathname === href
                  ? "text-foreground font-medium"
                  : "text-surface-400 hover:text-surface-200"
              }`}
            >
              {label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-surface-500 truncate max-w-[160px]">
                {user.email}
              </span>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-sm text-surface-400 hover:text-surface-200 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm bg-accent-blue hover:bg-accent-blue/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-surface-400"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-2 space-y-3 border-t border-surface-800 pt-4">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm ${
                pathname === href
                  ? "text-foreground font-medium"
                  : "text-surface-400"
              }`}
            >
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <p className="text-xs text-surface-500 truncate">{user.email}</p>
              <form action="/auth/logout" method="post">
                <button type="submit" className="text-sm text-surface-400">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-accent-blue"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

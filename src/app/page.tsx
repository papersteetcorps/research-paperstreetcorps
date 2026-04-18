import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PaperList from "@/components/PaperList";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: papers } = await supabase
    .from("papers")
    .select("id, title, abstract, authors, category, submitted_at")
    .eq("status", "approved")
    .order("submitted_at", { ascending: false });

  const categories = Array.from(
    new Set((papers || []).map((p) => p.category))
  ).sort();

  const stats = [
    { value: papers?.length || 0, label: "Papers published" },
    { value: categories.length, label: "Research areas" },
    { value: new Set((papers || []).flatMap((p) => p.authors.split(",").map((a: string) => a.trim()))).size, label: "Authors" },
    { value: "Peer", label: "Reviewed" },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden -mt-10 -mx-6 px-6 pt-20 pb-16 border-b border-surface-800">
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-blue/5 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-0 w-[400px] h-[300px] bg-accent-teal/5 rounded-full blur-[100px]" />
          <div className="absolute top-40 left-0 w-[400px] h-[300px] bg-accent-purple/5 rounded-full blur-[100px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-5xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-900 border border-surface-800 text-xs text-surface-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
            Open for submissions
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Research worth
            <br />
            <span className="text-surface-400">publishing.</span>
          </h1>

          <p className="mt-6 text-lg text-surface-400 max-w-2xl leading-relaxed">
            A curated platform for independent researchers. Submit your work,
            get reviewed, and receive a certificate of publication from Paper
            Street Corps.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Submit your paper
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                <polyline points="12,5 19,12 12,19" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="#papers"
              className="inline-flex items-center gap-2 bg-surface-900 hover:bg-surface-800 text-surface-200 font-medium px-6 py-3 rounded-xl transition-colors text-sm border border-surface-700"
            >
              Browse papers
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="bg-surface-900/50 backdrop-blur border border-surface-800 rounded-2xl p-5"
              >
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-surface-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-xs text-surface-500 uppercase tracking-widest mb-2">How it works</p>
          <h2 className="text-3xl font-bold">From draft to published in four steps.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              step: "01",
              title: "Create an account",
              body: "Sign up as a researcher with your name, email, and affiliation. No institutional gatekeeping.",
              color: "text-accent-blue",
            },
            {
              step: "02",
              title: "Submit your paper",
              body: "Upload your PDF with title, abstract, authors, and category. Submissions are free and always open.",
              color: "text-accent-teal",
            },
            {
              step: "03",
              title: "Editorial review",
              body: "Every paper is reviewed for clarity, rigor, and fit. You'll be notified of the decision.",
              color: "text-accent-purple",
            },
            {
              step: "04",
              title: "Get published & certified",
              body: "Approved papers go live with their own page, and you receive a Paper Street Corps certificate of publication.",
              color: "text-accent-amber",
            },
          ].map(({ step, title, body, color }) => (
            <div
              key={step}
              className="group bg-surface-900/30 border border-surface-800 rounded-2xl p-6 hover:border-surface-700 transition-colors"
            >
              <div className="flex gap-5">
                <span className={`text-4xl font-bold shrink-0 leading-tight ${color}`}>
                  {step}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories showcase */}
      {categories.length > 0 && (
        <section className="max-w-5xl mx-auto">
          <div className="mb-8">
            <p className="text-xs text-surface-500 uppercase tracking-widest mb-2">Research areas</p>
            <h2 className="text-3xl font-bold">Explore by category.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = papers?.filter((p) => p.category === cat).length || 0;
              return (
                <a
                  key={cat}
                  href={`#papers`}
                  className="bg-surface-900 hover:bg-surface-800 border border-surface-800 hover:border-surface-700 rounded-full px-4 py-2 text-sm text-surface-300 transition-colors"
                >
                  {cat}
                  <span className="ml-2 text-xs text-surface-500">{count}</span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Papers */}
      <section id="papers" className="max-w-5xl mx-auto scroll-mt-8">
        <div className="mb-8">
          <p className="text-xs text-surface-500 uppercase tracking-widest mb-2">Library</p>
          <h2 className="text-3xl font-bold">Published papers.</h2>
          <p className="mt-2 text-surface-400 max-w-2xl text-sm leading-relaxed">
            Browse the full collection of peer-reviewed research. Search by title, author, or filter by category.
          </p>
        </div>
        <PaperList papers={papers || []} categories={categories} />
      </section>

      {/* Footer CTA */}
      <section className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden border border-surface-800 rounded-3xl p-10 md:p-14 bg-gradient-to-br from-surface-900 to-surface-900/30">
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-accent-blue/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold">Have research to share?</h2>
            <p className="mt-3 text-surface-400 leading-relaxed">
              Submissions are free, reviewed by hand, and recognized with an official certificate of publication.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Submit a paper
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 border border-surface-700 hover:border-surface-500 text-surface-200 font-medium px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

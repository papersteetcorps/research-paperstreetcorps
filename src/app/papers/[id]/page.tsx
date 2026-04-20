import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: paper } = await supabase
    .from("papers")
    .select("title, abstract, authors")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!paper) return { title: "Paper not found" };

  return {
    title: `${paper.title} — Paper Street Corps Research`,
    description: paper.abstract.slice(0, 160),
    openGraph: {
      title: paper.title,
      description: paper.abstract.slice(0, 160),
      type: "article",
      authors: paper.authors.split(",").map((a: string) => a.trim()),
    },
  };
}

export default async function PaperDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: paper } = await supabase
    .from("papers")
    .select("*, researchers(name, affiliation)")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!paper) notFound();

  const publishedDate = new Date(paper.reviewed_at || paper.submitted_at);
  const formattedDate = publishedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const citationText = `${paper.authors}. "${paper.title}." Paper Street Corps Research, ${publishedDate.getFullYear()}. ${paper.pdf_url}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-200 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="15,18 9,12 15,6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to papers
      </Link>

      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs bg-accent-teal/15 text-accent-teal px-2.5 py-0.5 rounded-full">
            {paper.category}
          </span>
          <span className="text-xs text-surface-500">{formattedDate}</span>
          {paper.certificate_url && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20,6 9,17 4,12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Verified by Paper Street Corps
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
          {paper.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="text-surface-300">{paper.authors}</span>
          {paper.researchers?.affiliation && (
            <span className="text-surface-500">{paper.researchers.affiliation}</span>
          )}
        </div>
      </header>

      {/* Abstract */}
      <section className="space-y-3">
        <h2 className="text-xs text-surface-500 uppercase tracking-widest">Abstract</h2>
        <p className="text-surface-300 leading-relaxed">{paper.abstract}</p>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <a
          href={paper.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="7,10 12,15 17,10" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Download PDF
        </a>

      </div>

      {/* PDF Embed */}
      <section className="space-y-3">
        <h2 className="text-xs text-surface-500 uppercase tracking-widest">Full Paper</h2>
        <div className="border border-surface-800 rounded-xl overflow-hidden bg-surface-900">
          <iframe
            src={paper.pdf_url}
            className="w-full h-[80vh]"
            title={paper.title}
          />
        </div>
      </section>

      {/* Citation */}
      <section className="space-y-3">
        <h2 className="text-xs text-surface-500 uppercase tracking-widest">Cite this paper</h2>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <p className="text-sm text-surface-300 leading-relaxed font-mono break-all">
            {citationText}
          </p>
        </div>
      </section>

      {/* Paper ID */}
      <div className="text-xs text-surface-600 border-t border-surface-800 pt-4">
        Paper ID: {paper.id}
      </div>
    </div>
  );
}

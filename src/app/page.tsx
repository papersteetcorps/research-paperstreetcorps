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

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="space-y-3">
        <p className="text-xs text-surface-500 uppercase tracking-widest">
          Paper Street Corps
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Research Papers</h1>
        <p className="text-surface-400 max-w-2xl">
          Peer-reviewed research published through Paper Street Corps. Researchers
          can submit their work for review and receive a certificate upon approval.
        </p>
        <Link
          href="/submit"
          className="inline-block bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Submit a paper &rarr;
        </Link>
      </header>

      <PaperList papers={papers || []} categories={categories} />
    </div>
  );
}

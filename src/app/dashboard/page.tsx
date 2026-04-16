import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProfileEditor from "@/components/ProfileEditor";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: {
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-400",
    label: "Pending review",
  },
  approved: {
    bg: "bg-green-500/10 border-green-500/20",
    text: "text-green-400",
    label: "Approved",
  },
  rejected: {
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-red-400",
    label: "Changes requested",
  },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("researchers")
    .select("id, name, email, affiliation")
    .eq("id", user!.id)
    .single();

  const { data: papers } = await supabase
    .from("papers")
    .select("*")
    .eq("researcher_id", user!.id)
    .order("submitted_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>
          <p className="text-surface-400 mt-1">
            Track the status of your research papers
          </p>
        </div>
        <Link
          href="/submit"
          className="bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Submit new paper
        </Link>
      </header>

      {profile && <ProfileEditor profile={profile} />}

      {params.submitted === "1" && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm">
          Paper submitted successfully! It will be reviewed shortly.
        </div>
      )}

      {papers && papers.length > 0 ? (
        <div className="space-y-3">
          {papers.map((paper) => {
            const style = STATUS_STYLES[paper.status] || STATUS_STYLES.pending;
            return (
              <div
                key={paper.id}
                className="border border-surface-800 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {paper.title}
                    </h3>
                    <p className="text-sm text-surface-500 mt-0.5">
                      {paper.authors}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-2.5 py-1 rounded-full border ${style.bg} ${style.text}`}
                  >
                    {style.label}
                  </span>
                </div>

                <p className="text-sm text-surface-400 line-clamp-2">
                  {paper.abstract}
                </p>

                <div className="flex items-center gap-4 text-xs text-surface-500">
                  <span>{paper.category}</span>
                  <span>
                    Submitted{" "}
                    {new Date(paper.submitted_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {paper.pdf_url && (
                    <a
                      href={paper.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-blue hover:text-accent-blue/80 transition-colors"
                    >
                      View PDF
                    </a>
                  )}
                  {paper.status === "approved" && paper.certificate_url && (
                    <a
                      href={paper.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-teal hover:text-accent-teal/80 transition-colors"
                    >
                      Download Certificate
                    </a>
                  )}
                </div>

                {paper.status === "rejected" && paper.rejection_note && (
                  <div className="bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2 text-sm text-red-400">
                    <span className="font-medium">Reviewer note:</span>{" "}
                    {paper.rejection_note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-surface-800 rounded-xl p-8 text-center space-y-3">
          <p className="text-surface-500">You haven&apos;t submitted any papers yet.</p>
          <Link
            href="/submit"
            className="inline-block text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            Submit your first paper &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

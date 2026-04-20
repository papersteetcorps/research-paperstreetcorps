import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProfileEditor from "@/components/ProfileEditor";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("researchers")
    .select("id, name, email, affiliation, created_at")
    .eq("id", user!.id)
    .single();

  const { data: papers } = await supabase
    .from("papers")
    .select("id, status")
    .eq("researcher_id", user!.id);

  const counts = {
    total: papers?.length || 0,
    approved: papers?.filter((p) => p.status === "approved").length || 0,
    pending: papers?.filter((p) => p.status === "pending").length || 0,
    rejected: papers?.filter((p) => p.status === "rejected").length || 0,
  };

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-surface-500">Profile not found.</p>
      </div>
    );
  }

  // Initials for avatar
  const initials = profile.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-surface-400 mt-1">Your researcher account details</p>
      </header>

      {/* Profile Card */}
      <div className="bg-surface-900/30 border border-surface-800 rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="text-2xl font-semibold text-foreground truncate">
              {profile.name}
            </h2>
            <p className="text-surface-400">{profile.email}</p>
            {profile.affiliation ? (
              <p className="text-sm text-surface-500">{profile.affiliation}</p>
            ) : (
              <p className="text-sm text-surface-600 italic">No organization set</p>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-surface-800 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">
              Full name
            </p>
            <p className="text-surface-200">{profile.name}</p>
          </div>
          <div>
            <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">
              Email
            </p>
            <p className="text-surface-200 truncate">{profile.email}</p>
          </div>
          <div>
            <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">
              Organization
            </p>
            <p className="text-surface-200">
              {profile.affiliation || <span className="text-surface-600">—</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">
              Joined
            </p>
            <p className="text-surface-200">{joinedDate || "—"}</p>
          </div>
        </div>
      </div>

      {/* Edit Section */}
      <ProfileEditor profile={profile} />

      {/* Submission Stats */}
      <div>
        <h3 className="text-sm font-medium text-surface-400 mb-3">
          Submission overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-900/30 border border-surface-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-foreground">{counts.total}</p>
            <p className="text-xs text-surface-500 mt-1">Total submitted</p>
          </div>
          <div className="bg-surface-900/30 border border-surface-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-400">{counts.approved}</p>
            <p className="text-xs text-surface-500 mt-1">Approved</p>
          </div>
          <div className="bg-surface-900/30 border border-surface-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-amber-400">{counts.pending}</p>
            <p className="text-xs text-surface-500 mt-1">Pending</p>
          </div>
          <div className="bg-surface-900/30 border border-surface-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-red-400">{counts.rejected}</p>
            <p className="text-xs text-surface-500 mt-1">Rejected</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-surface-900 hover:bg-surface-800 border border-surface-700 text-surface-200 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          View my submissions
        </Link>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Submit new paper
        </Link>
      </div>
    </div>
  );
}

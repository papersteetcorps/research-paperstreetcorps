import { createClient } from "@/lib/supabase/server";
import SubmitForm from "@/components/SubmitForm";

export default async function SubmitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("researchers")
    .select("name, email")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Submit a paper</h1>
        <p className="text-surface-400 mt-2">
          Your paper will be reviewed before publication. Each listed author
          receives their own certificate of publication.
        </p>
      </header>

      <SubmitForm
        defaultName={profile?.name || ""}
        defaultEmail={profile?.email || user?.email || ""}
      />
    </div>
  );
}

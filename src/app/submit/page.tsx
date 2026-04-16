"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  "Psychology",
  "Typology",
  "Neuroscience",
  "Cognitive Science",
  "Philosophy",
  "Behavioral Science",
  "Other",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [authors, setAuthors] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please upload your paper as a PDF.");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be under 20 MB.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to submit a paper.");
      setSubmitting(false);
      return;
    }

    // Upload PDF to storage
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${timestamp}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("research-papers")
      .upload(filePath, file);

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setSubmitting(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("research-papers")
      .getPublicUrl(filePath);

    // Insert paper record
    const { error: insertError } = await supabase.from("papers").insert({
      researcher_id: user.id,
      title: title.trim(),
      abstract: abstract.trim(),
      authors: authors.trim(),
      category,
      pdf_url: urlData.publicUrl,
      status: "pending",
    });

    if (insertError) {
      setError(`Submission failed: ${insertError.message}`);
      setSubmitting(false);
      return;
    }

    router.push("/dashboard?submitted=1");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Submit a paper</h1>
        <p className="text-surface-400 mt-2">
          Your paper will be reviewed before publication. You&apos;ll receive a
          certificate upon approval.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Paper title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Temporal Reference Cognition: A Generative Framework"
            className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-foreground placeholder-surface-600 text-sm focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Authors *
          </label>
          <input
            type="text"
            required
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            placeholder="e.g. Jane Smith, John Doe, Alice Johnson"
            className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-foreground placeholder-surface-600 text-sm focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30 transition-colors"
          />
          <p className="text-xs text-surface-500 mt-1">Comma-separated list of all authors</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Category *
          </label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30 transition-colors"
          >
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Abstract *
          </label>
          <textarea
            required
            rows={6}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            placeholder="Brief summary of your research paper..."
            className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-foreground placeholder-surface-600 text-sm focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30 transition-colors resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Paper PDF *
          </label>
          <div className="border-2 border-dashed border-surface-700 rounded-xl p-6 text-center hover:border-surface-500 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer space-y-2 block">
              {file ? (
                <>
                  <div className="text-accent-blue font-medium text-sm">{file.name}</div>
                  <div className="text-xs text-surface-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </>
              ) : (
                <>
                  <div className="text-surface-400 text-sm">
                    Click to upload your paper
                  </div>
                  <div className="text-xs text-surface-600">
                    PDF only, max 20 MB
                  </div>
                </>
              )}
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors text-sm"
        >
          {submitting ? "Submitting..." : "Submit for review"}
        </button>

        <p className="text-xs text-surface-600 text-center">
          Submissions are reviewed manually. You&apos;ll be notified when your paper is approved or if changes are needed.
        </p>
      </form>
    </div>
  );
}

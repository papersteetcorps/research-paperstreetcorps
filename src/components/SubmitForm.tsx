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

const MAX_AUTHORS = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

type AuthorField = { name: string; email: string };

export default function SubmitForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [category, setCategory] = useState("");
  const [authors, setAuthors] = useState<AuthorField[]>([
    { name: defaultName, email: defaultEmail },
  ]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateAuthor(index: number, field: keyof AuthorField, value: string) {
    setAuthors((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }

  function addAuthor() {
    if (authors.length < MAX_AUTHORS) {
      setAuthors((prev) => [...prev, { name: "", email: "" }]);
    }
  }

  function removeAuthor(index: number) {
    if (authors.length > 1) {
      setAuthors((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate authors
    const cleaned = authors.map((a) => ({
      name: a.name.trim(),
      email: a.email.trim(),
    }));
    if (cleaned.some((a) => !a.name || !a.email)) {
      setError("Each author must have a name and email.");
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cleaned.some((a) => !emailRe.test(a.email))) {
      setError("One or more email addresses are invalid.");
      return;
    }

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to submit a paper.");
      setSubmitting(false);
      return;
    }

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

    const authorsDisplay = cleaned.map((a) => a.name).join(", ");
    const authorsData = cleaned.map((a) => ({
      name: a.name,
      email: a.email,
      certificate_url: null,
    }));

    const { error: insertError } = await supabase.from("papers").insert({
      researcher_id: user.id,
      title: title.trim(),
      abstract: abstract.trim(),
      authors: authorsDisplay,
      authors_data: authorsData,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-surface-300 mb-2">Paper title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Temporal Reference Cognition: A Generative Framework"
          className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-foreground placeholder-surface-600 text-sm focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30 transition-colors"
        />
      </div>

      {/* Authors */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-surface-300">Authors *</label>
          <span className="text-xs text-surface-500">
            {authors.length} / {MAX_AUTHORS} · Each gets their own certificate
          </span>
        </div>

        <div className="space-y-3">
          {authors.map((author, i) => (
            <div
              key={i}
              className="bg-surface-900/40 border border-surface-800 rounded-xl p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500 uppercase tracking-wider">
                  Author {i + 1}{i === 0 && " (You)"}
                </span>
                {authors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAuthor(i)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={author.name}
                  onChange={(e) => updateAuthor(i, "name", e.target.value)}
                  placeholder="Full name"
                  className="bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-foreground placeholder-surface-600 text-sm focus:outline-none focus:border-accent-blue/60 transition-colors"
                />
                <input
                  type="email"
                  required
                  value={author.email}
                  onChange={(e) => updateAuthor(i, "email", e.target.value)}
                  placeholder="email@example.com"
                  className="bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-foreground placeholder-surface-600 text-sm focus:outline-none focus:border-accent-blue/60 transition-colors"
                />
              </div>
            </div>
          ))}

          {authors.length < MAX_AUTHORS && (
            <button
              type="button"
              onClick={addAuthor}
              className="w-full border border-dashed border-surface-700 hover:border-surface-500 text-surface-400 hover:text-surface-200 text-sm font-medium py-3 rounded-xl transition-colors"
            >
              + Add co-author
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-300 mb-2">Category *</label>
        <select
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-surface-900 border border-surface-700 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-accent-blue/60 focus:ring-1 focus:ring-accent-blue/30 transition-colors"
        >
          <option value="" disabled>Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-300 mb-2">Abstract *</label>
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
        <label className="block text-sm font-medium text-surface-300 mb-2">Paper PDF *</label>
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
                <div className="text-surface-400 text-sm">Click to upload your paper</div>
                <div className="text-xs text-surface-600">PDF only, max 20 MB</div>
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
        Submissions are reviewed manually. Upon approval, a combined certificate and one
        individual certificate per author will be generated.
      </p>
    </form>
  );
}

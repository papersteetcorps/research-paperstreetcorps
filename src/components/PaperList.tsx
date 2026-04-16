"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Paper = {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  category: string;
  submitted_at: string;
};

export default function PaperList({
  papers,
  categories,
}: {
  papers: Paper[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return papers.filter((paper) => {
      const matchesCategory =
        !selectedCategory || paper.category === selectedCategory;
      const matchesQuery =
        !q ||
        paper.title.toLowerCase().includes(q) ||
        paper.authors.toLowerCase().includes(q) ||
        paper.abstract.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [papers, query, selectedCategory]);

  if (papers.length === 0) {
    return (
      <section className="border border-surface-800 rounded-xl p-8 text-center">
        <p className="text-surface-500">No papers published yet.</p>
        <p className="text-sm text-surface-600 mt-1">
          Be the first to submit your research.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search papers by title, author, or keyword..."
            className="w-full bg-surface-900 border border-surface-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-surface-600 focus:outline-none focus:border-surface-600 transition-colors"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-surface-900 border border-surface-800 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-surface-600 transition-colors"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-surface-500">
        {filtered.length} paper{filtered.length !== 1 ? "s" : ""}
        {query || selectedCategory ? " found" : " published"}
      </p>

      {/* Paper cards */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((paper) => (
            <Link
              key={paper.id}
              href={`/papers/${paper.id}`}
              className="block border border-surface-800 rounded-xl p-5 hover:border-surface-600 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs bg-accent-teal/15 text-accent-teal px-2 py-0.5 rounded-full">
                  {paper.category}
                </span>
                <span className="text-xs text-surface-500">
                  {new Date(paper.submitted_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h3 className="font-semibold text-foreground">{paper.title}</h3>
              <p className="text-sm text-surface-500 mt-1">{paper.authors}</p>
              <p className="text-sm text-surface-400 mt-2 line-clamp-2">
                {paper.abstract}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border border-surface-800 rounded-xl p-8 text-center">
          <p className="text-surface-500">No papers match your search.</p>
          <button
            onClick={() => {
              setQuery("");
              setSelectedCategory("");
            }}
            className="text-sm text-accent-blue hover:text-accent-blue/80 mt-2 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}

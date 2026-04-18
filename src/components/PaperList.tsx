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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((paper) => (
            <Link
              key={paper.id}
              href={`/papers/${paper.id}`}
              className="group relative block bg-surface-900/30 border border-surface-800 rounded-2xl p-6 hover:border-surface-600 transition-all hover:bg-surface-900/60"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs bg-accent-teal/15 text-accent-teal px-2.5 py-1 rounded-full font-medium">
                  {paper.category}
                </span>
                <span className="text-xs text-surface-500">
                  {new Date(paper.submitted_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h3 className="font-semibold text-foreground text-lg leading-snug group-hover:text-accent-blue transition-colors">
                {paper.title}
              </h3>
              <p className="text-sm text-surface-500 mt-2">{paper.authors}</p>
              <p className="text-sm text-surface-400 mt-3 line-clamp-3 leading-relaxed">
                {paper.abstract}
              </p>
              <div className="mt-4 pt-4 border-t border-surface-800 flex items-center text-xs text-surface-500 group-hover:text-accent-blue transition-colors">
                Read paper
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1 transition-transform group-hover:translate-x-1">
                  <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                  <polyline points="12,5 19,12 12,19" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
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

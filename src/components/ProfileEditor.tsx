"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  name: string;
  email: string;
  affiliation: string | null;
};

export default function ProfileEditor({ profile }: { profile: Profile }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [affiliation, setAffiliation] = useState(profile.affiliation || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("researchers")
      .update({
        name: name.trim(),
        affiliation: affiliation.trim() || null,
      })
      .eq("id", profile.id);

    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="border border-surface-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-surface-400">Profile</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-surface-500 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent-blue/60 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-surface-500 mb-1">Organization / Affiliation</label>
            <input
              type="text"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder="University or organization"
              className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder-surface-600 focus:outline-none focus:border-accent-blue/60 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setName(profile.name);
                setAffiliation(profile.affiliation || "");
              }}
              className="text-xs text-surface-400 hover:text-surface-200 px-4 py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-foreground font-medium">{name}</span>
            {saved && <span className="text-xs text-green-400">Saved</span>}
          </div>
          <p className="text-sm text-surface-500">{profile.email}</p>
          {affiliation && (
            <p className="text-sm text-surface-400">{affiliation}</p>
          )}
          {!affiliation && (
            <p className="text-xs text-surface-600">No organization set</p>
          )}
        </div>
      )}
    </div>
  );
}

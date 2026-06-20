"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function SkillTagInput({
  skills,
  onAdd,
  onRemove,
  placeholder = "Add a skill and press Enter",
}: {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    const id = setTimeout(async () => {
      const res = await fetch(`/api/skills?q=${encodeURIComponent(value.trim())}`);
      const data = await res.json();
      setSuggestions((data.skills ?? []).map((s: any) => s.name).filter((n: string) => !skills.includes(n)));
    }, 200);
    return () => clearTimeout(id);
  }, [value, skills]);

  function commit(name: string) {
    const clean = name.trim();
    if (!clean || skills.includes(clean)) return;
    onAdd(clean);
    setValue("");
    setSuggestions([]);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {skills.map((s) => (
          <span key={s} className="chip">
            {s}
            <button onClick={() => onRemove(s)} className="text-muted hover:text-coral">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          className="input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(value);
            }
          }}
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full card p-1 max-h-44 overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => commit(s)}
                className="block w-full text-left px-3 py-1.5 rounded-md text-sm hover:bg-paper"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

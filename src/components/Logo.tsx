import { cn } from "@/lib/utils";

// Signature mark: a compass/wayfinding glyph — "Atlas: navigate your career".
export default function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="12.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18.5 9.5L13 13L9.5 18.5L15 15L18.5 9.5Z" fill="#FF6B47" stroke="#FF6B47" strokeLinejoin="round" />
        <circle cx="14" cy="14" r="1.4" fill="currentColor" />
      </svg>
      {withWordmark && <span className="font-display text-xl font-semibold tracking-tight">Atlas</span>}
    </div>
  );
}

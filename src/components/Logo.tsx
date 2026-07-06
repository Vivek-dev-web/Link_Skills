import { cn } from "@/lib/utils";

export default function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* 5 ascending buildings (skyline/bar-chart) + orange growth arrow on the tallest */}
      <svg width="38" height="26" viewBox="0 0 38 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Building 1 — shortest */}
        <rect x="0"  y="20" width="5" height="6"  rx="0.5" fill="currentColor"/>
        {/* Building 2 */}
        <rect x="7"  y="16" width="5" height="10" rx="0.5" fill="currentColor"/>
        <rect x="8.5" y="18" width="2" height="1.5" rx="0.2" fill="white" fillOpacity="0.22"/>
        {/* Building 3 */}
        <rect x="14" y="11" width="5" height="15" rx="0.5" fill="currentColor"/>
        <rect x="15.5" y="13"   width="2" height="1.5" rx="0.2" fill="white" fillOpacity="0.22"/>
        <rect x="15.5" y="16.5" width="2" height="1.5" rx="0.2" fill="white" fillOpacity="0.22"/>
        {/* Building 4 */}
        <rect x="21" y="7"  width="5" height="19" rx="0.5" fill="currentColor"/>
        <rect x="22.5" y="9"    width="2" height="1.5" rx="0.2" fill="white" fillOpacity="0.22"/>
        <rect x="22.5" y="13"   width="2" height="1.5" rx="0.2" fill="white" fillOpacity="0.22"/>
        <rect x="22.5" y="17"   width="2" height="1.5" rx="0.2" fill="white" fillOpacity="0.22"/>
        {/* Building 5 — tallest */}
        <rect x="28" y="3"  width="10" height="23" rx="0.5" fill="currentColor"/>
        <rect x="30"  y="14"  width="2" height="1.5" rx="0.2" fill="white" fillOpacity="0.22"/>
        <rect x="30"  y="18"  width="2" height="1.5" rx="0.2" fill="white" fillOpacity="0.22"/>
        {/* Orange upward arrow on tallest building */}
        <rect x="31.5" y="6"  width="3" height="9"  rx="1" fill="#D4622A"/>
        <polygon points="29,8 33,2.5 37,8" fill="#D4622A"/>
      </svg>
      {withWordmark && (
        <span className="font-display text-xl leading-none tracking-tight">
          <span className="font-bold">Skill</span><span className="font-normal">Warehouse</span>
        </span>
      )}
    </div>
  );
}

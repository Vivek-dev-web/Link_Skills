import Image from "next/image";
import { cn, initials } from "@/lib/utils";

const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-2xl",
};

const COLORS = ["#FF6B47", "#0F7A72", "#D98F2B", "#5B6EE1", "#C0527A"];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  if (src) {
    const dim = size === "xl" ? 96 : size === "lg" ? 56 : size === "md" ? 40 : size === "sm" ? 32 : 24;
    return (
      <Image
        src={src}
        alt={name}
        width={dim}
        height={dim}
        className={cn(SIZES[size], "rounded-full object-cover shrink-0", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        SIZES[size],
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
        className
      )}
      style={{ backgroundColor: colorFor(name || "?") }}
    >
      {initials(name || "?")}
    </div>
  );
}

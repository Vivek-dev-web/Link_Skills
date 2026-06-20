import Link from "next/link";
import Logo from "@/components/Logo";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-ink">
        <Logo />
      </Link>
      <div className="card w-full max-w-sm p-7">
        <h1 className="font-display text-2xl text-ink mb-1.5">{title}</h1>
        {subtitle && <p className="text-sm text-muted mb-6">{subtitle}</p>}
        {children}
      </div>
      {footer && <div className="mt-5 text-sm text-muted">{footer}</div>}
    </div>
  );
}

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STATUS_LABEL, type Lang } from "@/lib/constants";

const buttonStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "outline" | "danger" | "ghost"; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      className={cn(
        buttonStyles,
        {
          primary: "bg-navy text-white hover:bg-navy-dark",
          secondary: "bg-blue text-white hover:bg-blue-dark",
          outline: "border border-line bg-surface text-ink hover:border-navy hover:text-navy",
          danger: "bg-danger text-white hover:opacity-90",
          ghost: "text-ink-soft hover:text-navy hover:bg-background",
        }[variant],
        { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" }[size],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonStyles,
        {
          primary: "bg-navy text-white hover:bg-navy-dark",
          secondary: "bg-blue text-white hover:bg-blue-dark",
          outline: "border border-line bg-surface text-ink hover:border-navy hover:text-navy",
          danger: "bg-danger text-white hover:opacity-90",
          ghost: "text-ink-soft hover:text-navy hover:bg-background",
        }[variant],
        { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" }[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-blue focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-blue focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-blue focus:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children, htmlFor, className }: { children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 block text-sm font-medium text-ink", className)}>
      {children}
    </label>
  );
}

export function Card({ className, bg, children }: { className?: string; bg?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-line shadow-card", bg || "bg-surface", className)}>
      {children}
    </div>
  );
}

export function StatusBadge({ status, lang = "id" }: { status: string; lang?: Lang }) {
  const styles: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    accepted: "bg-blue/10 text-blue",
    approved: "bg-accent/10 text-accent",
    rejected: "bg-danger/10 text-danger",
    in_progress: "bg-blue/10 text-blue",
    completed: "bg-accent/10 text-accent",
    cancelled: "bg-ink-soft/10 text-ink-soft",
    open: "bg-warning/10 text-warning",
    resolved: "bg-accent/10 text-accent",
    dismissed: "bg-ink-soft/10 text-ink-soft",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", styles[status] || "bg-ink-soft/10 text-ink-soft")}>
      {STATUS_LABEL[status]?.[lang] || status}
    </span>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  const styles = {
    error: "border-danger/30 bg-danger/5 text-danger",
    success: "border-accent/30 bg-accent/5 text-accent-dark",
    info: "border-blue/30 bg-blue/5 text-blue-dark",
  };
  return (
    <div className={cn("rounded-lg border px-4 py-3 text-sm", styles[kind])} role="alert">
      {children}
    </div>
  );
}

export function Avatar({ name, src, size = "md" }: { name: string; src?: string | null; size?: "sm" | "md" | "lg" }) {
  const dim = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-lg" }[size];
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={`${name}'s avatar`} className={cn("rounded-full object-cover", dim)} />
    );
  }
  const init = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className={cn("flex items-center justify-center rounded-full bg-navy font-semibold text-white", dim)} aria-hidden="true">
      {init}
    </span>
  );
}

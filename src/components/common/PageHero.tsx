import type { ReactNode } from "react";

export function PageHero({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-deep p-8 text-primary-foreground shadow-elevated">
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-primary-glow/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-primary-glow/20 blur-3xl" />
      <div className="relative">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-primary-foreground/80 text-sm md:text-base">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
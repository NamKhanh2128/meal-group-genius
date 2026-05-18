import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-[8px] border border-dashed border-[#d9d2e6] bg-white p-10 text-center">
      <h3 className="text-lg font-bold text-[#252033]">{title}</h3>
      {description && <p className="mt-1 text-sm text-[#746d82]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

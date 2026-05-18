/**
 * src/components/meal-plan/MissingIngredientsWarning.tsx
 */
import { AlertTriangle } from "lucide-react";
import type { MissingIngredient } from "@/types/mealplan";

interface Props {
  items: MissingIngredient[];
}

export function MissingIngredientsWarning({ items }: Props) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4">
      <div className="flex items-center gap-2 text-warning font-semibold text-sm mb-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Thiếu {items.length} nguyên liệu trong tủ lạnh
      </div>
      <ul className="space-y-1">
        {items.map((m) => (
          <li key={m.name} className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{m.name}</span>
            <span>
              Cần <strong>{m.neededQty} {m.unit}</strong>
              {m.haveQty > 0 && <span className="ml-1 text-muted-foreground">(có {m.haveQty})</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

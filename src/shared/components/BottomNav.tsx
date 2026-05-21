import { Home, Refrigerator, ScrollText, ShoppingCart, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/fridge", label: "Fridge", icon: Refrigerator },
  { to: "/shopping", label: "Shopping", icon: ShoppingCart },
  { to: "/meal-planner", label: "Meal", icon: ScrollText },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[18px] bg-white p-2 shadow-[0_18px_55px_rgba(37,28,52,0.25)] md:hidden">
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-[12px] py-2 text-[11px] font-bold ${isActive ? "bg-[#eee9f7] text-[#7655aa]" : "text-[#9188a1]"}`}>
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

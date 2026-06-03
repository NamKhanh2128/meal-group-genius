import { db } from "@/lib/mockDb";

export const adminStatsApi = {
  async summary() {
    const state = await db();
    
    // Sort family activities descending by date
    const sortedActivities = [...state.family_activities]
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    // Map user names and avatars to activities
    const enrichedActivities = sortedActivities.slice(0, 10).map((act) => {
      const user = state.users.find((u) => u.user_id === act.user_id);
      return {
        ...act,
        user_name: user?.full_name ?? "Người dùng ẩn danh",
        user_role: user?.role ?? "USER",
      };
    });

    return {
      totalUsers: state.users.filter((u) => u.role === "USER").length,
      totalAdmins: state.users.filter((u) => u.role === "ADMIN").length,
      totalFoods: state.foods.length,
      totalRecipes: state.recipes.length,
      totalFamilies: state.families.length,
      totalMealPlans: state.meal_plans.length,
      activeShopping: state.shopping_lists.filter((s) => s.status === "DRAFT").length,
      recentActivities: enrichedActivities,
    };
  },

  async mealsByDay() {
    const state = await db();
    
    // Generate last 7 days keys in YYYY-MM-DD format
    const last7Days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - idx);
      return d.toISOString().split("T")[0]!;
    }).reverse();

    const counts = last7Days.reduce<Record<string, number>>((acc, day) => {
      acc[day] = 0;
      return acc;
    }, {});

    state.meal_plans.forEach((mp) => {
      const day = mp.meal_date.split("T")[0];
      if (day && day in counts) {
        counts[day] = (counts[day] ?? 0) + 1;
      }
    });

    return last7Days.map((day) => {
      // Format to DD/MM label
      const [_, month, date] = day.split("-");
      return {
        date: `${date}/${month}`,
        count: counts[day] ?? 0,
      };
    });
  },

  async foodsByCategory() {
    const state = await db();
    const categories: Record<string, number> = {};

    state.foods.forEach((food) => {
      categories[food.category] = (categories[food.category] ?? 0) + 1;
    });

    return Object.keys(categories).map((cat) => ({
      name: cat,
      value: categories[cat] ?? 0,
    }));
  },

  async topRecipes() {
    const state = await db();
    const counts: Record<string, number> = {};

    state.meal_plans.forEach((mp) => {
      counts[mp.recipe_id] = (counts[mp.recipe_id] ?? 0) + 1;
    });

    const sorted = Object.keys(counts)
      .map((recipeId) => {
        const recipe = state.recipes.find((r) => r.recipe_id === recipeId);
        return {
          name: recipe?.recipe_name ?? "Công thức ẩn danh",
          count: counts[recipeId] ?? 0,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return sorted;
  },

  async activityLogs() {
    const state = await db();
    
    // Group activities by date
    const counts: Record<string, number> = {};
    
    state.family_activities.forEach((act) => {
      const day = act.created_at.split("T")[0];
      if (day) {
        counts[day] = (counts[day] ?? 0) + 1;
      }
    });

    // Take last 7 days
    const last7Days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - idx);
      return d.toISOString().split("T")[0]!;
    }).reverse();

    return last7Days.map((day) => {
      const [_, month, date] = day.split("-");
      return {
        date: `${date}/${month}`,
        count: counts[day] ?? 0,
      };
    });
  },

  async getFamilies() {
    const state = await db();
    return state.families.map((f) => {
      const members = state.family_members.filter((fm) => fm.family_id === f.family_id);
      const creator = state.users.find((u) => u.user_id === f.created_by);
      return {
        ...f,
        memberCount: members.length,
        creatorName: creator?.full_name ?? "Người dùng ẩn danh",
        creatorEmail: creator?.email ?? "—",
      };
    });
  },

  async getShoppingLists() {
    const state = await db();
    return state.shopping_lists.map((s) => {
      const items = state.shopping_list_items.filter((item) => item.shopping_list_id === s.shopping_list_id);
      const creator = state.users.find((u) => u.user_id === s.created_by);
      return {
        ...s,
        itemCount: items.length,
        creatorName: creator?.full_name ?? "Người dùng ẩn danh",
      };
    });
  },
};

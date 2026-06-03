import { useEffect, useState, useMemo, useCallback } from "react";
import { Calendar, Download, Printer, Utensils, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { MealPlanWithDetails } from "@/api/adminMealApi";
import { adminMealApi } from "@/api/adminMealApi";
import { mealTypes } from "@/constants/options";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterBar, type FilterConfig } from "@/components/shared/FilterBar";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";

export function MealListPage() {
  // States
  const [meals, setMeals] = useState<MealPlanWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMealType, setFilterMealType] = useState<string>("ALL");
  const [filterDate, setFilterDate] = useState<string>("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load Data
  const loadMeals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminMealApi.list();
      setMeals(data);
    } catch (error) {
      toast.error("Không thể tải danh sách lịch sử bữa ăn.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  // Reset page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterMealType, filterDate]);

  // Filtering
  const filteredMeals = useMemo(() => {
    return meals.filter((m) => {
      const matchesSearch =
        (m.family_name && m.family_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.recipe_name && m.recipe_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.creator_name && m.creator_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filterMealType === "ALL" || m.meal_type === filterMealType;

      const matchesDate = !filterDate || m.meal_date.includes(filterDate);

      return matchesSearch && matchesType && matchesDate;
    });
  }, [meals, searchQuery, filterMealType, filterDate]);

  // Pagination slicing
  const paginatedMeals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMeals.slice(start, start + pageSize);
  }, [filteredMeals, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredMeals.length === 0) {
      toast.error("Không có dữ liệu để xuất file.");
      return;
    }

    try {
      const headers = ["Gia đình", "Ngày lên kế hoạch", "Bữa ăn", "Công thức món ăn", "Thành viên lập"];
      const rows = filteredMeals.map((m) => [
        m.family_name ?? "—",
        m.meal_date ?? "—",
        m.meal_type ?? "—",
        m.recipe_name ?? "—",
        m.creator_name ?? "—",
      ]);

      // CSV Encoding with BOM for Vietnamese characters
      const csvContent =
        "\uFEFF" +
        [headers.join(","), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Lich_su_bua_an_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Xuất file báo cáo CSV thành công!");
    } catch {
      toast.error("Xuất báo cáo thất bại.");
    }
  };

  // Print friendly view
  const handlePrint = () => {
    window.print();
  };

  // Filter Configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: "mealType",
      label: "Bữa ăn",
      value: filterMealType,
      onChange: setFilterMealType,
      options: [
        { label: "Tất cả các bữa", value: "ALL" },
        ...mealTypes.map((t) => ({ label: `Bữa ${t}`, value: t })),
      ],
    },
  ];

  // Column definitions
  const columns: Column<MealPlanWithDetails>[] = useMemo(
    () => [
      {
        key: "family_name",
        header: "Hộ gia đình",
        sortable: true,
        render: (row) => <span className="font-extrabold text-sm text-foreground">{row.family_name}</span>,
      },
      {
        key: "meal_date",
        header: "Ngày",
        sortable: true,
        render: (row) => {
          const [year, month, date] = row.meal_date.split("-");
          return (
            <span className="font-semibold text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 opacity-60 text-primary" />
              {`${date}/${month}/${year}`}
            </span>
          );
        },
      },
      {
        key: "meal_type",
        header: "Bữa ăn",
        sortable: true,
        render: (row) => {
          const typeColors: Record<string, string> = {
            "Sáng": "bg-sky-500/10 text-sky-600 border-sky-500/20",
            "Trưa": "bg-amber-500/10 text-amber-600 border-amber-500/20",
            "Tối": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
            "Bữa phụ": "bg-slate-500/10 text-slate-600 border-slate-500/20",
          };
          const colorClass = typeColors[row.meal_type] || typeColors["Bữa phụ"]!;
          return (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${colorClass}`}>
              {row.meal_type}
            </span>
          );
        },
      },
      {
        key: "recipe_name",
        header: "Công thức chế biến",
        sortable: true,
        render: (row) => (
          <span className="font-bold text-sm text-primary flex items-center gap-1">
            <Utensils className="h-3.5 w-3.5 text-primary opacity-75 shrink-0" />
            {row.recipe_name}
          </span>
        ),
      },
      {
        key: "creator_name",
        header: "Thành viên lên thực đơn",
        className: "hidden md:table-cell",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary shrink-0">
              {row.creator_name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-foreground/80">{row.creator_name}</span>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 print:p-0">
      <PageHeader
        title="Quản Lý Lịch Sử Bữa Ăn"
        description="Báo cáo giám sát kế hoạch dinh dưỡng và lịch sử ăn uống của các hộ gia đình thành viên."
        className="print:hidden"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-10 rounded-[8px] border-border bg-card text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              In danh sách
            </Button>
            <Button
              onClick={handleExportCSV}
              className="bg-[#7655aa] hover:bg-[#67489a] font-bold rounded-[8px] flex items-center gap-1.5 h-10 px-4 text-white"
            >
              <Download className="h-4 w-4 text-white" />
              Xuất báo cáo CSV
            </Button>
          </div>
        }
      />

      {/* Controls */}
      <div className="space-y-3 print:hidden">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm theo tên gia đình, tên công thức nấu hoặc người thiết kế..."
            className="flex-1"
          />

          {/* Date Picker Input */}
          <div className="relative shrink-0 w-full md:w-[220px]">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="h-10 w-full rounded-[8px] border border-border bg-card px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/45"
            />
          </div>
        </div>

        <FilterBar
          filters={filterConfigs}
          onClearAll={() => {
            setFilterMealType("ALL");
            setFilterDate("");
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMeals}
            className="h-9 px-3 rounded-[8px] text-xs font-bold text-muted-foreground hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Làm mới dữ liệu
          </Button>
        </FilterBar>
      </div>

      {/* Data Table */}
      <div className="relative">
        <DataTable
          data={paginatedMeals}
          columns={columns}
          getRowId={(row) => row.meal_plan_id}
          loading={loading}
          emptyMessage="Không tìm thấy lịch sử bữa ăn nào phù hợp với bộ lọc."
        />

        <Pagination
          total={filteredMeals.length}
          page={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          className="print:hidden"
        />
      </div>
    </div>
  );
}
export default MealListPage;

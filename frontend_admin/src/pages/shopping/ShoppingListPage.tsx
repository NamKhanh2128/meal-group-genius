import { useEffect, useState, useMemo, useCallback } from "react";
import { Eye, Trash2, ShoppingBag, Calendar, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { adminShoppingApi, type ShoppingListWithDetails } from "@/api/adminShoppingApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterBar, type FilterConfig } from "@/components/shared/FilterBar";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

export function ShoppingListPage() {
  // States
  const [lists, setLists] = useState<ShoppingListWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog States
  const [viewTarget, setViewTarget] = useState<ShoppingListWithDetails | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShoppingListWithDetails | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load Data
  const loadLists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminShoppingApi.list();
      setLists(data);
    } catch (error) {
      toast.error("Không thể tải danh sách mua sắm.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  // Reset page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // Filtering
  const filteredLists = useMemo(() => {
    return lists.filter((sl) => {
      const matchesSearch =
        sl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sl.family_name && sl.family_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sl.creator_name && sl.creator_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = filterStatus === "ALL" || sl.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [lists, searchQuery, filterStatus]);

  // Pagination slicing
  const paginatedLists = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLists.slice(start, start + pageSize);
  }, [filteredLists, currentPage, pageSize]);

  // Single delete handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminShoppingApi.delete(deleteTarget.shopping_list_id);
      toast.success(`Đã xóa danh sách mua sắm "${deleteTarget.title}" thành công!`);
      setDeleteTarget(null);
      await loadLists();
    } catch (error) {
      toast.error("Không thể xóa danh sách mua sắm.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter Configuration
  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Trạng thái",
      value: filterStatus,
      onChange: setFilterStatus,
      options: [
        { label: "Tất cả trạng thái", value: "ALL" },
        { label: "Đang soạn (DRAFT)", value: "DRAFT" },
        { label: "Đã hoàn thành (DONE)", value: "DONE" },
      ],
    },
  ];

  // Column definitions
  const columns: Column<ShoppingListWithDetails>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Tên danh sách",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-foreground">{row.title}</div>
              <div className="text-[10px] text-muted-foreground">ID: {row.shopping_list_id}</div>
            </div>
          </div>
        ),
      },
      {
        key: "family_name",
        header: "Hộ gia đình",
        sortable: true,
        render: (row) => <span className="font-bold text-xs text-foreground/80">{row.family_name}</span>,
      },
      {
        key: "creator_name",
        header: "Người lập",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">
              {row.creator_name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-foreground/85">{row.creator_name}</span>
          </div>
        ),
      },
      {
        key: "plan_date",
        header: "Ngày đi chợ dự kiến",
        sortable: true,
        render: (row) => (
          <span className="font-semibold text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 opacity-60 text-primary" />
            {row.plan_date}
          </span>
        ),
      },
      {
        key: "items_count",
        header: "Số lượng sản phẩm",
        render: (row) => (
          <span className="font-bold text-xs text-primary">{row.items?.length ?? 0} mặt hàng</span>
        ),
      },
      {
        key: "status",
        header: "Trạng thái",
        sortable: true,
        render: (row) => {
          const isDone = row.status === "DONE";
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isDone
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}
            >
              {isDone ? "Đã mua xong" : "Đang soạn"}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Thao tác",
        render: (row) => (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:bg-blue-500/15"
              onClick={() => setViewTarget(row)}
              title="Xem chi tiết các mặt hàng"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/15"
              onClick={() => setDeleteTarget(row)}
              title="Xóa danh sách đi chợ"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Danh Sách Mua Sắm"
        description="Giám sát danh sách đi chợ, mua sắm thực phẩm và tiến độ hoàn thành của các hộ gia đình thành viên."
      />

      {/* Control Panel */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm theo tên danh sách, hộ gia đình hoặc người lập..."
            className="flex-1"
          />
        </div>

        <FilterBar filters={filterConfigs} onClearAll={() => setFilterStatus("ALL")} />
      </div>

      {/* Data Table */}
      <div className="relative">
        <DataTable
          data={paginatedLists}
          columns={columns}
          getRowId={(row) => row.shopping_list_id}
          loading={loading}
          emptyMessage="Không tìm thấy danh sách mua sắm nào phù hợp với bộ lọc."
        />

        <Pagination
          total={filteredLists.length}
          page={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Dialog: View Shopping List Items */}
      <Dialog open={Boolean(viewTarget)} onOpenChange={(open) => !open && setViewTarget(null)}>
        <DialogContent className="max-w-xl bg-white rounded-2xl shadow-xl border border-border/40 p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold text-[#5b368d] flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#ffb11f]" />
              Chi tiết mặt hàng - {viewTarget?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tiến độ mua sắm thực tế của các mặt hàng trong danh sách.
            </DialogDescription>
          </DialogHeader>

          <div className="border border-border/40 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#eee9f7] text-[#7655aa] border-b border-border/40">
                <tr>
                  <th className="p-3 font-bold">Mặt hàng</th>
                  <th className="p-3 font-bold text-center">Cần mua</th>
                  <th className="p-3 font-bold text-center">Đã mua</th>
                  <th className="p-3 font-bold text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {viewTarget?.items && viewTarget.items.length > 0 ? (
                  viewTarget.items.map((item) => {
                    const isCompleted = item.item_status === "COMPLETED";
                    const isPartial = item.item_status === "PARTIAL";

                    return (
                      <tr key={item.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition">
                        <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                          <span className="text-lg">{item.icon ?? "🧺"}</span>
                          <span>{item.food_name ?? "Thực phẩm ẩn danh"}</span>
                        </td>
                        <td className="p-3 text-center font-bold text-foreground/80">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-3 text-center font-bold text-primary">
                          {item.bought_quantity ?? 0} {item.unit}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : isPartial
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : isPartial ? (
                              <Clock className="h-3 w-3 text-blue-500" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-slate-500" />
                            )}
                            {item.item_status === "COMPLETED"
                              ? "Hoàn tất"
                              : item.item_status === "PARTIAL"
                              ? "Một phần"
                              : "Chưa mua"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      Không có mặt hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <DialogClose asChild>
              <Button className="bg-[#7655aa] hover:bg-[#67489a] text-white font-bold rounded-lg px-4 h-9">
                Đóng
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Delete Shopping List */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Xóa danh sách mua sắm "${deleteTarget?.title}"?`}
        description="Hành động này không thể hoàn tác. Việc xóa danh sách mua sắm sẽ đồng thời dọn sạch thông tin tất cả các mặt hàng được kê khai đi chợ bên trong."
        primaryLabel="Xóa vĩnh viễn"
        type="destructive"
        onConfirm={handleDelete}
        isLoading={actionLoading}
      />
    </div>
  );
}

export default ShoppingListPage;

import { useEffect, useState, useMemo, useCallback } from "react";
import { Edit2, Trash2, Refrigerator, Calendar, AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { adminInventoryApi, type FridgeItemWithDetails } from "@/api/adminInventoryApi";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterBar, type FilterConfig } from "@/components/shared/FilterBar";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

export function InventoryListPage() {
  // States
  const [items, setItems] = useState<FridgeItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState<string>("ALL");
  const [filterExpiry, setFilterExpiry] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit State
  const [editTarget, setEditTarget] = useState<FridgeItemWithDetails | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editLocation, setEditLocation] = useState<"Ngăn mát" | "Ngăn đông" | "Kệ thường">("Ngăn mát");
  const [editExpiryDate, setEditExpiryDate] = useState<string>("");

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<FridgeItemWithDetails | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load Data
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminInventoryApi.list();
      setItems(data);
    } catch (error) {
      toast.error("Không thể tải danh sách thực phẩm tủ lạnh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Reset page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterLocation, filterExpiry]);

  // Expiry Checker Helper
  const getExpiryState = (expiryDate: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (expiryDate < today) return "EXPIRED";
    
    const diffTime = new Date(expiryDate).getTime() - new Date(today).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 4) return "EXPIRING";
    
    return "NORMAL";
  };

  // Filtering
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        (item.family_name && item.family_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.food_name && item.food_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLocation = filterLocation === "ALL" || item.location === filterLocation;

      const expiryState = getExpiryState(item.expiry_date);
      const matchesExpiry = filterExpiry === "ALL" || expiryState === filterExpiry;

      return matchesSearch && matchesLocation && matchesExpiry;
    });
  }, [items, searchQuery, filterLocation, filterExpiry]);

  // Pagination slicing
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Open Edit Dialog
  const handleOpenEdit = (item: FridgeItemWithDetails) => {
    setEditTarget(item);
    setEditQuantity(item.quantity);
    setEditLocation(item.location);
    setEditExpiryDate(item.expiry_date.slice(0, 10));
  };

  // Save Edit Handler
  const handleSaveEdit = async () => {
    if (!editTarget) return;
    if (editQuantity <= 0) {
      toast.error("Số lượng phải lớn hơn 0.");
      return;
    }
    setActionLoading(true);
    try {
      await adminInventoryApi.update(editTarget.fridge_item_id, {
        quantity: editQuantity,
        location: editLocation,
        expiry_date: editExpiryDate,
      });
      toast.success("Cập nhật thực phẩm tủ lạnh thành công!");
      setEditTarget(null);
      await loadItems();
    } catch (error) {
      toast.error("Cập nhật thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminInventoryApi.delete(deleteTarget.fridge_item_id);
      toast.success(`Đã xóa thực phẩm khỏi tủ lạnh gia đình "${deleteTarget.family_name}"!`);
      setDeleteTarget(null);
      await loadItems();
    } catch (error) {
      toast.error("Xóa thực phẩm thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter Configuration
  const filterConfigs: FilterConfig[] = [
    {
      key: "location",
      label: "Vị trí bảo quản",
      value: filterLocation,
      onChange: setFilterLocation,
      options: [
        { label: "Tất cả vị trí", value: "ALL" },
        { label: "Ngăn mát", value: "Ngăn mát" },
        { label: "Ngăn đông", value: "Ngăn đông" },
        { label: "Kệ thường", value: "Kệ thường" },
      ],
    },
    {
      key: "expiry",
      label: "Tình trạng hạn dùng",
      value: filterExpiry,
      onChange: setFilterExpiry,
      options: [
        { label: "Tất cả hạn sử dụng", value: "ALL" },
        { label: "Còn hạn sử dụng", value: "NORMAL" },
        { label: "Sắp hết hạn (≤ 4 ngày)", value: "EXPIRING" },
        { label: "Đã quá hạn sử dụng", value: "EXPIRED" },
      ],
    },
  ];

  // Column definitions
  const columns: Column<FridgeItemWithDetails>[] = useMemo(
    () => [
      {
        key: "family_name",
        header: "Hộ gia đình",
        sortable: true,
        render: (row) => <span className="font-extrabold text-sm text-foreground">{row.family_name}</span>,
      },
      {
        key: "food_name",
        header: "Thực phẩm",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <span className="text-xl shrink-0">{row.icon ?? "🍎"}</span>
            <div>
              <span className="font-bold text-xs text-foreground/80">{row.food_name}</span>
              <div className="text-[10px] text-muted-foreground">{row.category}</div>
            </div>
          </div>
        ),
      },
      {
        key: "quantity",
        header: "Số lượng tồn",
        sortable: true,
        render: (row) => (
          <span className="font-bold text-xs text-primary">
            {row.quantity} {row.unit}
          </span>
        ),
      },
      {
        key: "location",
        header: "Vị trí bảo quản",
        sortable: true,
        render: (row) => {
          const locColors: Record<string, string> = {
            "Ngăn mát": "bg-sky-500/10 text-sky-600 border-sky-500/20",
            "Ngăn đông": "bg-blue-500/10 text-blue-600 border-blue-500/20",
            "Kệ thường": "bg-amber-500/10 text-amber-600 border-amber-500/20",
          };
          const colorClass = locColors[row.location] || "bg-slate-500/10 text-slate-600 border-slate-500/20";
          return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}>
              {row.location}
            </span>
          );
        },
      },
      {
        key: "expiry_date",
        header: "Hạn sử dụng",
        sortable: true,
        render: (row) => {
          const [year, month, date] = row.expiry_date.split("-");
          return (
            <span className="font-semibold text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 opacity-60 text-primary" />
              {`${date}/${month}/${year}`}
            </span>
          );
        },
      },
      {
        key: "status",
        header: "Trình trạng",
        render: (row) => {
          const state = getExpiryState(row.expiry_date);
          const isExpired = state === "EXPIRED";
          const isExpiring = state === "EXPIRING";

          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isExpired
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  : isExpiring
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              }`}
            >
              {isExpired || isExpiring ? <AlertTriangle className="h-3 w-3 shrink-0" /> : null}
              {isExpired ? "Đã quá hạn" : isExpiring ? "Sắp hết hạn" : "Còn hạn sử dụng"}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Thao tác",
        render: (row) => (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#7655aa] hover:bg-[#7655aa]/15"
              onClick={() => handleOpenEdit(row)}
              title="Chỉnh sửa kho tồn"
            >
              <Edit2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/15"
              onClick={() => setDeleteTarget(row)}
              title="Xóa khỏi tủ lạnh"
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
        title="Quản Lý Kho Tủ Lạnh"
        description="Theo dõi số lượng, vị trí bảo quản và thời hạn sử dụng thực tế của thực phẩm trong tủ lạnh của các hộ gia đình."
      />

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm theo tên hộ gia đình hoặc tên thực phẩm..."
            className="flex-1"
          />
        </div>

        <FilterBar
          filters={filterConfigs}
          onClearAll={() => {
            setFilterLocation("ALL");
            setFilterExpiry("ALL");
          }}
        />
      </div>

      {/* Data Table */}
      <div className="relative">
        <DataTable
          data={paginatedItems}
          columns={columns}
          getRowId={(row) => row.fridge_item_id}
          loading={loading}
          emptyMessage="Không tìm thấy thực phẩm nào trong tủ lạnh phù hợp với bộ lọc."
        />

        <Pagination
          total={filteredItems.length}
          page={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Dialog: Edit Inventory Item */}
      <Dialog open={Boolean(editTarget)} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-md bg-white rounded-2xl shadow-xl border border-border/40 p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold text-[#5b368d] flex items-center gap-2">
              <Refrigerator className="h-5 w-5 text-[#ffb11f]" />
              Điều chỉnh thực phẩm tủ lạnh
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Thay đổi số lượng, vị trí bảo quản hoặc ngày hết hạn của thực phẩm.
            </DialogDescription>
          </DialogHeader>

          {editTarget && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-[#fbfbfe] border border-border/40 rounded-xl">
                <span className="text-2xl">{editTarget.icon ?? "🍎"}</span>
                <div>
                  <div className="font-extrabold text-sm text-foreground">{editTarget.food_name}</div>
                  <div className="text-xs text-muted-foreground">Gia đình: {editTarget.family_name}</div>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="text-xs font-bold text-muted-foreground">
                  Số lượng ({editTarget.unit})
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(Number(e.target.value))}
                  placeholder="Nhập số lượng tồn"
                  className="h-10 rounded-[8px] font-sans"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-bold text-muted-foreground">
                  Vị trí bảo quản
                </Label>
                <Select
                  value={editLocation}
                  onValueChange={(val: any) => setEditLocation(val)}
                >
                  <SelectTrigger id="location" className="h-10 rounded-[8px]">
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Ngăn mát">Ngăn mát</SelectItem>
                    <SelectItem value="Ngăn đông">Ngăn đông</SelectItem>
                    <SelectItem value="Kệ thường">Kệ thường</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <Label htmlFor="expiry" className="text-xs font-bold text-muted-foreground">
                  Hạn sử dụng
                </Label>
                <Input
                  id="expiry"
                  type="date"
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  className="h-10 rounded-[8px] font-sans"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-lg h-9 font-bold px-4">
                Hủy
              </Button>
            </DialogClose>
            <Button
              onClick={handleSaveEdit}
              className="bg-[#7655aa] hover:bg-[#67489a] text-white font-bold rounded-lg px-4 h-9"
              disabled={actionLoading}
            >
              Lưu thay đổi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Delete Inventory Item */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa thực phẩm khỏi tủ lạnh gia đình?"
        description={
          <div className="space-y-2">
            <p>
              Hành động này sẽ xóa vĩnh viễn thực phẩm "{deleteTarget?.food_name}" ra khỏi kho lưu trữ tủ lạnh của gia đình "{deleteTarget?.family_name}".
            </p>
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 text-xs font-bold text-destructive rounded-xl border border-destructive/20 mt-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Gia đình sẽ không thấy thực phẩm này trên ứng dụng di động nữa.</span>
            </div>
          </div>
        }
        primaryLabel="Xóa vĩnh viễn"
        type="destructive"
        onConfirm={handleDelete}
        isLoading={actionLoading}
      />
    </div>
  );
}

export default InventoryListPage;

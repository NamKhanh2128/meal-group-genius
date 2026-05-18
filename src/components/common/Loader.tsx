export function Loader({ label = "Đang xử lý..." }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-[#746d82]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#7655aa] border-t-transparent" />
      {label}
    </div>
  );
}

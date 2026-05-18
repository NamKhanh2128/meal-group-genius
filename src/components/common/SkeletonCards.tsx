export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-[8px] bg-white p-4 shadow-card">
          <div className="h-36 animate-pulse rounded-[8px] bg-[#eee9f7]" />
          <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-[#eee9f7]" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-[#f3eff8]" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#f3eff8]" />
        </div>
      ))}
    </div>
  );
}

'use client';

export default function StatsChartLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-muted" />
        ))}
      </div>

      <div className="min-h-[350px] bg-muted rounded-md border p-4" />

      <div className="flex flex-col gap-2 md:flex-row">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="basis-1/3 min-h-[350px] bg-muted rounded-md border p-4" />
        ))}
      </div>

      <div className="min-h-[350px] bg-muted rounded-md border p-4 flex flex-col md:flex-row gap-4">
        <div className="basis-1/2 h-full bg-muted rounded-md" />
        <div className="basis-1/2 h-full bg-muted rounded-md" />
      </div>

      <div className="min-h-[350px] bg-muted rounded-md border p-4 flex flex-col md:flex-row gap-4">
        <div className="basis-1/2 h-full bg-muted rounded-md" />
        <div className="basis-1/2 h-full bg-muted rounded-md" />
      </div>

      <div className="min-h-[350px] bg-muted rounded-md border p-4" />
    </div>
  );
}

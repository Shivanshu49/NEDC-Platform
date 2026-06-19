/** Friendly placeholder shown when a section has no data in Supabase yet. */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-12 text-center text-muted-foreground">
      {message}
    </div>
  );
}

/** Friendly placeholder shown when a section has no data in Supabase yet. */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-foreground/15 p-12 text-center text-foreground/70">
      {message}
    </div>
  );
}

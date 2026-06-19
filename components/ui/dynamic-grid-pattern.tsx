import { cn } from "@/lib/utils"

interface PatternProps {
  numOfRows?: number
  numOfCols?: number
  className?: string
}

export const DynamicGridPattern = ({
  numOfRows = 25,
  numOfCols = 25,
  className
}: PatternProps) => {
  const rows = new Array(numOfRows).fill(1)
  const cols = new Array(numOfCols).fill(1)
  return (
    <div
      style={{ transform: `translateZ(0)` }}
      className="absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2"
    >
      {rows.map((_, i) => (
        <div key={`row` + i} className="relative h-8 w-16 border-l">
          {cols.map((_, j) => {
            // Deterministic (no Math.random → no hydration mismatch): scatter a
            // gentle ambient shimmer over ~8% of cells, each with a staggered
            // start so they don't pulse in unison.
            const shimmer = (i * 31 + j * 17) % 13 === 0
            const delay = ((i * 7 + j * 5) % 12) * 0.5
            return (
              <div
                key={`col` + j}
                style={shimmer ? { animationDelay: `${delay}s` } : undefined}
                className={cn(
                  "relative h-8 w-16 border-r border-t transition-all duration-1000 hover:duration-0",
                  shimmer
                    ? // a faint resting glow that breathes; on hover, stop the
                      // breathing and show the full tile fill
                      "bg-primary-foreground/[0.06] animate-grid-shimmer hover:animate-none hover:opacity-100"
                    : "bg-transparent",
                  className
                )}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely — `clsx` handles conditionals, `twMerge`
 * de-duplicates conflicting utilities (e.g. `px-2 px-4` → `px-4`). Used by every
 * shadcn/ui component and our own UI primitives.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

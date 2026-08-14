"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * SPA PageView tracker. The official pixel snippet (init + first PageView)
 * is server-rendered in the root <head> — this component only covers
 * Next.js client-side navigations, which never reload the page.
 */
export default function MetaPixel() {
  const pathname = usePathname();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}

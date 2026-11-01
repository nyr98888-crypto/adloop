"use client";

import { useSyncExternalStore } from "react";

/** True after hydration on the client (safe portal / document.body gate). */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

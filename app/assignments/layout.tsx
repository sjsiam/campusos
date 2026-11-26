"use client";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import AssignmentList from "@/components/AssignmentList";

// CO-37: phone = list, detail as separate pages; ≥ 768 = list (340px, 400px ≥ 1024) beside the detail.
// The list stays mounted while a detail is open, so going back keeps its scroll.
export default function AssignmentsLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  // Top row after each list load (null = empty list, undefined = loading). Wrapped so every load is a new value.
  const [first, setFirst] = useState<{ id: string | null }>();
  const onFirst = useCallback((id: string | null) => setFirst({ id }), []);
  const used = useRef<object>(undefined);
  const list = path === "/assignments";
  // Wide screens open the top item by default (system.md §5); the index page's "pick" text is for an empty list.
  // Only a fresh load redirects, so coming back after a delete never jumps to the deleted item.
  useEffect(() => {
    if (!list || !first?.id || used.current === first || !matchMedia("(min-width: 768px)").matches) return;
    used.current = first;
    router.replace(`/assignments/${first.id}`);
  }, [list, first, router]);
  if (path === "/assignments/new") return children;
  return (
    <div className="flex flex-1 flex-col md:grid md:grid-cols-[340px_minmax(0,640px)] lg:grid-cols-[400px_minmax(0,640px)]">
      <div className={`md:border-r md:border-line ${list ? "" : "hidden md:block"}`}><AssignmentList onFirst={onFirst} /></div>
      <div className={list ? "hidden md:block" : ""}>{list && first?.id !== null ? null : children}</div>
    </div>
  );
}

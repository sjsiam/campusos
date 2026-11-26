"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { listUpdates } from "@/lib/data";
import { useT, type MessageKey } from "@/lib/i18n";
import { useSession } from "./Session";
import { Icon } from "./ui";

/** When the Updates feed was last opened; newer updates count as unread. */
export const SEEN_KEY = "updatesSeenAt";
export const readSeen = () => { try { return Number(localStorage.getItem(SEEN_KEY) ?? 0); } catch { return 0; } };

const tabs: { href: string; key: MessageKey; icon: "cal" | "list" | "bell" }[] = [
  { href: "/today", key: "nav.today", icon: "cal" },
  { href: "/assignments", key: "nav.assignments", icon: "list" },
  { href: "/updates", key: "nav.updates", icon: "bell" },
];

/** Pages without app chrome: no nav, phone-width column at every size. */
const bare = (path: string) => path === "/" || path === "/login" || path === "/onboarding" || path === "/assignments/new";

/** Unread updates from others since the feed was last opened; re-counted on every navigation. */
function useUnread() {
  const path = usePathname();
  const session = useSession(); // null on /login
  const classIds = session?.profile?.classIds, uid = session?.user.uid;
  const onUpdates = path.startsWith("/updates");
  const [unread, setUnread] = useState(0);
  // Re-counted on every tab change; opening the feed clears it.
  useEffect(() => {
    if (!classIds || onUpdates) return;
    let live = true;
    listUpdates(classIds).then((us) => { if (live) setUnread(us.filter((u) => u.createdBy !== uid && u.createdAt.getTime() > readSeen()).length); }, () => {});
    return () => { live = false; };
  }, [classIds, uid, onUpdates, path]);
  return onUpdates ? 0 : unread;
}

// CO-37 shell (system.md v3 §4–5): phone = column + bottom nav; ≥ 768 = icon rail (72) beside the panes;
// ≥ 1024 = labelled rail (220). Desktop reuses the tablet panes (no week grid, Siam's cut). Account, language and
// the rep action stay in each first pane's app bar, so the rail has no footer.
export default function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const count = useUnread();
  // The landing page sets its own widths (two columns ≥ 1024); other bare pages stay a phone column.
  if (bare(path)) return <div className={`mx-auto flex w-full flex-1 flex-col ${path === "/" ? "" : "max-w-md"}`}><main className="flex flex-1 flex-col">{children}</main></div>;
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col md:max-w-none md:flex-row">
      <Rail count={count} />
      <main className="flex flex-1 flex-col md:min-w-0">{children}</main>
      <BottomNav count={count} />
    </div>
  );
}

const badge = "grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 font-fig text-xs font-bold text-bg";

function Rail({ count }: { count: number }) {
  const path = usePathname();
  const { t } = useT();
  return (
    <nav aria-label="CampusOS" className="sticky top-0 hidden h-dvh w-[72px] shrink-0 flex-col gap-1 bg-head px-2.5 py-3.5 text-on-head md:flex lg:w-[220px]">
      <span className="pb-3 text-center font-fig text-base font-bold lg:hidden" aria-hidden>CO</span>
      <span className="hidden px-2 pb-3.5 font-fig text-[22px] font-bold lg:block">CampusOS</span>
      {tabs.map(({ href, key, icon }) => (
        <Link key={href} href={href} aria-current={path.startsWith(href) ? "page" : undefined} aria-label={t(key)}
          className="relative flex min-h-11 items-center justify-center gap-2.5 rounded-lg font-semibold text-on-head-muted aria-[current=page]:bg-white/12 aria-[current=page]:text-on-head lg:justify-start lg:px-2.5">
          <Icon name={icon} className="size-[22px]" />
          <span className="hidden lg:inline">{t(key)}</span>
          {href === "/updates" && count > 0 && (
            <span className={`${badge} absolute top-1 right-1.5 lg:static lg:ml-auto`}>{count}<span className="sr-only"> {t("update.new")}</span></span>
          )}
        </Link>
      ))}
    </nav>
  );
}

// Bottom nav (system.md v3 §4): 3 tabs, active = primary + bold, no indicator. Phone only.
function BottomNav({ count }: { count: number }) {
  const path = usePathname();
  const { t } = useT();
  return (
    <nav className="sticky bottom-0 mt-auto border-t md:hidden border-line bg-bg pb-[max(0.625rem,env(safe-area-inset-bottom))]">
      <ul className="grid grid-cols-3">
        {tabs.map(({ href, key, icon }) => (
          <li key={href}>
            <Link href={href} aria-current={path.startsWith(href) ? "page" : undefined}
              className="relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[13px] text-muted aria-[current=page]:font-bold aria-[current=page]:text-primary">
              <Icon name={icon} className="size-6" />
              {t(key)}
              {href === "/updates" && count > 0 && (
                <span className={`${badge} absolute top-1.5 left-[calc(50%+6px)]`}>
                  {count}<span className="sr-only"> {t("update.new")}</span>
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

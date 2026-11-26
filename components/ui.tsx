"use client";
// Small shared pieces from docs/design/system.md v3 §4.
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { useT } from "@/lib/i18n";

export const btnPrimary =
  "inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-[10px] bg-primary px-[18px] text-[17px] font-bold text-on-primary disabled:opacity-50";
export const btnSecondary =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-line-strong bg-bg px-4 font-semibold";
const btnTextBase = "inline-flex min-h-11 items-center gap-1.5 font-semibold";
export const btnText = `${btnTextBase} text-primary`;
export const btnDangerText = `${btnTextBase} text-danger`;
export const sectionLabel = "text-[15px] font-bold text-muted";
/** Sticky action bar at the bottom of a focused screen (onboarding, forms). */
export const stickyBar = "sticky bottom-0 mt-auto flex flex-col gap-2 border-t border-line bg-bg px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]";

// Icon paths from the board's <symbol> block (24px, stroke).
const ICONS = {
  cal: "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  list: "M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16ZM10 20a2 2 0 0 0 4 0",
  x: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  back: "M20 12H5M11 6l-6 6 6 6",
  check: "M5 12.5 10 17l9-10",
  search: "M4.5 11a6.5 6.5 0 1 0 13 0 6.5 6.5 0 1 0-13 0M16 16l4 4",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  share: "M12 3v12M8 7l4-4 4 4M6 11H5v9h14v-9h-1",
  addsq: "M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4ZM12 8.5v7M8.5 12h7",
};
const WIDTH: Partial<Record<keyof typeof ICONS, number>> = { x: 2.6, check: 2.6, plus: 2.2, back: 2, search: 2, link: 2, trash: 2, share: 2, addsq: 2 };
export const Icon = ({ name, className = "size-[22px]" }: { name: keyof typeof ICONS; className?: string }) => (
  <svg aria-hidden viewBox="0 0 24 24" className={`shrink-0 ${className}`} fill="none" stroke="currentColor"
    strokeWidth={WIDTH[name] ?? 1.8} strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[name]} /></svg>
);

export const Spinner = () => (
  <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />
);

export function FullScreenSpinner() {
  const { t } = useT();
  return (
    <div className="flex min-h-dvh items-center justify-center text-primary" role="status">
      <span className="size-8 animate-spin rounded-full border-4 border-current border-r-transparent motion-reduce:animate-none" />
      <span className="sr-only">{t("common.loading")}</span>
    </div>
  );
}

/** Placeholder rows with hairlines, like the list they stand in for. */
export const SkeletonRows = ({ n = 3, h = "h-16" }: { n?: number; h?: string }) => (
  <div aria-hidden>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} className="border-b border-line px-4 py-2.5"><div className={`animate-pulse rounded-md bg-bg-2 motion-reduce:animate-none ${h}`} /></div>
    ))}
  </div>
);

export function EmptyState({ title, body, children }: { title: string; body?: string; children?: ReactNode }) {
  return (
    <div className="px-4 py-12 text-center">
      <p className="text-base font-semibold">{title}</p>
      {body && <p className="mt-1 text-sm text-muted">{body}</p>}
      {children}
    </div>
  );
}

/** Heading row of a tablet/desktop side pane (board v3 `.panehead`). */
export const paneHead = "flex min-h-14 items-center justify-between gap-2.5 border-line px-4 py-1.5";

// CO-27: no offline cache, so a failed load while offline says so plainly instead of the generic error.
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useT();
  const online = useOnline();
  return (
    <EmptyState title={t(online ? "common.loadError" : "common.offlineError")}>
      <button onClick={onRetry} className={`${btnSecondary} mt-4 w-auto px-6`}>{t("common.retry")}</button>
    </EmptyState>
  );
}

/** Notice under the app bar (offline, reminders off, iPhone hint): text plus actions, no icon. */
export const Notice = ({ children }: { children: ReactNode }) => (
  <div role="status" className="mx-4 mt-3 rounded-[10px] border border-line-strong p-3 text-[15px]">{children}</div>
);

const onlineSub = (cb: () => void) => {
  addEventListener("online", cb); addEventListener("offline", cb);
  return () => { removeEventListener("online", cb); removeEventListener("offline", cb); };
};
const useOnline = () => useSyncExternalStore(onlineSub, () => navigator.onLine, () => true);
/** Connection dropped after the page loaded: what's on screen stays. Pages hide it while showing ErrorState. */
export function OfflineBanner() {
  const { t } = useT();
  const online = useOnline();
  return online ? null : <Notice>{t("common.offline")}</Notice>;
}

/**
 * Bottom sheet on a modal <dialog>: the browser traps focus, closes on Escape and makes the page inert.
 * Also closes on scrim tap, ✕ and a downward swipe on the grab area.
 */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const { t } = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const startY = useRef<number | null>(null);
  useEffect(() => {
    const d = ref.current;
    if (open && !d?.open) d?.showModal();
    if (!open && d?.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} aria-labelledby="sheet-title" onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="sheet rounded-t-[14px] bg-bg p-0 text-ink shadow-[0_-8px_24px_rgb(0_0_0/.25)]">
      <div className="px-4 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="touch-none" onPointerDown={(e) => { startY.current = e.clientY; }}
          onPointerUp={(e) => { if (startY.current !== null && e.clientY - startY.current > 60) onClose(); startY.current = null; }}>
          <div aria-hidden className="mx-auto mb-2.5 h-1 w-9 rounded-sm bg-line-strong opacity-60" />
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 id="sheet-title" className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="-mr-2.5 grid size-11 place-items-center text-muted">
              <Icon name="x" className="size-5" /><span className="sr-only">{t("common.close")}</span>
            </button>
          </div>
        </div>
        {children}
      </div>
    </dialog>
  );
}

/** Segmented control (system.md §4): selected segment is ink on bg. */
export function Segmented<V extends string>({ label, value, options, onChange, className = "" }:
  { label: string; value: V; options: [V, ReactNode, string?][]; onChange: (v: V) => void; className?: string }) {
  return (
    <div role="radiogroup" aria-label={label}
      className={`grid grid-flow-col auto-cols-fr overflow-hidden rounded-[10px] border-[1.5px] border-line-strong ${className}`}>
      {options.map(([v, text, lang]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} lang={lang} onClick={() => onChange(v)}
          className="min-h-12 border-l-[1.5px] border-line-strong px-2 font-semibold first:border-l-0 aria-checked:bg-ink aria-checked:text-bg">
          {text}
        </button>
      ))}
    </div>
  );
}

"use client";
// Today's one notice (screens.md §10): the iPhone install hint, or "reminders are off". Never both.
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { enablePush, pushState } from "@/lib/push";
import { useSession } from "./Session";
import { btnPrimary, btnText, Icon, Notice, Sheet } from "./ui";

const Glyph = ({ name }: { name: "share" | "addsq" }) => (
  <span className="ml-0.5 inline-grid size-[26px] place-items-center rounded-md border border-line-strong align-middle text-primary">
    <Icon name={name} className="size-4" />
  </span>
);

const KEY = "remDismissedAt";
const WEEK = 7 * 864e5;
const otherIosBrowser = () => /CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
const dismissedRecently = () => { try { return Date.now() - Number(localStorage.getItem(KEY) ?? 0) < WEEK; } catch { return false; } };

export default function RemindNotice() {
  const { t } = useT();
  const { user } = useSession();
  const [state, setState] = useState(pushState);
  const [hidden, setHidden] = useState(dismissedRecently);
  const [steps, setSteps] = useState(false);
  const dismiss = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch {} setHidden(true); };

  if (hidden) return null;
  const close = (
    <button onClick={dismiss} className="-mt-2.5 -mr-2.5 grid size-11 shrink-0 place-items-center text-muted">
      <Icon name="x" className="size-5" /><span className="sr-only">{t("common.dismiss")}</span>
    </button>
  );
  // iPhone not on the Home Screen (screens.md §8): Safari gets the steps; other iOS browsers can't install at all.
  if (state === "install") return (
    <>
      <Notice>
        <div className="flex items-start gap-1">
          <p className="flex-1">{t(otherIosBrowser() ? "install.useSafari" : "ios.text")}</p>
          {close}
        </div>
        {!otherIosBrowser() && <button onClick={() => setSteps(true)} className={btnText}>{t("ios.how")}</button>}
      </Notice>
      <Sheet open={steps} onClose={() => setSteps(false)} title={t("install.title")}>
        <ol className="mt-1.5 mb-4 flex list-decimal flex-col gap-2.5 pl-5">
          {/* Safari's own glyphs next to the steps that use them (board v3). */}
          <li>{t("install.step1")} <Glyph name="share" /></li>
          <li>{t("install.step2")} <Glyph name="addsq" /></li>
          <li>{t("install.step3")}</li>
        </ol>
        <button onClick={() => setSteps(false)} className={btnPrimary}>{t("ios.ok")}</button>
      </Sheet>
    </>
  );
  if (state !== "default") return null;
  return (
    <Notice>
      <div className="flex items-start gap-1">
        <p className="flex-1">{t("rem.text")}</p>
        {close}
      </div>
      <div className="mt-2 flex items-center gap-3">
        <button onClick={() => enablePush(user.uid).then(setState)} className="inline-flex min-h-11 items-center rounded-[10px] bg-primary px-3.5 text-[15px] font-bold text-on-primary">
          {t("rem.on")}
        </button>
        <button onClick={dismiss} className={btnText}>{t("rem.later")}</button>
      </div>
    </Notice>
  );
}

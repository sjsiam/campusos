"use client";
import { FirebaseError } from "firebase/app";
import { useEffect, useState } from "react";
import { redirectResult, signInWithGoogle } from "@/lib/auth";
import { useT, type MessageKey } from "@/lib/i18n";
import { btnPrimary, Spinner } from "./ui";

/** Google sign-in button with busy and error states; also finishes a redirect sign-in that returns here. */
export default function GoogleButton({ label = "login.google", className = "" }: { label?: MessageKey; className?: string }) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => { redirectResult().catch((e) => { console.error(e); setError(true); }); }, []);

  const signIn = async () => {
    setBusy(true);
    setError(false);
    try {
      await signInWithGoogle();
    } catch (e) {
      // Closing the popup is not an error.
      const code = e instanceof FirebaseError ? e.code : "";
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") { console.error(e); setError(true); }
      setBusy(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {error && <p role="alert" className="text-center text-sm font-semibold text-danger">{t("login.error")}</p>}
      <button onClick={signIn} disabled={busy} aria-busy={busy} className={btnPrimary}>
        {busy ? <Spinner />
          : <span aria-hidden className="grid size-[22px] place-items-center rounded bg-on-primary text-sm font-extrabold text-primary">G</span>}
        {t(label)}
      </button>
    </div>
  );
}

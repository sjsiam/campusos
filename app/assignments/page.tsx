"use client";
import { EmptyState } from "@/components/ui";
import { useT } from "@/lib/i18n";

// The list itself lives in app/assignments/layout.tsx. Tablet/desktop right pane, shown only when the list is empty
// (otherwise the layout opens the first item).
export default function AssignmentsIndex() {
  const { t } = useT();
  return <EmptyState title={t("assign.pick")} />;
}

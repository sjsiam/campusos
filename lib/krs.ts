// "Fill from KRS": finds course codes (+ Kelas) in text pasted from SIAKAD and maps them to CampusOS class ids.
// Pure and client-side: the pasted text is never sent or stored.
import type { CampusClass } from "./types";

export interface KrsResult {
  /** Class ids to tick (a code + Kelas with both a lecture and a lab gives both). */
  ids: string[];
  /** Codes (with the Kelas when one was read) that have no matching class in CampusOS. A known code with several
   *  sections and no readable Kelas is in neither list: the student ticks it by hand. */
  unknown: string[];
}

const CODE = /\b([A-Za-z]{4})(\d{4})\b/g;
const KELAS = /\bkelas\s*:?\s*([A-Za-z0-9]+)/gi;

export function parseKrs(text: string, classes: CampusClass[]): KrsResult {
  const hits = [...text.matchAll(CODE)];
  const ids = new Set<string>(), unknown = new Set<string>(), ticked = new Set<string>();
  hits.forEach((m, i) => {
    const code = (m[1] + m[2]).toUpperCase();
    // Everything up to the next code belongs to this course (same row, or the next lines in the jadwal layout).
    const seg = text.slice(m.index! + m[0].length, hits[i + 1]?.index ?? text.length);
    const mine = classes.filter((c) => c.courseCode.toUpperCase() === code);
    const sections = [...new Set(mine.map((c) => c.section.toUpperCase()))];
    // "Kelas : 23" wins; a repeated table header ("… Kelas SKS …") gives a non-section word, so prefer a known one.
    const labelled = [...seg.matchAll(KELAS)].map((k) => k[1].toUpperCase());
    // Tabular paste without the word "Kelas": a cell equal to one of this course's sections.
    const cells = seg.split(/[\s|;,()]+/).map((s) => s.toUpperCase());
    const tab = sections.filter((s) => cells.includes(s));
    const kelas = labelled.find((k) => sections.includes(k)) ?? (tab.length === 1 ? tab[0] : labelled[0]);
    const match = kelas ? mine.filter((c) => c.section.toUpperCase() === kelas)
      : mine.length === 1 ? mine : [];
    if (match.length) { match.forEach((c) => ids.add(c.id)); ticked.add(code); }
    else if (!mine.length || kelas) unknown.add(kelas ? `${code} · ${kelas}` : code);
  });
  // A code repeated elsewhere in the paste (header, summary) is not "missing" once one mention matched.
  return { ids: [...ids], unknown: [...unknown].filter((u) => !ticked.has(u.split(" ")[0])) };
}

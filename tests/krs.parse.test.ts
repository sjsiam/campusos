// QA: "Fill from KRS" parser against the checklist samples K1–K6 (docs/qa/krs-fill-checklist.md)
// and the real 11-class USK timetable. The fake NIM/name must never influence the result.
import { describe, expect, it } from "vitest";
import { parseKrs } from "../lib/krs";
import type { CampusClass } from "../lib/types";

const c = (code: string, section: string, type: CampusClass["type"] = "lecture"): CampusClass => ({
  id: `${code}-${section}-${type}`.toLowerCase(), courseCode: code, courseName: code, section, type, lecturer: "", slots: [], editors: [],
});
// Same ids as the seeded production/emulator data.
const REAL = [
  c("FFTT1001", "23"), c("FFTT1007", "CE03"), c("MKWU1002", "45"), c("MKWU1006", "D29"), c("STIK1001", "14"),
  c("STIK1003", "11"), c("STIK1005", "14"), c("STIK1007", "11", "lab"), c("STIK1009", "14"), c("STIK1011", "14", "lab"),
  c("STIK1013", "13"),
];
const NIM = "2408107010999";
const K1 = `KARTU RENCANA STUDI
NIM : ${NIM}    Nama : MAHASISWA UJI COBA
Semester Ganjil 2026/2027
No Kode      Mata Kuliah                      Kelas  SKS
1  STIK1005  Logika Digital                   14     3
2  STIK1007  Praktikum Logika Digital         11     1
3  FFTT1007  Matematika I                     CE03   3
4  MKWU1006  Pembinaan Karakter I             D29    1
5  STIK9999  Mata Kuliah Tidak Ada            01     2
Total SKS: 10`;
const K1_IDS = ["stik1005-14-lecture", "stik1007-11-lab", "fftt1007-ce03-lecture", "mkwu1006-d29-lecture"];

describe("K1 normal KRS", () => {
  it("ticks the 4 seeded classes; STIK9999 has no 'Kelas' label and an unknown code → listed as unknown", () => {
    const r = parseKrs(K1, REAL);
    expect(r.ids).toEqual(K1_IDS);
    expect(r.unknown).toEqual(["STIK9999"]);
  });
  it("the NIM, name and header never appear in the result", () => {
    expect(JSON.stringify(parseKrs(K1, REAL))).not.toMatch(new RegExp(`${NIM}|MAHASISWA|KARTU`));
  });
});

describe("K2 messy copy-paste", () => {
  it("lowercase, tabs, blank lines, 'Kelas: 14' and CRLF give the same 4", () => {
    const messy = `\r\n\r\nstik1005\tlogika digital\tKelas: 14\t3\r\n\r\nSTIK1007\t\tPraktikum\t11\r\nfftt1007   matematika   kelas :ce03\r\nMKWU1006 Pembinaan Karakter I (Kelas : D29)\r\n`;
    expect(parseKrs(messy, REAL).ids.sort()).toEqual([...K1_IDS].sort());
  });
  it("a code split by a space ('STIK 1005') is not read and not listed as unknown (by design of the regex)", () => {
    expect(parseKrs("STIK 1005 Logika Digital Kelas 14", REAL)).toEqual({ ids: [], unknown: [] });
  });
});

describe("K3 wrong section", () => {
  it("labelled wrong Kelas on a known code → not ticked, listed as 'CODE · KELAS'", () => {
    expect(parseKrs("STIK1005 Logika Digital Kelas : 99", REAL)).toEqual({ ids: [], unknown: ["STIK1005 · 99"] });
  });
  it("unlabelled wrong section on a one-section course → ticks that one section (code-only fallback)", () => {
    // Documented behaviour: with no 'Kelas' word, a course that has one class in CampusOS is ticked by code.
    expect(parseKrs("STIK1005 Logika Digital 99 3", REAL).ids).toEqual(["stik1005-14-lecture"]);
  });
});

describe("K4 nothing useful", () => {
  it("random Indonesian text and empty input find nothing", () => {
    expect(parseKrs("Mahasiswa wajib mengisi KRS sebelum tanggal 30 November di gedung rektorat.", REAL)).toEqual({ ids: [], unknown: [] });
    expect(parseKrs("", REAL)).toEqual({ ids: [], unknown: [] });
  });
  it("NIM-like and NIP-like digit runs are never codes", () => {
    expect(parseKrs(`${NIM} 198001012005011001 24081070109`, REAL)).toEqual({ ids: [], unknown: [] });
  });
});

describe("K5 hostile input", () => {
  it("HTML and SQL in the paste are just text; the code next to it still matches", () => {
    expect(parseKrs("<img src=x onerror=alert(1)>STIK1005 Kelas 14", REAL).ids).toEqual(["stik1005-14-lecture"]);
    expect(parseKrs("'; DROP TABLE classes; -- STIK1013 Kelas : 13", REAL).ids).toEqual(["stik1013-13-lecture"]);
  });
  it("unknown output contains only CODE or CODE · KELAS, never pasted markup", () => {
    for (const u of parseKrs("<b>ABCD1234</b> Kelas : <script>x</script>", REAL).unknown) expect(u).toMatch(/^[A-Z]{4}\d{4}( · [A-Z0-9]+)?$/);
  });
});

describe("K6 huge paste", () => {
  it("K1 × 2300 (~1 MB) parses in well under a second, no duplicates", () => {
    const big = Array(2300).fill(K1).join("\n");
    expect(big.length).toBeGreaterThan(1_000_000);
    const t0 = performance.now();
    const r = parseKrs(big, REAL);
    expect(performance.now() - t0).toBeLessThan(1000);
    expect(r.ids).toEqual(K1_IDS);
    expect(r.unknown).toContain("STIK9999"); // exact list blocked by KRS-1 (repeated header between copies)
  });
});

// KRS-1 (docs/qa/krs-report.md): a repeated table header ("No Kode Mata Kuliah Kelas SKS", e.g. a multi-page
// KRS) used to be read as "Kelas SKS" for the row above it. Fixed: a Kelas value must contain a digit.
const HEADER = "No Kode Mata Kuliah Kelas SKS";
describe("KRS-1 repeated header", () => {
  it("a known course without a section cell, followed by a header, is still ticked", () => {
    expect(parseKrs(`1 MKWU1002 Kewarganegaraan\n${HEADER}\n2 STIK1013 Biologi 13 3`, REAL))
      .toEqual({ ids: ["mkwu1002-45-lecture", "stik1013-13-lecture"], unknown: [] });
  });
  it("an unknown course before a header is listed without a bogus '· SKS'", () => {
    expect(parseKrs(`5 STIK9999 Robotika 01 2\n${HEADER}\n1 STIK1013 Biologi 13 3`, REAL).unknown).toEqual(["STIK9999"]);
  });
  it("the SIAKAD '(Kelas : x)' layout with a header in between already works", () => {
    expect(parseKrs(`1 MKWU1002 Kewarganegaraan\n(Kelas : 45)\n${HEADER}\n2 STIK1013 Biologi\n(Kelas : 13)`, REAL).ids)
      .toEqual(["mkwu1002-45-lecture", "stik1013-13-lecture"]);
  });
});

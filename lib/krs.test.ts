import { expect, test } from "vitest";
import { parseKrs } from "./krs";
import type { CampusClass } from "./types";

const c = (code: string, section: string, type: CampusClass["type"] = "lecture"): CampusClass => ({
  id: `${code}-${section}-${type}`.toLowerCase(), courseCode: code, courseName: code, section, type, lecturer: "", slots: [], editors: [],
});
const CLASSES = [
  c("FFTT1001", "23"), c("FFTT1007", "CE03"), c("MKWU1002", "45"), c("STIK1005", "14"), c("STIK1005", "11"),
  c("STIK1007", "11", "lab"), c("STIK1009", "14"), c("STIK1009", "14", "lab"), c("STIK1013", "13"),
];

test("SIAKAD jadwal layout: code, name, then (Kelas : x) on the next lines", () => {
  const text = `No\tKode\tMata Kuliah\tSKS\tJadwal
1\tFFTT1001\tFisika I
(Kelas : 23)\t3\tRabu, 08:00 - 10:30\tF01 - 301
2\tFFTT1007\tMatematika I
(Kelas : CE03)\t3\tSelasa, 08:00 - 10:30\tF01 - 205
3\tSTIK1005\tLogika Digital
(Kelas : 14)\t2\tJumat, 10:45 - 12:25\tF01 - 303`;
  expect(parseKrs(text, CLASSES)).toEqual({ ids: ["fftt1001-23-lecture", "fftt1007-ce03-lecture", "stik1005-14-lecture"], unknown: [] });
});

test("tabular paste with a bare section cell; a header row in between does not confuse it", () => {
  const text = "1 | STIK1005 | Logika Digital | 14 | 2\nNo | Kode | Mata Kuliah | Kelas | SKS\n2 | STIK1007 | Praktikum Logika Digital | 11 | 1";
  expect(parseKrs(text, CLASSES).ids).toEqual(["stik1005-14-lecture", "stik1007-11-lab"]);
});

test("same code + Kelas with a lecture and a lab ticks both", () => {
  expect(parseKrs("STIK1009 Pemrograman I Kelas: 14", CLASSES).ids).toEqual(["stik1009-14-lecture", "stik1009-14-lab"]);
});

test("missing Kelas: ticks a code with one class only; ambiguous codes are left to the student", () => {
  expect(parseKrs("MKWU1002 Kewarganegaraan\nSTIK1005 Logika Digital", CLASSES)).toEqual({ ids: ["mkwu1002-45-lecture"], unknown: [] });
});

test("unknown codes and unknown sections are listed once; duplicates collapse", () => {
  const text = "STIK1013 (Kelas : 13)\nSTIK1013 (Kelas : 13)\nSTIK9999 Robotika (Kelas : 2)\nSTIK9999 (Kelas : 2)\nFFTT1001 (Kelas : 99)\nSTIK1099";
  expect(parseKrs(text, CLASSES)).toEqual({ ids: ["stik1013-13-lecture"], unknown: ["STIK9999 · 2", "FFTT1001 · 99", "STIK1099"] });
});

test("lowercase and extra whitespace", () => {
  expect(parseKrs("   stik1005   logika digital   kelas   :   14   \n\n  fftt1007 \t kelas:ce03 ", CLASSES).ids)
    .toEqual(["stik1005-14-lecture", "fftt1007-ce03-lecture"]);
});

test("empty or code-free input finds nothing; NIPs, rooms and dates are not codes", () => {
  expect(parseKrs("", CLASSES)).toEqual({ ids: [], unknown: [] });
  expect(parseKrs("   \n ", CLASSES)).toEqual({ ids: [], unknown: [] });
  expect(parseKrs("NIP 198001012005011001 · F01 - 301 · 26 Nov 2026 · 11.02.005", CLASSES)).toEqual({ ids: [], unknown: [] });
});

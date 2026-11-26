import { expect, test } from "vitest";
import { isRealDate } from "./validate";

test("impossible calendar dates are rejected", () => {
  expect(["2026-02-28", "2028-02-29", "2026-12-31"].map(isRealDate)).toEqual([true, true, true]);
  expect(["2026-02-29", "2026-02-30", "2026-04-31", "2026-13-01", "2026-00-10"].map(isRealDate)).toEqual([false, false, false, false, false]);
});

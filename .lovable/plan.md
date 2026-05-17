# Stabilize the rotating hero word on mobile

## Problem (verified visually at 320 / 375 / 1366)

Two of the four foreign phrases (`tout le monde`, `semua orang`) wrap **mid-phrase** on narrow viewports, splitting the headline into 3 lines and causing the dashboard below to jump as the word rotates. Single-word picks (English + Devanagari + CJK + Japanese) render fine on the baseline at every size.

## Fix

Two small, additive changes to `src/pages/Landing.tsx` (`RotatingWord` component):

1. **Keep multi-word phrases atomic.** Add `whitespace-nowrap` to the rotating `<span>`. That makes the browser wrap *around* the phrase (between "Remember" and "tout le monde"), never inside it. Worst case the headline still grows to 3 lines on 320px, but the phrase stays intact.

2. **Hide rare-wrap phrases on the smallest screens.** For viewports under ~360px, swap `tout le monde` and `semua orang` for shorter variants from the same languages so the headline stays 2 lines:
   - French: `tous` (instead of `tout le monde`)
   - Indonesian: `kawan` (instead of `semua orang`)

   Implementation: define two parallel `FOREIGN_WORDS` arrays — one full, one mobile-safe — and pick from the right pool based on `window.matchMedia("(max-width: 380px)")` evaluated on mount and on resize.

3. **No layout-shift padding hack needed.** Because the headline already centers and the wrapper isn't fixed-width, `whitespace-nowrap` alone solves the jitter; we don't need a reserved min-width.

## What we are NOT changing

- Baseline alignment for CJK / Devanagari — that's font-rendering behavior, not a fix worth chasing.
- Rotation cadence, weights, or memory windows.
- The animation (`blur + slide + fade`).
- The existing visual regression test still passes; we'll extend it with one new assertion that the rotating span carries `whitespace-nowrap`.

## Verification

After the fix, re-screenshot at 320 / 375 / 1366 across at least 6 rotations and confirm:
- The headline stays at 2 lines on 375 and above for every word.
- No mid-phrase wrap on 320.
- All existing tests still green.

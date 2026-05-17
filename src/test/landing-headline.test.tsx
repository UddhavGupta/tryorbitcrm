import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Landing from "@/pages/Landing";

/**
 * Visual regression smoke check for the rotating hero word.
 *
 * Guards against two real bugs we hit before:
 *   1. A wrapper with `overflow-hidden` clipping descenders / non-Latin scripts.
 *   2. The animated word breaking out of the headline baseline (e.g. via a
 *      block-level wrapper or extra padding pushing it off the line).
 *
 * If anyone reintroduces those, this test fails fast.
 */

const renderLanding = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    </HelmetProvider>,
  );

const getRotatingWord = () => {
  const heading = screen.getByRole("heading", { level: 1 });
  const word = heading.querySelector(".italic.text-primary") as HTMLElement | null;
  if (!word) throw new Error("Rotating word span not found in <h1>");
  return { heading, word };
};

describe("Landing hero rotating word", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders inside the headline alongside the static text", () => {
    renderLanding();
    const { heading, word } = getRotatingWord();
    expect(heading.textContent).toMatch(/Remember/);
    expect(heading.textContent).toMatch(/in your orbit/);
    // The animated word must live inside the same <h1>, not a sibling block.
    expect(within(heading).getByText(word.textContent!)).toBe(word);
  });

  it("is not wrapped in any overflow-hidden / clipping ancestor inside the headline", () => {
    renderLanding();
    const { heading, word } = getRotatingWord();
    let node: HTMLElement | null = word;
    while (node && node !== heading) {
      expect(node.className).not.toMatch(/\boverflow-hidden\b/);
      expect(node.className).not.toMatch(/\bclip-/);
      node = node.parentElement;
    }
  });

  it("stays on the text baseline (no block wrappers, no vertical padding)", () => {
    renderLanding();
    const { heading, word } = getRotatingWord();
    // Walk up to the headline; every ancestor must be inline-friendly.
    let node: HTMLElement | null = word;
    while (node && node !== heading) {
      expect(node.tagName.toLowerCase()).toBe("span");
      // No padding-bottom / padding-top hacks that would knock the glyph off baseline.
      expect(node.className).not.toMatch(/\b(pt|pb|py)-\d/);
      node = node.parentElement;
    }
  });

  it("swaps to a new word after the rotation interval", () => {
    renderLanding();
    const initial = getRotatingWord().word.textContent;
    expect(initial).toBe("everyone");

    // Advance past one full swap cycle (2600ms interval + 450ms fade gap).
    act(() => {
      vi.advanceTimersByTime(2600 + 500);
    });

    const next = getRotatingWord().word.textContent;
    expect(next).toBeTruthy();
    expect(next).not.toBe(initial);
  });
});

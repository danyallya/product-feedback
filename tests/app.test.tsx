import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage from "../app/page";

describe("product-feedback workspace", () => {
  it("renders its initial workspace content", () => {
    const markup = renderToStaticMarkup(createElement(HomePage));
    expect(markup).toContain("morrow");
    expect(markup).toContain('id="ideas"');
    expect(markup).toContain('id="roadmap"');
    expect(markup).toContain("A true quiet mode for notifications");
    expect(markup).toContain("In progress");
    expect(markup).toContain('Synthetic session preview · not a live delivery schedule');
    expect(markup).toContain('Saved views for every kind of work');
    expect(markup).toContain('Bring my own fields to the project board');
    expect(markup).toContain('Nothing in this lane yet.');
    expect(markup).toContain('Subscriptions are unavailable in this preview.');
    expect(markup).not.toContain('Subscribe to updates');
    expect(markup).toContain('aria-label="Find an idea"');
    for (const target of ['changelog', 'privacy', 'guidelines', 'powered']) {
      expect(markup).toContain(`id="${target}"`);
      expect(markup).toContain(`href="#${target}"`);
    }
    expect(markup).toContain('session preview');
  });
});

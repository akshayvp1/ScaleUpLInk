import { describe, expect, it } from "vitest";
import { cn } from "../../src/lib/utils";

describe("cn", () => {
  it("merges conditional classes", () => {
    const hidden: boolean = false;

    expect(cn("px-2", hidden && "hidden", "text-sm")).toBe("px-2 text-sm");
  });

  it("lets later conflicting utilities win", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});

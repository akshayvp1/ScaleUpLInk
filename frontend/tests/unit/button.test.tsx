import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../../src/components/ui/button";

describe("Button", () => {
  it("renders its label and variant attributes", () => {
    render(<Button variant="destructive">Delete</Button>);

    const button = screen.getByRole("button", { name: "Delete" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-variant", "destructive");
    expect(button).toHaveClass("bg-destructive");
  });
});

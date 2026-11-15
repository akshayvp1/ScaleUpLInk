import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import EmojiPicker from "../../src/components/chat/EmojiPicker";

describe("EmojiPicker", () => {
  it("searches emojis by name and selects one", () => {
    const onSelect = vi.fn();
    render(<EmojiPicker onSelect={onSelect} />);

    fireEvent.change(screen.getByPlaceholderText("Search emojis..."), {
      target: { value: "rocket" },
    });
    fireEvent.click(screen.getByTitle("rocket"));

    expect(onSelect).toHaveBeenCalledWith("🚀");
    expect(localStorage.getItem("scaleup-chat-recent-emojis")).toContain("🚀");
  });

  it("switches emoji categories", () => {
    render(<EmojiPicker onSelect={vi.fn()} />);

    fireEvent.click(screen.getByTitle("Animals & Nature"));

    expect(screen.getByText("Animals & Nature")).toBeInTheDocument();
    expect(screen.getByTitle("dog face")).toBeInTheDocument();
  });

  it("shows a recent section after an emoji is selected", () => {
    localStorage.setItem(
      "scaleup-chat-recent-emojis",
      JSON.stringify(["🎉"])
    );

    render(<EmojiPicker onSelect={vi.fn()} />);

    expect(screen.getByText("Recently used")).toBeInTheDocument();
  });

  it("shows an empty state for unmatched searches", () => {
    render(<EmojiPicker onSelect={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Search emojis..."), {
      target: { value: "zzzz-not-an-emoji" },
    });

    expect(screen.getByText(/No emojis found/)).toBeInTheDocument();
  });
});

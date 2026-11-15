import { describe, expect, it } from "vitest";

import {
  dataUrlToBlob,
  getAttachmentName,
  getFileExtension,
  getFileTypeLabel,
} from "../../src/utils/fileAttachment";

describe("fileAttachment", () => {
  it("converts a base64 data URL into a typed blob", async () => {
    const blob = dataUrlToBlob("data:text/plain;base64,SGVsbG8=");

    expect(blob).not.toBeNull();
    expect(blob?.type).toBe("text/plain");
    expect(await blob?.text()).toBe("Hello");
  });

  it("converts a non-base64 data URL into a blob", async () => {
    const blob = dataUrlToBlob("data:text/plain,Hello%20world");

    expect(blob).not.toBeNull();
    expect(await blob?.text()).toBe("Hello world");
  });

  it("returns null for malformed data URLs", () => {
    expect(dataUrlToBlob("not-a-data-url")).toBeNull();
  });

  it("keeps the original filename or falls back", () => {
    expect(getAttachmentName("report.docx")).toBe("report.docx");
    expect(getAttachmentName("   ")).toBe("Shared file");
    expect(getAttachmentName(undefined, "Shared image")).toBe("Shared image");
  });

  it("labels common document types", () => {
    expect(
      getFileTypeLabel(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "brief.docx"
      )
    ).toBe("Document");
    expect(getFileTypeLabel("application/pdf", "brief.pdf")).toBe("PDF");
    expect(getFileTypeLabel(undefined, "archive.zip")).toBe("ZIP");
  });

  it("reads the file extension", () => {
    expect(getFileExtension("presentation.pptx")).toBe("PPTX");
    expect(getFileExtension("no-extension")).toBe("FILE");
  });
});

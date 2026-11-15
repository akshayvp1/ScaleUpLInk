export function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const commaIndex = dataUrl.indexOf(",");
    if (commaIndex === -1) return null;

    const header = dataUrl.slice(0, commaIndex);
    const body = dataUrl.slice(commaIndex + 1);
    const mimeMatch = /data:([^;]+)/i.exec(header);
    const mimeType = mimeMatch?.[1] || "application/octet-stream";
    const isBase64 = /;base64/i.test(header);

    if (!isBase64) {
      return new Blob([decodeURIComponent(body)], { type: mimeType });
    }

    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: mimeType });
  } catch {
    return null;
  }
}

export function getAttachmentName(
  fileName: string | undefined,
  fallback = "Shared file"
): string {
  const trimmed = fileName?.trim();
  return trimmed || fallback;
}

export function getFileExtension(fileName: string): string {
  const match = /\.([a-z0-9]{1,8})$/i.exec(fileName);
  return match?.[1]?.toUpperCase() ?? "FILE";
}

export function getFileTypeLabel(mimeType?: string, fileName?: string): string {
  if (mimeType) {
    if (mimeType.startsWith("image/")) return "Image";
    if (mimeType === "application/pdf") return "PDF";
    if (mimeType.includes("word")) return "Document";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "Spreadsheet";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "Presentation";
    if (mimeType.startsWith("text/")) return "Text file";
    if (mimeType.startsWith("audio/")) return "Audio";
    if (mimeType.startsWith("video/")) return "Video";
    if (mimeType.includes("zip") || mimeType.includes("compressed")) return "Archive";
  }

  return fileName ? getFileExtension(fileName) : "File";
}

export function openAttachment(
  fileUrl: string,
  fileName = "Shared file"
): void {
  if (fileUrl.startsWith("data:")) {
    const blob = dataUrlToBlob(fileUrl);
    if (!blob) return;

    const objectUrl = URL.createObjectURL(blob);

    if (isBrowserPreviewable(blob.type)) {
      window.open(objectUrl, "_blank", "noopener,noreferrer");
    } else {
      triggerDownload(objectUrl, fileName);
    }

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return;
  }

  window.open(fileUrl, "_blank", "noopener,noreferrer");
}

function isBrowserPreviewable(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    mimeType.startsWith("text/") ||
    mimeType.startsWith("audio/") ||
    mimeType.startsWith("video/") ||
    mimeType === "application/pdf"
  );
}

export function downloadAttachment(fileUrl: string, fileName: string): void {
  if (fileUrl.startsWith("data:")) {
    const blob = dataUrlToBlob(fileUrl);
    if (!blob) return;

    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl, fileName);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return;
  }

  triggerDownload(fileUrl, fileName);
}

function triggerDownload(url: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

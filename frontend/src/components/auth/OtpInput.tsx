import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

import { cn } from "../../lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  invalid?: boolean;
  className?: string;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus,
  invalid,
  className,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    Array(length).fill(null)
  );

  const focusInput = (index: number) => {
    inputRefs.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  };

  const handleChange = (index: number, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "");
    const next = value.split("");

    if (!digits) {
      next[index] = "";
      onChange(next.join("").slice(0, length));
      return;
    }

    digits
      .slice(0, length - index)
      .split("")
      .forEach((digit, offset) => {
        next[index + offset] = digit;
      });

    onChange(next.join("").slice(0, length));
    focusInput(index + digits.length);
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      focusInput(index - 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusInput(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text/plain")
      .trim()
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasted) return;

    onChange(pasted);
    focusInput(pasted.length - 1);
  };

  return (
    <div
      className={cn("flex items-center justify-between gap-2", className)}
      role="group"
      aria-label="One-time password"
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] ?? ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          className={cn(
            "border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-12 w-10 rounded-lg border text-center text-lg font-semibold shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 sm:w-12",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"
          )}
        />
      ))}
    </div>
  );
}

export default OtpInput;

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "../../lib/utils";
import { Input } from "../ui/input";

function PasswordInput({
  className,
  disabled,
  ...props
}: React.ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-0 right-0 inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
export default PasswordInput;

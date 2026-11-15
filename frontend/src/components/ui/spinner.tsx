import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const sizeMap = {
  sm: "size-4",
  default: "size-5",
  lg: "size-8",
} as const

interface SpinnerProps {
  size?: keyof typeof sizeMap
  className?: string
  label?: string
}

export function Spinner({ size = "default", className, label }: SpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2" role="status">
      <Loader2
        className={cn("animate-spin text-primary motion-reduce:animate-none", sizeMap[size], className)}
        aria-hidden="true"
      />
      {label ? (
        <span className="text-sm text-muted-foreground">{label}</span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </span>
  )
}

export default Spinner

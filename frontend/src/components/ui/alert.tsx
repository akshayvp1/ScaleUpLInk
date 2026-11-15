import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-sm shadow-xs [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        info: "border-info/30 bg-info/10 text-foreground [&>svg]:text-info",
        success:
          "border-success/30 bg-success/10 text-foreground [&>svg]:text-success",
        warning:
          "border-warning/30 bg-warning/10 text-foreground [&>svg]:text-warning",
        destructive:
          "border-destructive/30 bg-destructive/10 text-foreground [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-semibold leading-snug", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }

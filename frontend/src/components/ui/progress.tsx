import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "default" | "gold" | "green";
}

const variantClasses = {
  default: "bg-primary",
  gold: "bg-gradient-to-r from-gold-dark via-gold to-gold-light",
  green: "bg-gradient-to-r from-pitch to-pitch-light",
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };

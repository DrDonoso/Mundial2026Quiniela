import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

function Avatar({ src, alt, fallback, size = "md", className, ...props }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt || fallback}
          className="aspect-square h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-pitch-light to-pitch font-semibold text-gold-light uppercase">
          {fallback.slice(0, 2)}
        </div>
      )}
    </div>
  );
}

export { Avatar };

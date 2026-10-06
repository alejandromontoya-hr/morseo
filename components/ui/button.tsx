import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-ink text-ink-fg hover:opacity-85",
  secondary: "border-[1.5px] border-text text-text hover:bg-surface",
  ghost: "text-muted hover:bg-surface hover:text-text",
  // Círculo o cápsula lisa sobre la página, como los botones de la barra de arriba
  soft: "bg-desk-raised text-text hover:bg-line",
} as const;

const SIZES = {
  md: "h-11 px-5 text-[15px]",
  sm: "h-9 px-3.5 text-sm",
  icon: "size-10",
} as const;

export function Button({
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,opacity,color] disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-[18px] [&_svg]:shrink-0",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}

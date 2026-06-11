import React from "react"
import { cn } from "../../lib/utils.js"

export function AnimatedShinyText({
  children,
  className = "",
  shimmerWidth = 120,
  ...props
}) {
  return (
    <span
      style={{
        "--shiny-width": `${shimmerWidth}px`,
      }}
      className={cn(
        "mx-auto max-w-md",
        // Shine effect
        "animate-shiny-text bg-clip-text bg-no-repeat bg-gradient-to-r from-transparent via-white/80 via-50% to-transparent",
        "bg-[length:var(--shiny-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite] bg-[position:0_0] text-transparent",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

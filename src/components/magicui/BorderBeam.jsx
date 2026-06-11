import React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils.js"

export function BorderBeam({
  className = "",
  size = 100,
  delay = 0,
  duration = 6,
  colorFrom = "#7C3AED",
  colorTo = "#EC4899",
  transition = {},
  style = {},
  reverse = false,
  initialOffset = 0,
  borderWidth = 1.5,
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent"
      style={{
        borderWidth: `${borderWidth}px`,
        maskImage: 'linear-gradient(transparent, transparent), linear-gradient(#000, #000)',
        maskClip: 'padding-box, border-box',
        maskComposite: 'intersect',
        WebkitMaskImage: 'linear-gradient(transparent, transparent), linear-gradient(#000, #000)',
        WebkitMaskClip: 'padding-box, border-box',
        WebkitMaskComposite: 'source-out', // standard source-out/destination-in matching depending on browser
        ...style
      }}
    >
      <motion.div
        className={cn(
          "absolute aspect-square bg-gradient-to-l",
          className
        )}
        style={{
          width: size,
          height: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
        }}
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  )
}

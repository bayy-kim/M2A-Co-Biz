"use client"

import { motion, useReducedMotion } from "framer-motion"

interface AnimateSectionProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

// Fade in and slide up section with reduced motion safety
export function AnimateSection({ children, delay = 0, className }: AnimateSectionProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ 
        duration: 0.45, 
        ease: [0.22, 1, 0.36, 1], 
        delay 
      }}
    >
      {children}
    </motion.div>
  )
}

// Stagger parent wrapper for grids and card lists
export function AnimateStagger({ children, className, delay = 0.06 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

// Stagger child item
export function AnimateItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={{
        hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } 
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// Interactive Touch/Click Feedback (Scale Tap for Mobile & Desktop)
export function AnimateTap({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// Subtle Float Motion for Badges / Hero Cards (Desktop, view-port optimized to prevent GPU drain)
export function AnimateFloat({ children, className }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      whileInView={{ y: [0, -8, 0] }}
      viewport={{ once: false, margin: "-10px" }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}

// Hover Glow Card for Desktop
export function AnimateCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

import Link from "next/link"

interface LogoProps {
  href?: string
  className?: string
  showSubtitle?: boolean
  subtitleText?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({
  href = "/",
  className = "",
  showSubtitle = false,
  subtitleText = "Pusat Komunitas Bisnis",
  size = "md",
}: LogoProps) {
  const iconSize = size === "sm" ? "w-8 h-8 text-label-md" : size === "lg" ? "w-12 h-12 text-headline-lg" : "w-10 h-10 text-headline-md"
  const textSize = size === "sm" ? "text-label-md" : size === "lg" ? "text-display-md" : "text-headline-md"

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${iconSize} bg-primary text-on-primary rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0`}>
        <span>M</span>
      </div>
      <div className="flex flex-col">
        <span className={`${textSize} font-bold text-primary tracking-tight leading-none`}>
          M2A Co-Biz
        </span>
        {showSubtitle && (
          <span className="text-label-sm text-on-surface-variant font-medium mt-0.5">
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
        {content}
      </Link>
    )
  }

  return content
}

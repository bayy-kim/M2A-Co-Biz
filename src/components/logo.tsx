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
  const imgHeight = size === "sm" ? "h-9" : size === "lg" ? "h-14" : "h-11"

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/images/logo.png"
        alt="Logo M2A Co-Biz"
        className={`${imgHeight} w-auto object-contain shrink-0`}
      />
      {showSubtitle && (
        <div className="flex flex-col justify-center">
          <span className="text-label-sm text-on-surface-variant font-medium">
            {subtitleText}
          </span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} aria-label="Beranda M2A Co-Biz" className="inline-flex outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
        {content}
      </Link>
    )
  }

  return content
}

import Link from "next/link"
import { ChevronRight, Store, type LucideIcon } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

interface SidebarItem {
  label: string
  href: string
  icon?: LucideIcon
}

interface DashboardShellProps {
  sidebarItems: SidebarItem[]
  title: string
  roleLabel: string
  tab: string
  children: React.ReactNode
  extraHeader?: React.ReactNode
  userName?: string | null
}

export function DashboardShell({
  sidebarItems,
  title,
  roleLabel,
  tab,
  children,
  extraHeader,
  userName,
}: DashboardShellProps) {
  const isActive = (item: SidebarItem) =>
    item.href === `/${roleLabel}` ? tab === "overview" : item.href.includes(tab)

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="w-64 bg-surface-container-low border-r border-outline-variant/30 hidden lg:flex flex-col">
        <div className="p-lg border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-on-primary font-bold text-headline-md">M</span>
            </div>
            <div>
              <h2 className="text-label-md font-bold text-on-surface">M2A Co-Biz</h2>
              <p className="text-label-sm text-on-surface-variant">{title}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-md space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-md py-2.5 rounded-lg text-label-md transition-all ${
                  isActive(item)
                    ? "bg-primary text-on-primary font-bold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-higher hover:text-on-surface"
                }`}
              >
                {Icon && <Icon className="w-[18px] h-[18px]" />}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-lg border-t border-outline-variant/30 space-y-1">
          <Link
            href="/catalog"
            className="flex items-center gap-3 px-md py-2.5 rounded-lg text-label-md text-primary hover:bg-primary/5 transition-colors"
          >
            <Store className="w-[18px] h-[18px]" />
            Lihat Produk
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto pb-20 lg:pb-12">
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-lg h-16">
          <div className="flex items-center gap-lg">
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-label-sm text-on-surface-variant">{roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)}</span>
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              <span className="text-label-sm font-bold text-on-surface capitalize">{tab.replace(/-/g, " ")}</span>
            </div>
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-on-primary font-bold text-label-md">M</span>
              </div>
              <span className="text-label-md font-bold text-on-surface">{roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)}</span>
            </div>
          </div>
          {extraHeader}
        </header>

        <div className="p-lg space-y-lg">{children}</div>
      </main>

      <nav className="lg:hidden fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
        <div className="flex items-center justify-around mx-auto max-w-lg">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-16 px-1 transition-all ${
                  active
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  active ? "bg-primary-container text-primary" : ""
                }`}>
                  {Icon ? <Icon className="w-5 h-5" /> : <span className="w-5 h-5" />}
                </div>
                <span className={`text-[11px] leading-tight text-center max-w-full truncate ${
                  active ? "font-bold text-primary" : "text-on-surface-variant"
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

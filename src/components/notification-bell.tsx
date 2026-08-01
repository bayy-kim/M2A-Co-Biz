"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Bell, CheckCheck } from "lucide-react"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const load = async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications)
      setUnread(data.unreadCount)
    } catch {}
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnread(0)
  }

  const openItem = async (n: Notification) => {
    if (!n.read) {
      await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.id }) })
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
      setUnread((u) => Math.max(0, u - 1))
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-[14px] clay-sm flex items-center justify-center relative transition-transform hover:scale-105"
        style={{ background: "var(--color-clay-surface)", boxShadow: "var(--shadow-clay-sm)" }}
        aria-label="Notifikasi"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" style={{ color: "var(--color-on-surface-variant)" }} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: "var(--color-error)", color: "white" }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[85vw] clay-lg p-3 z-50" style={{ boxShadow: "var(--shadow-clay-lg)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-extrabold" style={{ color: "var(--color-primary)" }}>Notifikasi</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-bold inline-flex items-center gap-1 hover:underline" style={{ color: "var(--color-primary)" }}>
                <CheckCheck className="w-3.5 h-3.5" /> Tandai dibaca
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: "var(--color-on-surface-variant)" }}>Belum ada notifikasi.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-1">
              {notifications.map((n) => {
                const content = (
                  <div className={`flex gap-2 p-2.5 rounded-xl cursor-pointer transition-colors ${n.read ? "" : "bg-primary-container/40"}`}>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: "var(--color-on-surface)" }}>{n.title}</p>
                      <p className="text-[11px] leading-snug line-clamp-2" style={{ color: "var(--color-on-surface-variant)" }}>{n.message}</p>
                      <p className="text-[10px] mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
                        {new Date(n.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: "var(--color-primary)" }} />}
                  </div>
                )
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => openItem(n)}>{content}</Link>
                ) : (
                  <button key={n.id} type="button" onClick={() => openItem(n)} className="w-full text-left">{content}</button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

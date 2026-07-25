import { prisma } from "@/lib/db"
import { Shield, User, Store } from "lucide-react"
import { ToggleUserStatusButton } from "./user-actions"

export async function AdminUsersTab({ searchParams }: { searchParams:  Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || "1"))
  const perPage = 20
  const skip = (page - 1) * perPage

  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      include: { sellerProfile: { select: { businessName: true, status: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
    }),
    prisma.user.count(),
  ])
  const totalPages = Math.ceil(totalUsers / perPage)

  const roleIcon = (role: string) => {
    switch (role) {
      case "ADMIN": return <Shield className="w-4 h-4 text-primary" />
      case "SELLER": return <Store className="w-4 h-4 text-success" />
      default: return <User className="w-4 h-4 text-secondary" />
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
      <div className="p-lg border-b border-outline-variant/30">
        <h3 className="text-headline-md text-on-surface font-bold">Manajemen Pengguna</h3>
        <p className="text-label-sm text-on-surface-variant mt-1">{totalUsers} total pengguna</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
              <th className="px-lg py-3 font-medium">Pengguna</th>
              <th className="px-lg py-3 font-medium">Peran</th>
              <th className="px-lg py-3 font-medium">Usaha</th>
              <th className="px-lg py-3 font-medium">Bergabung</th>
              <th className="px-lg py-3 font-medium">Status</th>
              <th className="px-lg py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                <td className="px-lg py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-label-md font-bold">
                      {user.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-label-md font-bold text-on-surface">{user.name}</p>
                      <p className="text-label-sm text-on-surface-variant">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-lg py-3">
                  <div className="flex items-center gap-1.5">
                    {roleIcon(user.role)}
                    <span className="text-label-sm text-on-surface">{user.role}</span>
                  </div>
                </td>
                <td className="px-lg py-3 text-label-sm text-on-surface-variant">
                  {user.sellerProfile?.businessName || "-"}
                </td>
                <td className="px-lg py-3 text-label-sm text-on-surface-variant">
                  {user.createdAt.toLocaleDateString()}
                </td>
                <td className="px-lg py-3">
                  <span className={`inline-flex items-center gap-1 px-md py-0.5 rounded-full text-label-sm font-bold ${
                    user.isActive
                      ? "bg-success/10 text-success"
                      : "bg-error/10 text-error"
                  }`}>
                    {user.isActive ? "Aktif" : "Ditangguhkan"}
                  </span>
                </td>
                <td className="px-lg py-3">
                  <ToggleUserStatusButton userId={user.id} isActive={user.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="p-lg border-t border-outline-variant/30 flex items-center justify-between">
          <span className="text-label-sm text-on-surface-variant">Halaman {page} dari {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && <a href={`/admin?tab=users&page=${page - 1}`} className="px-md py-2 rounded-lg border border-outline-variant text-label-md text-on-surface hover:bg-surface-container transition-colors">Sebelumnya</a>}
            {page < totalPages && <a href={`/admin?tab=users&page=${page + 1}`} className="px-md py-2 rounded-lg bg-primary text-on-primary text-label-md hover:opacity-90 transition-opacity">Selanjutnya</a>}
          </div>
        </div>
      )}
    </div>
  )
}

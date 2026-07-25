import { prisma } from "@/lib/db"
import { Shield, User, Store, Search } from "lucide-react"
import { ToggleUserStatusButton } from "./user-actions"

export async function AdminUsersTab() {
  const users = await prisma.user.findMany({
    include: { sellerProfile: { select: { businessName: true, status: true } } },
    orderBy: { createdAt: "desc" },
  })

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
        <h3 className="text-headline-md text-on-surface font-bold">User Management</h3>
        <p className="text-label-sm text-on-surface-variant mt-1">{users.length} total user(s)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
              <th className="px-lg py-3 font-medium">User</th>
              <th className="px-lg py-3 font-medium">Role</th>
              <th className="px-lg py-3 font-medium">Business</th>
              <th className="px-lg py-3 font-medium">Joined</th>
              <th className="px-lg py-3 font-medium">Status</th>
              <th className="px-lg py-3 font-medium">Actions</th>
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
                    {user.isActive ? "Active" : "Suspended"}
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
    </div>
  )
}

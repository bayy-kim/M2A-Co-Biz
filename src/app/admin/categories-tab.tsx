import { prisma } from "@/lib/db"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import { ApproveCategoryButton, RejectCategoryButton } from "./category-actions"

export async function AdminCategoriesTab() {
  const [approvedCategories, pendingCategories] = await Promise.all([
    prisma.category.findMany({
      where: { status: "APPROVED" },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { status: "PENDING" },
      include: { requestedBySeller: { select: { businessName: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <div className="space-y-lg">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
        <div className="p-lg border-b border-outline-variant/30">
          <h3 className="text-headline-md text-on-surface font-bold">Pending Category Proposals</h3>
          <p className="text-label-sm text-on-surface-variant mt-1">{pendingCategories.length} proposal(s) awaiting review</p>
        </div>
        {pendingCategories.length === 0 ? (
          <div className="p-lg text-center text-on-surface-variant text-body-md py-xxl">No pending proposals.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                  <th className="px-lg py-3 font-medium">Category Name</th>
                  <th className="px-lg py-3 font-medium">Proposed By</th>
                  <th className="px-lg py-3 font-medium">Date</th>
                  <th className="px-lg py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingCategories.map((cat) => (
                  <tr key={cat.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="text-label-md font-bold text-on-surface">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-lg py-3 text-label-sm text-on-surface">
                      {cat.requestedBySeller?.businessName || "Admin"}
                    </td>
                    <td className="px-lg py-3 text-label-sm text-on-surface-variant">
                      {cat.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-lg py-3">
                      <div className="flex items-center gap-2">
                        <ApproveCategoryButton categoryId={cat.id} />
                        <RejectCategoryButton categoryId={cat.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
        <div className="p-lg border-b border-outline-variant/30 flex items-center justify-between">
          <h3 className="text-headline-md text-on-surface font-bold">Active Categories</h3>
          <span className="text-label-sm text-on-surface-variant">{approvedCategories.length} total</span>
        </div>
        {approvedCategories.length === 0 ? (
          <div className="p-lg text-center text-on-surface-variant text-body-md py-xl">No categories yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                  <th className="px-lg py-3 font-medium">Name</th>
                  <th className="px-lg py-3 font-medium">Default Commission</th>
                  <th className="px-lg py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {approvedCategories.map((cat) => (
                  <tr key={cat.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-3 text-label-md text-on-surface">{cat.name}</td>
                    <td className="px-lg py-3 text-label-md text-on-surface">{Number(cat.defaultCommissionPercent)}%</td>
                    <td className="px-lg py-3">
                      <span className="inline-flex items-center gap-1 px-md py-0.5 rounded-full text-label-sm font-bold bg-success/10 text-success">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

-- Performance indexes for hot-path queries (additive, safe)

CREATE INDEX IF NOT EXISTS "idx_productvariant_product_id" ON "ProductVariant"("productId");

CREATE INDEX IF NOT EXISTS "idx_review_product_id" ON "Review"("productId");
CREATE INDEX IF NOT EXISTS "idx_review_buyer_id" ON "Review"("buyerId");

CREATE INDEX IF NOT EXISTS "idx_payout_seller_id" ON "Payout"("sellerId");
CREATE INDEX IF NOT EXISTS "idx_payout_status" ON "Payout"("status");

CREATE INDEX IF NOT EXISTS "idx_ledgerentry_type" ON "LedgerEntry"("type");
CREATE INDEX IF NOT EXISTS "idx_ledgerentry_related_order_id" ON "LedgerEntry"("relatedOrderId");
CREATE INDEX IF NOT EXISTS "idx_ledgerentry_related_payout_id" ON "LedgerEntry"("relatedPayoutId");

CREATE INDEX IF NOT EXISTS "idx_commissionrule_scope_ref_id" ON "CommissionRule"("scope", "refId");

CREATE INDEX IF NOT EXISTS "idx_category_status" ON "Category"("status");

CREATE INDEX IF NOT EXISTS "idx_activitylog_actor_id" ON "ActivityLog"("actorId");
CREATE INDEX IF NOT EXISTS "idx_activitylog_created_at" ON "ActivityLog"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_activitylog_target_type" ON "ActivityLog"("targetType");

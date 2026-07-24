import { describe, it, expect } from "vitest"
import { calculateCommission } from "./commission-engine"

describe("calculateCommission", () => {
  it("calculates 5% commission correctly", () => {
    const result = calculateCommission(100000, 1, 5)
    expect(result.commissionRupiah).toBe(5000)
    expect(result.sellerNetRupiah).toBe(95000)
  })

  it("calculates 0% commission (no commission)", () => {
    const result = calculateCommission(50000, 2, 0)
    expect(result.commissionRupiah).toBe(0)
    expect(result.sellerNetRupiah).toBe(100000)
  })

  it("calculates 100% commission correctly", () => {
    const result = calculateCommission(200000, 1, 100)
    expect(result.commissionRupiah).toBe(200000)
    expect(result.sellerNetRupiah).toBe(0)
  })

  it("handles multiple qty correctly", () => {
    const result = calculateCommission(15000, 3, 10)
    expect(result.commissionRupiah).toBe(4500)
    expect(result.sellerNetRupiah).toBe(40500)
  })

  it("rounds down fractional commission", () => {
    const result = calculateCommission(10000, 1, 3)
    expect(result.commissionRupiah).toBe(300)
    expect(result.sellerNetRupiah).toBe(9700)
  })

  it("rounds fractional commission correctly at the boundary", () => {
    const result = calculateCommission(33333, 1, 10)
    expect(result.commissionRupiah).toBe(3333)
    expect(result.sellerNetRupiah).toBe(30000)
  })

  it("handles zero price gracefully", () => {
    const result = calculateCommission(0, 1, 5)
    expect(result.commissionRupiah).toBe(0)
    expect(result.sellerNetRupiah).toBe(0)
  })

  it("handles large numbers without overflow", () => {
    const result = calculateCommission(10000000, 100, 5)
    expect(result.commissionRupiah).toBe(50000000)
    expect(result.sellerNetRupiah).toBe(950000000)
  })
})

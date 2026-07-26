import { describe, it, expect, beforeEach } from "vitest"
import { encrypt, decrypt } from "./encryption"

describe("encryption (AES-256-GCM)", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = "5f75de376e5d84f9037f7eca8646e344d1e01df0b5c39e8ebf6ca364e047d20f"
  })

  it("encrypts and decrypts text accurately", () => {
    const originalText = "Sensitive KTP Data: 3271012345670001"
    const encrypted = encrypt(originalText)

    expect(encrypted).not.toBe(originalText)
    expect(encrypted.split(":")).toHaveLength(3)

    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(originalText)
  })

  it("produces unique IVs for identical input text", () => {
    const text = "Same text"
    const enc1 = encrypt(text)
    const enc2 = encrypt(text)

    expect(enc1).not.toBe(enc2)
    expect(decrypt(enc1)).toBe(text)
    expect(decrypt(enc2)).toBe(text)
  })

  it("fails decryption if ciphertext is tampered with", () => {
    const text = "Secret Document Content"
    const encrypted = encrypt(text)
    const parts = encrypted.split(":")
    // Tamper with the ciphertext payload
    const tamperedPayload = parts[2].slice(0, -2) + "00"
    const tamperedCiphertext = `${parts[0]}:${parts[1]}:${tamperedPayload}`

    expect(() => decrypt(tamperedCiphertext)).toThrow()
  })

  it("fails decryption if authentication tag is invalid", () => {
    const text = "Secret Document Content"
    const encrypted = encrypt(text)
    const parts = encrypted.split(":")
    // Tamper with authentication tag
    const tamperedTag = "00".repeat(16)
    const tamperedCiphertext = `${parts[0]}:${tamperedTag}:${parts[2]}`

    expect(() => decrypt(tamperedCiphertext)).toThrow()
  })

  it("throws error if ENCRYPTION_KEY is missing", () => {
    delete process.env.ENCRYPTION_KEY
    expect(() => encrypt("test")).toThrow("ENCRYPTION_KEY environment variable is required")
  })
})

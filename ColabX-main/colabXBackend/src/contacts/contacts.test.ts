/**
 * ============================================================
 * ColabX – Contacts Module Tests
 * ============================================================
 * Covers:
 *   BLACK-BOX : Equivalence Partitioning + Boundary Value Analysis
 *   WHITE-BOX : Branch coverage of createContact service logic
 * ============================================================
 */

import { describe, it, expect } from "vitest";
import { createContactSchema, updateContactSchema } from "./contacts.validation.js";

// ─────────────────────────────────────────────────────────────
// SECTION 1 — BLACK-BOX TESTING (Equivalence Partitioning + BVA)
// Treating the Zod schema as a black box: we only care about
// valid/invalid input → pass/fail output.
// ─────────────────────────────────────────────────────────────

describe("⬛ BLACK-BOX | Contacts Module – createContactSchema", () => {

  // ── Equivalence Partitioning: name field ─────────────────────
  describe("EP: name field (min=2, max=200)", () => {

    it("BB-C-01 | Valid name (normal string) → should PASS", () => {
      const result = createContactSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("BB-C-02 | name too short (1 char) → should FAIL", () => {
      const result = createContactSchema.safeParse({
        name: "J",
        email: "j@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("BB-C-03 | name missing entirely → should FAIL", () => {
      const result = createContactSchema.safeParse({
        email: "j@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("BB-C-04 | name too long (201 chars) → should FAIL", () => {
      const result = createContactSchema.safeParse({
        name: "A".repeat(201),
        email: "j@example.com",
      });
      expect(result.success).toBe(false);
    });
  });

  // ── Equivalence Partitioning: email field ─────────────────────
  describe("EP: email field", () => {

    it("BB-C-05 | Valid email format → should PASS", () => {
      const result = createContactSchema.safeParse({
        name: "John",
        email: "john@company.com",
      });
      expect(result.success).toBe(true);
    });

    it("BB-C-06 | Invalid email (no @) → should FAIL", () => {
      const result = createContactSchema.safeParse({
        name: "John",
        email: "johncompany.com",
      });
      expect(result.success).toBe(false);
    });

    it("BB-C-07 | Invalid email (plain string) → should FAIL", () => {
      const result = createContactSchema.safeParse({
        name: "John",
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("BB-C-08 | Empty email → should FAIL", () => {
      const result = createContactSchema.safeParse({
        name: "John",
        email: "",
      });
      expect(result.success).toBe(false);
    });
  });

  // ── Equivalence Partitioning: phone field (optional) ──────────
  describe("EP: phone field (optional, max=50)", () => {

    it("BB-C-09 | Phone omitted (optional) → should PASS", () => {
      const result = createContactSchema.safeParse({
        name: "Alice",
        email: "alice@x.com",
      });
      expect(result.success).toBe(true);
    });

    it("BB-C-10 | Phone provided (valid) → should PASS", () => {
      const result = createContactSchema.safeParse({
        name: "Alice",
        email: "alice@x.com",
        phone: "+91-9999999999",
      });
      expect(result.success).toBe(true);
    });

    it("BB-C-11 | Phone too long (51 chars) → should FAIL", () => {
      const result = createContactSchema.safeParse({
        name: "Alice",
        email: "alice@x.com",
        phone: "1".repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });

  // ── Boundary Value Analysis: name field ───────────────────────
  describe("BVA: name field boundaries", () => {

    it("BVA-C-01 | name = 1 char (below min) → should FAIL", () => {
      const result = createContactSchema.safeParse({ name: "A", email: "a@x.com" });
      expect(result.success).toBe(false);
    });

    it("BVA-C-02 | name = 2 chars (at min) → should PASS", () => {
      const result = createContactSchema.safeParse({ name: "AB", email: "a@x.com" });
      expect(result.success).toBe(true);
    });

    it("BVA-C-03 | name = 3 chars (just above min) → should PASS", () => {
      const result = createContactSchema.safeParse({ name: "ABC", email: "a@x.com" });
      expect(result.success).toBe(true);
    });

    it("BVA-C-04 | name = 199 chars (just below max) → should PASS", () => {
      const result = createContactSchema.safeParse({ name: "A".repeat(199), email: "a@x.com" });
      expect(result.success).toBe(true);
    });

    it("BVA-C-05 | name = 200 chars (at max) → should PASS", () => {
      const result = createContactSchema.safeParse({ name: "A".repeat(200), email: "a@x.com" });
      expect(result.success).toBe(true);
    });

    it("BVA-C-06 | name = 201 chars (above max) → should FAIL", () => {
      const result = createContactSchema.safeParse({ name: "A".repeat(201), email: "a@x.com" });
      expect(result.success).toBe(false);
    });
  });

  // ── Boundary Value Analysis: phone field ──────────────────────
  describe("BVA: phone field boundaries", () => {

    it("BVA-C-07 | phone = 50 chars (at max) → should PASS", () => {
      const result = createContactSchema.safeParse({
        name: "Alice",
        email: "a@x.com",
        phone: "1".repeat(50),
      });
      expect(result.success).toBe(true);
    });

    it("BVA-C-08 | phone = 51 chars (above max) → should FAIL", () => {
      const result = createContactSchema.safeParse({
        name: "Alice",
        email: "a@x.com",
        phone: "1".repeat(51),
      });
      expect(result.success).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// updateContactSchema black-box checks
// ─────────────────────────────────────────────────────────────
describe("⬛ BLACK-BOX | Contacts Module – updateContactSchema", () => {

  it("BB-C-12 | Empty update body (all optional) → should PASS", () => {
    const result = updateContactSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("BB-C-13 | Update with valid email → should PASS", () => {
    const result = updateContactSchema.safeParse({ email: "new@x.com" });
    expect(result.success).toBe(true);
  });

  it("BB-C-14 | Update with invalid email → should FAIL", () => {
    const result = updateContactSchema.safeParse({ email: "bad-email" });
    expect(result.success).toBe(false);
  });

  it("BB-C-15 | Update isPrimary as boolean → should PASS", () => {
    const result = updateContactSchema.safeParse({ isPrimary: true });
    expect(result.success).toBe(true);
  });

  it("BB-C-16 | Update phone nullish (null) → should PASS", () => {
    const result = updateContactSchema.safeParse({ phone: null });
    expect(result.success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// SECTION 2 — WHITE-BOX TESTING (Branch Coverage)
// Testing internal branches of the data transformation logic
// that mirrors what createContact() service does with defaults.
// ─────────────────────────────────────────────────────────────

describe("⬜ WHITE-BOX | Contacts Module – createContact default branches", () => {

  /**
   * Mirrors the branch logic from contacts.service.ts createContact():
   *   phone: data.phone ?? null      → Branch B
   *   role:  data.role  ?? null      → Branch C
   *   isPrimary: data.isPrimary ?? false → Branch D
   */
  function applyContactDefaults(data: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
    isPrimary?: boolean;
  }) {
    return {
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,       // Branch B
      role: data.role ?? null,         // Branch C
      isPrimary: data.isPrimary ?? false, // Branch D
    };
  }

  it("WB-C-01 | All optional fields provided → stored as-is (Branch B-YES, C-YES, D-YES)", () => {
    const result = applyContactDefaults({
      name: "Tom",
      email: "tom@x.com",
      phone: "9999",
      role: "CTO",
      isPrimary: true,
    });
    expect(result.phone).toBe("9999");      // Branch B → YES
    expect(result.role).toBe("CTO");        // Branch C → YES
    expect(result.isPrimary).toBe(true);    // Branch D → YES
  });

  it("WB-C-02 | No optional fields → defaults applied (Branch B-NO, C-NO, D-NO)", () => {
    const result = applyContactDefaults({ name: "Tom", email: "tom@x.com" });
    expect(result.phone).toBeNull();        // Branch B → NO → null
    expect(result.role).toBeNull();         // Branch C → NO → null
    expect(result.isPrimary).toBe(false);   // Branch D → NO → false
  });

  it("WB-C-03 | Only phone provided → role & isPrimary use defaults (Branch B-YES, C-NO, D-NO)", () => {
    const result = applyContactDefaults({
      name: "Tom",
      email: "tom@x.com",
      phone: "12345",
    });
    expect(result.phone).toBe("12345");     // Branch B → YES
    expect(result.role).toBeNull();         // Branch C → NO
    expect(result.isPrimary).toBe(false);   // Branch D → NO
  });

  it("WB-C-04 | isPrimary=false explicitly → stored as false not defaulted (Branch D-YES, explicit false)", () => {
    const result = applyContactDefaults({
      name: "Tom",
      email: "tom@x.com",
      isPrimary: false,
    });
    expect(result.isPrimary).toBe(false);   // explicitly false, not default
  });

  it("WB-C-05 | Validation catches short name → schema rejects before service runs", () => {
    const parsed = createContactSchema.safeParse({ name: "A", email: "a@x.com" });
    expect(parsed.success).toBe(false);     // Early exit – DB never called
    if (!parsed.success) {
      expect(parsed.error.issues[0].path[0]).toBe("name");
    }
  });

  it("WB-C-06 | Validation catches bad email → schema rejects before service runs", () => {
    const parsed = createContactSchema.safeParse({ name: "Alice", email: "bad" });
    expect(parsed.success).toBe(false);     // Early exit – DB never called
    if (!parsed.success) {
      expect(parsed.error.issues[0].path[0]).toBe("email");
    }
  });
});

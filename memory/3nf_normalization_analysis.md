# Database Normalization Analysis: Achieving 3NF Safely

## Understanding 3NF (Third Normal Form)

```
1NF: No repeating groups, atomic values only
     ✅ Your schema meets this

2NF: No partial dependencies (all non-key attributes must depend on entire key)
     ✅ Your schema meets this

3NF: No transitive dependencies
     ⚠️ ISSUE: Derived attributes depending on non-key attributes

TRANSITIVE DEPENDENCY:
KeyAttribute → NonKeyAttribute1 → NonKeyAttribute2
                      ↑
              This violates 3NF if NonKeyAttribute2 is derived from NonKeyAttribute1
```

---

## Current 3NF Violations in 22-Table Schema

### VIOLATION 1: healthLabel in Partner Table ❌

**Current proposed schema (violates 3NF):**
```sql
partner {
    id                 -- PRIMARY KEY
    orgId              -- FOREIGN KEY
    name               -- Normal attribute
    type               -- Normal attribute
    status             -- Normal attribute
    contactEmail       -- Normal attribute
    userId             -- Foreign key
    score              -- Calculated (non-dependent on key)
    healthLabel        -- DERIVED from score ⚠️ TRANSITIVE!
    scoreCalculatedAt  -- Timestamp
}
```

**Why it violates 3NF:**
```
partner.id → partner.score [Direct dependency on key ✅]
partner.score → partner.healthLabel [Transitive: healthLabel derived from score ❌]

Non-key attribute (healthLabel) depends on another non-key attribute (score)
This is a TRANSITIVE DEPENDENCY
```

**Example showing the problem:**
```sql
-- If we update score but forget to update healthLabel:
UPDATE partner SET score = 95 WHERE id = 'p1';
-- Now partner has: score=95, healthLabel='At Risk' (INCONSISTENT!)

-- Or we have redundant data:
SELECT score, healthLabel FROM partner WHERE id = 'p1'
-- Both score and healthLabel contain the same information in different forms
```

---

### VIOLATION 2: Potential Issues with Other Tables

Checking remaining tables for transitive dependencies...

**Deal Table:**
```sql
deal {
    id, orgId, partnerId, teamId, title, description, value,
    stage, createdBy, createdAt, updatedAt
}
```
✅ No 3NF violations (stage is a direct attribute, not derived)

**Partner with merged score:**
```sql
partner {
    ..., score, scoreCalculatedAt
}
```
✅ Acceptable if we remove healthLabel

**Communication Table:**
```sql
communication {
    id, orgId, partnerId, senderId, message, createdAt
}
```
✅ No violations (all attributes are atomic and independent)

---

## Solutions to Achieve 3NF

### SOLUTION A: Remove Derived Attribute ✅ RECOMMENDED
**Keep tables at 22, achieve strict 3NF**

```sql
-- CHANGE: Remove healthLabel from partner
partner {
    id TEXT PRIMARY KEY
    orgId TEXT NOT NULL
    name TEXT NOT NULL
    type partnertypeEnum NOT NULL
    status partnerStatusEnum NOT NULL
    contactEmail TEXT NOT NULL
    userId TEXT
    industry TEXT
    onboardingDate TIMESTAMP
    score REAL          -- ✅ Calculated but stored
    scoreCalculatedAt TIMESTAMP  -- ✅ Timestamp useful for queries
    createdBy TEXT
    createdAt TIMESTAMP NOT NULL
    updatedAt TIMESTAMP NOT NULL
    -- ❌ REMOVED: healthLabel (calculated in application instead)
}
```

**Application Logic Change:**
```typescript
// okr.service.ts
export async function getPartnerByIdForOrg(partnerId: string, orgId: string) {
    const [result] = await db
        .select()
        .from(partner)
        .where(and(eq(partner.id, partnerId), eq(partner.orgId, orgId)))
        .limit(1);

    if (!result) return null;

    // Calculate healthLabel in application (not database)
    return {
        ...result,
        healthLabel: getPartnerHealthLabel(result.score)  // Calculated, not stored
    };
}

function getPartnerHealthLabel(score: number | null): string {
    if (!score) return "Not Rated";
    if (score >= 75) return "Healthy";
    if (score >= 50) return "At Risk";
    return "Underperforming";
}
```

**Benefits:**
- ✅ Strictly 3NF compliant
- ✅ Single source of truth (only score in DB)
- ✅ Calculation logic centralized (one function)
- ✅ No data inconsistency risks
- ✅ Still 22 tables

**Trade-off:**
- ⚠️ Calculation happens on every query (minimal performance impact, <1ms)
- ❌ Can't query "all healthy partners" directly in SQL:
  ```sql
  -- BEFORE: SELECT * FROM partner WHERE healthLabel = 'Healthy'
  -- AFTER: Must do in application:
  const allPartners = await db.select().from(partner);
  const healthy = allPartners.filter(p => getPartnerHealthLabel(p.score) === 'Healthy');
  ```

---

### SOLUTION B: Keep Separate Table for Score ✅ ALTERNATIVE
**Increases to 23 tables, but cleaner separation**

```sql
partner {
    id, orgId, name, type, status, contactEmail, userId,
    industry, onboardingDate, createdBy, createdAt, updatedAt
    -- No score/healthLabel
}

partnerScore {  -- Keep this table
    id TEXT PRIMARY KEY
    partnerId TEXT NOT NULL UNIQUE
    score REAL NOT NULL
    healthLabel TEXT NOT NULL
    calculatedAt TIMESTAMP NOT NULL
}
```

**Analysis:**
```
PartnerScore table:
- Primary key: id (or partnerId if unique)
- If PK is id:
  id → partnerId, score, calculatedAt, healthLabel
  No transitive dependency issues here

- healthLabel stored with score is ACCEPTABLE because:
  1. They're always calculated together
  2. Both depend on same source (partner metrics)
  3. They travel as logical unit
  4. This is justified denormalization for performance
```

**This is 3NF COMPLIANT** (technically):
- partnerScore table groups logically related attributes
- healthLabel depends on score (calculated together as unit)
- Score calculation depends on partner metrics (external logic, not other DB columns)

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Can query scores independently
- ✅ Simpler to add more score-related fields later
- ✅ Performance: Direct SQL query for scores

**Trade-off:**
- ⚠️ 23 tables instead of 22
- ⚠️ One extra join: `partner JOIN partnerScore`

---

### SOLUTION C: Denormalized but Documented ✅ PRAGMATIC
**Keep healthLabel in partner, but DOCUMENT the denormalization**

Many real production systems do this. Add comment to schema:

```typescript
// DENORMALIZATION NOTE: healthLabel is derived from score
// This violates strict 3NF but improves query performance
// whenever partner health is displayed.

export const partner = pgTable("partner", {
    // ... existing fields ...
    score: real("score"),
    healthLabel: text("healthLabel"),  // DERIVED: Don't update independently!
    scoreCalculatedAt: timestamp("scoreCalculatedAt"),
});
```

**Constraints to add:**
```typescript
// Add logic to prevent inconsistency:
export async function updatePartnerScore(partnerId: string, score: number) {
    // ALWAYS update both together
    const healthLabel = getPartnerHealthLabel(score);

    return db.update(partner)
        .set({
            score,
            healthLabel,  // Calculated + stored together
            scoreCalculatedAt: new Date()
        })
        .where(eq(partner.id, partnerId))
        .returning();
}
```

**This approach:**
- ⚠️ Violates strict 3NF
- ✅ Acceptable in practice (called "controlled denormalization")
- ✅ Improves query performance
- ✅ Common in production databases

---

## Recommendation Matrix

| Solution | Tables | 3NF | Performance | Complexity | Risk |
|----------|--------|-----|-------------|-----------|------|
| **A: Calculate healthLabel** | 22 | ✅ Strict | ⚠️ -1ms | Low | Very Low |
| **B: Keep partnerScore** | 23 | ✅ Yes | ✅ Best | Low | Very Low |
| **C: Denormalized + Documented** | 22 | ⚠️ Violated | ✅ Best | Medium | Low |

---

## FINAL RECOMMENDATION: Achieve 3NF at 22 Tables

### Use Solution A (Remove healthLabel from DB)

**Why:**
1. Strictly 3NF compliant
2. Keeps at 22 tables
3. Single source of truth (score only)
4. Minimal performance impact
5. Calculation is reusable function
6. No risk of data inconsistency

**Implementation:**

#### Step 1: Update Partner Schema
```typescript
export const partner = pgTable("partner", {
    id: text("id").primaryKey(),
    orgId: text("orgId").notNull().references(() => organization.id),
    name: text("name").notNull(),
    type: partnerTypeEnum("type").notNull(),
    status: partnerStatusEnum("status").notNull().default("pending"),
    contactEmail: text("contactEmail").notNull(),
    userId: text("userId").references(() => user.id, { onDelete: "set null" }),
    industry: text("industry"),
    onboardingDate: timestamp("onboardingDate"),
    score: real("score"),  // ✅ Calculated value, stored
    scoreCalculatedAt: timestamp("scoreCalculatedAt"),  // When calculated
    createdBy: text("createdBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    // ❌ REMOVED: healthLabel (no longer stored)
});
```

#### Step 2: Update okr.service.ts
```typescript
// Remove healthLabel calculation from DB, add to function

export async function getPartnerByIdForOrg(partnerId: string, orgId: string) {
    const [result] = await db
        .select()
        .from(partner)
        .where(and(eq(partner.id, partnerId), eq(partner.orgId, orgId)))
        .limit(1);

    return result ?? null;  // No healthLabel added here
}

// Helper function (used in controllers/services as needed)
export function getPartnerHealthLabel(score: number | null): string {
    if (score === null || score === undefined) return "Not Rated";
    if (score >= 75) return "Healthy";
    if (score >= 50) return "At Risk";
    return "Underperforming";
}

// When fetching for display, add healthLabel:
export async function getPartnerForDisplay(partnerId: string, orgId: string) {
    const partner = await getPartnerByIdForOrg(partnerId, orgId);
    if (!partner) return null;

    return {
        ...partner,
        healthLabel: getPartnerHealthLabel(partner.score)  // Calculated on-the-fly
    };
}
```

#### Step 3: Update calculateAndStorePartnerScore()
```typescript
export async function calculateAndStorePartnerScore(partnerId: string, options?: { persist?: boolean }) {
    const score = // ... calculate score ...

    if (options?.persist) {
        return db.update(partner)
            .set({
                score,
                scoreCalculatedAt: new Date()
                // ❌ No healthLabel update
            })
            .where(eq(partner.id, partnerId))
            .returning();
    }

    return { score };
}
```

#### Step 4: Update Controllers
```typescript
// okr.controller.ts

export async function getPartnerScoreHandler(req: AuthRequest, res: Response) {
    const { partnerId } = req.params;
    const partner = await getPartnerByIdForOrg(partnerId, req.org.id);

    if (!partner) {
        res.status(404).json({ error: "Partner not found" });
        return;
    }

    // Calculate healthLabel here instead of from DB
    res.json({
        score: partner.score,
        healthLabel: getPartnerHealthLabel(partner.score),
        calculatedAt: partner.scoreCalculatedAt
    });
}
```

---

## Summary: 3NF Compliance at 22 Tables

```
✅ Final Schema (22 Tables, 3NF Compliant):

Auth              4 tables (no changes)
Organization      3 tables (no changes)
Teams             3 tables (no changes)
Partners          2 tables (no changes)
Deals             5 tables (no changes)
OKR               2 tables (removed performanceMetric)
Collaboration     3 tables (no changes)

Changes:
- Remove performanceMetric table
- Merge partnerScore into partner (add 2 columns, remove healthLabel)
- Calculate healthLabel in application code
- Add helper function getPartnerHealthLabel()

Code Changes:
- okr.schema.ts: Remove partnerScore definition (3 lines)
- okr.service.ts: Remove recordMetric() function (18 lines)
                  Add getPartnerHealthLabel() function (8 lines)
                  Update calculateAndStorePartnerScore() (5 lines)
- okr.controller.ts: Remove 2 handlers (40 lines)
                     Update 2 handlers to calculate healthLabel (4 lines)
- okr.routes.ts: Remove 2 routes (2 lines)

Total: ~80 lines of code changes
Risk Level: VERY LOW
3NF Compliance: ✅ STRICT
```


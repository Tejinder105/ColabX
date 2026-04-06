# Schema Merge Analysis: Back to Original Structure

## Contact Table Understanding
```
PARTNER TABLE (single contact):
- partnerId, name, type, contactEmail, userId, ...
- Has only ONE primary contact email

CONTACT TABLE (multiple contacts per partner):
- contactId, partnerId, name, email, phone, role, isPrimary, ...
- Allows MANY people per single partner
- Each contact can have different role (Sales Rep, Technical, Finance, etc.)
```

**Current Usage:**
- Routes: POST/GET/PATCH/DELETE `/api/partners/:partnerId/contacts`
- 5 service functions: createContact, getPartnerContacts, getContactById, updateContact, deleteContact
- 4 controllers: createContactHandler, getPartnerContactsHandler, updateContactHandler, deleteContactHandler

---

## OPTION 1: Merge Deal Tables Back into Original Deal Table ❌
**NOT RECOMMENDED**

### Problem: One-to-Many Relationships Cannot Be Flattened
```
ORIGINAL:
deal (1) ───────┬─── dealAssignment (many) ─── user
                ├─── dealMessage (many) ─── user
                ├─── dealTask (many) ─── user
                └─── dealDocument (many) ─── user

If merged into deal table, each deal row would need:
- 10 assignedUserIds (array/JSON)
- 20 messageIds (array/JSON)
- 5 taskIds (array/JSON)
- 3 documentIds (array/JSON)

This violates relational database principles (1NF - First Normal Form)
```

### What Would Break
- Can't index individual messages/tasks/documents
- Repeated data on every query
- Updates become complex
- SQL queries become unmaintainable
- Performance degrades with large datasets

### Example of Bad Design
```sql
-- BEFORE (Normalized) - Fast, clean
SELECT * FROM dealMessage WHERE dealId = 'xyz' AND senderId = 'user1'

-- AFTER (Denormalized) - Slow, messy
SELECT * FROM deal WHERE id = 'xyz' AND messageIds @> 'msg_123'  -- JSON contains
-- Would need to parse JSON and filter in application code
```

**Conclusion:** Keep dealAssignment, dealMessage, dealTask, dealDocument as separate tables ✅

---

## OPTION 2: Merge OKR Tables Back ❌
**NOT RECOMMENDED for same reasons**

### Current Structure
```
ORIGINAL:
objective (1) ─── keyResult (many)
  ├─── performanceMetric (many)
  └─── partnerScore (1)

Merging performanceMetric into objective:
- One objective could have 100+ metrics recorded over time
- Can't store array of metrics in single row
- SQL queries become impossible

Merging partnerScore into objective:
- partnerScore is calculated once, not tied to single objective
- Belongs at partner level, not objective level
```

**Only Viable:** Move `partnerScore` to `partner` table (adds 3 columns to partner)

```sql
-- Current: Store in separate table
SELECT score, healthLabel, calculatedOn FROM partnerScore WHERE partnerId = 'xyz'

-- Alternative: Store in partner table
SELECT score, healthLabel, scoredAt FROM partner WHERE id = 'xyz'
-- Adds 3 columns to partner: score, healthLabel, scoredAt
```

**Impact:**
- Saves 1 table (partnerScore)
- Adds 3 columns to partner table
- Simpler queries joining partner + metrics

**Recommendation:** Merge `partnerScore` into `partner` ✅ (safe, saves 1 table)

---

## OPTION 3: Contact Table - Remove or Merge? ⚠️

### What Contact Table Does
```
Stores multiple people/contacts per partner:
- ID, Name, Email, Phone, Role, IsPrimary
- Types: Sales Rep, Technical Lead, Finance Contact, etc.

Example:
Partner: Acme Corp
├─ Contact: John (Sales Rep, john@acme.com)
├─ Contact: Sarah (Technical, sarah@acme.com)  ← isPrimary=true
└─ Contact: Mike (Finance, mike@acme.com)
```

### Usage Statistics
- 5 functions in contacts.service.ts
- 4 handlers in contacts.controller.ts
- Routes: `/api/partners/:partnerId/contacts`
- Actively maintained (has validation)

### Three Approaches

#### Approach A: Keep Contact Table ✅ BEST
**Pros:**
- Maintains multi-person contact management
- Clean separation of concerns
- Scalable if business needs expand
- Used actively in the system

**Cons:**
- Adds 1 table to schema

**Recommendation:** ✅ KEEP

---

#### Approach B: Merge Into Partner Table ⚠️ POSSIBLE
```
partner table extended with JSON array:

{
  "id": "partner_123",
  "name": "Acme Corp",
  "contactEmail": "sarah@acme.com",  -- primary (current field)
  "contacts": [  -- NEW: JSON array
    {
      "id": "contact_1",
      "name": "John",
      "email": "john@acme.com",
      "phone": "+1234",
      "role": "Sales Rep",
      "isPrimary": false
    },
    {
      "id": "contact_2",
      "name": "Sarah",
      "email": "sarah@acme.com",
      "phone": "+5678",
      "role": "Technical",
      "isPrimary": true
    }
  ]
}
```

**Issues:**
- No indexes on contacts within JSON
- `getPartnerContacts()` would be slow (JSON parsing)
- Can't query "all technical contacts across org" efficiently
- Update operations become complex
- Need `@>` operators (PostgreSQL JSON contains)

**Query Performance (BEFORE vs AFTER):**
```sql
-- BEFORE (Fast, indexed)
SELECT * FROM contact
WHERE partnerId = 'xyz' AND role = 'Technical'
TIME: <1ms

-- AFTER (Slow, JSON parsing)
SELECT * FROM partner WHERE id = 'xyz'
-- Then parse JSON in app code
TIME: 50-100ms for large datasets
```

**Recommendation:** ❌ NOT WORTH IT - Loses too much querying power

---

#### Approach C: Remove Contact Table ❌ NO
This removes active functionality. Would break:
- `/api/partners/:partnerId/contacts` endpoints (4 routes)
- Multi-contact management UI
- Partner contact relationship tracking

**Not viable unless business doesn't need multi-person contact management**

---

## REVISED CONSOLIDATION STRATEGY: 24 → 21 Tables

### Changes:
1. **Remove performanceMetric** ✅ (not critical)
2. **Merge partnerScore into partner table** ✅ (safe, 1 table saved)
3. **Keep contact table** ✅ (active, needed)
4. **Keep deal tables separate** ✅ (relational integrity)
5. **Keep OKR separate** ✅ (one-to-many relationships)

### Result: 23 Tables (not 21, but optimal)
```
Auth              4
Organization      3
Teams             3
Partners          2 (kept contact)
Deals             5 (kept message/task/document/assignment)
OKR               3 (removed performanceMetric, merged partnerScore)
Collaboration     3
━━━━━━━━━━━━━━━━━━━━━━
TOTAL            23 tables
```

### Implementation Plan

#### 1. Merge partnerScore → partner
**File:** `partners.schema.ts`

```typescript
export const partner = pgTable("partner", {
    id: text("id").primaryKey(),
    // ... existing fields ...

    // NEW FIELDS FROM partnerScore:
    score: real("score"),  // Nullable, calculated on demand
    healthLabel: text("healthLabel"),  // "Healthy" | "At Risk" | "Underperforming"
    scoreCalculatedAt: timestamp("scoreCalculatedAt"),
});
```

**Changes needed:**
- Add 3 columns to partner table
- Update `okr.service.ts` lines 521-555 (calculateAndStorePartnerScore)
  - Instead of storing in partnerScore table, UPDATE partner table
- Update `okr.controller.ts` (no changes needed, query logic same)
- Delete `partnerScore` table definition
- Delete migration referencing partnerScore

**Impact:** ✅ Low - only internal schema change

#### 2. Remove performanceMetric Table

**Files to delete:**
- `okr.schema.ts` - Delete performanceMetric definition (lines 99-120)
- `okr.service.ts` - Delete recordMetric() and getPartnerMetrics()
- `okr.controller.ts` - Delete recordMetricHandler() and getPartnerMetricsHandler()
- `okr.routes.ts` - Delete 2 metric routes

**Result:** Removes manual metric recording feature

**Impact:** ⚠️ Medium - UI may have metric input fields referencing deleted endpoints

---

## Final Recommendation Summary

| Action | Tables Saved | Complexity | Risk |
|--------|-------------|-----------|------|
| Remove performanceMetric | 1 | Low | Medium (feature removal) |
| Merge partnerScore → partner | 1 | Low | Low |
| Keep contact table | 0 | - | - |
| Keep deal tables | 0 | - | - |
| Keep OKR intact | 0 | - | - |
| **TOTAL** | **2** | Low | Low |

**24 → 22 tables** with **minimal risk and code changes**

---

## NOT Recommended (Why You Can't Merge to 19)

The remaining 5 tables (dealAssignment, dealMessage, dealTask, dealDocument, performanceMetric) represent **one-to-many relationships**:

```
One Deal    ──┬──→ Many Deal Messages
              ├──→ Many Deal Tasks
              ├──→ Many Deal Documents
              └──→ Many Deal Assignments

One Partner ──→ Many Performance Metrics
```

These **CANNOT be flattened** into parent rows without:
- Violating database normalization rules
- Creating unmaintainable JSON columns
- Losing query performance (no indexes on nested data)
- Breaking SQL integrity constraints

**SQL Best Practice:** Use separate tables for one-to-many relationships ✅

**Your current schema is already optimal for the data structure.**


# ColabX – Software Engineering Testing Report
### Black-Box & White-Box Testing | 2 Modules

---

## Project Overview

| Item | Detail |
|---|---|
| **Project Name** | ColabX – Partner Relationship Management |
| **Tech Stack** | Node.js + Express + TypeScript (Backend), React + Vite (Frontend) |
| **Database** | PostgreSQL (via Drizzle ORM) |
| **Modules Tested** | 1. Contacts Module &nbsp; 2. Deals Module |
| **Testing Types** | Black-Box Testing, White-Box Testing |

---

## Module 1: Contacts Module

### Overview
The Contacts module manages partner contacts within an organization. It allows creating, reading, updating, and deleting contacts associated with partners.

**API Endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/partners/:partnerId/contacts` | Get all contacts of a partner |
| `POST` | `/api/partners/:partnerId/contacts` | Create a new contact |
| `PATCH` | `/api/contacts/:contactId` | Update a contact |
| `DELETE` | `/api/contacts/:contactId` | Delete a contact |

---

### ◾ BLACK-BOX TESTING – Contacts Module

> Black-box testing focuses on **inputs and outputs** without knowledge of internal code. We test the API endpoints as an external user would.

#### Technique 1: Equivalence Partitioning

The input domain is divided into valid and invalid classes.

**Field: `name`** (string, min 2, max 200)

| Class | Range | Test Input | Expected Result |
|---|---|---|---|
| Valid | 2–200 chars | `"John Doe"` | ✅ 201 Created |
| Invalid (too short) | < 2 chars | `"J"` | ❌ 400 Bad Request |
| Invalid (empty) | 0 chars | `""` | ❌ 400 Bad Request |
| Invalid (too long) | > 200 chars | `"A" × 201` | ❌ 400 Bad Request |

**Field: `email`** (valid email format)

| Class | Test Input | Expected Result |
|---|---|---|
| Valid email | `"john@example.com"` | ✅ 201 Created |
| Invalid format | `"not-an-email"` | ❌ 400 Bad Request |
| Missing @ | `"johnexample.com"` | ❌ 400 Bad Request |
| Empty | `""` | ❌ 400 Bad Request |

**Field: `phone`** (optional, max 50 chars)

| Class | Test Input | Expected Result |
|---|---|---|
| Valid | `"+91-9999999999"` | ✅ 201 Created |
| Too long | `"1" × 51` | ❌ 400 Bad Request |
| Omitted | *(not provided)* | ✅ 201 Created (null stored) |

---

#### Technique 2: Boundary Value Analysis

**Field: `name`** boundary:

| Test Case | Input Length | Expected |
|---|---|---|
| BVA-C-01 | 1 char (`"A"`) | ❌ 400 – below minimum |
| BVA-C-02 | 2 chars (`"AB"`) | ✅ 201 – exactly at minimum |
| BVA-C-03 | 3 chars (`"ABC"`) | ✅ 201 – just above minimum |
| BVA-C-04 | 199 chars | ✅ 201 – just below maximum |
| BVA-C-05 | 200 chars | ✅ 201 – exactly at maximum |
| BVA-C-06 | 201 chars | ❌ 400 – above maximum |

**Field: `phone`** boundary:

| Test Case | Input Length | Expected |
|---|---|---|
| BVA-C-07 | 50 chars | ✅ 201 – exactly at maximum |
| BVA-C-08 | 51 chars | ❌ 400 – above maximum |

---

#### Black-Box Test Cases – Contacts

| TC ID | Test Case | Input | Expected Output | Type |
|---|---|---|---|---|
| BB-C-01 | Create contact with all valid fields | `name="Jane Doe"`, `email="jane@x.com"`, `phone="9999"`, `role="CTO"`, `isPrimary=true` | `201 Created` with contact object | Happy Path |
| BB-C-02 | Create contact with only required fields | `name="Jane"`, `email="jane@x.com"` | `201 Created` | Happy Path |
| BB-C-03 | Create contact with invalid email | `name="Jane"`, `email="invalid"` | `400 Bad Request` | Negative |
| BB-C-04 | Create contact with name too short | `name="J"`, `email="j@x.com"` | `400 Bad Request` | Negative |
| BB-C-05 | Create contact with missing `name` | `email="j@x.com"` | `400 Bad Request` | Negative |
| BB-C-06 | Get contacts for valid partner | Valid `partnerId` in URL | `200 OK` with array | Happy Path |
| BB-C-07 | Get contacts for non-existent partner | Invalid/random `partnerId` | `404 Not Found` | Negative |
| BB-C-08 | Update contact email | `email="new@x.com"` | `200 OK` with updated object | Happy Path |
| BB-C-09 | Update contact with invalid email | `email="bad-email"` | `400 Bad Request` | Negative |
| BB-C-10 | Delete existing contact | Valid `contactId` | `200 OK` with deleted object | Happy Path |
| BB-C-11 | Delete non-existent contact | Random UUID as `contactId` | `404 Not Found` | Negative |
| BB-C-12 | Create contact without authentication | No auth token | `401 Unauthorized` | Security |
| BB-C-13 | Create contact with viewer role (no permission) | Role = `viewer` | `403 Forbidden` | Authorization |

---

### ◾ WHITE-BOX TESTING – Contacts Module

> White-box testing examines the **internal logic and code paths**. We analyze the source code to create test cases that cover all branches.

#### Source Code Reference: [contacts.validation.ts](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/contacts/contacts.validation.ts)

```typescript
export const createContactSchema = z.object({
    name: z.string().min(2).max(200).trim(),       // Path 1: name validation
    email: z.string().email(),                      // Path 2: email validation
    phone: z.string().max(50).trim().optional(),    // Path 3: optional phone
    role: z.string().max(200).trim().optional(),    // Path 4: optional role
    isPrimary: z.boolean().optional(),              // Path 5: optional boolean
});
```

#### Source Code Reference: [contacts.service.ts](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/contacts/contacts.service.ts) – [createContact()](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/contacts/contacts.service.ts#5-34)

```typescript
export async function createContact(orgId, partnerId, userId, data) {
    const [created] = await db.insert(contact).values({
        id: crypto.randomUUID(),          // Branch A: always executes
        phone: data.phone ?? null,        // Branch B: phone provided OR null
        role: data.role ?? null,          // Branch C: role provided OR null
        isPrimary: data.isPrimary ?? false // Branch D: isPrimary provided OR false
    }).returning();
    return created;
}
```

#### Control Flow Graph – [createContact](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/contacts/contacts.service.ts#5-34)

```
START
  │
  ▼
[Insert into DB]
  │
  ├── data.phone provided? ──YES──► phone = data.phone
  │                        └─NO──► phone = null          (Branch B)
  │
  ├── data.role provided?  ──YES──► role = data.role
  │                        └─NO──► role = null           (Branch C)
  │
  ├── isPrimary provided?  ──YES──► isPrimary = data.isPrimary
  │                        └─NO──► isPrimary = false     (Branch D)
  │
  ▼
[Return created record]
  │
  ▼
END
```

#### White-Box Test Cases – Contacts

| TC ID | Path Covered | Input | Expected | Coverage |
|---|---|---|---|---|
| WB-C-01 | All optional fields provided | `phone`, `role`, `isPrimary` all set | All values stored as-is | Branch B-YES, C-YES, D-YES |
| WB-C-02 | No optional fields | Only `name` + `email` | `phone=null`, `role=null`, `isPrimary=false` | Branch B-NO, C-NO, D-NO |
| WB-C-03 | Only phone provided | `phone="999"`, no role/isPrimary | `role=null`, `isPrimary=false` | Branch B-YES, C-NO, D-NO |
| WB-C-04 | `isPrimary=false` explicitly | `isPrimary=false` | Stored as `false` | Branch D-YES (false case) |
| WB-C-05 | Validation rejects short name | `name="A"` | Zod throws, DB never called | Early exit path |
| WB-C-06 | Validation rejects bad email | `email="xyz"` | Zod throws, DB never called | Email validation path |

#### Statement & Branch Coverage

| Code Element | Covered By | Coverage |
|---|---|---|
| `phone ?? null` | WB-C-01, WB-C-02 | **100%** |
| `role ?? null` | WB-C-01, WB-C-02 | **100%** |
| `isPrimary ?? false` | WB-C-01, WB-C-02, WB-C-04 | **100%** |
| Zod `min(2)` for name | WB-C-05 | **100%** |
| Zod `email()` check | WB-C-06 | **100%** |
| **Overall Branch Coverage** | | **100%** |

---
---

## Module 2: Deals Module

### Overview
The Deals module manages business deals between an organization and its partners. Deals move through stages: `lead → proposal → negotiation → won/lost`.

**API Endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/deals` | Create a new deal |
| `GET` | `/api/deals` | Get all deals for org |
| `GET` | `/api/deals/:dealId` | Get single deal with details |
| `PATCH` | `/api/deals/:dealId` | Update deal |
| `DELETE` | `/api/deals/:dealId` | Soft-delete deal (marks as `lost`) |
| `POST` | `/api/deals/:dealId/assign` | Assign user to deal |
| `GET` | `/api/deals/:dealId/assign` | Get deal assignments |
| `DELETE` | `/api/deals/:dealId/assign/:userId` | Remove user from deal |

---

### ◾ BLACK-BOX TESTING – Deals Module

#### Technique 1: Equivalence Partitioning

**Field: `title`** (string, min 2, max 300)

| Class | Test Input | Expected |
|---|---|---|
| Valid | `"Partnership with Acme Corp"` | ✅ 201 Created |
| Too short | `"X"` | ❌ 400 Bad Request |
| Too long | `"A" × 301` | ❌ 400 Bad Request |

**Field: `stage`** (enum: lead, proposal, negotiation, won, lost)

| Class | Test Input | Expected |
|---|---|---|
| Valid enum | `"proposal"` | ✅ 200 OK |
| Valid enum | `"won"` | ✅ 200 OK |
| Invalid enum | `"active"` | ❌ 400 Bad Request |
| Invalid enum | `"LEAD"` (uppercase) | ❌ 400 Bad Request |
| Invalid enum | `""` (empty) | ❌ 400 Bad Request |

**Field: `value`** (optional number)

| Class | Test Input | Expected |
|---|---|---|
| Valid positive | `50000` | ✅ 201 Created |
| Valid zero | `0` | ✅ 201 Created |
| Valid decimal | `99.99` | ✅ 201 Created |
| Invalid (string) | `"50000"` | ❌ 400 Bad Request |
| Omitted | *(not sent)* | ✅ 201 Created (null stored) |

---

#### Technique 2: Boundary Value Analysis

**Field: `title`** boundary:

| TC ID | Input Length | Expected |
|---|---|---|
| BVA-D-01 | 1 char | ❌ 400 – below minimum |
| BVA-D-02 | 2 chars | ✅ 201 – at minimum |
| BVA-D-03 | 3 chars | ✅ 201 – just above minimum |
| BVA-D-04 | 299 chars | ✅ 201 – just below maximum |
| BVA-D-05 | 300 chars | ✅ 201 – at maximum |
| BVA-D-06 | 301 chars | ❌ 400 – above maximum |

**Field: `description`** (optional, max 2000):

| TC ID | Input Length | Expected |
|---|---|---|
| BVA-D-07 | 2000 chars | ✅ 201 – at maximum |
| BVA-D-08 | 2001 chars | ❌ 400 – above maximum |

---

#### Black-Box Test Cases – Deals

| TC ID | Test Case | Input | Expected Output | Type |
|---|---|---|---|---|
| BB-D-01 | Create deal with all fields | `title`, `partnerId`, `description`, `value` | `201 Created` with deal object | Happy Path |
| BB-D-02 | Create deal with only required fields | `title`, `partnerId` | `201 Created` | Happy Path |
| BB-D-03 | Create deal with invalid partnerId | Random non-existent UUID | `404 Not Found` | Negative |
| BB-D-04 | Create deal with missing title | Only `partnerId` | `400 Bad Request` | Negative |
| BB-D-05 | Create deal with title too short | `title="X"` | `400 Bad Request` | Negative |
| BB-D-06 | Update deal stage to valid value | `stage="won"` | `200 OK` with updated deal | Happy Path |
| BB-D-07 | Update deal stage to invalid value | `stage="closed"` | `400 Bad Request` | Negative |
| BB-D-08 | Update deal value | `value=75000` | `200 OK` | Happy Path |
| BB-D-09 | Get all deals (no filters) | No query params | `200 OK` with array | Happy Path |
| BB-D-10 | Get deals filtered by stage | `?stage=lead` | `200 OK` filtered array | Happy Path |
| BB-D-11 | Get deals filtered by invalid stage | `?stage=xyz` | `200 OK` (empty array or ignored) | Edge Case |
| BB-D-12 | Get single deal by valid ID | Valid `dealId` | `200 OK` with deal + assignments | Happy Path |
| BB-D-13 | Get deal by non-existent ID | Random UUID | `404 Not Found` | Negative |
| BB-D-14 | Delete deal | Valid `dealId` | `200 OK`, stage becomes `"lost"` | Happy Path |
| BB-D-15 | Assign user to deal | Valid `dealId` + `userId` | `201 Created` assignment | Happy Path |
| BB-D-16 | Assign same user twice | Same `userId` twice | `409 Conflict` or `400 Bad Request` | Negative |
| BB-D-17 | Create deal without auth | No token | `401 Unauthorized` | Security |
| BB-D-18 | Create deal as viewer (no role) | Role = `viewer` | `403 Forbidden` | Authorization |

---

### ◾ WHITE-BOX TESTING – Deals Module

#### Source Code Reference: [deals.service.ts](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/deals/deals.service.ts) – [getOrgDeals()](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/deals/deals.service.ts#34-82)

```typescript
export async function getOrgDeals(orgId, filters?) {
    const conditions = [eq(deal.orgId, orgId)];   // Base condition always added

    if (filters?.stage) {                           // Branch 1: stage filter
        conditions.push(eq(deal.stage, filters.stage));
    }
    if (filters?.partnerId) {                       // Branch 2: partner filter
        conditions.push(eq(deal.partnerId, filters.partnerId));
    }

    const results = await db.select()...where(and(...conditions));

    if (filters?.assignedUser) {                    // Branch 3: assignedUser filter
        const assignedDealIds = await db.select()...;
        const assignedSet = new Set(assignedDealIds.map(r => r.dealId));
        return results.filter(r => assignedSet.has(r.id));  // Branch 3a: filter result
    }

    return results;                                  // Branch 3b: return all
}
```

#### Control Flow Graph – [getOrgDeals](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/deals/deals.service.ts#34-82)

```
START
  │
  ▼
[conditions = [orgId filter]]
  │
  ├── filters.stage EXISTS? ──YES──► Add stage condition
  │                         └─NO──► Skip                  (Branch 1)
  │
  ├── filters.partnerId?   ──YES──► Add partnerId condition
  │                         └─NO──► Skip                  (Branch 2)
  │
  ▼
[Query DB with conditions]
  │
  ├── filters.assignedUser? ──YES──► Filter results by assignments
  │                          └─NO──► Return all results   (Branch 3)
  │
  ▼
END
```

#### Source Code Reference: [softDeleteDeal()](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/deals/deals.service.ts#143-152)

```typescript
export async function softDeleteDeal(dealId: string) {
    const [updated] = await db
        .update(deal)
        .set({ stage: "lost" })          // Always sets to "lost" (no branching)
        .where(eq(deal.id, dealId))
        .returning();
    return updated;                       // May be undefined if dealId not found
}
```

#### White-Box Test Cases – Deals

| TC ID | Path / Branch Covered | Input | Expected | Coverage |
|---|---|---|---|---|
| WB-D-01 | No filters (Branch 1-NO, 2-NO, 3-NO) | [getOrgDeals(orgId)](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/deals/deals.service.ts#34-82) | All org deals returned | Base path |
| WB-D-02 | Stage filter only (Branch 1-YES, 2-NO, 3-NO) | `filters={stage:"lead"}` | Only `lead` deals returned | Branch 1 |
| WB-D-03 | Partner filter only (Branch 1-NO, 2-YES, 3-NO) | `filters={partnerId:"xyz"}` | Only partner deals returned | Branch 2 |
| WB-D-04 | assignedUser filter (Branch 3-YES, 3a) | `filters={assignedUser:"uid"}` | Deals assigned to user | Branch 3 |
| WB-D-05 | assignedUser with no matches (Branch 3-YES, 3a empty) | `filters={assignedUser:"unknown"}` | Empty array `[]` | Branch 3a empty |
| WB-D-06 | All filters combined | `stage+partnerId+assignedUser` | Intersection result | All branches YES |
| WB-D-07 | Soft delete existing deal | Valid `dealId` | `stage` becomes `"lost"` | softDelete path |
| WB-D-08 | Soft delete non-existent deal | Random UUID | `updated = undefined` | softDelete null return |
| WB-D-09 | [isOrgMember](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/deals/deals.service.ts#209-218) returns true | Valid orgId + userId | Returns `true` | Member check |
| WB-D-10 | [isOrgMember](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/deals/deals.service.ts#209-218) returns false | Invalid userId | Returns `false` | Member check false |

#### Statement & Branch Coverage – Deals

| Code Element | Covered By | Coverage |
|---|---|---|
| `if (filters?.stage)` | WB-D-01, WB-D-02 | **100%** |
| `if (filters?.partnerId)` | WB-D-01, WB-D-03 | **100%** |
| `if (filters?.assignedUser)` | WB-D-01, WB-D-04, WB-D-05 | **100%** |
| [softDeleteDeal](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/deals/deals.service.ts#143-152) – record found | WB-D-07 | **100%** |
| [softDeleteDeal](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/deals/deals.service.ts#143-152) – record not found | WB-D-08 | **100%** |
| [isOrgMember](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/deals/deals.service.ts#209-218) – true branch | WB-D-09 | **100%** |
| [isOrgMember](file:///e:/ColabX-main/ColabX-main/colabXBackend/src/deals/deals.service.ts#209-218) – false branch | WB-D-10 | **100%** |
| **Overall Branch Coverage** | | **100%** |

---

## Summary Table

| Module | Testing Type | Technique | # Test Cases |
|---|---|---|---|
| Contacts | Black-Box | Equivalence Partitioning + BVA | 13 |
| Contacts | White-Box | Branch Coverage + CFG | 6 |
| Deals | Black-Box | Equivalence Partitioning + BVA | 18 |
| Deals | White-Box | Branch Coverage + CFG | 10 |
| **Total** | | | **47** |

---

## Tools That Can Be Used for Actual Test Execution

| Tool | Purpose |
|---|---|
| **Postman / Thunder Client** | Manual black-box API testing |
| **Jest + Supertest** | Automated white-box unit/integration testing |
| **Drizzle ORM test DB** | In-memory/test DB for white-box isolation |
| **Istanbul / c8** | Code coverage reports for white-box |

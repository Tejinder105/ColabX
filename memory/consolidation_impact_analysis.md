# Database Consolidation Impact Analysis: 24 → 19 Tables

## Executive Summary
Reducing from 24 to 19 tables requires consolidating 5 tables into 3 using polymorphic/discriminator patterns. This adds **query complexity** and **reduces type safety**, but saves schema maintenance and storage overhead.

---

## CONSOLIDATION 1: Collaboration Module (3 → 1 table)
**Tables Merging:** `communication`, `document`, `activityLog` → `activity`

### Current Schema (3 separate tables)
```
Communication:
- id, orgId, partnerId, senderId, message, createdAt

Document:
- id, orgId, partnerId, uploadedBy, fileName, fileUrl, visibility, uploadedAt

ActivityLog:
- id, orgId, userId, entityType, entityId, action, createdAt
```

### New Consolidated Schema
```
Activity:
- id (pk)
- orgId (fk)
- userId (sender/uploader/user)
- type ('message' | 'document' | 'event')  [DISCRIMINATOR]
- partnerId (nullable - only for message/document)
- senderId (nullable - message only)
- uploadedBy (nullable - document only)
- createdBy (nullable - event only)
- message (nullable - message only)
- fileName (nullable - document only)
- fileUrl (nullable - document only)
- visibility (nullable - document only, enum)
- entityType (nullable - event only, audit trail type)
- entityId (nullable - event only, what entity)
- action (nullable - event only, what action)
- createdAt
- updatedAt
```

### Code Changes Required

#### 1. **collaboration.service.ts**
**Current:** 12 functions across 3 tables
**Changes:**
- `createCommunication()` → Insert with `type='message'`
- `createDocument()` → Insert with `type='document'`
- `createActivity()` → Insert with `type='event'`
- `getPartnerCommunications()` → WHERE type='message' AND partnerId=...
- `getPartnerDocuments()` → WHERE type='document' AND partnerId=...
- `getPartnerActivities()` → WHERE type='event' AND entityId=...

**Risk:** Type safety lost - no longer compile-time guaranteed that `message` field exists on messages

```typescript
// BEFORE
export async function createCommunication(orgId: string, partnerId: string, senderId: string, message: string) {
    return db.insert(communication).values({...})
}

// AFTER
export async function createCommunication(orgId: string, partnerId: string, senderId: string, message: string) {
    return db.insert(activity).values({
        type: 'message',
        orgId, partnerId, senderId, message
    })
}
```

#### 2. **deals.controller.ts**
**Impact:** Lines calling `createActivity()`
- Creates activity logs for: deal, deal_task, deal_document, deal_assignment, deal_message

```typescript
// BEFORE
await createActivity(orgId, userId, "deal", dealId, `created deal "${created.title}"`)

// AFTER - Same API, works transparently
await createActivity(orgId, userId, "deal", dealId, `created deal "${created.title}"`)
```
✅ **No code changes needed** - `createActivity()` function signature unchanged

#### 3. **okr.controller.ts**
**Impact:** Lines calling `createActivity()`
- ALL activity logging for objectives/key results stays the same

✅ **No code changes needed** - `createActivity()` is called identically

#### 4. **inviteController.ts**
**Impact:** Line 202-207, 232-235
- Calls `createActivity()` for invitation events

✅ **No code changes needed** - activity logging unchanged

### Query Pattern Changes

#### Partner Communications Query
```typescript
// BEFORE
export async function getPartnerCommunications(partnerId: string) {
    return db
        .select({ id: communication.id, message: communication.message, ... })
        .from(communication)
        .where(eq(communication.partnerId, partnerId))
}

// AFTER
export async function getPartnerCommunications(partnerId: string) {
    return db
        .select({ id: activity.id, message: activity.message, ... })
        .from(activity)
        .where(and(eq(activity.type, 'message'), eq(activity.partnerId, partnerId)))
        .orderBy(desc(activity.createdAt))
}
```

#### Document Visibility Filtering
```typescript
// BEFORE - Index works directly
.where(eq(document.visibility, 'shared'))

// AFTER - Need composite index
.where(and(
    eq(activity.type, 'document'),
    eq(activity.visibility, 'shared')
))
// Index: (type, visibility) RECOMMENDED
```

#### Activity Filtering
```typescript
// BEFORE
.where(and(
    eq(activityLog.entityType, 'partner'),
    eq(activityLog.entityId, partnerId)
))

// AFTER
.where(and(
    eq(activity.type, 'event'),
    eq(activity.entityType, 'partner'),
    eq(activity.entityId, partnerId)
))
// Index: (type, entityType, entityId) RECOMMENDED
```

### Impact Summary

| Aspect | Impact | Severity |
|--------|--------|----------|
| Function Signatures | No changes to public API | ✅ Low |
| Controller Code | No code changes | ✅ Low |
| Query Complexity | +WHERE conditions | ⚠️ Medium |
| Indexes | Need composite indexes | ⚠️ Medium |
| Type Safety | Lost field-level validation | ❌ High |
| NULL Fields | 10+ nullable columns per row | ❌ High |
| Query Performance | Slightly slower without proper indexes | ⚠️ Medium |

---

## CONSOLIDATION 2: Deal Collaboration (3 → 1 table)
**Tables Merging:** `dealMessage`, `dealTask`, `dealDocument` → `dealItem`

### Current Schema
```
DealMessage:
- id, dealId, senderId, content, createdAt

DealTask:
- id, dealId, title, description, assigneeUserId, status, dueDate, createdBy, createdAt, updatedAt, completedAt

DealDocument:
- id, dealId, uploadedBy, fileName, fileUrl, visibility, uploadedAt
```

### New Consolidated Schema
```
DealItem:
- id (pk)
- dealId (fk)
- type ('message' | 'task' | 'document')  [DISCRIMINATOR]
- senderId (nullable - message only)
- content (nullable - message only)
- title (nullable - task only)
- description (nullable - task/document)
- assigneeUserId (nullable - task only)
- status (nullable - task only, enum)
- dueDate (nullable - task only)
- completedAt (nullable - task only)
- uploadedBy (nullable - document only)
- fileName (nullable - document only)
- fileUrl (nullable - document only)
- visibility (nullable - document only, enum)
- createdAt
- createdBy (for tasks)
- updatedAt
```

### Code Changes Required

#### 1. **deals.core.service.ts**
**Current:** 14 functions for messages/tasks/documents (lines 327-547)

```typescript
// BEFORE
export async function createDealMessage(dealId: string, senderId: string, content: string) {
    return db.insert(dealMessage).values({ id: UUID, dealId, senderId, content }).returning()
}

// AFTER
export async function createDealMessage(dealId: string, senderId: string, content: string) {
    return db.insert(dealItem).values({
        id: UUID,
        dealId,
        type: 'message',
        senderId,
        content
    }).returning()
}
```

#### 2. **deals.controller.ts**
**Lines affected:** 385-740 (deal content handlers)

**Message Handlers** (lines 385-430)
```typescript
// BEFORE
await createDealMessage(dealId, userId, content)
const messages = await getDealMessages(dealId)
await deleteDealMessage(messageId)

// AFTER - Same, functions adapt internally
await createDealMessage(dealId, userId, content)  // ✅ No change
const messages = await getDealMessages(dealId)    // ✅ No change
await deleteDealMessage(messageId)                 // ✅ No change
```

**Task Handlers** (lines 471-628)
```typescript
// BEFORE
const task = await createDealTask(dealId, userId, { title, description, assigneeUserId })
await updateDealTask(taskId, { status: 'done' })
tasks = await getDealTasks(dealId)

// AFTER - Same API, can stay unchanged
// BUT: Need to ensure type casting when filtering
```

**Document Handlers** (lines 632-680)
```typescript
// BEFORE
const document = await createDealDocument(dealId, userId, { fileName, fileUrl, visibility })
const docs = await getDealDocuments(dealId, { visibility: 'internal' })

// AFTER
const document = await createDealDocument(dealId, userId, { fileName, fileUrl, visibility })  // ✅ No change
const docs = await getDealDocuments(dealId, { visibility: 'internal' })                       // ✅ No change
```

### Query Pattern Changes

#### Get Deal Messages
```typescript
// BEFORE - Index on (dealMessage.dealId, createdAt)
.from(dealMessage)
.where(eq(dealMessage.dealId, dealId))
.orderBy(asc(dealMessage.createdAt))

// AFTER - Index on (dealItem.dealId, type, createdAt) REQUIRED
.from(dealItem)
.where(and(eq(dealItem.dealId, dealId), eq(dealItem.type, 'message')))
.orderBy(asc(dealItem.createdAt))
```

#### Update Task Status
```typescript
// BEFORE - Direct column update
.update(dealTask)
.set({ status: 'done', completedAt: new Date() })

// AFTER - Same pattern
.update(dealItem)
.set({ status: 'done', completedAt: new Date() })
.where(and(eq(dealItem.id, taskId), eq(dealItem.type, 'task')))
```

#### Filter Documents by Visibility
```typescript
// BEFORE
.where(eq(dealDocument.visibility, 'shared'))

// AFTER
.where(and(
    eq(dealItem.dealId, dealId),
    eq(dealItem.type, 'document'),
    eq(dealItem.visibility, 'shared')
))
// Index: (dealId, type, visibility) CRITICAL
```

### Implementation Complexity
Deal collaboration is **HIGHER complexity** than collaboration module:

1. **Three distinct data models** with different lifecycles
2. **Status enums** on tasks only
3. **Visibility enums** on documents only
4. **Different relationships** (tasks have createdBy, messages have senderId)
5. **Update patterns** vary (tasks update status, documents don't)

### Code Files Affected
- `deals.schema.ts` - Replace 5 table definitions with 1
- `deals.core.service.ts` - 14 functions need internal refactoring
- `deals.controller.ts` - 21 handlers mostly unchanged but may need type casting
- `deals.routes.ts` - Route definitions unchanged ✅

### Impact Summary

| Aspect | Impact | Severity |
|--------|--------|----------|
| Function Signatures | Can stay unchanged (adapter pattern) | ✅ Low |
| Controller Code | No code changes needed | ✅ Low |
| Service Logic | 14 functions refactored | ⚠️ Medium |
| Query Complexity | Multiple WHERE conditions per query | ⚠️ Medium |
| Indexes | Need 3-4 composite indexes | ⚠️ Medium |
| Type Safety | Lost enum-level type checking | ❌ High |
| NULL columns | 15+ nullable per row | ❌ High |
| Constraint Pushing | Foreign keys become complex | ⚠️ Medium |

---

## CONSOLIDATION 3: Remove PerformanceMetric Table
**Tables Removed:** `performanceMetric`
**Calculation:** Live aggregation from objectives, deals, activities

### Current Usage
```
recordMetric(partnerId, metricType, metricValue)
  → INSERT performanceMetric

getPartnerMetrics(partnerId, filters)
  → SELECT * FROM performanceMetric

calculateAndStorePartnerScore(partnerId)
  → Aggregates metrics + objectives + deals + activities
  → STORES IN partnerScore table
```

### What Changes

#### 1. **okr.service.ts**
**Functions affected (lines 417-452):**

```typescript
// REMOVE COMPLETELY
export async function recordMetric(...) { ... }  // DELETE
export async function getPartnerMetrics(...) { ... }  // DELETE
```

#### 2. **okr.controller.ts**
**Handlers affected (lines 447-506):**

```typescript
// recordMetricHandler (lines 447-484) - MUST DELETE
// POST /okr/partners/:partnerId/metrics
// This entire endpoint becomes unavailable

// getPartnerMetricsHandler (lines 487-506) - MUST DELETE
// GET /okr/partners/:partnerId/metrics
// This endpoint becomes unavailable
```

#### 3. **okr.routes.ts**
**Routes to remove:**
```typescript
// DELETE these routes
router.post('/partners/:partnerId/metrics', requireOrganization, recordMetricHandler)
router.get('/partners/:partnerId/metrics', requireOrganization, getPartnerMetricsHandler)
```

#### 4. **calculateAndStorePartnerScore() Impact**

Current flow:
```
recordMetric() → performanceMetric table
getPartnerMetrics() → SELECT from performanceMetric
calculateAndStorePartnerScore() → Aggregates + stores in partnerScore
```

New flow (NO METRICS):
```
calculateAndStorePartnerScore() → Calculates from:
  - objectives + keyResults (40%)
  - deals (40%)
  - activityLog (20%)
  → STORES IN partnerScore
```

**Query in calculatePartnerScoreSnapshot (lines 454-472):**

```typescript
// CHANGE: Remove metric aggregation
const [partnerObjectives, partnerDeals, recentActivities] = await Promise.all([
    db.select(...).from(objective).where(...),
    db.select(...).from(deal).where(...),
    db.select(...).from(activityLog).where(...),
    // REMOVE: db.select(...).from(performanceMetric).where(...)
])
```

### Scoring Recalculation
Current score formula (line 510-512):
```
finalScore = (dealsPerformance * 0.4) + (okrCompletion * 0.4) + (activity * 0.2)
```

If metrics were weighted, scoring changes significantly. Need to verify:
- Are metrics used in partner health calculations?
- Do any reports/dashboards rely on metrics history?
- Would users lose ability to manually input metrics?

### UI/Frontend Impact
Any UI showing "Partner Metrics" becomes unavailable:
- Dashboard metric cards
- Partner performance metrics page
- Metric history/trends view

### Files to Modify
1. `okr.schema.ts` - Delete performanceMetric table definition + relations
2. `okr.service.ts` - Delete recordMetric(), getPartnerMetrics()
3. `okr.controller.ts` - Delete recordMetricHandler(), getPartnerMetricsHandler()
4. `okr.routes.ts` - Delete 2 routes
5. Any frontend components using /api/okr/metrics endpoints

### Impact Summary

| Aspect | Impact | Severity |
|--------|--------|----------|
| Backend Functions | 2 functions removed | ✅ Low |
| API Endpoints | 2 endpoints removed | ⚠️ Medium |
| Data Loss Risk | NO - metrics aren't stored after deletion | ✅ Low |
| Calculation Impact | Removed from score formula | ❌ High |
| Frontend Impact | Metric cards become unavailable | ⚠️ Medium |
| User Workflow | Can't record manual metrics | ❌ High |

---

## OVERALL IMPACT SUMMARY

### What Stays the Same (Controller code)
✅ **deals.controller.ts** - 21 handlers mostly work as-is
✅ **collaboration.controller.ts** - All handlers work via updated service layer
✅ **inviteController.ts** - Activity logging transparent
✅ **okr.controller.ts** (partial) - Score/performance routes work, but 2 metric routes removed

### What Changes (Service layer)
⚠️ **collaboration.service.ts** - 12 functions refactored for consolidated table
⚠️ **deals.core.service.ts** - 14 functions refactored for consolidated table
❌ **okr.service.ts** - 2 functions removed entirely
⚠️ **okr.controller.ts** - 2 handlers removed

### What Changes (Data layer)
✅ **database schema** - 5 tables → 3 tables (saves storage)
⚠️ **Indexes** - Need 4-6 new composite indexes for performance
❌ **Type safety** - Significant loss with polymorphic tables
⚠️ **Query complexity** - More WHERE clauses, harder to optimize

### Risk Assessment

**HIGH RISK:**
- Loss of compile-time type checking
- Over-nullability of consolidated rows (15+ NULLs per row)
- Query performance degradation without proper indexes
- Hard to scale if business logic diverges per type
- Testing matrix expansions (type='X' combinations)

**MEDIUM RISK:**
- Removing metric recording capability (user-facing feature loss)
- Index design choices affect query speed
- Adapter functions hide complexity

**LOW RISK:**
- Controller code changes minimal
- External API/routes mostly unchanged
- Function-level adapters can maintain interface

---

## RECOMMENDATION

**NOT RECOMMENDED** for 5-table reduction unless:

1. **Schema complexity** is a critical business concern
2. You're willing to **lose type safety** (use discriminated unions in types)
3. **Query performance** testing shows acceptable results
4. **Metrics feature** removal is acceptable to users
5. You implement **comprehensive integration tests** (type permutations)

**ALTERNATIVE: Reduce to 21 tables instead**
- Remove `performanceMetric` only (saves 1 table)
- Keep collaboration & deals consolidated separately
- Easier rollback, better type safety
- Minimal controller impact

**WHAT TO DO:**
1. ✅ Remove performanceMetric (straightforward, low risk)
2. ⚠️ Consolidate collaboration tables separately (test thoroughly)
3. ⚠️ Consolidate deals tables separately (complex, defer)
4. ❌ Do NOT consolidate all 5 at once (too risky)


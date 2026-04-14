# ColabX Database — Normalization Analysis

## Normal Forms — Quick Reference

| Form | Rule | What it prevents |
|------|------|-----------------|
| **1NF** | Every column holds a single atomic value; no repeating groups; every row is unique (has a PK) | Arrays in cells, comma-separated values, duplicate rows |
| **2NF** | Must be in 1NF + every non-key column depends on the **entire** primary key (no partial dependencies) | Only matters when PK is composite — a non-key column must not depend on just *part* of the PK |
| **3NF** | Must be in 2NF + every non-key column depends **directly** on the PK, not on another non-key column (no transitive dependencies) | Column A → Column B → PK violation (B is redundant) |

> **All tables use surrogate UUID primary keys**, so 2NF is automatically satisfied (no composite PK = no partial dependency possible).

---

## Table-by-Table Analysis

---

### 1. `user`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `id` | text | **PK** |
| `name` | text | NOT NULL |
| `email` | text | NOT NULL, UNIQUE |
| `emailVerified` | boolean | NOT NULL, default false |
| `image` | text | nullable |
| `createdAt` | timestamp | NOT NULL |
| `updatedAt` | timestamp | NOT NULL |

**Relationships**
- `user` ←1:many→ `session` (a user has many sessions)
- `user` ←1:many→ `account` (a user has many OAuth accounts)
- `user` ←1:many→ `orgUser` (a user belongs to many organizations)
- `user` ←1:many→ `partner` (as creator or linked user)
- `user` ←1:many→ `team`, `teamMember`, `dealAssignment`, `dealTask`, `dealDocument`, etc.

**1NF ✅** — Every column is atomic. `email` is a single value, not a list. Has a PK (`id`).

**2NF ✅** — Single-column PK, so partial dependencies are impossible.

**3NF ✅** — No column depends on another non-key column. `email` does not determine `name`; all attributes describe the user directly.

---

### 2. `session`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `id` | text | **PK** |
| `userId` | text | FK → user.id |
| `token` | text | NOT NULL, UNIQUE |
| `expiresAt` | timestamp | NOT NULL |
| `ipAddress` | text | nullable |
| `userAgent` | text | nullable |
| `createdAt` | timestamp | NOT NULL |
| `updatedAt` | timestamp | NOT NULL |

**Relationships**
- `session` many:1→ `user`

**1NF ✅** — All atomic values, unique PK.

**2NF ✅** — Single-column PK.

**3NF ✅** — `ipAddress` and `userAgent` describe the session directly, not derived from `userId`.

---

### 3. `account`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `id` | text | **PK** |
| `userId` | text | FK → user.id |
| `accountId` | text | NOT NULL |
| `providerId` | text | NOT NULL |
| `accessToken` | text | nullable |
| `refreshToken` | text | nullable |
| `idToken` | text | nullable |
| `accessTokenExpiresAt` | timestamp | nullable |
| `refreshTokenExpiresAt` | timestamp | nullable |
| `scope` | text | nullable |
| `password` | text | nullable |
| `createdAt` | timestamp | NOT NULL |
| `updatedAt` | timestamp | NOT NULL |

**Relationships**
- `account` many:1→ `user`

**1NF ✅** — All atomic. Each OAuth account is one row.

**2NF ✅** — Single-column PK.

**3NF ✅** — All token fields describe this specific account record; none derive from `userId`.

---

### 4. `verification`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `id` | text | **PK** |
| `identifier` | text | NOT NULL |
| `value` | text | NOT NULL |
| `expiresAt` | timestamp | NOT NULL |
| `createdAt` | timestamp | NOT NULL |
| `updatedAt` | timestamp | NOT NULL |

**Relationships** — standalone (used by Better Auth internally)

**1NF ✅** — All atomic, unique PK.

**2NF ✅** — Single-column PK.

**3NF ✅** — All columns describe this verification token directly.

---

### 5. `organization`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `organizationId` | text | **PK** |
| `name` | text | NOT NULL |
| `slug` | text | NOT NULL, UNIQUE |
| `logo` | text | nullable |
| `industry` | text | nullable |
| `timezone` | text | nullable |
| `createdAt` | timestamp | NOT NULL |
| `updatedAt` | timestamp | NOT NULL |

**Relationships**
- `organization` ←1:many→ `orgUser`, `invitation`, `partner`, `team`, `deal`, `objective`, `activityLog`, `notification`

**1NF ✅** — All atomic values.

**2NF ✅** — Single-column PK.

**3NF ✅** — `industry` and `timezone` describe the org directly; `slug` does not determine `name` (they're independent attributes).

---

### 6. `orgUser`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `orgUserId` | text | **PK** |
| `userId` | text | FK → user.id |
| `organizationId` | text | FK → organization.organizationId |
| `role` | enum | NOT NULL (admin\|manager\|partner) |
| `joinedAt` | timestamp | NOT NULL |

**Relationships**
- `orgUser` many:1→ `user`
- `orgUser` many:1→ `organization`

**1NF ✅** — Atomic values; each membership is one row.

**2NF ✅** — Single surrogate PK; `role` is not a partial dependency.

**3NF ✅** — `role` and `joinedAt` describe this specific membership, not derived from `userId` or `organizationId` alone.

---

### 7. `invitation`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `invitationId` | text | **PK** |
| `organizationId` | text | FK → organization.organizationId |
| `email` | text | NOT NULL |
| `token` | text | NOT NULL, UNIQUE |
| `role` | enum | NOT NULL (manager\|partner) |
| `partnerType` | text | nullable |
| `partnerIndustry` | text | nullable |
| `expiresAt` | timestamp | NOT NULL |
| `usedAt` | timestamp | nullable |
| `createdAt` | timestamp | NOT NULL |

**Relationships**
- `invitation` many:1→ `organization`

**1NF ✅** — All atomic values.

**2NF ✅** — Single-column PK.

**3NF ✅** — `partnerType` and `partnerIndustry` are nullable fields that describe the invitation directly (set independently per row, not derived from `role`). `role` does not functionally determine `partnerType` — knowing `role='partner'` doesn't tell you which type. Direct dependency: `invitationId → partnerType`.

---

### 8. `partner`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `partnerId` | text | **PK** |
| `organizationId` | text | FK → organization.organizationId |
| `userId` | text | FK → user.id (nullable) |
| `name` | text | NOT NULL |
| `type` | enum | NOT NULL (reseller\|agent\|technology\|distributor) |
| `status` | enum | NOT NULL (pending\|active\|inactive\|suspended) |
| `contactEmail` | text | NOT NULL |
| `industry` | text | nullable |
| `onboardingDate` | timestamp | nullable |
| `score` | real | nullable |
| `scoreCalculatedAt` | timestamp | nullable |
| `createdByUserId` | text | FK → user.id (nullable) |
| `createdAt` | timestamp | NOT NULL |
| `updatedAt` | timestamp | NOT NULL |

**Relationships**
- `partner` many:1→ `organization`
- `partner` many:1→ `user` (linked user, optional)
- `partner` many:1→ `user` (creator)
- `partner` ←1:many→ `contact`, `deal`, `teamPartner`, `communication`, `document`, `objective`, `notification`

**1NF ✅** — All atomic values.

**2NF ✅** — Single-column PK.

**3NF ✅** — `scoreCalculatedAt` describes when `score` was last computed — both depend directly on `partnerId`, not on each other transitively. `userId` and `createdByUserId` are independent FKs.

---

### 9. `team`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `teamId` | text | **PK** |
| `organizationId` | text | FK → organization.organizationId |
| `name` | text | NOT NULL |
| `description` | text | nullable |
| `createdByUserId` | text | FK → user.id (nullable) |
| `createdAt` | timestamp | NOT NULL |
| `updatedAt` | timestamp | NOT NULL |

**Relationships**
- `team` many:1→ `organization`
- `team` many:1→ `user` (creator)
- `team` ←1:many→ `teamMember`, `teamPartner`, `deal`, `objective`

**1NF ✅** — All atomic.

**2NF ✅** — Single-column PK.

**3NF ✅** — All columns describe the team directly.

---

### 10. `teamMember`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `teamMemberId` | text | **PK** |
| `teamId` | text | FK → team.teamId |
| `userId` | text | FK → user.id |
| `role` | enum | NOT NULL (lead\|member) |
| `joinedAt` | timestamp | NOT NULL |

**Unique constraint:** `(teamId, userId)`

**Relationships**
- `teamMember` many:1→ `team`
- `teamMember` many:1→ `user`

**1NF ✅** — All atomic.

**2NF ✅** — Single surrogate PK.

**3NF ✅** — `role` describes this specific membership, not derived from `teamId` or `userId` alone.

---

### 11. `teamPartner`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `teamPartnerId` | text | **PK** |
| `teamId` | text | FK → team.teamId |
| `partnerId` | text | FK → partner.partnerId, UNIQUE |
| `assignedByUserId` | text | FK → user.id (nullable) |
| `assignedAt` | timestamp | NOT NULL |

**Unique constraint:** `(teamId, partnerId)`, `partnerId` alone

**Relationships**
- `teamPartner` many:1→ `team`
- `teamPartner` many:1→ `partner`
- `teamPartner` many:1→ `user` (assigner)

**1NF ✅** — All atomic.

**2NF ✅** — Single surrogate PK.

**3NF ✅** — `assignedAt` describes this assignment, not derived from either FK.

---

### 12. `contact`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `contactId` | text | **PK** |
| `partnerId` | text | FK → partner.partnerId |
| `name` | text | NOT NULL |
| `email` | text | NOT NULL |
| `phone` | text | nullable |
| `role` | text | nullable |
| `isPrimary` | boolean | NOT NULL, default false |
| `createdByUserId` | text | FK → user.id (nullable) |
| `createdAt` | timestamp | NOT NULL |
| `updatedAt` | timestamp | NOT NULL |

**Relationships**
- `contact` many:1→ `partner`
- `contact` many:1→ `user` (creator)

> **Note:** `organizationId` was removed (3NF fix) — derivable via `partnerId → partner.organizationId`.

**1NF ✅** — All atomic.

**2NF ✅** — Single-column PK.

**3NF ✅** — All attributes describe the contact directly. No `organizationId` column eliminates the previous transitive dependency.

---

### 13. `deal`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `dealId` | text | **PK** |
| `organizationId` | text | FK → organization.organizationId |
| `partnerId` | text | FK → partner.partnerId |
| `teamId` | text | FK → team.teamId (nullable) |
| `title` | text | NOT NULL |
| `description` | text | nullable |
| `value` | real | nullable |
| `stage` | enum | NOT NULL (lead\|proposal\|negotiation\|won\|lost) |
| `createdByUserId` | text | FK → user.id (nullable) |
| `createdAt` | timestamp | NOT NULL |
| `updatedAt` | timestamp | NOT NULL |

**Relationships**
- `deal` many:1→ `organization`, `partner`, `team`, `user`
- `deal` ←1:many→ `dealAssignment`, `dealMessage`, `dealTask`, `dealDocument`

**1NF ✅** — All atomic.

**2NF ✅** — Single-column PK.

**3NF ✅** — `organizationId` is retained here as a deliberate multi-tenancy shortcut (needed independently of `partnerId` for org-scoped queries). It's a direct attribute of the deal row.

---

### 14. `dealAssignment`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `dealAssignmentId` | text | **PK** |
| `dealId` | text | FK → deal.dealId |
| `userId` | text | FK → user.id |
| `assignedAt` | timestamp | NOT NULL |

**Unique constraint:** `(dealId, userId)`

**Relationships**
- `dealAssignment` many:1→ `deal`
- `dealAssignment` many:1→ `user`

**1NF ✅** — All atomic.

**2NF ✅** — Single-column PK.

**3NF ✅** — `assignedAt` describes this assignment directly.

---

### 15. `dealMessage`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `dealMessageId` | text | **PK** |
| `dealId` | text | FK → deal.dealId |
| `senderUserId` | text | FK → user.id |
| `content` | text | NOT NULL |
| `createdAt` | timestamp | NOT NULL |

**Relationships**
- `dealMessage` many:1→ `deal`
- `dealMessage` many:1→ `user` (sender)

**1NF ✅** / **2NF ✅** / **3NF ✅** — All attributes describe one message.

---

### 16. `dealTask`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `dealTaskId` | text | **PK** |
| `dealId` | text | FK → deal.dealId |
| `title` | text | NOT NULL |
| `description` | text | nullable |
| `assigneeUserId` | text | FK → user.id (nullable) |
| `status` | enum | NOT NULL (todo\|in_progress\|done) |
| `dueDate` | timestamp | nullable |
| `createdByUserId` | text | FK → user.id (nullable) |
| `createdAt` | timestamp | NOT NULL |
| `updatedAt` | timestamp | NOT NULL |
| `completedAt` | timestamp | nullable |

**Relationships**
- `dealTask` many:1→ `deal`
- `dealTask` many:1→ `user` (assignee, creator)

**1NF ✅** / **2NF ✅** / **3NF ✅** — All attributes describe one task directly.

---

### 17. `dealDocument`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `dealDocumentId` | text | **PK** |
| `dealId` | text | FK → deal.dealId |
| `uploadedByUserId` | text | FK → user.id |
| `fileName` | text | NOT NULL |
| `fileUrl` | text | NOT NULL |
| `visibility` | enum | NOT NULL (shared\|internal) |
| `uploadedAt` | timestamp | NOT NULL |

**Relationships**
- `dealDocument` many:1→ `deal`
- `dealDocument` many:1→ `user` (uploader)

**1NF ✅** / **2NF ✅** / **3NF ✅** — All attributes describe one document record.

---

### 18. `objective`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `objectiveId` | text | **PK** |
| `organizationId` | text | FK → organization.organizationId |
| `partnerId` | text | FK → partner.partnerId (nullable) |
| `teamId` | text | FK → team.teamId (nullable) |
| `title` | text | NOT NULL |
| `description` | text | nullable |
| `startDate` | date | NOT NULL |
| `endDate` | date | NOT NULL |
| `createdByUserId` | text | FK → user.id (nullable) |
| `createdAt` | timestamp | NOT NULL |
| `updatedAt` | timestamp | NOT NULL |

**Relationships**
- `objective` many:1→ `organization`, `partner` (optional), `team` (optional), `user`
- `objective` ←1:many→ `keyResult`

**1NF ✅** — All atomic.

**2NF ✅** — Single-column PK.

**3NF ✅** — `partnerId` and `teamId` are optional single-valued FKs; each objective belongs to at most one partner and one team. No transitive dependency.

---

### 19. `keyResult`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `keyResultId` | text | **PK** |
| `objectiveId` | text | FK → objective.objectiveId |
| `title` | text | NOT NULL |
| `targetValue` | real | NOT NULL |
| `currentValue` | real | NOT NULL, default 0 |
| `status` | enum | NOT NULL (on_track\|at_risk\|off_track) |
| `createdAt` | timestamp | NOT NULL |
| `updatedAt` | timestamp | NOT NULL |

**Relationships**
- `keyResult` many:1→ `objective`

**1NF ✅** / **2NF ✅** / **3NF ✅** — All attributes describe one key result directly.

---

### 20. `communication`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `communicationId` | text | **PK** |
| `partnerId` | text | FK → partner.partnerId |
| `senderUserId` | text | FK → user.id |
| `message` | text | NOT NULL |
| `createdAt` | timestamp | NOT NULL |

**Relationships**
- `communication` many:1→ `partner`
- `communication` many:1→ `user` (sender)

> **Note:** `organizationId` was removed (3NF fix) — derivable via `partnerId → partner.organizationId`.

**1NF ✅** / **2NF ✅** / **3NF ✅** — All attributes describe one message directly.

---

### 21. `document`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `documentId` | text | **PK** |
| `partnerId` | text | FK → partner.partnerId |
| `uploadedByUserId` | text | FK → user.id |
| `fileName` | text | NOT NULL |
| `fileUrl` | text | NOT NULL |
| `visibility` | text | NOT NULL |
| `uploadedAt` | timestamp | NOT NULL |

**Relationships**
- `document` many:1→ `partner`
- `document` many:1→ `user` (uploader)

> **Note:** `organizationId` was removed (3NF fix) — derivable via `partnerId → partner.organizationId`.

**1NF ✅** / **2NF ✅** / **3NF ✅** — All attributes describe one document record directly.

---

### 22. `activityLog`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `activityLogId` | text | **PK** |
| `organizationId` | text | FK → organization.organizationId |
| `userId` | text | FK → user.id |
| `entityType` | text | NOT NULL |
| `entityId` | text | NOT NULL |
| `action` | text | NOT NULL |
| `createdAt` | timestamp | NOT NULL |

**Relationships**
- `activityLog` many:1→ `organization`
- `activityLog` many:1→ `user`

**1NF ✅** — All atomic. `entityType` + `entityId` is a polymorphic reference (one value pair per row, not a list).

**2NF ✅** — Single-column PK.

**3NF ✅** — `entityType` does not determine `action`; all columns describe this one log entry.

---

### 23. `notification`

**Schema**

| Column | Type | Constraint |
|--------|------|------------|
| `notificationId` | text | **PK** |
| `organizationId` | text | FK → organization.organizationId |
| `recipientUserId` | text | FK → user.id |
| `partnerId` | text | FK → partner.partnerId (nullable) |
| `alertType` | text | NOT NULL |
| `title` | text | NOT NULL |
| `message` | text | NOT NULL |
| `severity` | text | default 'info' |
| `read` | boolean | default false |
| `sentViaEmail` | boolean | default false |
| `emailSentAt` | timestamp | nullable |
| `relatedEntityType` | text | nullable |
| `relatedEntityId` | text | nullable |
| `createdAt` | timestamp | NOT NULL |
| `readAt` | timestamp | nullable |

**Relationships**
- `notification` many:1→ `organization`
- `notification` many:1→ `user` (recipient)
- `notification` many:1→ `partner` (optional)

**1NF ✅** — All atomic; `relatedEntityType` + `relatedEntityId` is a single polymorphic pair.

**2NF ✅** — Single-column PK.

**3NF ✅** — `emailSentAt` is a direct fact (when email was sent), not transitively derived from `sentViaEmail`. All columns describe this one notification.

---

## Overall Verdict

| Normal Form | Status |
|-------------|--------|
| **1NF** | ✅ All 22 tables |
| **2NF** | ✅ All 22 tables |
| **3NF** | ✅ All 22 tables (after removing transitive `organizationId` from `contact`, `communication`, `document` in migration `0013`) |
| **4NF** | ✅ All 22 tables |

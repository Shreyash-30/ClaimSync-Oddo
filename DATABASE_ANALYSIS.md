# Database analysis

All models are Mongoose documents using ObjectIds. Default timestamps are `createdAt`/`updatedAt` unless renamed.

| Model | Fields/validation/indexes | References and relationships |
|---|---|---|
| Company | name required; country; base_currency default USD; created_by; timestamps | created_by -> User; 1:N User, Expense, Policy, WorkflowConfig |
| User | required/indexed company ID, name/email; globally unique/indexed email; password hash; role enum ADMIN/EMPLOYEE/MANAGER/FINANCE/CFO; active/verified false; nullable manager/creator | Company; nullable self manager |
| Expense | required user/company/amount/currency/date; conversion values; receipt IDs; status DRAFT/SUBMITTED/REJECTED/APPROVED/SENT_BACK; approval status/step; embedded items, flags, violations, risk, snapshots/history; version; soft delete; user and createdAt-desc indexes | User, Receipt[], Approval[], ExpenseVersion[]; company lacks ref declaration |
| Receipt | required expense/file URL/type/globally unique hash; OCR state/data/raw text/confidence/validation; expense index | Expense; duplicate hash reuses receipt across expenses |
| Approval | required expense/step/role; optional approver/group/due/rule; PENDING/APPROVED/REJECTED/SENT_BACK; final/escalated; indexed expense/approver/status/group | Expense, optional User, opaque group ID |
| WorkflowConfig | company/name required; embedded steps; CFO flag; active; nonunique company+active index | Company; copied into Approval at submission |
| Policy | company/category/maxAmount required; receiptRequired; Hard/Soft | Company; no category uniqueness |
| AuditLog | entity/entity ID/action required; actor; old/new mixed values; append timestamp; composite history index | polymorphic |
| ExpenseVersion | expense/version/snapshot required; unique expense+version | Expense |
| Invite | email/user/token/expiry required; token unique; TTL expiry; used flag | User; no current producer |
| Idempotency | globally unique key/hash/response; 24-hour TTL | operational request record |

## Migration relationship table

| Parent | Cardinality | Child |
|---|---:|---|
| Company | 1:N | User, Expense, Policy, WorkflowConfig |
| User | 1:N | Expense and User (manager hierarchy) |
| Expense | 1:N | Receipt, Approval, ExpenseVersion, audit event |
| WorkflowConfig | 1:N | WorkflowStep |
| ApprovalGroup | 1:N | Approval |

Expense embeds items, flags, violations, finalized OCR values, risk breakdown and approval history; configs embed steps/rules. Use relational child tables for queryable business data (not JSON only).
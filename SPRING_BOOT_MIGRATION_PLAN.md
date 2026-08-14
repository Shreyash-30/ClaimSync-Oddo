# Spring Boot + MySQL migration plan

## Target architecture

Use Spring Boot Web, Validation, Security, Data JPA, Flyway, MySQL, a storage abstraction, and a durable job mechanism (e.g. queue/outbox) for OCR/email. Keep controllers thin; use DTOs and service-layer transactional use cases. Do not expose JPA entities or internal approval snapshots.

## Relational design

Core tables: `company`, `user`, `expense`, `receipt`, `policy`, `workflow_config` (versioned), `workflow_step`, `workflow_step_role`, `approval_group`, `approval_task`, `approval_history`, `expense_item`, `expense_flag`, `expense_violation`, `expense_version`, `audit_event`, `idempotency_record`, `invite`, `password_reset_token`. Use decimal `DECIMAL(19,4)` for money/rates; UTC `TIMESTAMP`; UUID or BIGINT consistently; company foreign key/index on every tenant record. Keep receipt one-to-one with its owning expense; model detected duplicate via relation, not a shared attachment.

JPA: Company 1:N Users/Expenses/Policies/WorkflowConfigs; User self `manager`; Expense 1:N Receipt/ApprovalTask/items/flags/violations/history/versions; WorkflowConfig 1:N steps/roles; ApprovalGroup 1:N tasks. Add `@Version` to Expense and ApprovalTask. Enforce unique `(company_id, category)` policies, one active config using a partial-equivalent strategy or active-version pointer, and idempotency unique `(company_id,key)`.

## Service/controller boundaries

Provide Auth, UserAdministration, Company, Policy, Expense, Receipt/OCR, WorkflowDefinition, ApprovalExecution, Audit and Notification services. Retain current routes/wrapper during compatibility phase, adding DTO validation and standard error responses. Add missing APIs deliberately: expense-by-ID, resubmit/correct returned expense, password reset, change-password UI, audit/history, report/analytics only after requirements are defined.

## Security

Spring Security resource-server-style JWT filter with strong externalized secret/key rotation, expiry/issuer/audience, authentication loaded from active User, tenant-aware authorization, and token invalidation/version on password change. Apply method policies: employee ownership; manager chain/company scope; finance/CFO company scope; admin tenant administration. Store tokens in HttpOnly/Secure/SameSite cookies or mitigate XSS if retaining Bearer local storage. Rate-limit login/reset, enforce password policy, never return/email plaintext temporary passwords, and enable restrictive CORS/TLS.

## Approval implementation

Snapshot the exact workflow version, assignments and rules inside one submit transaction. Require all configured steps to resolve (or explicitly configure fallback). Action transaction locks expense/task/group; validates tenant, active actor, current step and eligibility; computes quorum with `ceil(total*percentage)`; records actor/user/time/comment; transitions tasks to APPROVED/REJECTED/SENT_BACK/CANCELLED distinctly. CFO override must be explicit, authorized and conditioned on the persisted configuration. Implement SLA escalation as scheduled/outbox work.

## Migration and testing

1. Inventory/export Mongo data, map ObjectIds, normalize embedded arrays, validate orphan/duplicate hash/cross-tenant records, and import via reversible staged Flyway/data tooling.
2. Run old/new API contract tests against fixtures; dual-read or compare results before cutover.
3. Unit-test policy/risk/workflow/quorum/status state machine; repository integration tests on MySQL; MVC security/tenant/validation tests; concurrency tests for two approvals; OCR/storage/email integration tests; frontend contract/e2e tests.
4. Observe with structured audit/outbox logs, health/readiness, metrics for OCR/job/approval SLA, backups and rollback plan.

The checked-in `claimsync/` Java project is only a bare Java 17/Spring Boot 4.1 starter with JPA/Security/Web/MySQL dependencies; it is not a viable partial migration and should be replaced or brought to an approved supported Boot version during implementation.
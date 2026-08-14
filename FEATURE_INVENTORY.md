# Feature inventory

| Feature | Purpose and entry point | APIs / entities | Implemented rules |
|---|---|---|---|
| Company registration | Signup page / `POST /auth/signup` creates a tenant and administrator. | Company, User, AuditLog | Name/email/password required; email globally unique; default base currency USD. |
| Login/profile | Login page and persisted React context. | `POST /auth/login`, `GET /auth/me`; User, AuditLog | Active user and bcrypt match required; JWT lasts 7 days. |
| Invite activation | `/activate/:token` page invokes set password. | `POST /auth/set-password`; Invite, User | Valid, unused, unexpired invite and inactive user required. No API creates an invite, so this is currently disconnected. |
| Password change | No surfaced UI; authenticated API only. | `POST /auth/change-password`; User, AuditLog | Current password must match. No strength policy. |
| User administration | Admin Users page. | `POST/GET/DELETE /users`; User, AuditLog | Admin-only route; create validates five roles; generated password is emailed and also returned as `__test_temp_pass`. |
| Company settings | Admin Settings page. | `GET/PUT /company`; Company | Admin-only; partial/missing values can overwrite fields as undefined. |
| Policy management | Admin Policy page. | `GET/POST/DELETE /policies`; Policy | One policy lookup per category at submit; duplicate category policies are allowed; hard missing receipt blocks, other outcomes are flags/violations. |
| Workflow builder | Admin Workflow page. | `GET/POST /workflow-config`; ApprovalWorkflowConfig | Saving deactivates all old configs then creates one; no validation of empty/invalid semantic workflow. UI selects only one role despite schema allowing many. |
| Draft expense | Employee Add Expense page. | `POST /expenses`; Expense, ExpenseVersion, AuditLog | Date cannot be future; amount/currency/date required by schema; converts to process-wide base currency. No positive-amount validation. |
| Edit expense | Employee Edit Expense page. | `GET /expenses`, `PUT /expenses/:id`; Expense, Version, Audit | Only DRAFT status; recalculates rate on amount/currency change. Any authenticated caller can update any known ID. |
| Receipt extraction | Smart Scan before saving. | `POST /receipts/extract` multipart | JPEG/PNG/PDF, <=5 MB; OCR parse returns inferred amount/date/currency/category/items. Stateless and unauthorised for ownership. |
| Receipt upload/reconcile | Submit flow. | `POST /receipts/upload`; Receipt, Expense, Audit | Draft required but not ownership-bound. Exact global duplicate file hash is linked and a violation is added. OCR/reconciliation updates fields and flags. |
| Missing receipt declaration | API only, not used by UI. | `POST /expenses/:id/declaration`; Expense, Version, Audit | Draft only; only one `MISSING_RECEIPT` flag. Reason is not required. |
| Expense submission | Add Expense flow. | `POST /expenses/:id/submit`; Expense, Approval, Version, Audit | Draft only; policy/risk checks; materialises active configured workflow or fallback. No ownership check and no receipt wait. |
| Employee expense tracking | Employee list/dashboard. | `GET /expenses`; Expense, Approval | Lists caller's expenses and derives active parallel/pending-role information. |
| Approval queue/action | Manager/Finance/CFO shared queue. | `GET /approvals/pending`, approve/reject/send-back; Approval, Expense, Audit | Direct assignment or unassigned same-role task; CFO can act on every pending task. Visibility is current-step-only. |
| OCR risk analysis | Triggered on upload/submission. | Analysis, OCR, Parsing, Validation, Reconciliation, Risk services | Luxury >500, 3+ same-day expenses, $45–$50 split-risk, OCR confidence/mismatch/duplicate checks. |
| Idempotency | Axios write interceptor and server middleware. | `X-Idempotency-Key`; Idempotency | Optional; key globally unique, payload hash must match, stored JSON replayed for 24 h. Multipart hash sees empty body before parsing. |
| Static/prototype screens | Reports, Analytics, FinanceDashboard, CfoDashboard, Currency, forgot-password. | None | UI-only mock data or local state; not backend features. |

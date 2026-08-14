# API documentation

Base path: `/api/v1`. JSON responses generally use `{ success, message?, data? }`. POST/PUT can include optional `X-Idempotency-Key`; same key and body replay the saved JSON for 24 hours.

| Method / route | Auth / role | Request | Response and business logic |
|---|---|---|---|
| POST `/auth/signup` | Public | `{name,country?,base_currency?,email,password}` | 201 token, role, company ID; creates Company and ADMIN. |
| POST `/auth/login` | Public | `{email,password}` | JWT and role; active bcrypt-matching account required. |
| POST `/auth/set-password` | Public | `{token,password}` | Activates unused/nonexpired Invite user. |
| POST `/auth/change-password` | Bearer | `{currentPassword,newPassword}` | Validates current password then updates hash. |
| GET `/auth/me` | Bearer | — | User populated with company and manager. |
| POST / GET / DELETE `/users` | ADMIN | creation `{name,email,role,manager_id?}` | Creates active verified user with emailed temporary credentials, lists tenant users, deletes same-company user. |
| GET / PUT `/company` | ADMIN | — / `{name,country,base_currency}` | Reads/updates company metadata. |
| GET / POST / DELETE `/policies` | ADMIN | policy fields / ID | Lists, creates and deletes tenant category policies. |
| GET / POST `/workflow-config` | ADMIN | — / configuration | Reads active/default workflow; deactivates old configs then creates new active config. |
| POST `/expenses` | Bearer | `{amount,currency,category?,date,description?}` | Creates converted DRAFT plus audit/version. |
| GET `/expenses` | Bearer | — | Caller expenses plus derived pending roles/parallel progress. |
| PUT `/expenses/:id` | Bearer | expense fields | Updates DRAFT; ownership is not checked. |
| POST `/expenses/:expenseId/declaration` | Bearer | `{declaration_reason}` | Adds missing receipt flag to DRAFT. |
| POST `/expenses/:id/submit` | Bearer | none | Evaluates policy/risk, materialises approvals, marks SUBMITTED/PENDING/current step 1. |
| POST `/receipts/extract` | Bearer, multipart | `receipt` | Parsed transient OCR fields; JPEG/PNG/PDF <=5 MB. |
| POST `/receipts/upload` | Bearer, multipart | `receipt`, `expense_id` | Links receipt to DRAFT and runs/queues OCR. |
| GET `/approvals/pending` | Bearer | — | Current-step direct/role tasks with group progress. |
| POST `/approvals/:id/approve` | Bearer | `{comment?}` | Advance/group-complete/finalise; CFO force-finalises. |
| POST `/approvals/:id/reject` | Bearer | `{comment?}` | Rejects expense and marks remaining pending tasks SENT_BACK. |
| POST `/approvals/:id/send-back` | Bearer | `{comment?}` | Ends task/workflow as SENT_BACK. |
| GET `/health` | Public, outside base | — | `{status:"OK"}`. |

JWT contains `user_id`, `role`, `company_id`. Middleware verifies only signature/expiry: it does not recheck active account, tenant membership, or revocation. Most service errors lack a status code and become 500; Mongoose validation is 400 and duplicate keys are 409.
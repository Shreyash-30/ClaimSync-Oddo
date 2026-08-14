# Frontend/backend mapping

Axios base URL is `VITE_API_URL` or `http://localhost:3000/api/v1`. It sends Bearer token from localStorage and creates a UUID idempotency key for every POST. React Query consumers expect `res.data.data` except user/policy endpoints as noted below.

| Frontend screen | Calls and expected contract | Compatibility notes |
|---|---|---|
| AuthContext/Login/Signup | login `{email,password}` -> token; signup `{name,country,base_currency:'USD',email,password}` -> token/role; then `/auth/me` populated User | Keep wrapper and field names. Local signup fabricates client user ID/company until refresh. |
| Activate account | set-password `{token,password}` | Invite flow backend is currently orphaned. |
| Add Expense | extract multipart -> `{data:{amount,date,merchant,currency,category,items,description}}`; create -> `{data:_id}`; upload multipart; submit | UI allows no receipt; upload and immediate submit race OCR/reconciliation. |
| Edit/list/dashboard | GET expenses -> `{data:Expense[]}`; PUT expense | No GET by ID; edit downloads list then filters. |
| Approval queue | GET pending -> `{data:Approval[]}` with populated `expense_id.user_id`, `receipt_ids`, history and `group_progress`; POST decision `{comment}` | Same queue component is reused for manager, finance and CFO. |
| Admin users | GET users -> `{data:User[]}`; POST user; DELETE user | UI expects manager population and temporary credentials mail. |
| Admin policy | GET -> `{data:Policy[]}`; POST/DELETE | UI calls max amount in `user.currency`, but AuthContext does not set it. |
| Admin workflow | GET -> `{data:config}`; POST `{name,steps,override_rules}` | UI only allows one role per step though backend supports role arrays. |
| Admin settings | GET/PUT company -> `{data:Company}` | Keep snake_case `base_currency`. |

No frontend calls exist for password change, missing receipt declaration, reports, analytics, currency administration, audit/version history, or a dedicated finance/CFO dashboard. Reports/analytics/finance/cfo/currency and forgot-password are local mock/static UI. Preserve wrapper `{success,data}`, snake_case Mongo fields, route paths, approval populated shapes, and receipt URL behavior to avoid breaking the current SPA.
# Role and permission matrix

| Role | Allowed actions/APIs | Approval capability | Restricted actions |
|---|---|---|---|
| Admin | signup/login/me; tenant user CRUD; company GET/PUT; policy CRUD; workflow GET/POST; technically all authenticated expense/receipt operations | Config may create ADMIN workflow tasks; an ADMIN can action a directly assigned/unassigned ADMIN task | Cannot use admin routes without ADMIN claim; no special global approval override |
| Employee | login/me; create/list/edit/submit expenses; upload/extract/declaration | Can only action an approval if directly assigned (possible only by custom setup) | No admin APIs; no normal manager/finance queue eligibility |
| Manager | login/me; all structurally authenticated expense/receipt APIs; pending queue/actions | Direct employee-manager task; unassigned MANAGER role queue; approve/reject/send back | Admin APIs blocked |
| Finance | same authenticated APIs and approval queue | Direct or unassigned FINANCE tasks | Admin APIs blocked |
| CFO | same authenticated APIs and approval queue | Direct/role task plus unconditional approval override for any PENDING task | Admin APIs blocked; CFO toggle does not restrict override |

Route middleware protects only Admin endpoints. Expense mutation/upload/submit endpoints require authentication but do not check role, ownership, expense company, or manager hierarchy. UI role routes are client-side navigation controls, not server authorization.
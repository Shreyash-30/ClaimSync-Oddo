# Business rules extracted from code

- A signup requires name, email and password; email is globally unique. User creation requires name, email and one of ADMIN/EMPLOYEE/MANAGER/FINANCE/CFO.
- An expense must have amount, currency and date; date cannot be in future. There is no server-side positive amount, currency-format, category or description rule.
- Only DRAFT expenses may be edited, uploaded to, declared missing-receipt, or submitted. Ownership is not checked.
- Conversion uses process environment `BASE_CURRENCY` (USD default), live rate cache for one hour, and conversion snapshot. It fails if the external rate is unavailable with no cache.
- Upload permits JPEG/PNG/PDF at <=5 MB. Exact SHA-256 duplicate is permitted but creates `DUPLICATE_RECEIPT` violation and links the prior receipt.
- OCR low confidence (<.7), missing merchant/amount, date/currency/amount mismatch and duplicate OCR values add flags/violations. Reconciliation can overwrite merchant/category/items/flags on a draft.
- Per-category policy matches case-insensitively. Amount above max is violation for Hard, flag for Soft. Missing required receipt throws only when Hard; Soft missing receipt is added to violations (implementation contradicts label).
- Risk: flags *.2 + violations *.4 + min(baseAmount/10000,1)*.3 + .2 for same-day frequency + .2 for split risk; cap 1. Luxury >500, 3+ same-day expenses, and 45<amount<50 are flags.
- Submission creates all approval tasks, status SUBMITTED/PENDING, current step 1. A workflow can silently omit unassigned steps.
- Reject/send-back terminally affects entire expense. CFO approve force-approves regardless of configured switch. No approval comment is mandatory server-side.
- Idempotency is optional and global by key; same key/different JSON body is conflict; multipart body hash is unreliable because multer has not populated body yet.
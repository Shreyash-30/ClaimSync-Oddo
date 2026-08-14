# Authentication analysis

Login looks up global email, requires `is_active`, compares bcryptjs hash (12 rounds), signs HS JWT with `JWT_SECRET` for 7 days, logs success/failure, and returns token/role. JWT payload is `{user_id,role,company_id}`. Auth middleware accepts `Authorization: Bearer <token>`, verifies signature/expiry, and attaches decoded claims; it does not query User, detect deletion/deactivation, enforce tenant/state, rotate/revoke tokens, or handle claims versioning.

Signup creates a Company and active/verified ADMIN, then immediately returns a JWT. Admin user creation also creates active/verified users and generates a 12-hex-character temporary password, emails it over SMTP, and returns it in `__test_temp_pass`. The mail says change password after login, but no `mustChangePassword` field or enforcement exists.

`POST /auth/change-password` is authenticated and verifies the old password. `POST /auth/set-password` is an invite-activation flow requiring unused, unexpired Invite and inactive user; no active flow creates an Invite. Forgot-password UI merely toggles local state: no reset endpoint, token, email, expiry or audit event exists.

Frontend stores the JWT in `localStorage` (`erms_token` and inside `erms_user`), injects it as Bearer via Axios, refreshes identity through `/auth/me`, and clears `erms_user` (but not always `erms_token`) on logout/401. This is XSS-exposed storage.

Security concerns: development fallback JWT secret; no rate limiting/lockout/password policy/reset implementation; global email identity; tokens remain valid after user deletion/password change; CORS is unrestricted; temporary plaintext password is returned and emailed; SMTP TLS disables certificate validation; no ownership/tenant authorization after authentication.
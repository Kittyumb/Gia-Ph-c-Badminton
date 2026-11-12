# Firestore Security Specification - Gia Phúc Cup 2026

## 1. Data Invariants
- Tournament documents under `/tournaments/{tournamentId}` represent tournament states and live scoring.
- Document IDs must conform to alphanumeric characters and dashes (`^[a-zA-Z0-9_\-]+$`) with a maximum length of 128 characters.
- Public read access is permitted on `/tournaments/{tournamentId}` so that spectators, players, and display screens can follow live match progress without logging in.
- Writes to `/tournaments/{tournamentId}` require either:
  1. Bootstrapped admin (`kittyumbs.tmd.047@gmail.com` with `email_verified == true`).
  2. Registered admin in `/admins/{userId}`.
  3. Authenticated referee/user (`request.auth != null && request.auth.token.email_verified == true`) updating tournament matches/scores.
- System fields like `id` must be immutable and match `{tournamentId}`.
- Payload sizes and string lengths are strictly constrained to prevent resource poisoning attacks.
- `/admins/{userId}` can only be written by existing verified admins or the bootstrapped super admin.

## 2. The "Dirty Dozen" Payloads (Adversarial Tests)

1. **Unauthenticated Write**: An unauthenticated user attempts to overwrite tournament scores. (Must be REJECTED)
2. **Unverified Email Spoof**: A user signs up claiming email `kittyumbs.tmd.047@gmail.com` but with `email_verified == false`. (Must be REJECTED)
3. **Ghost Field Injection**: Attempt to inject extra unexpected fields (e.g. `_isAdmin: true`) into the tournament document. (Must be REJECTED)
4. **ID Poisoning / Massive Path**: Using a 2KB garbage string as `{tournamentId}`. (Must be REJECTED)
5. **ID Mismatch Attack**: Payload contains `id: 'tournament-b'` while writing to path `/tournaments/tournament-a`. (Must be REJECTED)
6. **Denial of Wallet - String Overflow**: Attempt to write a 1MB payload in `name` or `updatedBy`. (Must be REJECTED)
7. **Type Poisoning**: Sending boolean `teams: true` instead of a list/array of teams. (Must be REJECTED)
8. **Admin Self-Promotion**: A non-admin user attempts to create a document in `/admins/{their_uid}` with `role: 'admin'`. (Must be REJECTED)
9. **Arbitrary Collection Root Write**: Attempting to write to `/unauthorized_collection/foo`. (Must be REJECTED by default deny-all)
10. **Admin Escalation on Update**: A non-admin user attempting to change an admin's role to superadmin. (Must be REJECTED)
11. **Negative Version Field**: Attempting to write `v: -999` to corrupt tournament schema version. (Must be REJECTED)
12. **Malformed Match Payload**: Writing empty object `{}` as tournament without required keys `id`, `v`, `teams`, `matches`. (Must be REJECTED)

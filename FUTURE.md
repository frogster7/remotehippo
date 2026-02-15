# Future work – Niche Tech Job Board

Items to implement later. Not in current scope.

---

## 5. Job alerts (email)

**Status:** To do later.

**Goal:** Let job seekers subscribe to alerts (e.g. by role, work type, tech, EU-only). Send a digest email when new jobs match their criteria.

**Suggested approach:**

1. **Data**
   - New table e.g. `job_alert_subscriptions`: `id`, `user_id` (FK → profiles), `role`, `work_type`, `job_type`, `tech`, `eu_timezone_friendly`, `created_at`. Or store a JSON/JSONB “filters” column.
   - RLS: users can only INSERT/UPDATE/DELETE their own rows; no public read needed for subscriptions.

2. **UI**
   - “Create alert” or “Subscribe to alerts” on `/jobs` (when filters are set) or a dedicated `/alerts` page for logged-in job seekers.
   - Manage subscriptions: list, edit, unsubscribe (e.g. on profile or `/alerts`).

3. **Email**
   - Use a transactional email provider (Resend, SendGrid, Supabase Edge + Resend, etc.). No new UI library; call from server action or cron/API route.
   - When to send: cron (e.g. Vercel Cron or external) that runs daily (or weekly), finds new active jobs since last run, then for each subscription with matching filters, build a digest and send one email per subscriber.

4. **Scope**
   - MVP: one subscription per user (one set of filters). Optional later: multiple named alerts per user.

**References:** PROJECT_BRIEF §3.3 (“Subscribe/unsubscribe to job alerts (email later)”); BUILD_LOG “Post-MVP enhancements” for Steps 1–4 already done.

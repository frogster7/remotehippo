---
name: Profile, CV, Navbar, Apply UX
overview: 'Plan for six features: lock profile role, support up to 3 CVs per user, navbar account dropdown (Edit / Sign out), optional CV upload on apply form, company logo on apply form, and a second "Apply" CTA at the bottom of the job detail page.'
todos: []
isProject: false
---

# Profile, CV, Navbar, and Apply UX Improvements

## 1. Lock role (no switching between Job seeker and Employer)

**Current behavior:** [app/profile/profile-form.tsx](app/profile/profile-form.tsx) has radio buttons for "Job seeker" / "Employer" (lines 258–284) and [app/profile/actions.ts](app/profile/actions.ts) `updateProfile` writes `role` to the DB.

**Changes:**

- **Profile form:** Remove the role radio group. Show the current role as read-only text (e.g. "You're registered as a Job seeker" or "Employer account") so the user sees it but cannot change it.
- **Profile action:** Stop accepting/updating `role` in `updateProfile`. Either remove `role` from `ProfileUpdateData` and from the `.update({...})` call, or keep the type but omit `role` when calling Supabase so the column is never changed.
- **Registration:** No change. Role is set once at sign-up in [app/register/register-form.tsx](app/register/register-form.tsx) and company vs user register forms.

---

## 2. Up to 3 CVs per user

**Current state:** Single `cv_file_url` on `profiles` (see [supabase/migrations/006_user_and_company_profiles.sql](supabase/migrations/006_user_and_company_profiles.sql)). [lib/storage.ts](lib/storage.ts) has `uploadCv`; profile actions update one URL.

**Approach:** Add a separate table for multiple CVs and keep profile compatibility during migration.

- **New migration:** Create table `user_cvs` with columns: `id` (uuid, default gen_random_uuid()), `user_id` (uuid, FK to profiles), `storage_path` (text), `display_name` (text, optional), `created_at` (timestamptz). RLS: user can SELECT/INSERT/DELETE own rows. Add check or app logic: max 3 rows per `user_id`.
- **Storage:** Reuse `user-cvs` bucket; path pattern e.g. `{user_id}/{uuid}-{filename}`. Reuse [lib/storage.ts](lib/storage.ts) `uploadCv`-style validation (type, size); add a small helper that uploads and returns path for insertion into `user_cvs`.
- **Profile UI ([app/profile/profile-form.tsx](app/profile/profile-form.tsx)):** For job seekers, replace the single CV block with a list of up to 3 CVs. Each item: display name/link (signed URL from server), delete button. "Add CV" uploads a new file, inserts into `user_cvs`, and refreshes; enforce max 3 (disable "Add" when count is 3).
- **Backfill / compatibility:** Either (a) one-time migration: for each profile with `cv_file_url` set, insert one row into `user_cvs` and then drop `cv_file_url` in a later migration, or (b) keep `cv_file_url` as "primary" and treat `user_cvs` as additional CVs (more complex). Recommended: migrate to `user_cvs` only; new migration copies existing `cv_file_url` into `user_cvs`, then drop column `cv_file_url` and update all reads to use `user_cvs` (and update apply flow to use "one of user_cvs" or form upload).

**Data flow (after migration):**

- Profile page: load CVs from `user_cvs` (and optionally still show a "primary" for backward compatibility if we keep it one step).
- Apply flow: either select one of the saved CVs (from `user_cvs`) or attach a file in the form (see task 4).

---

## 3. Navbar: account icon on the right with Edit and Sign out

**Current:** [app/components/header.tsx](app/_components/header.tsx) and [app/components/header-nav.tsx](app/_components/header-nav.tsx) show text links: Jobs, Saved Jobs, Dashboard (if employer), Profile. No account icon or dropdown.

**Changes:**

- **Desktop:** When logged in, move "Profile" (and optional Dashboard/Saved Jobs) into a dropdown on the right. Right side: "Jobs" link, then an **account icon button** (e.g. `User` from lucide-react) that opens a dropdown with:
  - **Edit** → link to `/profile`
  - **Sign out** → triggers sign out then redirect (same behavior as [app/profile/profile-form.tsx](app/profile/profile-form.tsx) `handleSignOut`: `supabase.auth.signOut()` then `window.location.href = "/"`).
- **Mobile:** In the sheet menu, replace the "Profile" link with the same account icon + dropdown (or a single "Account" row that expands to Edit / Sign out). Alternatively keep "Profile" and add "Sign out" as a separate item; ensure sign-out uses full page redirect so header updates.
- **Implementation:** Add a dropdown component (e.g. Radix DropdownMenu) under `components/ui/dropdown-menu.tsx` (shadcn pattern). Header passes `user` into `HeaderNav`; `HeaderNav` renders the account dropdown only when `user` is present. Sign-out must run in the client (createClient from `@/lib/supabase/client` + `signOut` + `window.location.href = "/"`).
- **Placement:** "All the way to the right" = account icon is the last item in the flex row (after Jobs / Saved Jobs / Dashboard if present), or the only item on the right if we move the other links left of it.

---

## 4. Apply form: attach CV from form (not only from profile)

**Current:** [app/jobs/[slug]/apply/actions.ts](app/jobs/[slug]/apply/actions.ts) requires `profile.cv_file_url`; returns error "Please add a CV in your profile before applying." Form only sends text fields; CV comes from profile.

**Desired:** User can either use a saved CV (from profile / user_cvs) or upload a file in the apply form for this application only.

**Changes:**

- **Apply action:** Accept optional `FormData` or an optional `cv_file` in the payload. If a file is provided: upload it via existing storage helper (e.g. upload to `user-cvs` bucket under `{user_id}/apply-{timestamp}-{filename}`), use returned path as `cv_url` for the application. If no file: require at least one CV source – either one of the user’s saved CVs (from `user_cvs` or legacy `cv_file_url`) or return the existing error. When multiple CVs exist (task 2), accept a chosen `cv_id` or path; otherwise keep current single-CV logic until task 2 is done.
- **Apply form UI ([app/jobs/[slug]/apply/application-form.tsx](app/jobs/[slug]/apply/application-form.tsx)):** Add optional file input (PDF/DOC/DOCX, same as profile). Label: "Use a saved CV from your profile or upload one for this application." If user has saved CVs: show dropdown or radio to pick one, plus "Or upload a different file for this application." If no saved CVs: require file upload (no longer block with "Add a CV in your profile" only – allow upload here). Submit: if file selected, send as multipart or base64; server uploads and uses that path for `applications.cv_url`.
- **Server action signature:** Change to accept `FormData` (or an object that includes optional `cv_file` / `cv_path`) so the client can send the chosen saved CV path or the uploaded file. If sending file, use `FormData` in `handleSubmit` and pass to a server action that reads `formData.get("cv_file")` and uploads if present.

---

## 5. Company logo on application form

**Current:** Apply form ([app/jobs/[slug]/apply/application-form.tsx](app/jobs/[slug]/apply/application-form.tsx)) shows job title and company name in the page header; form card has "Apply for {job.title}" and no logo.

**Changes:**

- **Props:** Form already receives `job` with `job.employer?.company_logo_url`. Pass through if not already.
- **UI:** In the form card (e.g. at the top of the card or next to the title), render the company logo when `job.employer?.company_logo_url` is set: same pattern as job detail page (Image component, or img with appropriate sizing and rounded corners). If no logo, show initials or nothing. Place it so it’s clearly the company for this application (e.g. logo + "Apply for {job.title} at {companyName}").

---

## 6. Job detail page: second "Apply for this job" at the bottom

**Current:** [app/jobs/[slug]/page.tsx](app/jobs/[slug]/page.tsx) has a two-column layout: main column with cards (company intro, description, etc.) and sidebar with [JobApplyCard](app/jobs/[slug]/job-apply-card.tsx) (apply button + share). The last content in the main column is the Description card (around lines 300–311).

**Changes:**

- **Placement:** Below the last card in the **main** column (after the Description card, still inside the `<article>` or the main column wrapper), add a full-width section with a prominent "Apply for this job" CTA.
- **Content:** Reuse the same `applyProps` (applyHref, applyLabel, applyNote). Render a card or bordered block with the same primary button (link to `applyProps.applyHref`) and optionally the same note text. If job is closed, show the same "position filled" message. No need to duplicate Share here; one share in the sidebar is enough.
- **Implementation:** Either inline the button + note in the job page or extract a small presentational component that takes `applyProps` and renders the apply CTA (so sidebar and bottom use the same data). [JobApplyCard](app/jobs/[slug]/job-apply-card.tsx) currently includes Share; the bottom block can be a simpler "Apply" block without Share.

---

## Suggested implementation order

1. **Lock role** – small, isolated change (profile form + action).
2. **Company logo on apply form** – quick UI add.
3. **Second Apply CTA on job detail** – quick layout add.
4. **Navbar account dropdown** – add dropdown component, then header changes; sign-out in dropdown.
5. **Up to 3 CVs** – migration, profile UI, then update apply to "choose one of saved or upload".
6. **Apply form: attach CV** – relax "must have profile CV", add file upload path and optional saved-CV choice; aligns with (5) once multiple CVs exist.

Tasks 2 and 4 are the largest (DB + storage + profile + apply flow). The rest are UI-only or small server tweaks.

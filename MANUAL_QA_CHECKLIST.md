# Manual QA Checklist

Use this checklist against the deployed Vercel URL connected to the intended Supabase project. Test with one Admin account and at least two Judge accounts.

## Test record and fixtures

- Test URL: `____________________________________________`
- Vercel deployment: `__________________________________`
- Supabase project: `____________________________________`
- Tester/date: `_________________________________________`
- Browser/device: `______________________________________`

Create or confirm these test records before testing:

- [ ] Admin account: `admin@example.com`
- [ ] Judge A account: `judge-a@example.com`
- [ ] Judge B account: `judge-b@example.com`
- [ ] Event 1 with status `DRAFT`
- [ ] Event 2 with status `OPEN`
- [ ] Event 3 with status `CLOSED`
- [ ] At least two criteria with different weights, for example `Technique = 60` and `Presentation = 40`
- [ ] At least three contestants with different names, aliases, and character names
- [ ] At least one valid reference image

For every create, update, assignment, score, or delete test:

- [ ] Confirm the success message or visible UI update.
- [ ] Refresh the current page and confirm the result remains.
- [ ] Open the same page in a new browser tab and confirm the result remains.
- [ ] Sign out and sign back in, then confirm the result remains.
- [ ] Confirm the result is visible only to users who should have access.

## Pre-deployment checks

- [ ] `DATABASE_URL` is configured in Vercel for the correct Supabase pooler connection.
- [ ] `DIRECT_URL` is configured if migrations or Prisma CLI commands run during deployment.
- [ ] Supabase database migrations have been applied to the target project.
- [ ] Prisma Client is generated during the install/build process.
- [ ] Required authentication and application environment variables are configured.
- [ ] No development-only database, admin password, or local URL is configured in Vercel.
- [ ] The production build completes successfully.
- [ ] The deployment logs contain no Prisma, migration, or database connection errors.

## Deployment smoke test

- [ ] Open the Vercel URL in an incognito/private window.
- [ ] The application loads without a blank screen or server error.
- [ ] Static assets, styles, icons, and images load correctly.
- [ ] Refreshing `/login`, `/admin`, and `/judge` does not produce a 404.
- [ ] The application uses HTTPS.
- [ ] Browser console has no blocking JavaScript errors.
- [ ] Network requests do not expose database credentials or service-role keys.

## Page: `/login`

### Layout and controls

- [ ] Login form is centered and readable on desktop.
- [ ] Login form is readable at 320px mobile width without horizontal scrolling.
- [ ] Email field has the correct email keyboard/input behavior on mobile.
- [ ] Password field masks the password.
- [ ] Submit button is visible and has a clear loading/disabled state while signing in.
- [ ] Validation messages appear near the relevant fields.

### Authentication behavior

- [ ] Valid Admin credentials sign in and route to `/admin`.
- [ ] Valid Judge credentials sign in and route to `/judge`.
- [ ] Invalid email/password shows a useful error and does not create a session.
- [ ] Empty email is rejected.
- [ ] Invalid email format is rejected.
- [ ] Empty password is rejected.
- [ ] Repeated clicks on Sign in do not submit duplicate requests.
- [ ] After signing out, browser Back does not reveal protected content.
- [ ] Opening `/admin` while logged out redirects to `/login`.
- [ ] Opening `/judge` while logged out redirects to `/login`.

## Page: `/admin`

### Event list

- [ ] Admin sees only the events returned by the application.
- [ ] Each event displays its name, status, and relevant summary information.
- [ ] `DRAFT`, `OPEN`, and `CLOSED` statuses are visually distinguishable.
- [ ] Event cards/rows link to the correct `/admin/events/:id` page.
- [ ] Empty state is shown when no events exist.
- [ ] Event list remains correct after a full page refresh.

### Create event

- [ ] Open the create-event dialog.
- [ ] Event name is required.
- [ ] Whitespace-only event names are rejected.
- [ ] Create an event with a normal name and confirm it appears in the list.
- [ ] Cancel the dialog and confirm no event was created.
- [ ] Close the dialog with its close control and confirm unsaved input is discarded or handled as designed.
- [ ] Double-clicking Create does not create duplicate events.
- [ ] The newly created event persists after refresh, new tab, and re-login.

## Page: `/admin/users`

### User list

- [ ] Admin can open the user-management page.
- [ ] Existing users display the expected full name, email, and role.
- [ ] Roles are clearly labeled as `ADMIN` or `JUDGE`.
- [ ] The seeded/protected admin account cannot be removed.
- [ ] The page has a useful empty/loading/error state.

### Create a Judge account

- [ ] Open `+ New account`.
- [ ] Enter a full name.
- [ ] Enter a valid email address.
- [ ] Enter a temporary password with at least 8 characters.
- [ ] Select `Judge` as the role.
- [ ] Submit the form once and confirm exactly one Judge is created.
- [ ] Confirm the new Judge appears in the user list with the correct email and role.
- [ ] Confirm the new Judge can sign in using the created credentials.
- [ ] Confirm the new Judge is initially not assigned to any event unless assignment is part of the setup.
- [ ] Confirm the account remains after refresh, new tab, and Admin re-login.

### Create an Admin account

- [ ] Create a second account with the `Admin` role.
- [ ] Confirm it appears as `ADMIN` in the user list.
- [ ] Confirm it can sign in and access `/admin`.
- [ ] Confirm it cannot access Judge-only scoring data unless the application explicitly permits it.

### User validation and removal

- [ ] Full name is required.
- [ ] Invalid email format is rejected.
- [ ] Password shorter than 8 characters is rejected.
- [ ] Duplicate email is rejected with a clear error.
- [ ] Canceling the modal does not create a user.
- [ ] Remove a non-protected Judge and confirm the confirmation prompt appears.
- [ ] Cancel the removal and confirm the user remains.
- [ ] Confirm the removal and verify the user disappears from the list.
- [ ] Confirm the removed user can no longer sign in.
- [ ] Refresh and re-login to confirm the removal persisted.

## Page: `/admin/events/:id` — general layout

- [ ] Event name and current status are visible.
- [ ] Criteria, Contestants, Judges, and Results tabs are present.
- [ ] Switching tabs loads the correct content without showing another event's data.
- [ ] Directly refreshing a tab URL preserves the event and active tab state as designed.
- [ ] An invalid event ID shows a controlled not-found/error state.
- [ ] Non-admin users cannot access this admin event-management page.

## Event detail — Criteria tab

### Create criteria

- [ ] Open the Criteria tab for Event 1.
- [ ] Enter a criterion name.
- [ ] Enter a numeric weight.
- [ ] Create `Technique = 60` and `Presentation = 40`.
- [ ] Confirm both criteria appear with the correct names and weights.
- [ ] Confirm the displayed total weight is `100`.
- [ ] Confirm criteria order is stable after refresh.
- [ ] Confirm criteria persist after new tab and re-login.

### Criteria validation and deletion

- [ ] Empty criterion name is rejected.
- [ ] Whitespace-only criterion name is rejected.
- [ ] Missing weight is rejected.
- [ ] Zero or negative weight is rejected.
- [ ] Non-numeric weight is rejected.
- [ ] Confirm duplicate or invalid criteria are not silently created.
- [ ] Delete a criterion only after confirming the intended confirmation behavior.
- [ ] Confirm the deleted criterion is removed after refresh.
- [ ] Confirm score forms/results handle the changed criterion set correctly.

## Event detail — Contestants tab

### Create contestant

- [ ] Open the Contestants tab.
- [ ] Enter contestant name.
- [ ] Enter alias.
- [ ] Enter character name.
- [ ] Select a supported JPG, PNG, WebP, or GIF reference image.
- [ ] Create the contestant and confirm the correct number, name, alias, character, and image preview appear.
- [ ] Create at least three contestants and confirm numbering is stable and unique.
- [ ] Confirm each contestant persists after refresh, new tab, and re-login.

### Contestant validation and deletion

- [ ] Required contestant fields show validation errors when empty.
- [ ] Unsupported file types are rejected.
- [ ] Oversized images are rejected or clearly warned according to the product rule.
- [ ] Canceling contestant creation does not create a record.
- [ ] Delete one contestant and confirm the confirmation prompt appears.
- [ ] Cancel deletion and confirm the contestant remains.
- [ ] Confirm deletion and verify the contestant no longer appears after refresh.
- [ ] Confirm deleted contestant data does not appear in the Judge scoring page.

## Event detail — Judges tab

### Assign a Judge

- [ ] Open the Judges tab for Event 2.
- [ ] Assign Judge A to Event 2.
- [ ] Confirm Judge A appears in the assigned-judges list.
- [ ] Confirm Judge A can see Event 2 on `/judge`.
- [ ] Confirm Judge A can open Event 2 scoring.
- [ ] Assign Judge B and confirm both judges appear.
- [ ] Confirm assigning the same Judge twice does not create a duplicate assignment.
- [ ] Confirm assignments persist after refresh, new tab, and re-login.

### Remove a Judge

- [ ] Remove Judge B from Event 2.
- [ ] Confirm Judge B disappears from the assigned list.
- [ ] Confirm Event 2 no longer appears for Judge B after re-login.
- [ ] Confirm Judge B cannot open Event 2 scoring directly by URL.
- [ ] Confirm Judge A still retains access.

## Event detail — Status and Results tabs

### Status changes

- [ ] Change Event 1 from `DRAFT` to `OPEN`.
- [ ] Confirm the new status is visible immediately.
- [ ] Refresh and confirm the status remains `OPEN`.
- [ ] Change Event 1 to `CLOSED` and confirm the state persists.
- [ ] Verify the intended scoring behavior for a closed event: scoring is either blocked or explicitly allowed by product requirements.
- [ ] Confirm status changes are isolated to the selected event.

### Results

- [ ] Open Results as Admin and confirm the leaderboard renders with the expected event.
- [ ] Confirm results use the configured criteria weights.
- [ ] Confirm contestants with no scores are handled clearly.
- [ ] Confirm ties are handled consistently.
- [ ] Refresh Results and confirm values do not change unexpectedly.
- [ ] Confirm a Judge cannot access admin-only results unless explicitly authorized by product requirements.

## Page: `/judge`

- [ ] Judge sees only events to which that Judge is assigned.
- [ ] Unassigned events are not shown.
- [ ] Event status is visible.
- [ ] Draft/closed event behavior matches the product rules.
- [ ] Each event opens the correct scoring page.
- [ ] Empty state is shown when the Judge has no assignments.
- [ ] The list remains correct after refresh, new tab, and re-login.
- [ ] Direct navigation to an unassigned event does not expose its contestants, criteria, or scores.

## Page: `/judge/score/:id`

### Scoring layout

- [ ] Event name and scoring context are correct.
- [ ] Every assigned criterion is shown exactly once.
- [ ] Every contestant is shown exactly once.
- [ ] Contestant name, alias, character, and reference image match the admin data.
- [ ] Score inputs are associated with the correct contestant and criterion.
- [ ] Score range is 0–100.
- [ ] Score step supports the intended half-point values, such as `87.5`.
- [ ] No horizontal scrolling is required on a desktop viewport.
- [ ] On mobile, the scoring table remains usable through responsive layout or intentional horizontal scrolling.
- [ ] Long contestant names and criteria do not overlap controls.

### Enter and save scores

- [ ] Enter scores for every contestant/criterion combination.
- [ ] Confirm the progress indicator reflects completed score cells.
- [ ] Enter a boundary score of `0`.
- [ ] Enter a boundary score of `100`.
- [ ] Enter a half-point score such as `72.5`.
- [ ] Reject negative scores.
- [ ] Reject scores above `100`.
- [ ] Reject invalid text or malformed numeric input.
- [ ] Save scores once and confirm a success state/message.
- [ ] Refresh and confirm every saved score remains in the correct cell.
- [ ] Open a new tab and confirm the same saved scores.
- [ ] Sign out and back in as the same Judge and confirm the scores remain.
- [ ] Save again after changing one score and confirm only the intended value changes.
- [ ] Repeated Save clicks do not duplicate or corrupt scores.
- [ ] Simulate a slow/failing request if possible and confirm the UI does not falsely report success.

### Judge isolation

- [ ] Judge A cannot view or edit Judge B's private score data unless the product explicitly requires shared scores.
- [ ] Judge A cannot submit scores for an event to which Judge A is not assigned.
- [ ] Changing the event ID in the URL does not bypass assignment checks.
- [ ] The scoring page does not expose another event's contestants or criteria through browser network responses.

## Persistence and data integrity

- [ ] New users persist in Supabase and remain available after deployment refreshes.
- [ ] New events persist with the correct status.
- [ ] Criteria names and weights persist without rounding or type changes.
- [ ] Contestant metadata and image URLs persist and reload correctly.
- [ ] Judge/event assignments persist and remain isolated by event.
- [ ] Scores persist with the correct Judge, event, contestant, and criterion relationships.
- [ ] Updating one record does not overwrite another record.
- [ ] Deleting a contestant, criterion, or Judge produces the intended cascade/restriction behavior.
- [ ] Refreshing during a loading state does not create duplicate records.
- [ ] Logging in from a second browser does not show stale authorization after assignment/removal changes.
- [ ] Database errors are shown as useful application errors and do not expose connection strings.

## Authorization and negative tests

- [ ] Logged-out users cannot access Admin pages.
- [ ] Logged-out users cannot access Judge pages.
- [ ] A Judge cannot create, delete, or modify users.
- [ ] A Judge cannot create, delete, or modify events.
- [ ] A Judge cannot create or delete criteria or contestants.
- [ ] A Judge cannot assign or remove Judges.
- [ ] A Judge cannot call admin-only result endpoints successfully.
- [ ] A Judge cannot read another event by changing the URL or request ID.
- [ ] A removed Judge loses access after the next authenticated request/session refresh.
- [ ] API errors do not reveal Prisma stack traces, database hosts, passwords, or service keys.

## Responsive and browser matrix

Run the relevant checks on each page below:

| Page | Desktop | Tablet | Mobile | Required checks |
|---|---|---|---|---|
| `/login` | [ ] | [ ] | [ ] | Form centered, fields usable, errors readable, no horizontal scroll |
| `/admin` | [ ] | [ ] | [ ] | Event cards/list fit, create dialog fits, status remains visible |
| `/admin/users` | [ ] | [ ] | [ ] | User rows do not clip, create-account modal fits, role/actions usable |
| `/admin/events/:id` Criteria | [ ] | [ ] | [ ] | Tabs usable, weights readable, add/delete controls accessible |
| `/admin/events/:id` Contestants | [ ] | [ ] | [ ] | Metadata readable, image picker usable, rows do not overlap |
| `/admin/events/:id` Judges | [ ] | [ ] | [ ] | Assign/remove controls accessible, long emails wrap safely |
| `/admin/events/:id` Results | [ ] | [ ] | [ ] | Leaderboard readable, columns do not hide rankings or scores |
| `/judge` | [ ] | [ ] | [ ] | Assigned-event cards fit, empty state readable, actions tappable |
| `/judge/score/:id` | [ ] | [ ] | [ ] | Score cells usable, images scale, Save button remains reachable |

Recommended viewport checks:

- [ ] 320 × 667
- [ ] 375 × 812
- [ ] 768 × 1024
- [ ] 1280 × 800
- [ ] 1440 × 900

Test at least two browsers, including Chromium/Chrome and one of Edge, Firefox, or Safari. Confirm keyboard navigation, visible focus states, and touch targets on mobile.

## Release sign-off

- [ ] All critical authentication tests pass.
- [ ] User creation and removal tests pass.
- [ ] Event, criteria, contestant, and Judge assignment tests pass.
- [ ] Judge scoring and score persistence tests pass.
- [ ] Results calculations and authorization tests pass.
- [ ] Responsive checks pass on every listed page.
- [ ] No blocking browser-console errors remain.
- [ ] No secrets or database connection details are exposed to the browser.
- [ ] Any failed test has an issue link and an owner.

Release decision: `PASS / PASS WITH KNOWN ISSUES / FAIL`

Tester signature: `______________________________`

Date: `__________________`

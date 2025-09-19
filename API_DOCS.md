# EyeCare Backend API Documentation

This document describes all available endpoints, request/response formats, authentication, and how to run the backend locally.

---

## Quick Start

1. Prerequisites
   - Node.js v16+
   - MongoDB (local or Atlas)
2. Create `.env` in project root:
   ```ini
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/eyecare
   JWT_SECRET=replace-with-a-strong-secret
   JWT_EXPIRES_IN=1h
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   node app.js
   ```
5. Health check:
   - GET http://localhost:3000/api → "✅ API is running"

Notes
- Base URL: `http://localhost:3000/api`
- Auth: Most routes under `/user`, `/info`, `/training`, `/forum`, `/eyeCareRoutineReminder` require JWT in `Authorization: Bearer <token>`.
- Public routes: `/api/`, `/api/auth/*`, `/api/eye-care/*`.

---

## Authentication (Public)

- POST `/api/auth/register`
  - Body: `{ email, password, userName, country, timezone, language }` (language required)
  - Response 201:
    ```json
    {
      "success": true,
      "message": "OTP sent to your email",
      "messageCode": 200,
      "data": {
        "user": { "id": "<id>", "email": "<email>" }
      }
    }
    ```
  - Notes: server sets a default avatar at `photoUrl` (DEFAULT_AVATAR_URL or `/uploads/default.png`).

- POST `/api/auth/verify-otp`
  - Body: `{ email, code }`
  - Response 200:
    ```json
    {
      "success": true,
      "message": "Verification successful",
      "messageCode": 200,
      "data": {
        "user": { "id": "<id>", "email": "<email>" },
        "token": "<JWT>"
      }
    }
    ```

- POST `/api/auth/resend-otp`
  - Body: `{ email }`
  - Response 201: `{ "success": true, "message": "OTP resent", "data": { "email": "<email>" } }`

- POST `/api/auth/login`
  - Body: `{ email, password, language }` (language required; updates stored language)
  - Response 202: `{ success: true, message: "Login successful", data: { user, token } }`
  - If the account is not verified: 403 with message `Please verify your email`.

- POST `/api/auth/change-password`
  - Body: `{ email, oldPassword, newPassword }`
  - Response 203: `{ success: true, message: "Password updated successfully" }`

- POST `/api/auth/firebase`
  - Body: `{ idToken: string, provider?: "google"|"apple"|"facebook", language }` (language required)
  - Response 200:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "messageCode": 200,
      "data": {
        "user": { "id": "<id>", "email": "<email>" },
        "token": "<JWT>"
      }
    }
    ```
  - Errors: 400 invalid body, 401 invalid/expired idToken, 501 server not configured
  - Notes: if the provider doesn't supply a picture, server sets the default avatar.

Avatar
- PUT `/api/user/avatar` (JWT required)
  - Headers: `Authorization: Bearer <token>`
  - Content-Type: `multipart/form-data`
  - Body: field `avatar` = image file (jpeg/png/webp, max 5MB)
  - Response 200: `{ success: true, data: { photoUrl } }`
  - Static files: `/uploads/**` are publicly served. Set `PUBLIC_BASE_URL` to get absolute URLs in responses.

---

## User (JWT required)

- GET `/api/user/name`
- GET `/api/user/profile`
  - Response 200:
    ```json
    { "success": true, "data": { "user": { /* user without password */ } } }
    ```

- PUT `/api/user/userName`
  - Body: `{ userName }`
  - Response 200: `{ success: true, message: "Profile updated successfully" }`

- PUT `/api/user/email`
  - Body: `{ email }`
  - Response 200: `{ success: true, message: "Profile updated successfully" }`

- PUT `/api/user/subscription`
  - Body: `{ plan: "free|standard|premium", period: "monthly|yearly" }`
  - Rules: `standard` only supports `monthly`; `premium` supports `monthly|yearly`. Server sets `expiresAt` to +1 month (monthly) or +12 months (yearly). When expired, backend auto-downgrades to `free` on next auth/profile call.
  - Response 200: `{ success: true, data: { subscription }, message: "Profile updated successfully" }`

- DELETE `/api/user/deleteAccount`
  - Response 200: `{ success: true, message: "Profile deleted successfully" }`

- PUT `/api/user/setLanguage`
  - Body: `{ language }`
- PUT `/api/user/cloudDevices`
  - Body: `{ syncAcrossDevices, enableCloudBackup }`
- PUT `/api/user/privacyData`
  - Body: `{ consentPersonalDataProcessing, consentToAnonymousDataCollection }`
- PUT `/api/user/countryTimezone`
  - Body: `{ country, timezone }`
- POST `/api/user/interest`
  - Body: `{ firstName, lastName?, emailAddress, country? }`
- POST `/api/user/feedback`
  - Body: `{ rating, feedbackSubject, description, email }`

All above return `{ success: true, message: "Profile updated successfully" }` (or similar) on success.

---

## Info (JWT required)

- GET `/api/info/:slug`
  - Response 200:
    ```json
    { "success": true, "message": "Information retrieved", "data": { "content": "..." } }
    ```

---

## Eye-care (Public)

- GET `/api/eye-care/`
  - Response: "✅ Eye Care API is running"

OSDI
- POST `/api/eye-care/osdi`
  - Body: `{ email, score, severity }`
  - Response 201: `{ success: true, message: "OSDI result saved" }`
- GET `/api/eye-care/osdi/:email`
  - Response 200: `{ success: true, message: "OSDI history retrieved", data: [ { email, score, severity, date, _id } ] }`
- DELETE `/api/eye-care/osdi/:email/:id`
  - Response 200: `{ success: true, message: "OSDI test deleted" }`

Generated results
- POST `/api/eye-care/osdi-generate-result`
  - Body: `{ Q1..Q12 }` (values 0–4 or 'N/A')
  - Response 200: `{ success: true, data: { osdiScore:number, result:"Normal|Mild|Moderate|Severe" } }`
- POST `/api/eye-care/dry-eye-product-finder-result`
  - Body: `{ Q1..Q20 }` (values like 'A'|'B'|'C'|'D')
  - Response 200: `{ success: true, data: { primary, secondary, score } }`
- POST `/api/eye-care/demodex-risk-check`
  - Body: `{ Q1..Q7 }` (boolean)
  - Response 200: `{ success: true, data: <numberOfTrues> }`

Blink
- POST `/api/eye-care/blink`
  - Body: `{ email, duration:number }`
  - Response 201: `{ success: true, message: "Blink result saved" }`
- GET `/api/eye-care/blink/:email`
  - Response 200: `{ success: true, message: "Blink history retrieved", data: [ { email, duration, date, _id } ] }`

Eye routine status (use these routine codes)
```
BLINK_TRAINING | EYE_DROP_TIMER | 20_20_20_TIMER | WARM_COMPRESS | EYE_CLEANING | LAUGH_EXERCISE
```
- POST `/api/eye-care/status/<ROUTINE>`
  - Body: `{ email, completed:boolean }`
  - Response 200: `{ success: true, message: "Routine status updated" }`
- GET `/api/eye-care/status/<ROUTINE>?email=...`
  - Response 200: `{ success: true, message: "Routine status retrieved", data: { completed:boolean } }`
- GET `/api/eye-care/ogonstatus/:email`
  - Response 200: `{ success: true, message: "Daily status retrieved", data: { <ROUTINE>: boolean, ... } }`
- GET `/api/eye-care/ogonstatus/extended/:email`
  - Response 200: `{ success: true, message: "Extended status retrieved", data: { <ROUTINE>: { done:number, goal:number }, ... } }`

---

## Eye Routine Reminders (JWT required)

- POST `/api/eyeCareRoutineReminder/createReminder`
  - Body:
    ```json
    {
      "repeatReminder": [1,2,3,4,5,6,7],
      "time": "HH:mm",
      "instructions": "optional",
      "type": "BLINK_TRAINING",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD"
    }
    ```
  - Response 200: `{ success: true, message: "Eye Routine Reminder added successfully", data: { ...reminder } }`

- POST `/api/eyeCareRoutineReminder/getReminder`
  - Body: `{ type }`
  - Response 200:
    ```json
    {
      "success": true,
      "message": "Eye Routine Reminder fetch successfully",
      "data": { "reminders": [/*...*/], "isComplete": false }
    }
    ```

- DELETE `/api/eyeCareRoutineReminder/deleteReminder/:id`
  - Response 200: `{ success: true, message: "Eye Routine Reminder deleted successfully" }`

- POST `/api/eyeCareRoutineReminder/updateReminderStatus`
  - Body: `{ type, isComplete:boolean }`
  - Response 200: `{ success: true, message: "Eye Routine Reminder updated successfully" }`

---

## Training (JWT required)

Important: The training router includes `api/...` in its internal paths and is mounted at `/api/training`. This results in final URLs like `/api/training/api/...`.

Goals
- GET `/api/training/api/goals/training/:email` → resets goals to defaults
  - Response 200: `{ success: true, message: "Training goals reset", data: [ goals ] }`
- POST `/api/training/api/goals/training/save`
  - Body: `[ { email, routine, targetPerWeek }, ... ]`
  - Response 200: `{ success: true, message: "Training goals saved" }`

Routine goals (generic)
- GET `/api/training/api/routine-goals?email=...`
  - Response 200: `{ success: true, message: "Training goals retrieved", data: [ ... ] }`
- POST `/api/training/api/routine-goals`
  - Body: `[ { email, routine, type: "training", targetPerWeek }, ... ]`
  - Response 200: `{ success: true, message: "Training goals saved" }`

Weekly/extended status
- GET `/api/training/api/trainingstatus/extended/:email?date=YYYY-MM-DD`
  - Response 200: `{ success: true, message: "Extended training status retrieved", data: { hemmapass:{done,goal}, promenad:{...}, styrketraning:{...} } }`

Routine entries (per day)
- POST `/api/training/api/entry/training`
  - Body: `{ email, routine, date? }`
  - Response 201: `{ success: true, message: "Training entry created" }`
- DELETE `/api/training/api/entry/training`
  - Body: `{ email, routine, date }`
  - Response 200: `{ success: true, message: "Training entry deleted" }`

Training log (per day flags)
- POST `/api/training/api/status/training`
  - Body: `{ email, date?, routine, completed:boolean }`
  - Response 200: `{ success: true, message: "Training status updated" }`
- GET `/api/training/api/status/training?email=...&date=YYYY-MM-DD`
  - Response 200: `{ success: true, message: "Training status retrieved", data: { email, date, routines: { ... } } }` (or `{}`)

Weekly goals
- POST `/api/training/api/weekly-goal`
  - Body: `{ email, trainingDays:number, eyeRoutineDays:number }`
  - Response 200: `{ success: true, message: "Weekly goal updated", data: { ... } }`
- GET `/api/training/api/weekly-goal?email=...`
  - Response 200: `{ success: true, message: "Weekly goal retrieved", data: { ... } }`

Progress counters
- POST `/api/training/api/routine-progress/increment`
  - Body: `{ email, routine }`
  - Response 200: `{ success: true, message: "Progress incremented", data: { email, routine, date, completedCount } }`
- POST `/api/training/api/routine-progress/decrement`
  - Body: `{ email, routine }`
  - Response 200: `{ success: true, message: "Progress decremented", data: { email, routine, date, completedCount } }`
- GET `/api/training/api/routine-progress/status?email=...&date=YYYY-MM-DD`
  - Response 200: `{ success: true, message: "Progress status retrieved", data: [ { routine, targetPerDay, completedCount }, ... ] }`

---

## Forum (JWT required)

The forum router also embeds `api/forum/...` and is mounted at `/api/forum`, resulting in final URLs like `/api/forum/api/forum/...`.

Posts
- POST `/api/forum/api/forum/posts`
  - Body: `{ text, imageUrl?, authorName?, authorId? }` (`authorId` can be user email to derive name)
  - Response 201: `{ success: true, message: "Post created", data: post }`
- GET `/api/forum/api/forum/posts`
  - Response 200: `{ success: true, message: "Posts retrieved", data: [ posts ] }`
- GET `/api/forum/api/forum/posts/:postId`
  - Response 200: `{ success: true, message: "Post retrieved", data: post }`
- POST `/api/forum/api/forum/posts/:postId/comments`
  - Body: `{ text, authorName?, authorId? }`
  - Response 200: `{ success: true, message: "Comment added", data: post }`
- PUT `/api/forum/api/forum/posts/:postId`
  - Body: `{ authorId, text, imageUrl }` (only author can update)
  - Response 200: `{ success: true, message: "Post updated", data: post }`
- DELETE `/api/forum/api/forum/posts/:postId`
  - Body: `{ authorId }` (only author can delete)
  - Response 200: `{ success: true, message: "Post deleted" }`

Uploads
- POST `/api/forum/api/forum/upload` (multipart/form-data, field: `image`)
  - Response 200: `{ success: true, message: "Image uploaded", data: { imageUrl: "/uploads/<file>" } }`
- GET `/api/forum/uploads/<file>` → serves static files

---

## Known Quirks & Tips

- Training and Forum routes include `api/...` inside their routers and are mounted under `/api`, yielding paths like `/api/training/api/...` and `/api/forum/api/forum/...`. They work as documented above; for cleaner URLs consider removing the extra `api` segments in those route files.
- `utils/OSDICalculator.js` uses ESM syntax (`export function ...`) while the project uses CommonJS (`require`). If you see an error like `Unexpected token 'export'`, convert it to CommonJS, e.g.:
  ```js
  // utils/OSDICalculator.js
  function calculateOsdiResult(answers) { /* ...same logic... */ }
  module.exports = { calculateOsdiResult };
  ```
- `config/jwt.js` references `config.JWT_SECRET` but does not import `config` and is not used elsewhere; prefer using `process.env.JWT_SECRET` as in controllers.
- Prefer `app.js` as the entry point. `server.js` is a legacy standalone server with overlapping routes and should be removed to avoid confusion.

---

## Example: Auth then call a protected route

```bash
# Register
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"P@ssw0rd","userName":"Test","country":"SE","timezone":"Europe/Stockholm"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"P@ssw0rd"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data.token))")

# Get profile
curl -s http://localhost:3000/api/user/profile -H "Authorization: Bearer $TOKEN"
```

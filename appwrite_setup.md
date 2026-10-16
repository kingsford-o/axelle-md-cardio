# Appwrite Setup & Migration Guide

This project has been migrated from Supabase to **Appwrite**.

## 1. Environment Variables Configuration

Copy `.env.example` or update `client/.env`:

```env
VITE_API_URL=http://localhost:4000

# Appwrite Cloud or Self-Hosted Configuration
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=axelle_cardio

# Collections (Default IDs)
VITE_APPWRITE_COLLECTION_PROFILES=profiles
VITE_APPWRITE_COLLECTION_JOURNAL=journal_entries
VITE_APPWRITE_COLLECTION_CHALLENGES=challenges_progress
VITE_APPWRITE_COLLECTION_LESSONS=lessons_progress
VITE_APPWRITE_COLLECTION_QUIZ=quiz_results
VITE_APPWRITE_COLLECTION_HEART_RATE=heart_rate_logs
```

> **Note:** If `VITE_APPWRITE_PROJECT_ID` is left blank, the app will automatically run using its built-in local offline mock client with localStorage persistence so that development and testing never crash!

---

## 2. Setting Up in Appwrite Console

1. **Create a Project**:
   - Go to [Appwrite Cloud Console](https://cloud.appwrite.io/) (or your self-hosted console).
   - Create a project named `axelle-cardio`.
   - Add a **Web App** platform with your domain:
     - Local development: `localhost` or `http://localhost:5174`

2. **Enable Email/Password & OAuth**:
   - Under **Auth** > **Settings**:
     - Enable **Email/Password**
     - Optional: Enable **Google OAuth** and set redirect to your app origin (`http://localhost:5174`)

3. **Create Database**:
   - Under **Databases** > **Create Database**:
     - Database ID: `axelle_cardio`
     - Database Name: `Axelle Cardio Telemetry Database`

4. **Create Collections & Attributes** (See [`appwrite_schema.json`](./appwrite_schema.json) for full JSON definition):

### `profiles` Collection
* **Permissions**: Add `Any` or `Users` (`create`, `read`, `update`, `delete`).
* **Attributes**:
  * `userId`: String (size 36, required)
  * `email`: String (size 255, required)
  * `fullName`: String (size 255, optional)
  * `phone`: String (size 32, optional)
  * `avatarUrl`: String (size 1000, optional)
  * `age`: Integer (optional, min: 1, max: 130)
  * `gender`: String (size 30, optional)
  * `activityLevel`: String (size 50, optional)
  * `points`: Integer (optional, default: 100)
  * `streak`: Integer (optional, default: 1)
  * `lastActive`: Datetime (optional)
* **Indexes**:
  * `userId_unique`: Unique index on `userId`
  * `email_idx`: Key index on `email`

### `journal_entries` Collection
* **Attributes**:
  * `userId`: String (size 36, required)
  * `mood`: String (size 50, required)
  * `symptoms`: String (size 500, optional)
  * `activity`: String (size 255, optional)
  * `notes`: String (size 2000, optional)
  * `date`: String (size 50, optional)
* **Indexes**:
  * `userId_idx`: Key index on `userId`

### `challenges_progress` Collection
* **Attributes**:
  * `userId`: String (size 36, required)
  * `challengeId`: String (size 50, required)
  * `completed`: Boolean (default: false)
  * `completedAt`: Datetime (optional)
* **Indexes**:
  * `userId_challenge_unique`: Unique index on `userId`, `challengeId`

### `lessons_progress` Collection
* **Attributes**:
  * `userId`: String (size 36, required)
  * `lessonId`: Integer (required)
  * `completed`: Boolean (default: false)
  * `completedAt`: Datetime (optional)
* **Indexes**:
  * `userId_lesson_unique`: Unique index on `userId`, `lessonId`

### `quiz_results` Collection
* **Attributes**:
  * `userId`: String (size 36, required)
  * `quizId`: Integer (required)
  * `score`: Integer (required)
  * `totalQuestions`: Integer (required)

### `heart_rate_logs` Collection
* **Attributes**:
  * `userId`: String (size 36, required)
  * `bpm`: Integer (required)
  * `category`: String (size 50, optional, default: "resting")
  * `recordedAt`: Datetime (optional)

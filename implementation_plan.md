# A-Note Academy Implementation Plan

AI learning platform combining Udemy's systematic courses with note's article-style distribution.

## Proposed Changes

### Database Setup (Supabase)

Create the following tables in the `public` schema:

#### `profiles`
- `id` (uuid, primary key)
- `email` (text, unique)
- `is_approved` (bool, default: false)
- `role` (text) - either 'admin' or 'user'

#### `courses`
- `id` (uuid, primary key)
- `title` (text)
- `description` (text)
- `price` (int)
- `thumbnail_url` (text)

#### `lessons`
- `id` (uuid, primary key)
- `course_id` (uuid, foreign key to `courses.id`)
- `title` (text)
- `content` (text/markdown)
- `video_url` (text)

#### `purchases`
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to `auth.users.id`)
- `course_id` (uuid, foreign key to `courses.id`)
- `status` (text) - 'pending' or 'completed'

### Phase 1: Admin Dashboard

- **Location**: `/admin`
- **Functionality**:
    - Middleware to protect `/admin` routes (check `profiles.role === 'admin'`).
    - Fetch and display `purchases` with `status === 'pending'`.
    - Button to approve:
        1. Set `purchases.status` to 'completed'.
        2. Set `profiles.is_approved` to `true` for the corresponding user.

### Phase 2: Content Protection (RLS)

- Enable RLS on all tables.
- `lessons` table policy:
    - `SELECT`: Only allow if user has a `purchases` record with `status === 'completed'` for the parent `course_id`.

### Phase 3: Course & Lesson UI

- **Homepage (`/`)**:
    - Grid of `courses` cards showing title, price, and thumbnail.
- **Course Detail (`/courses/[id]`)**:
    - Course description and list of lessons.
- **Lesson Page (`/lessons/[id]`)**:
    - Markdown renderer for `content`.
    - Video player for `video_url`.
    - Protected by RLS (Phase 2).

## Tech Stack Details
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, shadcn/ui.
- **Backend**: Supabase Auth & DB.
- **Payment**: Square SDK (integrated for flow, though manual approval is the current focus).

## Verification Plan

### Automated Tests
- Verification of RLS policies via Supabase CLI or SQL tests.
- UI component testing (optional, manual check first).

### Manual Verification
- Login as Admin and User.
- Create a purchase as User -> Verify Admin sees it.
- Approve as Admin -> Verify User can access lesson content.
- Try to access lesson content without purchase -> Verify RLS blocks it.

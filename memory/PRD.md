# NextGen Learning - Product Requirements Document

## Overview
NextGen Learning is a modern online education platform for students in Classes 6-12 (CBSE/ICSE/State Boards) offering premium 1-on-1 mentorship.

## Course Structure & Pricing (Updated Dec 2025)
| Class Level | Price/Month | Subjects |
|-------------|-------------|----------|
| Class 6-8 | ₹3,999 | Mathematics, Science, English, Social Science, Hindi |
| Class 9-10 | ₹5,999 | Mathematics, Science, English, Social Science, Hindi |
| Class 11-12 Humanities | ₹7,999 | History, Geography, Political Science, Sociology |
| Class 11-12 Commerce | ₹8,999 | Accountancy, Business Studies, Economics |

**Total Courses:** 39

## Teacher
- **Ruchi Kejriwal** - Post graduate from Jamia Millia Islamia, a prestigious public research university in Delhi
- **Email**: ruchi.kejriwal@nextgenlearning.com
- **Password**: ruchi123
- **Class Range**: 6-12
- **Bio**: Expert in all subjects for Class 6-12. Specializes in Commerce & Humanities for senior classes.

## Core Features

### 1. User Roles & Authentication
- **Roles**: Admin, Teacher, Student, Parent
- **Auth Methods**: JWT email/password + Emergent Google OAuth
- **Status**: ✅ IMPLEMENTED

### 2. Admin Dashboard (Full Site Control)
- **Overview Tab**: User/course/payment stats
- **Payments Tab**: Approve/reject manual UPI payments
- **Users Tab**: View all users, delete users (except self), create new users
- **Courses Tab**: Create/edit/delete/publish courses, assign teachers
- **Live Classes Tab**: Schedule/delete classes with Zoom/Google Meet
- **Status**: ✅ IMPLEMENTED

### 3. Teacher Dashboard
- Create/edit/delete courses
- Schedule live classes (Zoom/Google Meet)
- Manage 1:1 sessions
- View enrolled student counts
- Profile settings
- **Status**: ✅ IMPLEMENTED

### 4. Student Dashboard
- View enrolled courses
- Join live classes for enrolled courses only
- View 1:1 sessions (teacher-scheduled)
- AI Doubt Assistant
- Profile settings
- **Status**: ✅ IMPLEMENTED

### 5. Payment System
- Manual UPI verification flow
- Admin approval panel
- **Status**: ✅ IMPLEMENTED (MOCKED - Manual verification)

### 6. AI Doubt Assistant
- GPT-5.2 powered doubt resolution
- **Status**: ✅ IMPLEMENTED

## Technical Architecture

### Backend (FastAPI)
- `/app/backend/server.py` - All API endpoints (~1900 lines)
- MongoDB for data storage
- JWT authentication with RBAC

### Frontend (React)
- `/app/frontend/src/pages/` - All page components
- Shadcn UI components
- TailwindCSS dark theme

### Key API Endpoints
- Auth: `/api/auth/*`
- Courses: `/api/courses/*`
- Admin: `/api/admin/*` (users, analytics, payments)
- Live Classes: `/api/live-classes/*`
- Bookings: `/api/bookings/*`
- Student: `/api/student/*`

## Test Accounts
- **Admin**: admin@nextgen.com / admin123
- **Teacher**: ruchi.kejriwal@nextgenlearning.com / ruchi123
- **Student**: student@test.com / student123

## Completed Work (Dec 2025)
- ✅ Admin Dashboard with full CRUD on users, courses, classes, payments
- ✅ Course pricing updated: 6-8 (₹3,999), 9-10 (₹5,999), Humanities (₹7,999), Commerce (₹8,999)
- ✅ 39 courses created in database
- ✅ DELETE /api/admin/users/{user_id} endpoint added
- ✅ Teacher Control System (courses, live classes, 1:1 sessions)
- ✅ Student restricted views (enrolled courses only)
- ✅ Profile settings for all users
- ✅ AI Doubt Assistant with GPT-5.2

## Pending/Future Tasks

### P1 (High Priority)
- Parent-child account linking
- Email notifications for sessions/payments

### P2 (Medium Priority)
- Automated payment gateway (Stripe/Razorpay)
- Student progress analytics dashboard

### P3 (Low Priority)
- Enhanced AI assistant with course context
- Certificate generation
- Profile picture uploads

### Refactoring (Recommended)
- Break server.py into modular structure: `/routes/`, `/models/`, `/controllers/`

## Last Updated
- Date: December 2025
- Latest Changes:
  - Admin Dashboard with full site management
  - Course pricing restructured (6-8, 9-10, 11-12 Humanities/Commerce)
  - User deletion endpoint for admins

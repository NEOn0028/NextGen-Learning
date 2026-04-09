# NextGen Learning - Product Requirements Document

## Overview
NextGen Learning is a modern online education platform for students in Classes 6-10 (CBSE/ICSE/State Boards) offering premium 1-on-1 mentorship in Commerce and Humanities.

## Teacher
- **Ruchi Kejriwal** - Graduated from Delhi University with expertise in Commerce and Humanities. Specializes in teaching students from Class 6-10.
- **Email**: ruchi.kejriwal@nextgenlearning.com
- **Password**: ruchi123
- **Subjects**: Commerce, Humanities
- **Class Range**: 6-10

## Core Features

### 1. User Roles & Authentication
- **Roles**: Admin, Teacher, Student, Parent
- **Auth Methods**: 
  - JWT-based email/password authentication
  - Emergent-managed Google OAuth social login
- **Status**: ✅ IMPLEMENTED

### 2. Course Management (Teacher Only)
- Teachers can:
  - Create new courses (title, subject, class_level, stream, price, description, thumbnail)
  - Edit existing courses
  - Delete courses (with all associated content)
  - Publish/Unpublish courses
- Streams: Commerce, Humanities
- Class levels: 6, 7, 8, 9, 10
- **Status**: ✅ IMPLEMENTED

### 3. Teacher Dashboard
- Dark-themed modern UI
- Teacher profile with bio, subjects, class range
- Tabbed navigation:
  - **My Courses**: View, create, edit, delete, publish/unpublish courses
  - **Live Classes**: Schedule classes with Zoom or Google Meet
  - **1:1 Sessions**: Schedule private sessions for students
- **Status**: ✅ IMPLEMENTED

### 4. Live Class Management (Teacher Only)
- Schedule live classes with:
  - Class title
  - Course selection
  - Date and time
  - Duration (30, 45, 60, 90, 120 minutes)
  - Platform (Zoom or Google Meet)
  - Meeting link
  - Description
- Delete scheduled classes
- **Status**: ✅ IMPLEMENTED

### 5. 1:1 Session Management (Teacher Only)
- **Teacher creates sessions for students** (students cannot book)
- Session details:
  - Student name and email
  - Date, start time, end time
  - Platform (Zoom or Google Meet)
  - Meeting link
  - Subject and notes
- Students can only VIEW and JOIN scheduled sessions
- **Status**: ✅ IMPLEMENTED

### 6. Student Dashboard
- Dark-themed modern UI
- Shows teacher profile (Ruchi Kejriwal with bio and subjects)
- Tabbed navigation:
  - **Dashboard**: Stats, teacher info, quick actions
  - **My Courses**: View enrolled courses with content
  - **My Sessions**: View scheduled 1:1 sessions (join only, no booking)
- Features:
  - View enrolled course content
  - Join live classes
  - Watch recorded lectures
  - Join 1:1 sessions scheduled by teacher
- **Status**: ✅ IMPLEMENTED

### 7. Role-Based Access Control
- **Teachers only** can:
  - Create/edit/delete courses
  - Schedule live classes
  - Schedule 1:1 sessions
  - Generate meeting links
- **Students can only**:
  - View courses
  - Join live classes (enrolled)
  - Join scheduled sessions
  - Watch recordings
- **Status**: ✅ IMPLEMENTED

### 8. Payment System
- Manual UPI payment flow
- Admin verification panel
- **Status**: ✅ IMPLEMENTED (Manual verification)

### 9. AI Doubt Assistant
- GPT-5.2 powered doubt resolution
- **Status**: ✅ IMPLEMENTED

## Technical Architecture

### Backend (FastAPI)
- `/app/backend/server.py` - All API endpoints
- MongoDB for data storage
- JWT authentication with role-based access control

### Frontend (React)
- `/app/frontend/src/pages/` - All page components
- Shadcn UI components
- TailwindCSS styling
- Dark theme throughout

### Key API Endpoints
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Courses: `/api/courses` (CRUD), `/api/courses/{id}/publish`
- Live Classes: `/api/live-classes` (POST - teacher only)
- Bookings/Sessions: `/api/bookings` (POST - teacher only, GET - all)
- Student: `/api/student/enrolled-courses`, `/api/student/upcoming-classes`
- Teachers: `/api/teachers` (GET list)

## Test Accounts
- **Teacher**: ruchi.kejriwal@nextgenlearning.com / ruchi123
- **Student**: student@test.com / student123
- **Admin**: admin@nextgen.com / admin123

## Pending/Future Tasks

### P1 (High Priority)
- Email notifications for session scheduling
- Student progress analytics dashboard

### P2 (Medium Priority)
- Parent-child account linking
- Automated payment gateway (Stripe/Razorpay)

### P3 (Low Priority)
- Enhanced AI assistant with course context
- Certificate generation

## Last Updated
- Date: April 9, 2026
- Latest Changes: 
  - Removed all teachers, added only Ruchi Kejriwal
  - Students cannot create bookings (teacher-only)
  - Live class scheduling with Zoom/Google Meet options
  - 1:1 session scheduling by teacher

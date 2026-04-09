# NextGen Learning - Product Requirements Document

## Overview
NextGen Learning is a modern online education platform for students in Classes 9-12 (CBSE/ICSE/State Boards) offering premium 1-on-1 mentorship.

## Core Features

### 1. User Roles & Authentication
- **Roles**: Admin, Teacher, Student, Parent
- **Auth Methods**: 
  - JWT-based email/password authentication
  - Emergent-managed Google OAuth social login
- **Status**: ✅ IMPLEMENTED

### 2. Course Management
- Courses categorized by class (9-12) and stream (General, Commerce, Humanities)
- Teachers can:
  - Create new courses (title, subject, class_level, stream, price, description, thumbnail)
  - Edit existing courses
  - Delete courses (with all associated content)
  - Publish/Unpublish courses
- **Status**: ✅ IMPLEMENTED

### 3. Teacher Dashboard (NEW)
- Dark-themed modern UI
- Tabbed navigation:
  - **My Courses**: View, create, edit, delete, publish/unpublish courses
  - **Live Classes**: View upcoming scheduled classes
  - **1:1 Bookings**: Manage student booking requests (approve/reject)
  - **Availability**: Set weekly availability slots for 1:1 sessions
- **Status**: ✅ IMPLEMENTED

### 4. Course Content Management (ManageCourse)
- Teachers can manage within each course:
  - Recorded Lectures (add, edit, delete with YouTube/Google Drive links)
  - Live Classes (schedule Zoom/Google Meet sessions)
  - Mock Tests (create MCQ tests with questions)
  - Assignments (create with due dates)
  - Student Performance tracking
- **Status**: ✅ IMPLEMENTED

### 5. 1:1 Student-Teacher Booking System (NEW)
- **Teacher Side**:
  - Set availability slots (day of week, start/end time, slot duration)
  - View booking requests
  - Approve/reject bookings
  - Add meeting links to approved bookings
- **Student Side**:
  - View list of teachers
  - See teacher availability
  - Book 1:1 sessions
  - View booking status
  - Cancel pending/approved bookings
- **Status**: ✅ IMPLEMENTED

### 6. Student Dashboard (UPDATED)
- Dark-themed modern UI
- Tabbed navigation:
  - **Dashboard**: Stats, quick actions, upcoming classes
  - **My Courses**: View enrolled courses with content (lectures, live classes, assignments, tests)
  - **1:1 Sessions**: Book and manage 1:1 sessions with teachers
- Features:
  - View enrolled course content
  - Join live classes
  - Watch recorded lectures
  - Book 1:1 sessions
- **Status**: ✅ IMPLEMENTED

### 7. Payment System
- Manual UPI payment flow
- Admin verification panel
- **Status**: ✅ IMPLEMENTED (Manual verification, not automated gateway)

### 8. AI Doubt Assistant
- GPT-5.2 powered doubt resolution
- Subject-wise doubt categorization
- **Status**: ✅ IMPLEMENTED (using Emergent LLM Key)

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
- Teacher Availability: `/api/teacher/availability`
- Bookings: `/api/bookings`, `/api/bookings/{id}/approve|reject|cancel`
- Student: `/api/student/enrolled-courses`, `/api/student/upcoming-classes`

## Database Schema

### Collections
- `users`: User accounts with roles
- `courses`: Course information with published status
- `enrollments`: Student course enrollments
- `lectures`: Recorded lecture content
- `live_classes`: Scheduled live sessions
- `tests`: Mock tests with questions
- `assignments`: Course assignments
- `teacher_availability`: Teacher weekly availability slots
- `booking_slots`: 1:1 session bookings

## Pending/Future Tasks

### P1 (High Priority)
- Email notifications for booking confirmations
- Student progress analytics dashboard

### P2 (Medium Priority)
- Parent-child account linking
- Automated payment gateway (Stripe/Razorpay)

### P3 (Low Priority)
- Enhanced AI assistant with course context
- Certificate generation

## Testing
- Backend tests: `/app/backend/tests/test_teacher_control_system.py`
- 23 tests covering auth, courses, availability, bookings, role-based access
- All tests passing

## Last Updated
- Date: March 20, 2026
- Latest Feature: Teacher Control System with 1:1 Booking

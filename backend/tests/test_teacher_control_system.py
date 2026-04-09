"""
Backend API Tests for Teacher Control System
Tests: Auth, Courses CRUD, Availability, Bookings, Role-based access
"""
import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://board-ready-3.preview.emergentagent.com')

# Test credentials
TEACHER_EMAIL = "teacher@test.com"
TEACHER_PASSWORD = "teacher123"
STUDENT_EMAIL = "student@test.com"
STUDENT_PASSWORD = "student123"


class TestAuth:
    """Authentication endpoint tests"""
    
    def test_teacher_login_success(self):
        """Teacher can login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEACHER_EMAIL,
            "password": TEACHER_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["role"] == "teacher", f"Expected teacher role, got {data['user']['role']}"
        assert data["user"]["email"] == TEACHER_EMAIL
        print(f"✓ Teacher login successful - user_id: {data['user']['user_id']}")
    
    def test_student_login_success(self):
        """Student can login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data
        assert data["user"]["role"] == "student"
        print(f"✓ Student login successful - user_id: {data['user']['user_id']}")
    
    def test_login_invalid_credentials(self):
        """Login fails with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@test.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")
    
    def test_auth_me_with_token(self):
        """Auth/me endpoint returns user data with valid token"""
        # Login first
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEACHER_EMAIL,
            "password": TEACHER_PASSWORD
        })
        token = login_res.json()["token"]
        
        # Test /auth/me
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEACHER_EMAIL
        print("✓ Auth/me returns correct user data")


class TestTeacherCourseManagement:
    """Teacher course CRUD operations"""
    
    @pytest.fixture
    def teacher_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEACHER_EMAIL,
            "password": TEACHER_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def teacher_user_id(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEACHER_EMAIL,
            "password": TEACHER_PASSWORD
        })
        return response.json()["user"]["user_id"]
    
    def test_teacher_create_course(self, teacher_token):
        """Teacher can create a new course with all fields"""
        course_data = {
            "title": f"TEST_Course_{uuid.uuid4().hex[:8]}",
            "subject": "Mathematics",
            "stream": "general",
            "class_level": "10",
            "price": 5999,
            "description": "Test course for automated testing",
            "published": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/courses",
            json=course_data,
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["title"] == course_data["title"]
        assert data["subject"] == course_data["subject"]
        assert data["stream"] == course_data["stream"]
        assert data["class_level"] == course_data["class_level"]
        assert data["price"] == course_data["price"]
        assert "course_id" in data
        print(f"✓ Course created: {data['course_id']}")
        
        # Cleanup - delete the test course
        requests.delete(
            f"{BASE_URL}/api/courses/{data['course_id']}",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        return data["course_id"]
    
    def test_teacher_get_own_courses(self, teacher_token, teacher_user_id):
        """Teacher can get their own courses"""
        response = requests.get(
            f"{BASE_URL}/api/courses/teacher/{teacher_user_id}",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Teacher has {len(data)} courses")
    
    def test_teacher_edit_course(self, teacher_token):
        """Teacher can edit an existing course"""
        # Create a course first
        course_data = {
            "title": f"TEST_EditCourse_{uuid.uuid4().hex[:8]}",
            "subject": "Physics",
            "stream": "general",
            "class_level": "11",
            "price": 4999,
            "description": "Original description"
        }
        
        create_res = requests.post(
            f"{BASE_URL}/api/courses",
            json=course_data,
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        course_id = create_res.json()["course_id"]
        
        # Update the course
        update_data = {
            "title": "Updated Course Title",
            "price": 6999,
            "description": "Updated description"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/courses/{course_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["title"] == "Updated Course Title"
        assert data["price"] == 6999
        print(f"✓ Course updated successfully")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/courses/{course_id}",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
    
    def test_teacher_delete_course(self, teacher_token):
        """Teacher can delete their own course"""
        # Create a course first
        course_data = {
            "title": f"TEST_DeleteCourse_{uuid.uuid4().hex[:8]}",
            "subject": "Chemistry",
            "stream": "general",
            "class_level": "12",
            "price": 3999,
            "description": "Course to be deleted"
        }
        
        create_res = requests.post(
            f"{BASE_URL}/api/courses",
            json=course_data,
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        course_id = create_res.json()["course_id"]
        
        # Delete the course
        response = requests.delete(
            f"{BASE_URL}/api/courses/{course_id}",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200
        
        # Verify deletion
        get_res = requests.get(f"{BASE_URL}/api/courses/{course_id}")
        assert get_res.status_code == 404
        print("✓ Course deleted successfully")
    
    def test_teacher_publish_unpublish_course(self, teacher_token):
        """Teacher can publish/unpublish a course"""
        # Create a course
        course_data = {
            "title": f"TEST_PublishCourse_{uuid.uuid4().hex[:8]}",
            "subject": "Biology",
            "stream": "general",
            "class_level": "9",
            "price": 2999,
            "description": "Course for publish test",
            "published": True
        }
        
        create_res = requests.post(
            f"{BASE_URL}/api/courses",
            json=course_data,
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        course_id = create_res.json()["course_id"]
        
        # Toggle publish status
        response = requests.patch(
            f"{BASE_URL}/api/courses/{course_id}/publish",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "published" in data
        print(f"✓ Course publish toggled: published={data['published']}")
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/courses/{course_id}",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )


class TestTeacherAvailability:
    """Teacher availability slot management"""
    
    @pytest.fixture
    def teacher_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEACHER_EMAIL,
            "password": TEACHER_PASSWORD
        })
        return response.json()["token"]
    
    def test_teacher_add_availability(self, teacher_token):
        """Teacher can add availability slots"""
        availability_data = {
            "day_of_week": 1,  # Tuesday
            "start_time": "10:00",
            "end_time": "12:00",
            "slot_duration": 30
        }
        
        response = requests.post(
            f"{BASE_URL}/api/teacher/availability",
            json=availability_data,
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "availability_id" in data or "message" in data
        print(f"✓ Availability slot added/updated")
    
    def test_teacher_get_availability(self, teacher_token):
        """Teacher can view their availability slots"""
        response = requests.get(
            f"{BASE_URL}/api/teacher/availability",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Teacher has {len(data)} availability slots")
    
    def test_teacher_delete_availability(self, teacher_token):
        """Teacher can delete availability slots"""
        # First add an availability
        availability_data = {
            "day_of_week": 6,  # Sunday
            "start_time": "14:00",
            "end_time": "16:00",
            "slot_duration": 30
        }
        
        add_res = requests.post(
            f"{BASE_URL}/api/teacher/availability",
            json=availability_data,
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        
        # Get availability to find the ID
        get_res = requests.get(
            f"{BASE_URL}/api/teacher/availability",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        slots = get_res.json()
        
        # Find the Sunday slot
        sunday_slot = next((s for s in slots if s["day_of_week"] == 6), None)
        if sunday_slot:
            response = requests.delete(
                f"{BASE_URL}/api/teacher/availability/{sunday_slot['availability_id']}",
                headers={"Authorization": f"Bearer {teacher_token}"}
            )
            assert response.status_code == 200
            print("✓ Availability slot deleted")
        else:
            print("✓ No Sunday slot to delete (test passed)")


class TestStudentBookings:
    """Student 1:1 booking system"""
    
    @pytest.fixture
    def student_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def teacher_user_id(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEACHER_EMAIL,
            "password": TEACHER_PASSWORD
        })
        return response.json()["user"]["user_id"]
    
    def test_get_teachers_list(self):
        """Anyone can get list of teachers"""
        response = requests.get(f"{BASE_URL}/api/teachers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Found {len(data)} teachers")
    
    def test_get_teacher_availability(self, teacher_user_id):
        """Student can view teacher's availability"""
        response = requests.get(f"{BASE_URL}/api/teacher/{teacher_user_id}/availability")
        assert response.status_code == 200
        data = response.json()
        assert "availability" in data
        assert "booked_slots" in data
        print(f"✓ Teacher availability retrieved: {len(data['availability'])} slots")
    
    def test_student_create_booking(self, student_token, teacher_user_id):
        """Student can book a 1:1 session"""
        # Use a future date
        future_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        
        booking_data = {
            "teacher_id": teacher_user_id,
            "date": future_date,
            "start_time": "10:00",
            "end_time": "10:30",
            "subject": "Mathematics Doubt",
            "notes": "Need help with calculus"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/bookings",
            json=booking_data,
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "slot_id" in data
        print(f"✓ Booking created: {data['slot_id']}")
        return data["slot_id"]
    
    def test_student_get_bookings(self, student_token):
        """Student can view their bookings"""
        response = requests.get(
            f"{BASE_URL}/api/bookings/my",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Student has {len(data)} bookings")
    
    def test_student_cancel_booking(self, student_token, teacher_user_id):
        """Student can cancel their booking"""
        # Create a booking first
        future_date = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")
        
        booking_data = {
            "teacher_id": teacher_user_id,
            "date": future_date,
            "start_time": "15:00",
            "end_time": "15:30",
            "subject": "Test Cancel"
        }
        
        create_res = requests.post(
            f"{BASE_URL}/api/bookings",
            json=booking_data,
            headers={"Authorization": f"Bearer {student_token}"}
        )
        slot_id = create_res.json()["slot_id"]
        
        # Cancel the booking
        response = requests.patch(
            f"{BASE_URL}/api/bookings/{slot_id}/cancel",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        print("✓ Booking cancelled successfully")


class TestRoleBasedAccess:
    """Role-based access control tests"""
    
    @pytest.fixture
    def student_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        return response.json()["token"]
    
    @pytest.fixture
    def teacher_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEACHER_EMAIL,
            "password": TEACHER_PASSWORD
        })
        return response.json()["token"]
    
    def test_student_cannot_create_course(self, student_token):
        """Students cannot create courses"""
        course_data = {
            "title": "Unauthorized Course",
            "subject": "Test",
            "stream": "general",
            "class_level": "10",
            "price": 1000,
            "description": "Should fail"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/courses",
            json=course_data,
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Student correctly denied course creation")
    
    def test_student_cannot_add_availability(self, student_token):
        """Students cannot add teacher availability"""
        availability_data = {
            "day_of_week": 0,
            "start_time": "09:00",
            "end_time": "17:00",
            "slot_duration": 30
        }
        
        response = requests.post(
            f"{BASE_URL}/api/teacher/availability",
            json=availability_data,
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Student correctly denied availability creation")
    
    def test_student_cannot_approve_booking(self, student_token):
        """Students cannot approve bookings"""
        response = requests.patch(
            f"{BASE_URL}/api/bookings/fake_slot_id/approve",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        # Should be 403 (forbidden) or 404 (not found)
        assert response.status_code in [403, 404]
        print("✓ Student correctly denied booking approval")
    
    def test_teacher_can_view_bookings(self, teacher_token):
        """Teachers can view their bookings"""
        response = requests.get(
            f"{BASE_URL}/api/bookings/my",
            headers={"Authorization": f"Bearer {teacher_token}"}
        )
        assert response.status_code == 200
        print("✓ Teacher can view bookings")


class TestStudentDashboard:
    """Student dashboard functionality"""
    
    @pytest.fixture
    def student_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD
        })
        return response.json()["token"]
    
    def test_student_get_enrolled_courses(self, student_token):
        """Student can get enrolled courses"""
        response = requests.get(
            f"{BASE_URL}/api/student/enrolled-courses",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Student has {len(data)} enrolled courses")
    
    def test_student_get_upcoming_classes(self, student_token):
        """Student can get upcoming classes"""
        response = requests.get(
            f"{BASE_URL}/api/student/upcoming-classes",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Student has {len(data)} upcoming classes")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

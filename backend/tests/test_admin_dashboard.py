"""
Backend API Tests for NextGen Learning Admin Dashboard
Tests admin endpoints, course management, user management, and pricing
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@nextgen.com"
ADMIN_PASSWORD = "admin123"
TEACHER_EMAIL = "ruchi.kejriwal@nextgenlearning.com"
TEACHER_PASSWORD = "ruchi123"

# Expected pricing
PRICING = {
    "6-8": 3999,
    "9-10": 5999,
    "humanities": 7999,
    "commerce": 8999
}


class TestHealthAndAuth:
    """Basic health and authentication tests"""
    
    def test_api_health(self):
        """Test that API is accessible"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200, f"API not accessible: {response.status_code}"
        print("✓ API is accessible")
    
    def test_admin_login(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["role"] == "admin", f"Expected admin role, got {data['user']['role']}"
        print(f"✓ Admin login successful: {data['user']['name']}")
        return data["token"]
    
    def test_teacher_login(self):
        """Test teacher login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEACHER_EMAIL,
            "password": TEACHER_PASSWORD
        })
        assert response.status_code == 200, f"Teacher login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert data["user"]["role"] == "teacher", f"Expected teacher role, got {data['user']['role']}"
        print(f"✓ Teacher login successful: {data['user']['name']}")
        return data["token"]
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid login correctly rejected")


class TestAdminEndpoints:
    """Test admin-specific endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed - skipping admin tests")
        self.admin_token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_admin_analytics(self):
        """Test GET /api/admin/analytics"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics", headers=self.headers)
        assert response.status_code == 200, f"Analytics failed: {response.text}"
        data = response.json()
        assert "total_users" in data, "Missing total_users"
        assert "total_courses" in data, "Missing total_courses"
        assert "total_enrollments" in data, "Missing total_enrollments"
        print(f"✓ Analytics: {data['total_users']} users, {data['total_courses']} courses")
    
    def test_admin_get_users(self):
        """Test GET /api/admin/users"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=self.headers)
        assert response.status_code == 200, f"Get users failed: {response.text}"
        users = response.json()
        assert isinstance(users, list), "Expected list of users"
        
        # Check for different user roles
        roles = set(u.get("role") for u in users)
        print(f"✓ Found {len(users)} users with roles: {roles}")
        
        # Verify user structure
        if users:
            user = users[0]
            assert "user_id" in user, "Missing user_id"
            assert "email" in user, "Missing email"
            assert "name" in user, "Missing name"
            assert "role" in user, "Missing role"
            assert "password_hash" not in user, "password_hash should not be exposed"
    
    def test_admin_payment_verifications(self):
        """Test GET /api/admin/payment-verifications"""
        response = requests.get(f"{BASE_URL}/api/admin/payment-verifications", headers=self.headers)
        assert response.status_code == 200, f"Payment verifications failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Expected list of verifications"
        print(f"✓ Found {len(data)} payment verifications")


class TestCourseManagement:
    """Test course CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed - skipping course tests")
        self.admin_token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_get_all_courses(self):
        """Test GET /api/courses - verify 39 courses exist"""
        response = requests.get(f"{BASE_URL}/api/courses")
        assert response.status_code == 200, f"Get courses failed: {response.text}"
        courses = response.json()
        assert isinstance(courses, list), "Expected list of courses"
        print(f"✓ Found {len(courses)} courses")
        
        # Verify course structure
        if courses:
            course = courses[0]
            assert "course_id" in course, "Missing course_id"
            assert "title" in course, "Missing title"
            assert "price" in course, "Missing price"
            assert "class_level" in course, "Missing class_level"
        
        return courses
    
    def test_course_pricing_class_6_8(self):
        """Verify Class 6-8 courses are priced at ₹3,999"""
        response = requests.get(f"{BASE_URL}/api/courses")
        courses = response.json()
        
        class_6_8_courses = [c for c in courses if c.get("class_level") in ["6", "7", "8"]]
        print(f"Found {len(class_6_8_courses)} courses for Class 6-8")
        
        for course in class_6_8_courses:
            assert course["price"] == PRICING["6-8"], \
                f"Course '{course['title']}' (Class {course['class_level']}) has price {course['price']}, expected {PRICING['6-8']}"
        
        print(f"✓ All {len(class_6_8_courses)} Class 6-8 courses priced at ₹{PRICING['6-8']}")
    
    def test_course_pricing_class_9_10(self):
        """Verify Class 9-10 courses are priced at ₹5,999"""
        response = requests.get(f"{BASE_URL}/api/courses")
        courses = response.json()
        
        class_9_10_courses = [c for c in courses if c.get("class_level") in ["9", "10"]]
        print(f"Found {len(class_9_10_courses)} courses for Class 9-10")
        
        for course in class_9_10_courses:
            assert course["price"] == PRICING["9-10"], \
                f"Course '{course['title']}' (Class {course['class_level']}) has price {course['price']}, expected {PRICING['9-10']}"
        
        print(f"✓ All {len(class_9_10_courses)} Class 9-10 courses priced at ₹{PRICING['9-10']}")
    
    def test_course_pricing_humanities(self):
        """Verify Class 11-12 Humanities courses are priced at ₹7,999"""
        response = requests.get(f"{BASE_URL}/api/courses")
        courses = response.json()
        
        humanities_courses = [c for c in courses 
                            if c.get("class_level") in ["11", "12"] 
                            and c.get("stream") == "humanities"]
        print(f"Found {len(humanities_courses)} Humanities courses")
        
        for course in humanities_courses:
            assert course["price"] == PRICING["humanities"], \
                f"Course '{course['title']}' has price {course['price']}, expected {PRICING['humanities']}"
        
        print(f"✓ All {len(humanities_courses)} Humanities courses priced at ₹{PRICING['humanities']}")
    
    def test_course_pricing_commerce(self):
        """Verify Class 11-12 Commerce courses are priced at ₹8,999"""
        response = requests.get(f"{BASE_URL}/api/courses")
        courses = response.json()
        
        commerce_courses = [c for c in courses 
                          if c.get("class_level") in ["11", "12"] 
                          and c.get("stream") == "commerce"]
        print(f"Found {len(commerce_courses)} Commerce courses")
        
        for course in commerce_courses:
            assert course["price"] == PRICING["commerce"], \
                f"Course '{course['title']}' has price {course['price']}, expected {PRICING['commerce']}"
        
        print(f"✓ All {len(commerce_courses)} Commerce courses priced at ₹{PRICING['commerce']}")
    
    def test_create_course(self):
        """Test POST /api/courses - admin can create course"""
        test_course = {
            "title": "TEST_Course_Delete_Me",
            "description": "Test course for API testing",
            "stream": "general",
            "class_level": "6",
            "subject": "Test Subject",
            "price": 3999
        }
        
        response = requests.post(f"{BASE_URL}/api/courses", json=test_course, headers=self.headers)
        assert response.status_code == 200, f"Create course failed: {response.text}"
        
        data = response.json()
        assert "course_id" in data, "Missing course_id in response"
        assert data["title"] == test_course["title"], "Title mismatch"
        assert data["price"] == test_course["price"], "Price mismatch"
        
        print(f"✓ Created course: {data['course_id']}")
        
        # Cleanup - delete the test course
        delete_response = requests.delete(f"{BASE_URL}/api/courses/{data['course_id']}", headers=self.headers)
        assert delete_response.status_code == 200, f"Cleanup failed: {delete_response.text}"
        print("✓ Test course cleaned up")
    
    def test_update_course(self):
        """Test PUT /api/courses/{course_id} - admin can update course"""
        # First create a test course
        test_course = {
            "title": "TEST_Update_Course",
            "description": "Test course for update testing",
            "stream": "general",
            "class_level": "7",
            "subject": "Test Subject",
            "price": 3999
        }
        
        create_response = requests.post(f"{BASE_URL}/api/courses", json=test_course, headers=self.headers)
        assert create_response.status_code == 200, f"Create course failed: {create_response.text}"
        course_id = create_response.json()["course_id"]
        
        # Update the course
        update_data = {
            "title": "TEST_Updated_Course_Title",
            "price": 4999
        }
        
        update_response = requests.put(f"{BASE_URL}/api/courses/{course_id}", json=update_data, headers=self.headers)
        assert update_response.status_code == 200, f"Update course failed: {update_response.text}"
        
        updated_course = update_response.json()
        assert updated_course["title"] == update_data["title"], "Title not updated"
        assert updated_course["price"] == update_data["price"], "Price not updated"
        
        print(f"✓ Updated course: {course_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/courses/{course_id}", headers=self.headers)
        print("✓ Test course cleaned up")
    
    def test_delete_course(self):
        """Test DELETE /api/courses/{course_id} - admin can delete course"""
        # First create a test course
        test_course = {
            "title": "TEST_Delete_Course",
            "description": "Test course for delete testing",
            "stream": "general",
            "class_level": "8",
            "subject": "Test Subject",
            "price": 3999
        }
        
        create_response = requests.post(f"{BASE_URL}/api/courses", json=test_course, headers=self.headers)
        assert create_response.status_code == 200, f"Create course failed: {create_response.text}"
        course_id = create_response.json()["course_id"]
        
        # Delete the course
        delete_response = requests.delete(f"{BASE_URL}/api/courses/{course_id}", headers=self.headers)
        assert delete_response.status_code == 200, f"Delete course failed: {delete_response.text}"
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/courses/{course_id}")
        assert get_response.status_code == 404, "Course should be deleted"
        
        print(f"✓ Deleted course: {course_id}")


class TestUserManagement:
    """Test user management endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed - skipping user tests")
        self.admin_token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_delete_user_endpoint_exists(self):
        """Test DELETE /api/admin/users/{user_id} endpoint exists"""
        # Create a test user first
        test_user = {
            "email": f"TEST_delete_user_{os.urandom(4).hex()}@test.com",
            "password": "testpass123",
            "name": "TEST Delete User",
            "role": "student"
        }
        
        create_response = requests.post(f"{BASE_URL}/api/auth/register", json=test_user)
        assert create_response.status_code == 200, f"Create user failed: {create_response.text}"
        user_id = create_response.json()["user"]["user_id"]
        
        # Delete the user
        delete_response = requests.delete(f"{BASE_URL}/api/admin/users/{user_id}", headers=self.headers)
        assert delete_response.status_code == 200, f"Delete user failed: {delete_response.text}"
        
        # Verify user is deleted
        users_response = requests.get(f"{BASE_URL}/api/admin/users", headers=self.headers)
        users = users_response.json()
        user_ids = [u["user_id"] for u in users]
        assert user_id not in user_ids, "User should be deleted"
        
        print(f"✓ Deleted user: {user_id}")
    
    def test_cannot_delete_self(self):
        """Test admin cannot delete themselves"""
        # Get admin user_id
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=self.headers)
        admin_user_id = me_response.json()["user_id"]
        
        # Try to delete self
        delete_response = requests.delete(f"{BASE_URL}/api/admin/users/{admin_user_id}", headers=self.headers)
        assert delete_response.status_code == 400, f"Should not be able to delete self: {delete_response.status_code}"
        
        print("✓ Admin correctly prevented from deleting self")
    
    def test_delete_nonexistent_user(self):
        """Test deleting non-existent user returns 404"""
        delete_response = requests.delete(f"{BASE_URL}/api/admin/users/nonexistent_user_id", headers=self.headers)
        assert delete_response.status_code == 404, f"Expected 404, got {delete_response.status_code}"
        
        print("✓ Non-existent user deletion correctly returns 404")


class TestLiveClasses:
    """Test live class management"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip("Admin login failed - skipping live class tests")
        self.admin_token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.admin_token}"}
    
    def test_create_live_class(self):
        """Test POST /api/live-classes - admin can schedule live class"""
        # Get a course first
        courses_response = requests.get(f"{BASE_URL}/api/courses")
        courses = courses_response.json()
        if not courses:
            pytest.skip("No courses available for live class test")
        
        course_id = courses[0]["course_id"]
        
        live_class = {
            "course_id": course_id,
            "title": "TEST_Live_Class",
            "meeting_link": "https://zoom.us/j/test123",
            "platform": "zoom",
            "scheduled_at": "2026-03-25T10:00:00",
            "duration": 60
        }
        
        response = requests.post(f"{BASE_URL}/api/live-classes", json=live_class, headers=self.headers)
        assert response.status_code == 200, f"Create live class failed: {response.text}"
        
        data = response.json()
        assert "class_id" in data, "Missing class_id"
        
        print(f"✓ Created live class: {data['class_id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/live-classes/{data['class_id']}", headers=self.headers)
        print("✓ Test live class cleaned up")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

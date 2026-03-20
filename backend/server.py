from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Response, Request, Form, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

# Emergent LLM Key for AI Doubt Assistant
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class UserRole:
    STUDENT = "student"
    TEACHER = "teacher"
    PARENT = "parent"
    ADMIN = "admin"

class User(BaseModel):
    user_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None
    role: str = UserRole.STUDENT
    parent_email: Optional[str] = None  # For linking parent to student
    created_at: datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = UserRole.STUDENT
    parent_email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Session(BaseModel):
    session_token: str
    user_id: str
    expires_at: datetime
    created_at: datetime

class SessionData(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class Course(BaseModel):
    course_id: str
    title: str
    class_level: str  # "9", "10", "11", "12"
    stream: str  # "science", "commerce", "arts", "general"
    subject: str  # "Maths", "Physics", "Chemistry", etc.
    description: str
    price: int  # Monthly price in INR
    teacher_id: str
    teacher_name: Optional[str] = None
    thumbnail: Optional[str] = None
    created_at: datetime

class CourseCreate(BaseModel):
    title: str
    class_level: str
    stream: str
    subject: str
    description: str
    price: int
    thumbnail: Optional[str] = None

class Enrollment(BaseModel):
    enrollment_id: str
    student_id: str
    course_id: str
    payment_status: str  # "pending", "completed", "failed"
    payment_id: Optional[str] = None
    enrolled_at: datetime

class EnrollmentCreate(BaseModel):
    course_id: str

class Lecture(BaseModel):
    lecture_id: str
    course_id: str
    title: str
    description: Optional[str] = None
    video_url: str
    duration: Optional[int] = None  # in seconds
    uploaded_at: datetime

class LectureCreate(BaseModel):
    course_id: str
    title: str
    description: Optional[str] = None
    video_url: str
    duration: Optional[int] = None

class LiveClass(BaseModel):
    class_id: str
    course_id: str
    title: str
    meeting_link: str
    platform: str  # "zoom" or "meet"
    scheduled_at: datetime
    duration: int  # in minutes
    created_at: datetime

class LiveClassCreate(BaseModel):
    course_id: str
    title: str
    meeting_link: str
    platform: str
    scheduled_at: datetime
    duration: int

class Assignment(BaseModel):
    assignment_id: str
    course_id: str
    title: str
    description: str
    due_date: datetime
    total_marks: int
    created_at: datetime

class AssignmentCreate(BaseModel):
    course_id: str
    title: str
    description: str
    due_date: datetime
    total_marks: int

class Submission(BaseModel):
    submission_id: str
    assignment_id: str
    student_id: str
    content: str
    submitted_at: datetime
    grade: Optional[int] = None
    feedback: Optional[str] = None

class SubmissionCreate(BaseModel):
    assignment_id: str
    content: str

class Test(BaseModel):
    test_id: str
    course_id: str
    title: str
    description: str
    questions: List[Dict[str, Any]]  # Array of question objects
    total_marks: int
    duration: int  # in minutes
    created_at: datetime

class TestCreate(BaseModel):
    course_id: str
    title: str
    description: str
    questions: List[Dict[str, Any]]
    total_marks: int
    duration: int

class TestAttempt(BaseModel):
    attempt_id: str
    test_id: str
    student_id: str
    answers: Dict[str, Any]
    score: Optional[int] = None
    attempted_at: datetime

class TestAttemptCreate(BaseModel):
    test_id: str
    answers: Dict[str, Any]

class Doubt(BaseModel):
    doubt_id: str
    student_id: str
    student_name: Optional[str] = None
    course_id: Optional[str] = None
    subject: str
    message: str
    is_ai_response: bool = False
    ai_response: Optional[str] = None
    created_at: datetime

class DoubtCreate(BaseModel):
    course_id: Optional[str] = None
    subject: str
    message: str
    use_ai: bool = True

class DoubtResponse(BaseModel):
    response_id: str
    doubt_id: str
    responder_id: str
    responder_name: str
    message: str
    created_at: datetime

class DoubtResponseCreate(BaseModel):
    doubt_id: str
    message: str

class Announcement(BaseModel):
    announcement_id: str
    title: str
    content: str
    created_by: str
    created_by_name: Optional[str] = None
    created_at: datetime

class AnnouncementCreate(BaseModel):
    title: str
    content: str

class PaymentOrder(BaseModel):
    order_id: str
    amount: int
    currency: str
    status: str
    course_id: str
    student_id: str
    created_at: datetime

class PaymentOrderCreate(BaseModel):
    course_id: str
    amount: int

# ============ AUTH HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_user(authorization: Optional[str] = Header(None), request: Request = None) -> User:
    """
    Get current user from session_token cookie or Authorization header
    REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    """
    token = None
    
    # First try to get from cookie
    if request:
        token = request.cookies.get('session_token')
    
    # Fallback to Authorization header
    if not token and authorization:
        if authorization.startswith('Bearer '):
            token = authorization.replace('Bearer ', '')
        else:
            token = authorization
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Try JWT first
    user_id = verify_jwt_token(token)
    
    # If not JWT, check session token in database
    if not user_id:
        session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
        if not session_doc:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        # Check expiry
        expires_at = session_doc["expires_at"]
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        
        user_id = session_doc["user_id"]
    
    # Get user from database
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user_doc)

def require_role(required_roles: List[str]):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in required_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    password_hash = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "picture": None,
        "role": user_data.role,
        "parent_email": user_data.parent_email,
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create JWT token
    token = create_jwt_token(user_id)
    
    # Return user without password_hash
    user_doc.pop('password_hash')
    user_doc.pop('_id')
    
    return {"user": user_doc, "token": token}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(credentials.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    token = create_jwt_token(user_doc['user_id'])
    
    # Return user without password_hash
    user_doc.pop('password_hash')
    user_doc.pop('_id')
    
    return {"user": user_doc, "token": token}

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    """
    Exchange session_id from Google OAuth for session_token
    REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    """
    session_id = request.headers.get('X-Session-ID')
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    
    # Call Emergent Auth API
    import requests
    try:
        auth_response = requests.get(
            'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
            headers={'X-Session-ID': session_id}
        )
        auth_response.raise_for_status()
        session_data = auth_response.json()
    except Exception as e:
        logger.error(f"Failed to exchange session: {e}")
        raise HTTPException(status_code=400, detail="Invalid session_id")
    
    # Check if user exists
    user_doc = await db.users.find_one({"email": session_data['email']}, {"_id": 0})
    
    if not user_doc:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": session_data['email'],
            "name": session_data['name'],
            "picture": session_data.get('picture'),
            "role": UserRole.STUDENT,  # Default role
            "parent_email": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    else:
        # Update user info if needed
        user_id = user_doc['user_id']
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": session_data['name'],
                "picture": session_data.get('picture')
            }}
        )
        user_doc['name'] = session_data['name']
        user_doc['picture'] = session_data.get('picture')
    
    # Create session
    session_token = session_data['session_token']
    session_doc = {
        "session_token": session_token,
        "user_id": user_id,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    # Remove sensitive fields
    if 'password_hash' in user_doc:
        user_doc.pop('password_hash')
    if '_id' in user_doc:
        user_doc.pop('_id')
    
    return {"user": user_doc, "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(current_user: User = Depends(get_current_user), request: Request = None, response: Response = None):
    # Delete session from database
    if request:
        token = request.cookies.get('session_token')
        if token:
            await db.user_sessions.delete_one({"session_token": token})
    
    # Clear cookie
    if response:
        response.delete_cookie(key="session_token", path="/")
    
    return {"message": "Logged out successfully"}

# ============ COURSE ENDPOINTS ============

@api_router.post("/courses", response_model=Course)
async def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    course_id = f"course_{uuid.uuid4().hex[:12]}"
    course_doc = {
        "course_id": course_id,
        **course_data.model_dump(),
        "teacher_id": current_user.user_id,
        "teacher_name": current_user.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.courses.insert_one(course_doc)
    course_doc.pop('_id')
    
    # Parse datetime
    course_doc['created_at'] = datetime.fromisoformat(course_doc['created_at'])
    return Course(**course_doc)

@api_router.get("/courses", response_model=List[Course])
async def get_courses(
    class_level: Optional[str] = None,
    stream: Optional[str] = None,
    subject: Optional[str] = None
):
    query = {}
    if class_level:
        query['class_level'] = class_level
    if stream:
        query['stream'] = stream
    if subject:
        query['subject'] = subject
    
    courses = await db.courses.find(query, {"_id": 0}).to_list(1000)
    for course in courses:
        if isinstance(course['created_at'], str):
            course['created_at'] = datetime.fromisoformat(course['created_at'])
    return courses

@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    course = await db.courses.find_one({"course_id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if isinstance(course['created_at'], str):
        course['created_at'] = datetime.fromisoformat(course['created_at'])
    return Course(**course)

@api_router.get("/courses/teacher/{teacher_id}", response_model=List[Course])
async def get_teacher_courses(teacher_id: str):
    courses = await db.courses.find({"teacher_id": teacher_id}, {"_id": 0}).to_list(1000)
    for course in courses:
        if isinstance(course['created_at'], str):
            course['created_at'] = datetime.fromisoformat(course['created_at'])
    return courses

# ============ ENROLLMENT ENDPOINTS ============

@api_router.post("/enrollments", response_model=Enrollment)
async def create_enrollment(
    enrollment_data: EnrollmentCreate,
    current_user: User = Depends(get_current_user)
):
    # Check if already enrolled
    existing = await db.enrollments.find_one({
        "student_id": current_user.user_id,
        "course_id": enrollment_data.course_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    enrollment_id = f"enrollment_{uuid.uuid4().hex[:12]}"
    enrollment_doc = {
        "enrollment_id": enrollment_id,
        "student_id": current_user.user_id,
        "course_id": enrollment_data.course_id,
        "payment_status": "pending",
        "payment_id": None,
        "enrolled_at": datetime.now(timezone.utc).isoformat()
    }
    await db.enrollments.insert_one(enrollment_doc)
    enrollment_doc.pop('_id')
    enrollment_doc['enrolled_at'] = datetime.fromisoformat(enrollment_doc['enrolled_at'])
    return Enrollment(**enrollment_doc)

@api_router.get("/enrollments/student", response_model=List[Enrollment])
async def get_student_enrollments(current_user: User = Depends(get_current_user)):
    enrollments = await db.enrollments.find(
        {"student_id": current_user.user_id},
        {"_id": 0}
    ).to_list(1000)
    for enrollment in enrollments:
        if isinstance(enrollment['enrolled_at'], str):
            enrollment['enrolled_at'] = datetime.fromisoformat(enrollment['enrolled_at'])
    return enrollments

@api_router.get("/enrollments/course/{course_id}")
async def get_course_enrollments(
    course_id: str,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    enrollments = await db.enrollments.find(
        {"course_id": course_id, "payment_status": "completed"},
        {"_id": 0}
    ).to_list(1000)
    
    # Get student details
    result = []
    for enrollment in enrollments:
        student = await db.users.find_one({"user_id": enrollment['student_id']}, {"_id": 0, "password_hash": 0})
        if student:
            result.append({
                **enrollment,
                "student_name": student['name'],
                "student_email": student['email']
            })
    
    return result

# ============ LECTURE ENDPOINTS ============

@api_router.post("/lectures", response_model=Lecture)
async def create_lecture(
    lecture_data: LectureCreate,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    # Verify teacher owns the course
    course = await db.courses.find_one({"course_id": lecture_data.course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if current_user.role == UserRole.TEACHER and course['teacher_id'] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not your course")
    
    lecture_id = f"lecture_{uuid.uuid4().hex[:12]}"
    lecture_doc = {
        "lecture_id": lecture_id,
        **lecture_data.model_dump(),
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    await db.lectures.insert_one(lecture_doc)
    lecture_doc.pop('_id')
    lecture_doc['uploaded_at'] = datetime.fromisoformat(lecture_doc['uploaded_at'])
    return Lecture(**lecture_doc)

@api_router.get("/lectures/course/{course_id}", response_model=List[Lecture])
async def get_course_lectures(course_id: str):
    lectures = await db.lectures.find({"course_id": course_id}, {"_id": 0}).to_list(1000)
    for lecture in lectures:
        if isinstance(lecture['uploaded_at'], str):
            lecture['uploaded_at'] = datetime.fromisoformat(lecture['uploaded_at'])
    return lectures

@api_router.get("/lectures/{lecture_id}", response_model=Lecture)
async def get_lecture(lecture_id: str):
    lecture = await db.lectures.find_one({"lecture_id": lecture_id}, {"_id": 0})
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    if isinstance(lecture['uploaded_at'], str):
        lecture['uploaded_at'] = datetime.fromisoformat(lecture['uploaded_at'])
    return Lecture(**lecture)

# ============ LIVE CLASS ENDPOINTS ============

@api_router.post("/live-classes", response_model=LiveClass)
async def create_live_class(
    class_data: LiveClassCreate,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    class_id = f"class_{uuid.uuid4().hex[:12]}"
    class_doc = {
        "class_id": class_id,
        **class_data.model_dump(),
        "scheduled_at": class_data.scheduled_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.live_classes.insert_one(class_doc)
    class_doc.pop('_id')
    class_doc['scheduled_at'] = datetime.fromisoformat(class_doc['scheduled_at'])
    class_doc['created_at'] = datetime.fromisoformat(class_doc['created_at'])
    return LiveClass(**class_doc)

@api_router.get("/live-classes/course/{course_id}", response_model=List[LiveClass])
async def get_course_live_classes(course_id: str):
    classes = await db.live_classes.find({"course_id": course_id}, {"_id": 0}).to_list(1000)
    for cls in classes:
        if isinstance(cls['scheduled_at'], str):
            cls['scheduled_at'] = datetime.fromisoformat(cls['scheduled_at'])
        if isinstance(cls['created_at'], str):
            cls['created_at'] = datetime.fromisoformat(cls['created_at'])
    return classes

@api_router.get("/live-classes/upcoming")
async def get_upcoming_classes(current_user: User = Depends(get_current_user)):
    # Get enrolled courses
    enrollments = await db.enrollments.find(
        {"student_id": current_user.user_id, "payment_status": "completed"},
        {"_id": 0}
    ).to_list(1000)
    course_ids = [e['course_id'] for e in enrollments]
    
    # Get upcoming classes
    now = datetime.now(timezone.utc).isoformat()
    classes = await db.live_classes.find({
        "course_id": {"$in": course_ids},
        "scheduled_at": {"$gte": now}
    }, {"_id": 0}).sort("scheduled_at", 1).to_list(100)
    
    for cls in classes:
        if isinstance(cls['scheduled_at'], str):
            cls['scheduled_at'] = datetime.fromisoformat(cls['scheduled_at'])
        if isinstance(cls['created_at'], str):
            cls['created_at'] = datetime.fromisoformat(cls['created_at'])
    
    return classes

# ============ ASSIGNMENT ENDPOINTS ============

@api_router.post("/assignments", response_model=Assignment)
async def create_assignment(
    assignment_data: AssignmentCreate,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    assignment_id = f"assignment_{uuid.uuid4().hex[:12]}"
    assignment_doc = {
        "assignment_id": assignment_id,
        **assignment_data.model_dump(),
        "due_date": assignment_data.due_date.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.assignments.insert_one(assignment_doc)
    assignment_doc.pop('_id')
    assignment_doc['due_date'] = datetime.fromisoformat(assignment_doc['due_date'])
    assignment_doc['created_at'] = datetime.fromisoformat(assignment_doc['created_at'])
    return Assignment(**assignment_doc)

@api_router.get("/assignments/course/{course_id}", response_model=List[Assignment])
async def get_course_assignments(course_id: str):
    assignments = await db.assignments.find({"course_id": course_id}, {"_id": 0}).to_list(1000)
    for assignment in assignments:
        if isinstance(assignment['due_date'], str):
            assignment['due_date'] = datetime.fromisoformat(assignment['due_date'])
        if isinstance(assignment['created_at'], str):
            assignment['created_at'] = datetime.fromisoformat(assignment['created_at'])
    return assignments

@api_router.post("/submissions", response_model=Submission)
async def submit_assignment(
    submission_data: SubmissionCreate,
    current_user: User = Depends(get_current_user)
):
    submission_id = f"submission_{uuid.uuid4().hex[:12]}"
    submission_doc = {
        "submission_id": submission_id,
        "assignment_id": submission_data.assignment_id,
        "student_id": current_user.user_id,
        "content": submission_data.content,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "grade": None,
        "feedback": None
    }
    await db.submissions.insert_one(submission_doc)
    submission_doc.pop('_id')
    submission_doc['submitted_at'] = datetime.fromisoformat(submission_doc['submitted_at'])
    return Submission(**submission_doc)

@api_router.get("/submissions/assignment/{assignment_id}")
async def get_assignment_submissions(
    assignment_id: str,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    submissions = await db.submissions.find({"assignment_id": assignment_id}, {"_id": 0}).to_list(1000)
    
    # Get student details
    result = []
    for submission in submissions:
        student = await db.users.find_one({"user_id": submission['student_id']}, {"_id": 0, "password_hash": 0})
        if student:
            result.append({
                **submission,
                "student_name": student['name']
            })
    
    return result

@api_router.put("/submissions/{submission_id}/grade")
async def grade_submission(
    submission_id: str,
    grade: int,
    feedback: Optional[str] = None,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    result = await db.submissions.update_one(
        {"submission_id": submission_id},
        {"$set": {"grade": grade, "feedback": feedback}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"message": "Graded successfully"}

# ============ TEST ENDPOINTS ============

@api_router.post("/tests", response_model=Test)
async def create_test(
    test_data: TestCreate,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    test_id = f"test_{uuid.uuid4().hex[:12]}"
    test_doc = {
        "test_id": test_id,
        **test_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tests.insert_one(test_doc)
    test_doc.pop('_id')
    test_doc['created_at'] = datetime.fromisoformat(test_doc['created_at'])
    return Test(**test_doc)

@api_router.get("/tests/course/{course_id}", response_model=List[Test])
async def get_course_tests(course_id: str):
    tests = await db.tests.find({"course_id": course_id}, {"_id": 0}).to_list(1000)
    for test in tests:
        if isinstance(test['created_at'], str):
            test['created_at'] = datetime.fromisoformat(test['created_at'])
    return tests

@api_router.post("/test-attempts", response_model=TestAttempt)
async def submit_test(
    attempt_data: TestAttemptCreate,
    current_user: User = Depends(get_current_user)
):
    attempt_id = f"attempt_{uuid.uuid4().hex[:12]}"
    attempt_doc = {
        "attempt_id": attempt_id,
        "test_id": attempt_data.test_id,
        "student_id": current_user.user_id,
        "answers": attempt_data.answers,
        "score": None,
        "attempted_at": datetime.now(timezone.utc).isoformat()
    }
    await db.test_attempts.insert_one(attempt_doc)
    attempt_doc.pop('_id')
    attempt_doc['attempted_at'] = datetime.fromisoformat(attempt_doc['attempted_at'])
    return TestAttempt(**attempt_doc)

@api_router.get("/test-attempts/student")
async def get_student_test_attempts(current_user: User = Depends(get_current_user)):
    attempts = await db.test_attempts.find({"student_id": current_user.user_id}, {"_id": 0}).to_list(1000)
    for attempt in attempts:
        if isinstance(attempt['attempted_at'], str):
            attempt['attempted_at'] = datetime.fromisoformat(attempt['attempted_at'])
    return attempts

# ============ DOUBT ENDPOINTS ============

@api_router.post("/doubts", response_model=Doubt)
async def create_doubt(
    doubt_data: DoubtCreate,
    current_user: User = Depends(get_current_user)
):
    doubt_id = f"doubt_{uuid.uuid4().hex[:12]}"
    
    # AI response if requested
    ai_response = None
    if doubt_data.use_ai and EMERGENT_LLM_KEY:
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"doubt_{doubt_id}",
                system_message=f"You are an expert tutor for Indian students (Classes 9-12). Subject: {doubt_data.subject}. Provide clear, accurate, and helpful explanations."
            ).with_model("openai", "gpt-5.2")
            
            user_message = UserMessage(text=doubt_data.message)
            ai_response = await chat.send_message(user_message)
        except Exception as e:
            logger.error(f"AI response failed: {e}")
    
    doubt_doc = {
        "doubt_id": doubt_id,
        "student_id": current_user.user_id,
        "student_name": current_user.name,
        "course_id": doubt_data.course_id,
        "subject": doubt_data.subject,
        "message": doubt_data.message,
        "is_ai_response": bool(ai_response),
        "ai_response": ai_response,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.doubts.insert_one(doubt_doc)
    doubt_doc.pop('_id')
    doubt_doc['created_at'] = datetime.fromisoformat(doubt_doc['created_at'])
    return Doubt(**doubt_doc)

@api_router.get("/doubts/student", response_model=List[Doubt])
async def get_student_doubts(current_user: User = Depends(get_current_user)):
    doubts = await db.doubts.find({"student_id": current_user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for doubt in doubts:
        if isinstance(doubt['created_at'], str):
            doubt['created_at'] = datetime.fromisoformat(doubt['created_at'])
    return doubts

@api_router.get("/doubts", response_model=List[Doubt])
async def get_all_doubts(current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))):
    doubts = await db.doubts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for doubt in doubts:
        if isinstance(doubt['created_at'], str):
            doubt['created_at'] = datetime.fromisoformat(doubt['created_at'])
    return doubts

@api_router.post("/doubt-responses", response_model=DoubtResponse)
async def respond_to_doubt(
    response_data: DoubtResponseCreate,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    response_id = f"response_{uuid.uuid4().hex[:12]}"
    response_doc = {
        "response_id": response_id,
        "doubt_id": response_data.doubt_id,
        "responder_id": current_user.user_id,
        "responder_name": current_user.name,
        "message": response_data.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.doubt_responses.insert_one(response_doc)
    response_doc.pop('_id')
    response_doc['created_at'] = datetime.fromisoformat(response_doc['created_at'])
    return DoubtResponse(**response_doc)

@api_router.get("/doubt-responses/{doubt_id}", response_model=List[DoubtResponse])
async def get_doubt_responses(doubt_id: str):
    responses = await db.doubt_responses.find({"doubt_id": doubt_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    for response in responses:
        if isinstance(response['created_at'], str):
            response['created_at'] = datetime.fromisoformat(response['created_at'])
    return responses

# ============ ANNOUNCEMENT ENDPOINTS ============

@api_router.post("/announcements", response_model=Announcement)
async def create_announcement(
    announcement_data: AnnouncementCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    announcement_id = f"announcement_{uuid.uuid4().hex[:12]}"
    announcement_doc = {
        "announcement_id": announcement_id,
        "title": announcement_data.title,
        "content": announcement_data.content,
        "created_by": current_user.user_id,
        "created_by_name": current_user.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.announcements.insert_one(announcement_doc)
    announcement_doc.pop('_id')
    announcement_doc['created_at'] = datetime.fromisoformat(announcement_doc['created_at'])
    return Announcement(**announcement_doc)

@api_router.get("/announcements", response_model=List[Announcement])
async def get_announcements():
    announcements = await db.announcements.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for announcement in announcements:
        if isinstance(announcement['created_at'], str):
            announcement['created_at'] = datetime.fromisoformat(announcement['created_at'])
    return announcements

# ============ PAYMENT ENDPOINTS (MOCKED) ============

@api_router.post("/payments/submit-verification")
async def submit_payment_verification(
    course_id: str = Form(...),
    amount: int = Form(...),
    upi_id: str = Form(...),
    utr: str = Form(...),
    screenshot: Optional[bytes] = File(None),
    current_user: User = Depends(get_current_user)
):
    """
    Submit payment verification details for manual verification
    """
    verification_id = f"verification_{uuid.uuid4().hex[:12]}"
    
    verification_doc = {
        "verification_id": verification_id,
        "student_id": current_user.user_id,
        "student_name": current_user.name,
        "student_email": current_user.email,
        "course_id": course_id,
        "amount": amount,
        "upi_id": upi_id,
        "utr": utr,
        "has_screenshot": screenshot is not None,
        "status": "pending",  # pending, verified, rejected
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "verified_at": None,
        "verified_by": None
    }
    
    await db.payment_verifications.insert_one(verification_doc)
    
    # Update enrollment status to pending
    await db.enrollments.update_one(
        {"student_id": current_user.user_id, "course_id": course_id},
        {"$set": {"payment_status": "pending_verification"}}
    )
    
    return {
        "message": "Payment verification submitted successfully",
        "verification_id": verification_id,
        "status": "pending"
    }

@api_router.post("/payments/create-order")
async def create_payment_order(
    order_data: PaymentOrderCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create Razorpay payment order (MOCKED - Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env)
    """
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_doc = {
        "order_id": order_id,
        "amount": order_data.amount,
        "currency": "INR",
        "status": "created",
        "course_id": order_data.course_id,
        "student_id": current_user.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_orders.insert_one(order_doc)
    
    # TODO: Integrate real Razorpay when keys are provided
    # razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    # razorpay_order = razorpay_client.order.create({"amount": order_data.amount * 100, "currency": "INR"})
    
    return {
        "order_id": order_id,
        "amount": order_data.amount,
        "currency": "INR",
        "message": "MOCKED: Add Razorpay keys to enable real payments"
    }

@api_router.post("/payments/verify")
async def verify_payment(
    order_id: str,
    payment_id: str,
    signature: str,
    current_user: User = Depends(get_current_user)
):
    """
    Verify Razorpay payment (MOCKED)
    """
    # TODO: Verify signature with Razorpay
    # razorpay_client.utility.verify_payment_signature({
    #     'razorpay_order_id': order_id,
    #     'razorpay_payment_id': payment_id,
    #     'razorpay_signature': signature
    # })
    
    # Update payment order
    order = await db.payment_orders.find_one({"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.payment_orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": "completed", "payment_id": payment_id}}
    )
    
    # Update enrollment
    await db.enrollments.update_one(
        {"student_id": current_user.user_id, "course_id": order['course_id']},
        {"$set": {"payment_status": "completed", "payment_id": payment_id}}
    )
    
    return {"message": "Payment verified (MOCKED)", "status": "completed"}

# ============ ADMIN ENDPOINTS ============

@api_router.get("/admin/payment-verifications")
async def get_payment_verifications(current_user: User = Depends(require_role([UserRole.ADMIN]))):
    """Get all payment verifications for admin review"""
    verifications = await db.payment_verifications.find({}, {"_id": 0}).sort("submitted_at", -1).to_list(1000)
    
    # Parse datetime strings
    for verification in verifications:
        if isinstance(verification.get('submitted_at'), str):
            verification['submitted_at'] = verification['submitted_at']
        if verification.get('verified_at') and isinstance(verification['verified_at'], str):
            verification['verified_at'] = verification['verified_at']
    
    return verifications

@api_router.post("/admin/approve-payment/{verification_id}")
async def approve_payment(
    verification_id: str,
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Approve payment and grant course access"""
    # Get verification details
    verification = await db.payment_verifications.find_one({"verification_id": verification_id})
    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")
    
    # Update verification status
    await db.payment_verifications.update_one(
        {"verification_id": verification_id},
        {"$set": {
            "status": "verified",
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "verified_by": current_user.user_id
        }}
    )
    
    # Update enrollment status to completed
    await db.enrollments.update_one(
        {"student_id": verification['student_id'], "course_id": verification['course_id']},
        {"$set": {"payment_status": "completed"}}
    )
    
    return {"message": "Payment approved and course access granted"}

@api_router.post("/admin/reject-payment/{verification_id}")
async def reject_payment(
    verification_id: str,
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Reject payment verification"""
    verification = await db.payment_verifications.find_one({"verification_id": verification_id})
    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")
    
    # Update verification status
    await db.payment_verifications.update_one(
        {"verification_id": verification_id},
        {"$set": {
            "status": "rejected",
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "verified_by": current_user.user_id
        }}
    )
    
    # Update enrollment status to failed
    await db.enrollments.update_one(
        {"student_id": verification['student_id'], "course_id": verification['course_id']},
        {"$set": {"payment_status": "failed"}}
    )
    
    return {"message": "Payment rejected"}

@api_router.get("/admin/users")
async def get_all_users(current_user: User = Depends(require_role([UserRole.ADMIN]))):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    if role not in [UserRole.STUDENT, UserRole.TEACHER, UserRole.PARENT, UserRole.ADMIN]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await db.users.update_one({"user_id": user_id}, {"$set": {"role": role}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Role updated successfully"}

@api_router.get("/admin/analytics")
async def get_analytics(current_user: User = Depends(require_role([UserRole.ADMIN]))):
    total_users = await db.users.count_documents({})
    total_courses = await db.courses.count_documents({})
    total_enrollments = await db.enrollments.count_documents({"payment_status": "completed"})
    total_revenue = await db.payment_orders.aggregate([
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_revenue": total_revenue[0]['total'] if total_revenue else 0
    }

# ============ TEACHER ENDPOINTS ============

@api_router.post("/teacher/update-performance")
async def update_student_performance(
    student_id: str,
    course_id: str,
    marks: str = None,
    remarks: str = None,
    attendance: str = None,
    progress_level: str = None,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Update student performance data"""
    performance_id = f"perf_{uuid.uuid4().hex[:12]}"
    
    performance_doc = {
        "performance_id": performance_id,
        "student_id": student_id,
        "course_id": course_id,
        "teacher_id": current_user.user_id,
        "marks": marks,
        "remarks": remarks,
        "attendance": attendance,
        "progress_level": progress_level,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Upsert (update or insert)
    await db.student_performance.update_one(
        {"student_id": student_id, "course_id": course_id},
        {"$set": performance_doc},
        upsert=True
    )
    
    return {"message": "Performance updated successfully"}

@api_router.delete("/lectures/{lecture_id}")
async def delete_lecture(
    lecture_id: str,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Delete a lecture"""
    result = await db.lectures.delete_one({"lecture_id": lecture_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lecture not found")
    return {"message": "Lecture deleted"}

@api_router.put("/lectures/{lecture_id}")
async def update_lecture(
    lecture_id: str,
    lecture_data: LectureCreate,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Update a lecture"""
    result = await db.lectures.update_one(
        {"lecture_id": lecture_id},
        {"$set": lecture_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lecture not found")
    return {"message": "Lecture updated"}

@api_router.delete("/live-classes/{class_id}")
async def delete_live_class(
    class_id: str,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Delete a live class"""
    result = await db.live_classes.delete_one({"class_id": class_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Live class not found")
    return {"message": "Live class deleted"}

@api_router.delete("/tests/{test_id}")
async def delete_test(
    test_id: str,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Delete a test"""
    result = await db.tests.delete_one({"test_id": test_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"message": "Test deleted"}

@api_router.put("/tests/{test_id}")
async def update_test(
    test_id: str,
    test_data: TestCreate,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Update a test"""
    result = await db.tests.update_one(
        {"test_id": test_id},
        {"$set": test_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"message": "Test updated"}

# ============ PARENT ENDPOINTS ============

@api_router.get("/parent/children")
async def get_children(current_user: User = Depends(require_role([UserRole.PARENT]))):
    # Find students with this parent's email
    children = await db.users.find(
        {"parent_email": current_user.email},
        {"_id": 0, "password_hash": 0}
    ).to_list(1000)
    return children

@api_router.get("/parent/child/{child_id}/progress")
async def get_child_progress(
    child_id: str,
    current_user: User = Depends(require_role([UserRole.PARENT]))
):
    # Verify this is the parent
    child = await db.users.find_one({"user_id": child_id, "parent_email": current_user.email})
    if not child:
        raise HTTPException(status_code=403, detail="Not your child")
    
    # Get enrollments
    enrollments = await db.enrollments.find(
        {"student_id": child_id, "payment_status": "completed"},
        {"_id": 0}
    ).to_list(1000)
    
    # Get test attempts
    test_attempts = await db.test_attempts.find({"student_id": child_id}, {"_id": 0}).to_list(1000)
    
    # Get submissions
    submissions = await db.submissions.find({"student_id": child_id}, {"_id": 0}).to_list(1000)
    
    return {
        "child": {"user_id": child['user_id'], "name": child['name'], "email": child['email']},
        "enrollments": enrollments,
        "test_attempts": test_attempts,
        "submissions": submissions
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

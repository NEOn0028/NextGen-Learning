"""
Seed script to add sample courses to the database
Run this to populate the database with sample courses for testing
"""
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

async def seed_courses():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Sample courses
    courses = [
        {
            "course_id": "course_general_9_12",
            "title": "Complete Class 9-12 General Course",
            "class_level": "9-12",
            "stream": "general",
            "subject": "All Subjects",
            "description": "Comprehensive 1-on-1 mentorship for Classes 9-12 covering all subjects including Mathematics, Science, English, and Social Studies. Perfect for building strong fundamentals.",
            "price": 6999,
            "teacher_id": "teacher_001",
            "teacher_name": "Expert Tutor",
            "thumbnail": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "course_id": "course_humanities_11_12",
            "title": "Class 11-12 Humanities Premium",
            "class_level": "11-12",
            "stream": "humanities",
            "subject": "History, Political Science, Geography",
            "description": "Specialized 1-on-1 coaching for Humanities stream. Covers History, Political Science, Geography, Economics, and optional subjects. Board exam focused with conceptual clarity.",
            "price": 7999,
            "teacher_id": "teacher_002",
            "teacher_name": "Arts Specialist",
            "thumbnail": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "course_id": "course_commerce_11_12",
            "title": "Class 11-12 Commerce Excellence",
            "class_level": "11-12",
            "stream": "commerce",
            "subject": "Accounts, Economics, Business Studies",
            "description": "Premium 1-on-1 mentorship for Commerce students. Master Accountancy, Economics, Business Studies, and Mathematics. Includes practical case studies and board exam preparation.",
            "price": 9999,
            "teacher_id": "teacher_003",
            "teacher_name": "Commerce Expert",
            "thumbnail": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "course_id": "course_maths_9_10",
            "title": "Mathematics Mastery Class 9-10",
            "class_level": "9-10",
            "stream": "general",
            "subject": "Mathematics",
            "description": "Focused 1-on-1 mathematics coaching for Class 9-10. Build strong foundation in algebra, geometry, trigonometry, and statistics.",
            "price": 6999,
            "teacher_id": "teacher_004",
            "teacher_name": "Math Expert",
            "thumbnail": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "course_id": "course_commerce_accounts",
            "title": "Accountancy Specialized Program",
            "class_level": "11-12",
            "stream": "commerce",
            "subject": "Accountancy",
            "description": "Specialized 1-on-1 coaching for Accountancy. Master balance sheets, financial statements, partnership accounts, and company accounts with practical examples.",
            "price": 9999,
            "teacher_id": "teacher_003",
            "teacher_name": "CA Mentor",
            "thumbnail": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "course_id": "course_humanities_history",
            "title": "History Deep Dive Class 11-12",
            "class_level": "11-12",
            "stream": "humanities",
            "subject": "History",
            "description": "Comprehensive 1-on-1 History coaching covering ancient, medieval, and modern history. Focus on NCERT, map work, and source-based questions for board exams.",
            "price": 7999,
            "teacher_id": "teacher_005",
            "teacher_name": "History Scholar",
            "thumbnail": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Check if courses already exist
    existing_count = await db.courses.count_documents({})
    
    if existing_count > 0:
        print(f"Database already has {existing_count} courses. Clearing old courses...")
        await db.courses.delete_many({})
    
    # Insert courses
    result = await db.courses.insert_many(courses)
    print(f"✓ Successfully added {len(result.inserted_ids)} sample courses!")
    
    # Display added courses
    print("\nAdded Courses:")
    for course in courses:
        print(f"  - {course['title']} (₹{course['price']}/month) - {course['stream'].upper()}")
    
    client.close()
    print("\n✓ Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_courses())

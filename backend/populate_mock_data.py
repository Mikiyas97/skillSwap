import os
import random
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillswap_backend.settings')
django.setup()

from users.models import User
from skills.models import Category, SkillListing
from django.utils.text import slugify

# Sample data
USERS_DATA = [
    {
        "email": "alemu@dbu.edu.et",
        "username": "alemu123",
        "first_name": "Alemu",
        "last_name": "Tesfaye",
        "college": "College of Computing",
        "department": "Software Engineering",
        "year": "3rd Year",
        "bio": "Passionate about full-stack web development and AI.",
        "rating": 4.8,
        "total_reviews": 12,
        "sessions_completed": 15
    },
    {
        "email": "betty@dbu.edu.et",
        "username": "betty_designs",
        "first_name": "Betelhem",
        "last_name": "Worku",
        "college": "College of Engineering",
        "department": "Architecture",
        "year": "4th Year",
        "bio": "Loves creating beautiful and sustainable architectural designs.",
        "rating": 4.9,
        "total_reviews": 20,
        "sessions_completed": 25
    },
    {
        "email": "chala@dbu.edu.et",
        "username": "chala_math",
        "first_name": "Chala",
        "last_name": "Bekele",
        "college": "College of Natural Sciences",
        "department": "Mathematics",
        "year": "2nd Year",
        "bio": "Math enthusiast and competitive programmer.",
        "rating": 4.5,
        "total_reviews": 5,
        "sessions_completed": 8
    },
    {
        "email": "dawit@dbu.edu.et",
        "username": "dawit_business",
        "first_name": "Dawit",
        "last_name": "Tadesse",
        "college": "College of Business",
        "department": "Accounting",
        "year": "Graduating Class",
        "bio": "Expert in financial analysis and Excel modeling.",
        "rating": 4.7,
        "total_reviews": 15,
        "sessions_completed": 18
    }
]

LISTINGS_DATA = [
    {
        "user_email": "alemu@dbu.edu.et",
        "title": "I will teach you React.js and Tailwind CSS",
        "description": "Learn how to build modern, responsive web applications using React and Tailwind CSS. We will build a portfolio project together.",
        "post_type": "offer",
        "category_name": "Technology",
        "tags": ["React", "JavaScript", "Frontend", "Tailwind"],
        "level": "Beginner",
        "availability": "Weekends 2PM - 5PM"
    },
    {
        "user_email": "alemu@dbu.edu.et",
        "title": "Need help with Advanced Data Structures",
        "description": "I am looking for someone to tutor me in Advanced Data Structures (Graphs, DP, Trees) for my upcoming exams.",
        "post_type": "wanted",
        "category_name": "Technology",
        "tags": ["Algorithms", "Data Structures", "Java"],
        "level": "Advanced",
        "availability": "Weekdays after 6PM"
    },
    {
        "user_email": "betty@dbu.edu.et",
        "title": "AutoCAD and SketchUp Basics",
        "description": "I offer tutoring sessions for 2D and 3D modeling using AutoCAD and SketchUp. Perfect for engineering and architecture students.",
        "post_type": "offer",
        "category_name": "Art",
        "tags": ["AutoCAD", "SketchUp", "Design", "3D Modeling"],
        "level": "Beginner",
        "availability": "Tuesday and Thursday evenings"
    },
    {
        "user_email": "chala@dbu.edu.et",
        "title": "Calculus II and Linear Algebra Tutoring",
        "description": "Struggling with Math? I can help you understand Calculus II and Linear Algebra concepts with practical examples.",
        "post_type": "offer",
        "category_name": "Education",
        "tags": ["Math", "Calculus", "Linear Algebra"],
        "level": "Intermediate",
        "availability": "Flexible"
    },
    {
        "user_email": "dawit@dbu.edu.et",
        "title": "Looking for Python Data Analysis Tutor",
        "description": "I need someone to teach me Pandas, NumPy, and Matplotlib for financial data analysis.",
        "post_type": "wanted",
        "category_name": "Technology",
        "tags": ["Python", "Data Analysis", "Pandas"],
        "level": "Beginner",
        "availability": "Weekends morning"
    },
    {
        "user_email": "dawit@dbu.edu.et",
        "title": "Mastering Advanced Excel for Business",
        "description": "I will teach you VLOOKUP, Pivot Tables, Macros, and Financial Modeling in Excel.",
        "post_type": "offer",
        "category_name": "Business",
        "tags": ["Excel", "Finance", "Business", "Data"],
        "level": "Advanced",
        "availability": "Monday and Wednesday 5PM - 7PM"
    }
]


def populate():
    print("Creating users...")
    users = {}
    for data in USERS_DATA:
        user, created = User.objects.get_or_create(
            email=data["email"],
            defaults={
                "username": data["username"],
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "college": data["college"],
                "department": data["department"],
                "year": data["year"],
                "bio": data["bio"],
            }
        )
        if created:
            user.set_password('SkillSwap@2026')
            user.rating = data["rating"]
            user.total_reviews = data["total_reviews"]
            user.sessions_completed = data["sessions_completed"]
            user.save()
        users[data["email"]] = user
        print(f" - {'Created' if created else 'Existing'} User: {user.email}")

    print("\nCreating listings...")
    for data in LISTINGS_DATA:
        user = users[data["user_email"]]
        category, _ = Category.objects.get_or_create(
            name=data["category_name"],
            defaults={"slug": slugify(data["category_name"])}
        )
        
        listing, created = SkillListing.objects.get_or_create(
            tutor=user,
            title=data["title"],
            defaults={
                "description": data["description"],
                "post_type": data["post_type"],
                "category": category,
                "tags": data["tags"],
                "level": data["level"],
                "availability": data["availability"]
            }
        )
        print(f" - {'Created' if created else 'Existing'} Listing: {listing.title} ({listing.post_type})")

    print("\n✅ Database populated successfully!")

if __name__ == "__main__":
    populate()

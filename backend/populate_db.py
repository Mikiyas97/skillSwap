import os
import django
import uuid
import random
from datetime import datetime, timedelta

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "skillswap_backend.settings")
django.setup()

from users.models import User
from skills.models import Category, SkillListing
from tutoring.models import Session, Review

def run():
    print("Clearing existing data...")
    Review.objects.all().delete()
    Session.objects.all().delete()
    SkillListing.objects.all().delete()
    Category.objects.all().delete()
    # Don't delete all users in case there are real ones, but let's delete our mock ones.
    User.objects.filter(email__endswith='@mock.dbu.edu.et').delete()

    print("Creating Categories...")
    categories = [
        'Technology', 'Science', 'Education', 'Art', 'Music',
        'Business', 'Health', 'Personal', 'Entertainment', 'Sport', 'Society', 'Other'
    ]
    category_objs = {}
    for cat_name in categories:
        cat = Category.objects.create(name=cat_name, slug=cat_name.lower())
        category_objs[cat_name] = cat

    print("Creating Mock Users...")
    mock_users_data = [
        {
            "id": "1",
            "name": "Abebe Kebede",
            "department": "Computer Science",
            "year": "4th Year",
            "rating": 4.8,
            "reviews": 12,
            "sessions": 15,
            "avatar": "https://i.pravatar.cc/150?u=1",
            "bio": "Passionate about building scalable web apps and sharing knowledge."
        },
        {
            "id": "2",
            "name": "Sara Ahmed",
            "department": "Software Engineering",
            "year": "3rd Year",
            "rating": 4.9,
            "reviews": 24,
            "sessions": 30,
            "avatar": "https://i.pravatar.cc/150?u=2",
            "bio": "UI/UX enthusiast and frontend developer."
        },
        {
            "id": "3",
            "name": "Dawit Tadesse",
            "department": "Information Systems",
            "year": "2nd Year",
            "rating": 4.5,
            "reviews": 8,
            "sessions": 10,
            "avatar": "https://i.pravatar.cc/150?u=3",
            "bio": "Data science beginner eager to learn and teach."
        },
        {
            "id": "4",
            "name": "Hana Bekele",
            "department": "Computer Science",
            "year": "4th Year",
            "rating": 5.0,
            "reviews": 40,
            "sessions": 55,
            "avatar": "https://i.pravatar.cc/150?u=4",
            "bio": "Expert in machine learning and Python."
        },
        {
            "id": "5",
            "name": "Eyob Tesfaye",
            "department": "Software Engineering",
            "year": "1st Year",
            "rating": 0,
            "reviews": 0,
            "sessions": 0,
            "avatar": "https://i.pravatar.cc/150?u=5",
            "bio": "Just starting my journey in tech."
        }
    ]

    user_objs = {}
    for u in mock_users_data:
        first_name = u['name'].split()[0]
        last_name = u['name'].split()[1] if len(u['name'].split()) > 1 else ''
        email = f"{first_name.lower()}{u['id']}@mock.dbu.edu.et"
        user = User.objects.create(
            username=f"{first_name.lower()}{u['id']}",
            email=email,
            first_name=first_name,
            last_name=last_name,
            supabase_uid=str(uuid.uuid4()),
            college="Computing",
            department=u['department'],
            year=u['year'],
            avatar=u['avatar'],
            bio=u['bio'],
            rating=0.0, # Rating will be calculated based on reviews
            total_reviews=0,
            sessions_completed=0,
        )
        user_objs[u['id']] = user

    print("Creating Skill Listings...")
    listings_data = [
        {
            "tutor_id": "1",
            "title": "React.js Mastery",
            "description": "Learn how to build modern web applications using React.js. We will cover hooks, state management, and component architecture.",
            "category": "Technology",
            "tags": ["React", "Frontend", "JavaScript"],
            "level": "Intermediate",
            "availability": "Mon, Wed, Fri (Afternoons)"
        },
        {
            "tutor_id": "2",
            "title": "Figma UI/UX Design",
            "description": "Master the fundamentals of UI/UX design. Learn how to create wireframes, prototypes, and beautiful interfaces in Figma.",
            "category": "Design", # Note: Changed to Art or Technology depending on what we have, let's map Design to Technology or Art
            "tags": ["UI/UX", "Figma", "Design"],
            "level": "Beginner",
            "availability": "Weekends"
        },
        {
            "tutor_id": "4",
            "title": "Machine Learning Basics",
            "description": "An introduction to machine learning concepts using Python, Scikit-learn, and Pandas.",
            "category": "Technology",
            "tags": ["Python", "Machine Learning", "Data Science"],
            "level": "Advanced",
            "availability": "Tue, Thu (Evenings)"
        },
        {
            "tutor_id": "1",
            "title": "Node.js Backend",
            "description": "Learn how to create robust RESTful APIs using Node.js and Express.",
            "category": "Technology",
            "tags": ["Node.js", "Backend", "API"],
            "level": "Intermediate",
            "availability": "Wed, Sat"
        }
    ]

    listing_objs = []
    for ld in listings_data:
        cat_name = ld['category']
        if cat_name not in category_objs:
             # Fallback category if Design etc was used
             cat_name = 'Technology'

        listing = SkillListing.objects.create(
            tutor=user_objs[ld['tutor_id']],
            title=ld['title'],
            description=ld['description'],
            category=category_objs[cat_name],
            tags=ld['tags'],
            level=ld['level'],
            availability=ld['availability'],
            is_active=True
        )
        listing_objs.append(listing)

    print("Creating Sessions & Reviews...")
    # Add completed sessions and reviews for Hana (id: 4) to make her a top tutor
    listing_hana = next(l for l in listing_objs if l.tutor == user_objs["4"])
    
    for i in range(15):
        student = user_objs[str(random.choice([1,2,3,5]))]
        session = Session.objects.create(
            listing=listing_hana,
            tutor=user_objs["4"],
            student=student,
            skill_title=listing_hana.title,
            date=(datetime.now() - timedelta(days=i*2)).date(),
            time_slot="10:00 AM - 11:30 AM",
            status="completed"
        )
        session.complete() # Update tutor stats
        Review.objects.create(
            session=session,
            student=student,
            rating=random.choice([4, 5, 5, 5]),
            comment=f"Great session! Highly recommend."
        )

    # Add for Abebe (id: 1)
    listing_abebe = next(l for l in listing_objs if l.tutor == user_objs["1"])
    for i in range(8):
        student = user_objs[str(random.choice([2,3,4,5]))]
        session = Session.objects.create(
            listing=listing_abebe,
            tutor=user_objs["1"],
            student=student,
            skill_title=listing_abebe.title,
            date=(datetime.now() - timedelta(days=i*3)).date(),
            time_slot="2:00 PM - 3:30 PM",
            status="completed"
        )
        session.complete()
        Review.objects.create(
            session=session,
            student=student,
            rating=random.choice([4, 5]),
            comment="Very helpful."
        )

    # Add for Sara (id: 2)
    listing_sara = next(l for l in listing_objs if l.tutor == user_objs["2"])
    for i in range(12):
        student = user_objs[str(random.choice([1,3,4,5]))]
        session = Session.objects.create(
            listing=listing_sara,
            tutor=user_objs["2"],
            student=student,
            skill_title=listing_sara.title,
            date=(datetime.now() - timedelta(days=i*4)).date(),
            time_slot="4:00 PM - 5:30 PM",
            status="completed"
        )
        session.complete()
        Review.objects.create(
            session=session,
            student=student,
            rating=5,
            comment="Awesome!"
        )

    print("Data population complete!")

if __name__ == '__main__':
    run()

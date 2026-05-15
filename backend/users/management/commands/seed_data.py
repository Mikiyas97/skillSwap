"""
Management command to seed the database with demo data.
Run: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from users.models import User
from skills.models import Category, SkillListing
from tutoring.models import Session, Review
from chat.models import Message, Conversation
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Seed database with demo data for SkillSwap DBU'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Categories
        categories_data = [
            ('Programming', 'programming', '💻'),
            ('Web Development', 'web-development', '🌐'),
            ('Mobile Development', 'mobile-development', '📱'),
            ('Data Science', 'data-science', '📊'),
            ('Database', 'database', '🗄️'),
            ('Networking', 'networking', '🔗'),
            ('Security', 'security', '🔒'),
            ('Design', 'design', '🎨'),
            ('DevOps', 'devops', '⚙️'),
        ]
        categories = {}
        for name, slug, icon in categories_data:
            cat, _ = Category.objects.get_or_create(name=name, defaults={'slug': slug, 'icon': icon})
            categories[name] = cat

        # Users
        users_data = [
            {
                'username': 'abebegeleta', 'email': 'abebegeleta@dbu.edu.et',
                'first_name': 'Abebe', 'last_name': 'Geleta',
                'department': 'Software Engineering', 'year': '3rd Year',
                'bio': 'Passionate about teaching programming. I believe every student can learn to code.',
                'skills_teaching': ['Python Programming', 'Data Structures', 'Algorithms'],
                'rating': 4.9, 'total_reviews': 23, 'sessions_completed': 45,
                'badges': ['Top Tutor', 'Python Expert', '50+ Sessions'],
            },
            {
                'username': 'tigistworku', 'email': 'tigistworku@dbu.edu.et',
                'first_name': 'Tigist', 'last_name': 'Worku',
                'department': 'Computer Science', 'year': '2nd Year',
                'bio': 'Eager learner looking to improve my programming skills.',
                'skills_teaching': ['UI/UX Design', 'HTML/CSS', 'Figma'],
                'rating': 4.7, 'total_reviews': 12, 'sessions_completed': 18,
                'badges': ['Rising Star', 'Design Guru'],
            },
            {
                'username': 'dawitmengistu', 'email': 'dawitmengistu@dbu.edu.et',
                'first_name': 'Dawit', 'last_name': 'Mengistu',
                'department': 'Software Engineering', 'year': '4th Year',
                'bio': 'Final year student with internship experience.',
                'skills_teaching': ['Java', 'Spring Boot', 'Database Design', 'Git'],
                'rating': 4.8, 'total_reviews': 31, 'sessions_completed': 52,
                'badges': ['Top Tutor', 'Java Master', 'Mentor'],
            },
            {
                'username': 'saratadesse', 'email': 'saratadesse@dbu.edu.et',
                'first_name': 'Sara', 'last_name': 'Tadesse',
                'department': 'Information Technology', 'year': '3rd Year',
                'bio': 'Network and security enthusiast.',
                'skills_teaching': ['Networking', 'Cybersecurity', 'Linux'],
                'rating': 4.6, 'total_reviews': 8, 'sessions_completed': 15,
                'badges': ['Security Pro'],
            },
            {
                'username': 'yonasbekele', 'email': 'yonasbekele@dbu.edu.et',
                'first_name': 'Yonas', 'last_name': 'Bekele',
                'department': 'Software Engineering', 'year': '2nd Year',
                'bio': 'Mobile app development is my passion.',
                'skills_teaching': ['Flutter', 'Dart', 'Mobile UI'],
                'rating': 4.5, 'total_reviews': 6, 'sessions_completed': 10,
                'badges': ['Mobile Dev'],
            },
        ]

        users = []
        for data in users_data:
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    'email': data['email'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'department': data['department'],
                    'year': data['year'],
                    'bio': data['bio'],
                    'skills_teaching': data['skills_teaching'],
                    'rating': data['rating'],
                    'total_reviews': data['total_reviews'],
                    'sessions_completed': data['sessions_completed'],
                    'badges': data['badges'],
                }
            )
            if created:
                user.set_password('Test1234!')
            users.append(user)

        abebe, tigist, dawit, sara, yonas = users

        # Skill Listings
        listings_data = [
            (abebe, 'Python for Beginners', 'I can teach you Python from scratch — variables, loops, functions, OOP.', categories['Programming'], ['Python', 'Programming', 'Beginner-friendly'], 'Beginner', 'Weekends 2–5pm'),
            (dawit, 'Java & Spring Boot Masterclass', 'From core Java to building REST APIs with Spring Boot.', categories['Programming'], ['Java', 'Spring Boot', 'Backend', 'API'], 'Intermediate', 'Mon/Wed/Fri 4–6pm'),
            (tigist, 'UI/UX Design Fundamentals', 'Learn design thinking, wireframing in Figma, and how to create beautiful interfaces.', categories['Design'], ['Design', 'Figma', 'UI/UX', 'Creative'], 'Beginner', 'Tue/Thu 3–5pm'),
            (sara, 'Network Security Essentials', 'Understanding firewalls, encryption, VPNs, and common vulnerabilities.', categories['Security'], ['Security', 'Networking', 'Linux'], 'Intermediate', 'Weekends 10am–12pm'),
            (yonas, 'Build Your First Flutter App', 'Go from zero to a published mobile app.', categories['Mobile Development'], ['Flutter', 'Mobile', 'Dart'], 'Beginner', 'Sat 9am–12pm'),
            (abebe, 'Data Structures & Algorithms', 'Master arrays, linked lists, trees, graphs, sorting, and searching.', categories['Programming'], ['DSA', 'Algorithms', 'Interview Prep'], 'Advanced', 'Mon/Wed 6–8pm'),
        ]

        listings = []
        for tutor, title, desc, cat, tags, level, avail in listings_data:
            listing, _ = SkillListing.objects.get_or_create(
                tutor=tutor, title=title,
                defaults={'description': desc, 'category': cat, 'tags': tags, 'level': level, 'availability': avail}
            )
            listings.append(listing)

        # Sessions
        today = date.today()
        session1, _ = Session.objects.get_or_create(
            listing=listings[0], tutor=abebe, student=tigist, skill_title='Python for Beginners',
            defaults={'date': today + timedelta(days=2), 'time_slot': '3:00 PM', 'location': 'Library Room 204', 'status': 'upcoming'}
        )
        session2, _ = Session.objects.get_or_create(
            listing=listings[1], tutor=dawit, student=tigist, skill_title='Java & Spring Boot',
            defaults={'date': today - timedelta(days=1), 'time_slot': '4:00 PM', 'location': 'CS Lab 3', 'status': 'completed'}
        )
        session3, _ = Session.objects.get_or_create(
            listing=listings[2], tutor=tigist, student=abebe, skill_title='UI/UX Design',
            defaults={'date': today - timedelta(days=5), 'time_slot': '3:00 PM', 'location': 'Online', 'status': 'completed'}
        )

        # Reviews
        Review.objects.get_or_create(
            session=session2, student=tigist,
            defaults={'rating': 5, 'comment': 'Dawit explained everything so clearly. Highly recommend!'}
        )

        # Messages
        Message.objects.get_or_create(
            sender=tigist, receiver=abebe,
            text="Hi Abebe! I'm excited for our Python session. Should I prepare anything?",
            defaults={'is_read': True}
        )
        Message.objects.get_or_create(
            sender=abebe, receiver=tigist,
            text='Hi Tigist! Just make sure you have Python installed. See you Saturday!',
            defaults={'is_read': True}
        )

        self.stdout.write(self.style.SUCCESS(
            f'Done! Seeded: {len(users)} users, {len(listings)} listings, '
            f'{Session.objects.count()} sessions, {Review.objects.count()} reviews'
        ))

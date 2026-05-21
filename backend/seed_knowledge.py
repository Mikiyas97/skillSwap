"""
Seed the dbu_knowledge table with initial DBU facts.
Run once after enabling pgvector in Supabase:
    python seed_knowledge.py
"""

import os
import sys
import time
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillswap_backend.settings')
django.setup()

from assistant.embeddings import insert_knowledge

# ═══════════════════════════════════════════════════════════════
# DBU Knowledge Chunks — each entry is (topic, content)
# ═══════════════════════════════════════════════════════════════

KNOWLEDGE = [
    # ── Academic Calendar ──────────────────────────────────────
    ("Academic Calendar",
     "Debre Birhan University (DBU) academic year typically runs from September to July. "
     "The first semester starts in mid-September and ends in late January. "
     "The second semester begins in mid-February and ends in late June or early July. "
     "Registration for each semester usually opens one to two weeks before classes begin."),

    ("Academic Calendar - Key Dates",
     "Key dates for the DBU academic year: Registration period is the first two weeks of September "
     "for the first semester. Classes begin in the third week of September. "
     "Midterm exams are typically held in November. Final exams take place in January. "
     "The second semester registration opens in early February. "
     "Summer session (if offered) begins in July."),

    ("Academic Calendar - Breaks",
     "DBU academic breaks include: A one-to-two week break between semesters (late January to mid-February). "
     "Ethiopian holidays are observed including Ethiopian New Year (Meskerem 1), "
     "Timkat (Epiphany), Ethiopian Easter, and other national holidays. "
     "The summer break runs from July to September."),

    # ── Registration ────────────────────────────────────────────
    ("Registration Process",
     "To register at DBU, students must: 1) Log in to the student portal. "
     "2) Check fee clearance status — all outstanding fees must be settled before registration. "
     "3) Select courses for the semester based on your curriculum. "
     "4) Confirm your schedule and verify there are no time conflicts. "
     "5) Print your registration card. "
     "Late registration may be allowed with a penalty fee during the first week of classes."),

    ("Registration - New Students",
     "New students joining DBU must: Bring their original grade 12 transcript and university placement letter. "
     "Complete the registration form at the Registrar's Office. "
     "Get a student ID card from the ID office. "
     "Receive dormitory assignment from the Student Services office. "
     "Attend the orientation program held during the first week. "
     "New students should arrive at least one week before classes begin."),

    ("Registration - Course Load",
     "Regular students at DBU typically take 15-21 credit hours per semester. "
     "The minimum course load for full-time status is 12 credit hours. "
     "The maximum allowed is 21 credit hours per semester. "
     "Students with a GPA above 3.5 may request to take up to 24 credit hours with department approval. "
     "Students on academic probation may be limited to fewer credit hours."),

    # ── Colleges & Departments ──────────────────────────────────
    ("Colleges and Departments Overview",
     "Debre Birhan University has multiple colleges and institutes: "
     "College of Computing and Informatics (CCI), College of Natural and Computational Sciences, "
     "College of Business and Economics, College of Social Sciences and Humanities, "
     "College of Engineering and Technology, College of Medicine and Health Sciences, "
     "College of Law, College of Agriculture, and the Institute of Education and Behavioral Sciences."),

    ("College of Computing and Informatics",
     "The College of Computing and Informatics (CCI) at DBU offers the following departments: "
     "Computer Science (CS), Information Technology (IT), Software Engineering (SE), "
     "and Information Systems (IS). "
     "The college focuses on producing skilled IT professionals. "
     "Programs are offered at undergraduate (BSc) and postgraduate (MSc) levels. "
     "The department of Computer Science was one of the founding departments of the college."),

    ("College of Engineering and Technology",
     "The College of Engineering and Technology at DBU includes departments of: "
     "Civil Engineering, Electrical and Computer Engineering, Mechanical Engineering, "
     "Water Resources and Irrigation Engineering, and Chemical Engineering. "
     "Engineering programs are typically 5-year BSc programs. "
     "Students complete an internship and a senior project in their final year."),

    ("College of Business and Economics",
     "The College of Business and Economics at DBU offers departments of: "
     "Accounting and Finance, Management, Economics, Banking and Insurance, "
     "and Marketing Management. "
     "Programs are offered at both undergraduate and graduate levels. "
     "The college emphasizes practical business skills and entrepreneurship."),

    ("College of Natural and Computational Sciences",
     "The College of Natural and Computational Sciences at DBU includes departments of: "
     "Mathematics, Physics, Chemistry, Biology, Statistics, and Sport Science. "
     "These departments offer both undergraduate and graduate programs. "
     "The college provides foundational courses for many other programs across the university."),

    ("College of Social Sciences and Humanities",
     "The College of Social Sciences and Humanities at DBU has departments including: "
     "History and Heritage Management, Geography and Environmental Studies, "
     "Sociology, Psychology, Political Science, and Ethiopian Languages and Literature. "
     "The college also houses the Civics and Ethical Studies program."),

    ("College of Medicine and Health Sciences",
     "The College of Medicine and Health Sciences at DBU offers programs in: "
     "Medicine (MD), Nursing, Pharmacy, Medical Laboratory Sciences, "
     "Public Health, and Midwifery. "
     "The medical program is a 6-year program including clinical rotations. "
     "The college is affiliated with the Debre Birhan Referral Hospital for clinical training."),

    # ── Campus Rules & Policies ─────────────────────────────────
    ("Student ID and Campus Access",
     "All DBU students must carry their student ID card at all times on campus. "
     "The student ID is required for: entering campus gates, accessing the library, "
     "entering exam halls, using the cafeteria, and checking into dormitories. "
     "Lost ID cards can be replaced at the Registrar's Office with a replacement fee. "
     "Students found without ID may be denied entry to campus facilities."),

    ("Attendance Policy",
     "DBU requires a minimum of 80% attendance in all courses. "
     "Students who fall below 80% attendance may be barred from taking the final exam. "
     "Attendance is tracked by instructors through sign-in sheets or digital systems. "
     "Medical absences require a valid medical certificate from the campus clinic or a recognized hospital. "
     "Three consecutive unexcused absences may result in a warning from the department."),

    ("Academic Integrity",
     "DBU has a strict academic integrity policy. Cheating, plagiarism, and academic dishonesty "
     "are serious offenses. Penalties include: receiving a zero on the assignment, "
     "failing the course, suspension for one semester, or permanent dismissal depending on severity. "
     "Students are expected to submit original work and properly cite sources. "
     "Using unauthorized materials during exams is grounds for immediate disqualification."),

    ("Dress Code",
     "DBU enforces a modest dress code. Students are expected to dress appropriately "
     "for an academic environment. Clothing with offensive images or language is not allowed. "
     "Laboratory and workshop sessions may require specific safety clothing. "
     "Students in health sciences must wear their white coats during clinical sessions."),

    ("Library Rules",
     "The DBU library is open Monday to Saturday. Books can be borrowed for up to 14 days. "
     "Reference materials cannot be taken out of the library. "
     "A fine is charged for overdue books (per day). "
     "Students must present their ID to borrow books. "
     "Silence must be maintained in all reading areas. "
     "Food and drinks are not allowed inside the library. "
     "The library also provides internet access and computer stations."),

    ("Dormitory Rules",
     "DBU provides dormitory housing for students. Dormitory curfew is typically 10:00 PM "
     "on weekdays and 11:00 PM on weekends. Visitors of the opposite gender are not allowed "
     "in dormitory rooms. Students must keep their rooms clean. "
     "Electrical appliances (hot plates, heaters) are generally not allowed in dorm rooms. "
     "Damage to dormitory property will result in a repair fee charged to the student."),

    # ── Grading System ──────────────────────────────────────────
    ("Grading System",
    "DBU uses the following grading system: "
    "A+ (4.0, 90-100%), A (4.0, 85-89%), "
    "A- (3.75, 80-84%), B+ (3.5, 75-79%), "
    "B (3.0, 70-74%), B- (2.75, 65-69%), "
    "C+ (2.5, 60-64%), C (2.0, 55-59%), "
    "C- (1.75, 50-54%), D (1.0, 45-49%), "
    "F (0.0, below 45%). "
    "A minimum CGPA of 2.0 is required for graduation. "
    "Students with a semester GPA below 1.5 are placed on academic probation."),

    ("Academic Probation and Dismissal",
     "Students at DBU are placed on academic probation if their semester GPA falls below 1.5 "
     "or their cumulative GPA is below 2.0. Students on probation for two consecutive semesters "
     "may face academic dismissal. Dismissed students may appeal to the Academic Commission. "
     "Readmission after dismissal is possible after one year, subject to availability."),

    # ── Campus Services ─────────────────────────────────────────
    ("Campus Services",
     "DBU provides several student services: The Student Clinic offers basic healthcare. "
     "The Counseling Center provides academic and personal counseling. "
     "The Cafeteria serves meals (breakfast, lunch, dinner) with a meal card system. "
     "Sports facilities include a football field, basketball courts, and a gymnasium. "
     "The Student Union organizes cultural events, clubs, and extracurricular activities."),

    ("Contact Information",
     "Debre Birhan University main campus is located in Debre Birhan, Ethiopia. "
     "The university's website is dbu.edu.et. "
     "The Registrar's Office handles enrollment, transcripts, and student records. "
     "The Student Services Office handles dormitory assignments and student welfare. "
     "The Finance Office handles fee payments and financial clearance. "
     "For urgent matters, visit the main administration building on campus."),

    # ── About DBU ───────────────────────────────────────────────
    ("About Debre Birhan University",
     "Debre Birhan University (DBU) is a public university located in Debre Birhan, Ethiopia, "
     "about 130 km northeast of Addis Ababa. It was established in 2007 as one of the "
     "second-generation Ethiopian universities. The university offers undergraduate and "
     "postgraduate programs across multiple colleges. "
     "The campus sits at an elevation of about 2,800 meters above sea level, "
     "making it one of the highest-altitude universities in Africa."),
]


def seed():
    """Insert all knowledge chunks with embeddings."""
    print(f"Seeding {len(KNOWLEDGE)} knowledge chunks...")
    print("This will take a few minutes due to embedding generation.\n")

    for i, (topic, content) in enumerate(KNOWLEDGE, 1):
        try:
            kid = insert_knowledge(topic, content)
            print(f"  [{i}/{len(KNOWLEDGE)}] OK {topic} (id={kid})")
            time.sleep(0.5)  # Rate limiting for Gemini API
        except Exception as e:
            print(f"  [{i}/{len(KNOWLEDGE)}] FAIL {topic}: {e}")

    print(f"\nDone! Seeded {len(KNOWLEDGE)} chunks into dbu_knowledge.")


if __name__ == '__main__':
    seed()

"""
Email notification service using Resend API.
"""

import requests
from django.conf import settings


def send_booking_confirmation(session):
    """Send booking confirmation emails to both tutor and student."""
    if not settings.RESEND_API_KEY:
        print(f"[Email Skipped] No RESEND_API_KEY — would send booking confirmation for: {session}")
        return

    tutor_name = session.tutor.get_full_name() or session.tutor.username
    student_name = session.student.get_full_name() or session.student.username

    # Email to student
    _send_email(
        to=session.student.email,
        subject=f"Session Booked: {session.skill_title}",
        html=f"""
        <h2>Your session is confirmed! 🎉</h2>
        <p>You've booked a session with <strong>{tutor_name}</strong>.</p>
        <ul>
            <li><strong>Skill:</strong> {session.skill_title}</li>
            <li><strong>Date:</strong> {session.date}</li>
            <li><strong>Time:</strong> {session.time_slot}</li>
            <li><strong>Location:</strong> {session.location or 'TBD'}</li>
        </ul>
        <p>You can message your tutor through SkillSwap to prepare.</p>
        <p>— SkillSwap DBU</p>
        """,
    )

    # Email to tutor
    _send_email(
        to=session.tutor.email,
        subject=f"New Booking: {session.skill_title}",
        html=f"""
        <h2>New session booked! 📚</h2>
        <p><strong>{student_name}</strong> has booked a session with you.</p>
        <ul>
            <li><strong>Skill:</strong> {session.skill_title}</li>
            <li><strong>Date:</strong> {session.date}</li>
            <li><strong>Time:</strong> {session.time_slot}</li>
            <li><strong>Location:</strong> {session.location or 'TBD'}</li>
        </ul>
        <p>— SkillSwap DBU</p>
        """,
    )


def _send_email(to, subject, html):
    """Send an email via Resend API."""
    try:
        response = requests.post(
            'https://api.resend.com/emails',
            headers={
                'Authorization': f'Bearer {settings.RESEND_API_KEY}',
                'Content-Type': 'application/json',
            },
            json={
                'from': 'SkillSwap DBU <noreply@skillswap-dbu.com>',
                'to': [to],
                'subject': subject,
                'html': html,
            },
            timeout=10,
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"[Email Error] Failed to send to {to}: {e}")
        return None

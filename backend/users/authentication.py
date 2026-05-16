"""
DRF JWT Authentication backend for Supabase tokens.
"""

import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from users.models import User


class SupabaseJWTAuthentication(BaseAuthentication):
    """
    Authenticate requests using Supabase JWT tokens.
    Creates or retrieves the local User linked to Supabase.
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        
        print(f"[Supabase Auth] Processing request path: {request.path}")
        
        if not auth_header.startswith('Bearer '):
            print("[Supabase Auth] No Bearer token provided in Authorization header.")
            return None

        token = auth_header.replace('Bearer ', '')
        if not token:
            print("[Supabase Auth] Empty token string provided.")
            return None

        # -- DEMO BYPASS FOR TESTING --
        if token.startswith("DEMO_TOKEN"):
            parts = token.split(":")
            email = parts[1] if len(parts) > 1 else "abebegeleta@dbu.edu.et"
            
            print(f"[Supabase Auth] DEMO_TOKEN detected! Authenticating demo user: {email}")
            try:
                user = User.objects.get(email=email)
                print(f"[Supabase Auth] Authenticated existing demo user: {user.email}")
            except User.DoesNotExist:
                print(f"[Supabase Auth] New demo user, no Django profile yet: {email}")
                # Return an unsaved user instance so IsAuthenticated passes,
                # but views can check `if not request.user.pk:` to return 404.
                import uuid
                user = User(
                    supabase_uid=str(uuid.uuid4()),
                    email=email,
                    username=email.split('@')[0] if email else "demo_user"
                )
            return (user, token)

        # If no JWT secret is configured, skip (dev mode)
        if not settings.SUPABASE_JWT_SECRET:
            print("[Supabase Auth] Missing SUPABASE_JWT_SECRET in Django settings. Skipping auth.")
            return None

        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                audience='authenticated',
            )
            print("[Supabase Auth] JWT successfully verified. Extracted payload.")
        except jwt.ExpiredSignatureError:
            print("[Supabase Auth] ERROR: Token has expired.")
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            print(f"[Supabase Auth] ERROR: Invalid token: {str(e)}")
            raise AuthenticationFailed('Invalid token')

        supabase_uid = payload.get('sub')
        email = payload.get('email', '')

        if not supabase_uid:
            raise AuthenticationFailed('Token missing user ID')

        # Enforce @dbu.edu.et domain restriction
        if not email or not email.endswith('@dbu.edu.et'):
            raise AuthenticationFailed('Only @dbu.edu.et emails are allowed')

        try:
            user = User.objects.get(supabase_uid=supabase_uid)
            print(f"[Supabase Auth] Authenticated existing Django User: {user.email}")
        except User.DoesNotExist:
            print(f"[Supabase Auth] New Supabase user, no Django profile yet: {email}")
            # Return an unsaved user instance so IsAuthenticated passes,
            # but views can check `if not request.user.pk:` to return 404.
            user = User(
                supabase_uid=supabase_uid,
                email=email,
                username=email.split('@')[0] if email else supabase_uid[:30]
            )

        return (user, token)

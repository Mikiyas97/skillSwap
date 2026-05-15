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
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header.replace('Bearer ', '')
        if not token:
            return None

        # If no JWT secret is configured, skip (dev mode)
        if not settings.SUPABASE_JWT_SECRET:
            return None

        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                audience='authenticated',
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        supabase_uid = payload.get('sub')
        email = payload.get('email', '')
        user_metadata = payload.get('user_metadata', {})

        if not supabase_uid:
            raise AuthenticationFailed('Token missing user ID')

        # Get or create the local user
        user, created = User.objects.get_or_create(
            supabase_uid=supabase_uid,
            defaults={
                'username': email.split('@')[0] if email else supabase_uid[:30],
                'email': email,
                'first_name': user_metadata.get('name', '').split(' ')[0] if user_metadata.get('name') else '',
                'last_name': ' '.join(user_metadata.get('name', '').split(' ')[1:]) if user_metadata.get('name') else '',
                'college': user_metadata.get('college', ''),
                'department': user_metadata.get('department', ''),
                'year': user_metadata.get('year', ''),
            }
        )

        if not created and user_metadata:
            # Sync metadata updates from Supabase
            changed = False
            for field in ['college', 'department', 'year']:
                val = user_metadata.get(field, '')
                if val and getattr(user, field) != val:
                    setattr(user, field, val)
                    changed = True
            name = user_metadata.get('name', '')
            if name:
                parts = name.split(' ', 1)
                if user.first_name != parts[0]:
                    user.first_name = parts[0]
                    user.last_name = parts[1] if len(parts) > 1 else ''
                    changed = True
            if changed:
                user.save()

        return (user, token)

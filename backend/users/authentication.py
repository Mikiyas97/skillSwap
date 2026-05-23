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



        # If no JWT secret is configured, skip (dev mode)
        if not settings.SUPABASE_JWT_SECRET:
            print("[Supabase Auth] Missing SUPABASE_JWT_SECRET in Django settings. Skipping auth.")
            return None

        try:
            try:
                unverified_header = jwt.get_unverified_header(token)
            except Exception as parse_e:
                print(f"[Supabase Auth] FATAL PARSE ERROR. Token is not a JWT! Token: '{token[:30]}...' Error: {parse_e}")
                raise AuthenticationFailed('Invalid token format')

            # Extract the algorithm
            alg = unverified_header.get('alg', 'HS256')
            
            # Fetch public key using PyJWKClient for modern Supabase (RS256 or ES256)
            if alg in ['RS256', 'ES256']:
                from jwt import PyJWKClient
                jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
                jwks_client = PyJWKClient(jwks_url)
                signing_key = jwks_client.get_signing_key_from_jwt(token)
                secret_or_key = signing_key.key
            else:
                # Fallback for HS256 legacy Supabase
                import base64
                try:
                    secret_or_key = base64.b64decode(settings.SUPABASE_JWT_SECRET)
                except Exception:
                    secret_or_key = settings.SUPABASE_JWT_SECRET

            payload = jwt.decode(
                token,
                secret_or_key,
                algorithms=[alg],
                audience='authenticated',
                leeway=120,
            )
        except jwt.ExpiredSignatureError:
            print("[Supabase Auth] ERROR: Token has expired.")
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            print(f"[Supabase Auth] ERROR: Invalid token: {str(e)} | Type: {type(e)}")
            raise AuthenticationFailed(f'Invalid token signature: {str(e)}')

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
            if email:
                try:
                    user = User.objects.get(email=email)
                    user.supabase_uid = supabase_uid
                    user.save(update_fields=['supabase_uid'])
                    print(f"[Supabase Auth] Linked Supabase UID to existing Django User: {email}")
                except User.DoesNotExist:
                    user = User(
                        supabase_uid=supabase_uid,
                        email=email,
                        username=email.split('@')[0] if email else supabase_uid[:30]
                    )
            else:
                user = User(
                    supabase_uid=supabase_uid,
                    email=email,
                    username=supabase_uid[:30]
                )

        return (user, token)

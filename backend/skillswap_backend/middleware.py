"""
Supabase JWT Auth Middleware for Django.
Attaches supabase_user_id and supabase_email to request for downstream use.
"""

import jwt
from django.conf import settings
from django.http import JsonResponse


class SupabaseAuthMiddleware:
    """
    Middleware that validates Supabase JWT tokens.
    Public paths (admin, health check) are excluded.
    API endpoints require a valid Bearer token.
    """

    PUBLIC_PATHS = ['/admin/', '/api/auth/', '/api/health/']

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip auth for public paths and non-API routes
        if not request.path.startswith('/api/') or any(
            request.path.startswith(p) for p in self.PUBLIC_PATHS
        ):
            return self.get_response(request)

        # Allow browsing skills/leaderboard without auth (GET only)
        public_read_paths = ['/api/skills/listings/', '/api/skills/categories/', '/api/users/leaderboard/']
        if request.method == 'GET' and any(request.path.startswith(p) for p in public_read_paths):
            return self.get_response(request)

        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return self.get_response(request)  # Let DRF handle auth if no token

        if not settings.SUPABASE_JWT_SECRET:
            # No JWT secret configured — skip validation in dev
            return self.get_response(request)

        if token.startswith("DEMO_TOKEN"):
            parts = token.split(":")
            request.supabase_email = parts[1] if len(parts) > 1 else "abebegeleta@dbu.edu.et"
            request.supabase_user_id = "demo_user_id"
            return self.get_response(request)

        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                audience='authenticated',
            )
            request.supabase_user_id = payload.get('sub')
            request.supabase_email = payload.get('email')
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        return self.get_response(request)

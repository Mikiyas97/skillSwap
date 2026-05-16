import os
import jwt
import base64
import time

from dotenv import load_dotenv
load_dotenv()

secret = os.environ.get('SUPABASE_JWT_SECRET')

payload = {
    "aud": "authenticated",
    "exp": int(time.time()) + 3600,
    "sub": "12345678-1234-1234-1234-123456789012",
    "email": "test@test.com"
}

# 1. Try signing with base64 decoded secret
try:
    print("Testing base64 decoded secret...")
    b64secret = base64.b64decode(secret)
    token = jwt.encode(payload, b64secret, algorithm="HS256")
    print(f"Generated Token: {token}")
    
    # Verify it
    decoded = jwt.decode(token, b64secret, algorithms=["HS256", "RS256"], audience="authenticated")
    print("Successfully decoded with base64 decoded secret!")
except Exception as e:
    print("Error with base64 decoded secret:", e)

# 2. Try signing with raw string secret
try:
    print("\nTesting raw string secret...")
    token2 = jwt.encode(payload, secret, algorithm="HS256")
    print(f"Generated Token: {token2}")
    
    decoded2 = jwt.decode(token2, secret, algorithms=["HS256", "RS256"], audience="authenticated")
    print("Successfully decoded with raw string secret!")
except Exception as e:
    print("Error with raw string secret:", e)

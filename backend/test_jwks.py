import os
import jwt

from jwt import PyJWKClient
from dotenv import load_dotenv

load_dotenv()

# We need a token to test. We can just create a dummy one or test the JWKS client directly.
url = f"{os.getenv('SUPABASE_URL')}/auth/v1/.well-known/jwks.json"
print(f"Fetching from {url}")
try:
    client = PyJWKClient(url)
    keys = client.get_jwk_set()
    print("Fetched keys successfully")
    for key in keys.keys:
        print(f"Key ID: {key.key_id}")
        print(f"Key type: {type(key.key)}")
        # print(f"Key repr: {repr(key.key)[:100]}")
except Exception as e:
    print(f"Error fetching JWKS: {e}")

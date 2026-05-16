import os
import requests
import jwt
import base64

from dotenv import load_dotenv
load_dotenv()

url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_ANON_KEY')
secret = os.environ.get('SUPABASE_JWT_SECRET')

print(f"URL: {url}")
print(f"ANON_KEY: {key[:10]}...")
print(f"SECRET: {secret[:10]}...")

# 1. Try to sign up a dummy user to get a real token
auth_url = f"{url}/auth/v1/signup"
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}
data = {
    "email": "testdummy123@dbu.edu.et",
    "password": "Password123!"
}

try:
    print("Signing up dummy user...")
    res = requests.post(auth_url, headers=headers, json=data)
    print(res.status_code, res.text)
    token = res.json().get('access_token')
    if not token:
        print("No access token in signup response. Try login?")
        auth_url = f"{url}/auth/v1/token?grant_type=password"
        res = requests.post(auth_url, headers=headers, json=data)
        print(res.status_code, res.text)
        token = res.json().get('access_token')

    if token:
        print("Got token! Decoding...")
        header = jwt.get_unverified_header(token)
        payload = jwt.decode(token, options={"verify_signature": False})
        print("Header:", header)
        print("Payload:", payload)
        
        # Try verifying signature
        try:
            b64secret = base64.b64decode(secret)
            jwt.decode(token, b64secret, algorithms=["HS256"], audience="authenticated")
            print("SUCCESS! Token verified with base64 decoded secret.")
        except Exception as e:
            print("FAILED with b64decode:", e)
            
            try:
                jwt.decode(token, secret, algorithms=["HS256"], audience="authenticated")
                print("SUCCESS! Token verified with raw string secret.")
            except Exception as e2:
                print("FAILED with raw string:", e2)

except Exception as e:
    print("Error during test:", e)

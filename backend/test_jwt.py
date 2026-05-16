import jwt

try:
    jwt.decode("eyJhbGc...", "my_secret", algorithms=["HS256"])
except Exception as e:
    import traceback
    traceback.print_exc()

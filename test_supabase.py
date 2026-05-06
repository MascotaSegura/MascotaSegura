import urllib.request
import urllib.error
import json

URL = "https://vaztacfioinkkkxmimaw.supabase.co/auth/v1/signup"
KEY = "sb_publishable_WHwWYUn52u_73tvPN-PC4A_fDUTRNVD"

req = urllib.request.Request(URL, method="POST")
req.add_header("apikey", KEY)
req.add_header("Authorization", f"Bearer {KEY}")
req.add_header("Content-Type", "application/json")

data = json.dumps({
    "email": "testaccount3@example.com",
    "password": "testpassword123",
    "data": {"full_name": "Test User"}
}).encode('utf-8')

try:
    with urllib.request.urlopen(req, data=data) as response:
        print("Status Code:", response.getcode())
        print("Response:", response.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response:", e.read().decode())
except Exception as e:
    print("Error:", str(e))

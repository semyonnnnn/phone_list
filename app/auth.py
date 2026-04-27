import os
from fastapi import Request
from dotenv import load_dotenv

# Load the .env file variables into the system environment
load_dotenv()

# Fetch variables using os.getenv
# The second argument is a fallback/default value
AUTH_COOKIE = os.getenv("AUTH_COOKIE", "default_session_name")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

def is_authenticated(request: Request):
    return request.cookies.get("session_id") == AUTH_COOKIE
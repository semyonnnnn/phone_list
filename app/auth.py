from fastapi import Request

AUTH_COOKIE = "mega_corp_session_99"
ADMIN_USER = {"username": "admin", "password": "password123"}

def is_authenticated(request: Request):
    return request.cookies.get("session_id") == AUTH_COOKIE
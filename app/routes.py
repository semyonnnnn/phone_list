from fastapi import APIRouter, Request, Form, HTTPException, Response
from fastapi.responses import HTMLResponse, RedirectResponse
from auth import is_authenticated, ADMIN_USER, AUTH_COOKIE
from database import get_db

router = APIRouter()

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    if not is_authenticated(request):
        return RedirectResponse(url="/login")
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()

@router.get("/login", response_class=HTMLResponse)
async def login_page():
    with open("login.html", "r", encoding="utf-8") as f:
        return f.read()

@router.post("/login")
async def login(response: Response, username: str = Form(...), password: str = Form(...)):
    if username == ADMIN_USER["username"] and password == ADMIN_USER["password"]:
        response = RedirectResponse(url="/", status_code=303)
        response.set_cookie(key="session_id", value=AUTH_COOKIE)
        return response
    return HTMLResponse("Wrong credentials", status_code=401)
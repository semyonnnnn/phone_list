import os
from app.auth import is_authenticated, ADMIN_USERNAME, ADMIN_PASSWORD, AUTH_COOKIE
from fastapi import APIRouter, Request, Form, HTTPException, Response
from fastapi.responses import HTMLResponse, RedirectResponse
from dotenv import load_dotenv
from app.database import get_db

router = APIRouter()

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    if not is_authenticated(request):
        return RedirectResponse(url="/login")
    with open("public/index.html", "r", encoding="utf-8") as f:
        return f.read()

@router.get("/login", response_class=HTMLResponse)
async def login_page():
    with open("public/login.html", "r", encoding="utf-8") as f:
        return f.read()

@router.get("/test", response_class=HTMLResponse)
async def test_route():  # <--- Make sure this line exists!
    return """
    <html>
        <body style="background: #000; color: #0ff; font-family: monospace; text-align: center; padding-top: 50px;">
            <h1>[ NEURAL LATTICE ]</h1>
            <p>ROUTER STATUS: ONLINE</p>
        </body>
    </html>
    """

@router.post("/login")
async def login(response: Response, username: str = Form(...), password: str = Form(...)):
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        response = RedirectResponse(url="/", status_code=303)
        response.set_cookie(key="session_id", value=AUTH_COOKIE)
        return response
    return HTMLResponse("Wrong credentials", status_code=401)
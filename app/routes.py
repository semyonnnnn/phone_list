import os
from app.auth import is_authenticated, ADMIN_USERNAME, ADMIN_PASSWORD, AUTH_COOKIE
from fastapi import APIRouter, Request, Form, Response
from fastapi.responses import HTMLResponse, RedirectResponse
from app.ui import templates  # Using the shared UI provider we discussed

router = APIRouter()

@router.get("/")
async def home(request: Request):
    # 1. Security Check
    if not is_authenticated(request):
        return RedirectResponse(url="/login")
    
    # 2. Render the Dashboard
    # We pass 'request' so Jinja2 can handle static file paths
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    # 3. Render the Login Screen
    return templates.TemplateResponse("login.html", {"request": request})

@router.get("/test", response_class=HTMLResponse)
async def test_route():
    # Keep this as a raw string for a quick "heartbeat" check
    return """
    <html>
        <body style="background: #000; color: #0ff; font-family: monospace; text-align: center; padding-top: 50px;">
            <h1>[ NEURAL LATTICE ]</h1>
            <p>ROUTER STATUS: ONLINE</p>
        </body>
    </html>
    """

@router.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    # 4. Handle Authentication
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        # We create the redirect first
        response = RedirectResponse(url="/", status_code=303)
        # Then attach the cookie to that redirect object
        response.set_cookie(key="session_id", value=AUTH_COOKIE, httponly=True)
        return response
    
    return HTMLResponse("Wrong credentials", status_code=401)
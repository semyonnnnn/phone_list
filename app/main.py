from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.database import init_db
from app.routes import router
from fastapi.templating import Jinja2Templates

app = FastAPI(title="MegaCorp Neural Lattice")

# Mount static files and include our router
app.mount("/public", StaticFiles(directory="public"), name="public")
app.include_router(router)

init_db()


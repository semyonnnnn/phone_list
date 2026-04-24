from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn
from app.database import init_db
from app.routes import router

app = FastAPI(title="MegaCorp Neural Lattice")

# Mount static files and include our router
app.mount("/styles", StaticFiles(directory="styles"), name="styles")
app.mount("/public", StaticFiles(directory="public"), name="public")
app.include_router(router)

if __name__ == "__main__":
    init_db()
    uvicorn.run(app, host="0.0.0.0", port=8000)
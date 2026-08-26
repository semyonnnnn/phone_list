from fastapi import FastAPI
from upload import router as upload_router
from download import router as download_router

app = FastAPI(title="Phone Directory Processing Microservice")

# Include modular routers
app.include_router(upload_router)
app.include_router(download_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=5000, reload=True)
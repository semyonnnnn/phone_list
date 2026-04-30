from fastapi import HTTPException
######################################
from app.database.extract_excel import extract_excel
from app.database.upload import upload

def process_excel(file_bytes):
    try:
        # 1. Parse/Extract (Business Logic)
        names = extract_excel(file_bytes)
        
        # 2. Store (Application Logic)
        total_count = upload(names)
        
        return {
            "status": "success", 
            "message": f"Inserted {len(names)} rows. Total in DB: {total_count}"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Processing failed: {str(e)}")
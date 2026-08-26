from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

router = APIRouter()

@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # Read the Excel file, skipping the first 2 rows
        df = pd.read_excel(io.BytesIO(contents), skiprows=2, header=None)
        
        # Check if the dataframe has enough columns (we need up to index 9 / Column J)
        if df.shape[1] < 10:
            raise ValueError(f"Excel file has only {df.shape[1]} columns, but column J (index 9) is required.")
        
        # Map desired columns: B(1), C(2), E(4), H(7), J(9)
        selected_columns = [1, 2, 4, 7, 9]
        df_filtered = df.iloc[:, selected_columns].copy()
        
        df_filtered.columns = ['group', 'person', 'extension', 'phone', 'file_id']
        
        # Clean up data
        df_filtered = df_filtered.dropna(subset=['file_id', 'person'])
        df_filtered = df_filtered.fillna('')
        
        records = df_filtered.to_dict(orient='records')
        
        return {
            "status": "success",
            "total_rows": len(records),
            "data": records
        }
        
    except Exception as e:
        # Return an explicit error status and message instead of crashing the server
        raise HTTPException(
            status_code=400, 
            detail=f"Python parsing error: {str(e)}"
        )
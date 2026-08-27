from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

router = APIRouter()

def clean_and_format_phone(val):
    val_str = str(val).strip()
    digits_only = val_str.lstrip("+")
    
    # 1. Clean the prefix if it meets your 11-digit rule
    if len(digits_only) == 11:
        if val_str.startswith("+7343") or val_str.startswith("7343"):
            digits_only = digits_only.replace("7343", "", 1)
        elif val_str.startswith("+73522") or val_str.startswith("73522"):
            digits_only = digits_only.replace("73522", "", 1)
            
    # Re-extract just the clean digits to format them uniformly
    clean_digits = "".join(filter(str.isdigit, digits_only))
    
    # 2. Apply pretty formatting based on length
    # Example for 6 digits: xx-xx-xx (e.g., 12-34-56)
    if len(clean_digits) == 6:
        return f"{clean_digits[0:2]}-{clean_digits[2:4]}-{clean_digits[4:6]}"
        
    # Example for 7 digits: xxx-xx-xx (e.g., 123-45-67)
    elif len(clean_digits) == 7:
        return f"{clean_digits[0:3]}-{clean_digits[3:5]}-{clean_digits[5:7]}"
        
    # Fallback if it doesn't match standard expected lengths
    return val_str

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
        
        # Apply the phone cleaning function
        df_filtered['phone'] = df_filtered['phone'].apply(clean_and_format_phone)
        
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
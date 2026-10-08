from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
import hashlib

router = APIRouter()

def clean_and_format_phone(val):
    val_str = str(val).strip()
    digits_only = val_str.lstrip("+")
    
    if len(digits_only) == 11:
        if val_str.startswith("+7343") or val_str.startswith("7343"):
            digits_only = digits_only.replace("7343", "", 1)
        elif val_str.startswith("+73522") or val_str.startswith("73522"):
            digits_only = digits_only.replace("73522", "", 1)
            
    clean_digits = "".join(filter(str.isdigit, digits_only))
    
    if len(clean_digits) == 6:
        return f"{clean_digits[0:2]}-{clean_digits[2:4]}-{clean_digits[4:6]}"
    elif len(clean_digits) == 7:
        return f"{clean_digits[0:3]}-{clean_digits[3:5]}-{clean_digits[5:7]}"
        
    return val_str

def resolve_file_id(file_id, login, group, person):
    """
    Real file_id (column J) wins whenever present — those rows are untouched.
    When it's missing (the Kurgan export never fills it in), derive a
    deterministic id from their Логин instead of a fresh random one each
    time: a NEW random value every upload would look like a new person to
    Laravel's updateOrCreate/delete-sync and cause duplicate-then-delete
    churn instead of a stable record. Hashing the login gives the same
    rand_ value every upload, so the same person keeps the same row.
    If this person's file_id later becomes populated in a future export,
    this function starts returning the real id instead — the old rand_
    row then falls out of that upload's id list and gets cleaned up by
    the existing whereNotIn(...)->delete() in Laravel, with the new
    real-id row taking its place. That's the "graduate to the real id"
    behavior, and it requires no Laravel changes.
    """
    fid = str(file_id).strip()
    if fid and fid.lower() != 'nan':
        return fid

    # login should be unique per person; group+person is a last-resort
    # fallback only if login itself is ever blank too
    key = str(login).strip()
    if not key or key.lower() == 'nan':
        key = f"{group}|{person}"

    digest = hashlib.sha1(key.encode("utf-8")).hexdigest()[:12]
    return f"rand_{digest}"

@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        df = pd.read_excel(io.BytesIO(contents), skiprows=2, header=None)
        
        if df.shape[1] < 10:
            raise ValueError(f"Excel file has only {df.shape[1]} columns, but column J (index 9) is required.")
        
        # Added login (D / index 3): needed to derive a stable fallback id
        # when file_id (J) is blank. Dropped again before returning, since
        # Phone records don't store it.
        selected_columns = [1, 2, 3, 4, 7, 9]
        df_filtered = df.iloc[:, selected_columns].copy()
        
        df_filtered.columns = ['group', 'person', 'login', 'extension', 'phone', 'file_id']
        
        # file_id is no longer required here — a missing one is now
        # resolved below instead of causing the whole row to be dropped
        df_filtered = df_filtered.dropna(subset=['person'])
        df_filtered = df_filtered.fillna('')
        
        df_filtered['phone'] = df_filtered['phone'].apply(clean_and_format_phone)

        df_filtered['file_id'] = df_filtered.apply(
            lambda r: resolve_file_id(r['file_id'], r['login'], r['group'], r['person']),
            axis=1
        )
        df_filtered = df_filtered.drop(columns=['login'])
        
        records = df_filtered.to_dict(orient='records')
        
        return {
            "status": "success",
            "total_rows": len(records),
            "data": records
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Python parsing error: {str(e)}"
        )
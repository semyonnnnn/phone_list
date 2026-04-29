import os
import pandas as pd
import sqlite3
import io
from fastapi import HTTPException

def process_excel(file_bytes):
    try:
        df = pd.read_excel(io.BytesIO(file_bytes))
        
        # DEBUG: See what columns Pandas actually found
        print(f"Excel Columns found: {df.columns.tolist()}")

        # Use an absolute path to ensure we hit the RIGHT database
        # This assumes your structure is: root/app/process_excel.py and root/database/database.db
        current_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(current_dir, '..', 'database', 'database.db')
        
        print(f"Connecting to DB at: {os.path.abspath(db_path)}")

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        inserted_count = 0
        for index, row in df.iterrows():
            # If your Excel column is the 3rd one but not named 'c', use row.iloc[2]
            # row['c'] only works if the top cell of that column literally says 'c'
            val = row.iloc[2] 
            
            cursor.execute("INSERT INTO people (name) VALUES (?)", (val,))
            inserted_count += 1

        conn.commit()
        
        # Verify the count immediately
        cursor.execute("SELECT COUNT(*) FROM people")
        db_count = cursor.fetchone()[0]
        print(f"Total rows now in DB: {db_count}")
        
        conn.close()

        return {"status": "success", "message": f"Inserted {inserted_count} rows. Total in DB: {db_count}"}

    except Exception as e:
        print(f"CRASH: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
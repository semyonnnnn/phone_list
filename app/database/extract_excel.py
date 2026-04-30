import pandas as pd
import io

def extract_excel(file_bytes):
    df = pd.read_excel(io.BytesIO(file_bytes))
    # Business Logic: We specifically want the 3rd column
    return df.iloc[:, 2].dropna().tolist()
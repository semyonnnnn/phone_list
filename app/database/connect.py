import sqlite3
import os
from contextlib import contextmanager

# Absolute path: Works everywhere
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, '..', '..', 'storage', 'database.db')

@contextmanager
def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row # Apply your row settings here
    try:
        yield conn
    finally:
        conn.close() # The critical cleanup step

def init_db():
    with get_db() as conn: # Re-uses the safety logic above
        conn.execute("""
        CREATE TABLE IF NOT EXISTS people (
            name TEXT, location TEXT, phone TEXT, [add] TEXT,
            ip INTEGER, isBoss INTEGER DEFAULT 0, id INTEGER
        )
        """)
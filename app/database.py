import sqlite3
import os

def get_db():
    os.makedirs("database", exist_ok=True)
    conn = sqlite3.connect("database/database.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS people (
            name TEXT, 
            location TEXT,
            phone TEXT,
            [add] TEXT,
            ip INTEGER,
            isBoss INTEGER DEFAULT 0
            )
        """)
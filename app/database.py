import sqlite3

def get_db():
    conn = sqlite3.connect("directory.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS employees (name TEXT, phone TEXT, dept TEXT)")
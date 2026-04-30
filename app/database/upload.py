from contextlib import contextmanager
from app.database.connect import get_db

def upload(names: list):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.executemany("INSERT INTO people (namee) VALUES (?)", [(n,) for n in names])
        conn.commit()
        cursor.execute("SELECT COUNT(*) FROM people")
        return cursor.fetchone()[0]
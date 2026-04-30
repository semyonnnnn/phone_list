from app.database.connect import get_db

def init_db():
    """Executes the DDL (Data Definition Language) to build the schema"""
    with get_db() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS people (
            name TEXT, 
            location TEXT, 
            phone TEXT, 
            [add] TEXT,
            ip INTEGER, 
            isBoss INTEGER DEFAULT 0, 
            id INTEGER PRIMARY KEY AUTOINCREMENT
        )
        """)
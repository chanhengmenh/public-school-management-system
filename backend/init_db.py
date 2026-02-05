"""
Database initialization for PostgreSQL
Runs the schema SQL file to create tables
"""
from pathlib import Path
import uuid

from sqlalchemy import text
from database import engine, SessionLocal
from config import get_settings

settings = get_settings()


def check_tables_exist() -> bool:
    """Check if main tables already exist in the database"""
    try:
        with engine.connect() as conn:
            # Check if 'users' table exists (a key table to verify database setup)
            result = conn.execute(
                text("""
                SELECT EXISTS(
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name = 'users'
                )
                """)
            )
            return result.fetchone()[0]
    except Exception as e:
        print(f"Error checking tables: {e}")
        return False

def init_database_postgres() -> None:
    """Create tables for PostgreSQL using the schema.sql file if they don't exist"""
    schema_path = Path(__file__).resolve().parents[1] / "database" / "schema.sql"
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_path}")

    # Check if tables already exist
    if check_tables_exist():
        print("✓ Tables already exist in the database. Skipping schema creation.")
        return

    schema_sql = schema_path.read_text(encoding="utf-8")

    print("Creating PostgreSQL tables...")
    try:
        with engine.begin() as conn:
            conn.exec_driver_sql(schema_sql)
        print("✓ PostgreSQL tables created successfully!")
    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        raise

def seed_test_data():
    """Add test users for local development"""
    import bcrypt
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        result = db.execute(text("SELECT COUNT(*) FROM users")).fetchone()
        if result[0] > 0:
            print("⚠ Database already contains data. Skipping seed.")
            return
        
        print("Seeding test data...")
        
        # Helper function to hash passwords
        def hash_password(password: str) -> str:
            salt = bcrypt.gensalt()
            return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
        # Create test users
        users = [
            {
                "id": str(uuid.uuid4()),
                "email": "admin@iams.edu",
                "password_hash": hash_password("admin123"),
                "full_name": "System Administrator",
                "role": "admin"
            },
            {
                "id": str(uuid.uuid4()),
                "email": "teacher@iams.edu",
                "password_hash": hash_password("teacher123"),
                "full_name": "John Teacher",
                "role": "teacher"
            },
            {
                "id": str(uuid.uuid4()),
                "email": "student@iams.edu",
                "password_hash": hash_password("student123"),
                "full_name": "Jane Student",
                "role": "student"
            }
        ]
        
        for user in users:
            db.execute(
                text("""
                INSERT INTO users (id, email, password_hash, full_name, role)
                VALUES (:id, :email, :password_hash, :full_name, :role)
                """),
                user
            )
        
        db.commit()
        
        print("✓ Test users created:")
        print("  - admin@iams.edu / admin123")
        print("  - teacher@iams.edu / teacher123")
        print("  - student@iams.edu / student123")
        
    except Exception as e:
        print(f"✗ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("IAMS Database Initialization")
    print("=" * 50)

    if not settings.database_url.startswith("postgresql"):
        raise RuntimeError("DATABASE_URL must be PostgreSQL for this project.")

    init_database_postgres()

    # Ask if user wants to seed test data
    seed = input("\nWould you like to seed test data? (y/n): ").lower()
    if seed == 'y':
        seed_test_data()

    print("\n✓ Database initialization complete!")
    print("You can now run the server with: python main.py")

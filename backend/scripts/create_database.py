import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

from app.core.config import get_settings


def main() -> None:
    target_url = make_url(get_settings().database_url)
    database_name = target_url.database
    if not database_name:
        raise RuntimeError("DATABASE_URL must include a database name.")

    admin_url = target_url.set(database="postgres")
    engine = create_engine(admin_url, isolation_level="AUTOCOMMIT", pool_pre_ping=True)
    with engine.connect() as connection:
        exists = connection.execute(text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": database_name}).scalar()
        if exists:
            print(f'Database "{database_name}" already exists.')
            return
        quoted_name = database_name.replace('"', '""')
        connection.execute(text(f'CREATE DATABASE "{quoted_name}"'))
        print(f'Database "{database_name}" created.')


if __name__ == "__main__":
    main()

import asyncio
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import get_password_hash, create_access_token
from app.models.user import User
from app.models.node import Node
from app.models.alert import AlertRule, Alert
from app.main import app

# In-memory SQLite for isolated, fast testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Sets up fresh test database for each test function."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session
        await session.rollback()

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def async_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """FastAPI Test AsyncClient with db session override."""
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def admin_user(db_session: AsyncSession) -> User:
    """Creates default admin user fixture."""
    user = User(
        username="admin_test",
        email="admin@test.com",
        hashed_password=get_password_hash("admin123"),
        role="admin",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture(scope="function")
async def operator_user(db_session: AsyncSession) -> User:
    """Creates default operator user fixture."""
    user = User(
        username="operator_test",
        email="operator@test.com",
        hashed_password=get_password_hash("operator123"),
        role="operator",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture(scope="function")
async def analyst_user(db_session: AsyncSession) -> User:
    """Creates default analyst user fixture."""
    user = User(
        username="analyst_test",
        email="analyst@test.com",
        hashed_password=get_password_hash("analyst123"),
        role="analyst",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture(scope="function")
async def admin_headers(admin_user: User) -> dict:
    """Returns Auth headers for admin user."""
    token = create_access_token(subject=admin_user.username, role=admin_user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(scope="function")
async def operator_headers(operator_user: User) -> dict:
    """Returns Auth headers for operator user."""
    token = create_access_token(subject=operator_user.username, role=operator_user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(scope="function")
async def analyst_headers(analyst_user: User) -> dict:
    """Returns Auth headers for analyst user."""
    token = create_access_token(subject=analyst_user.username, role=analyst_user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(scope="function")
async def test_node(db_session: AsyncSession) -> Node:
    """Creates a sample telemetry node in DB."""
    node = Node(
        id="node-test-01",
        name="Test Sensor Node Alpha",
        node_type="POWER",
        status="ACTIVE",
        location_lat=37.7749,
        location_lon=-122.4194,
    )
    db_session.add(node)
    await db_session.commit()
    await db_session.refresh(node)
    return node


@pytest_asyncio.fixture(scope="function")
async def test_alert_rule(db_session: AsyncSession, test_node: Node) -> AlertRule:
    """Creates a sample alert rule in DB."""
    rule = AlertRule(
        metric_name="voltage_v",
        condition=">",
        threshold=250.0,
        severity="WARNING",
        active=True,
        node_id=test_node.id,
    )
    db_session.add(rule)
    await db_session.commit()
    await db_session.refresh(rule)
    return rule

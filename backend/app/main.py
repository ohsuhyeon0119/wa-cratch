from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, get_db, Base
from app.models import user, project  # noqa: F401 — registers models before create_all
from app.models import like  # noqa: F401 — registers Like model before create_all
from app.routers import auth, projects, activity, users, likes, voice
from app.services import auth_service


def _seed_test_account(db) -> None:
    if auth_service.get_user_by_username(db, "test") is None:
        auth_service.create_user(db, username="test", nickname="테스트유저", password="test", avatar="🧇")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        _seed_test_account(db)
    finally:
        db.close()
    yield


app = FastAPI(title="CatCratch API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(likes.router, prefix="/projects", tags=["likes"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(activity.router, prefix="/activity", tags=["activity"])
app.include_router(voice.router, prefix="/voice", tags=["voice"])

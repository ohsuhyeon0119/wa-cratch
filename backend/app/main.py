from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, get_db, Base
from app.models import user, project  # noqa: F401 — registers models before create_all
from app.routers import auth, projects, activity, users
from app.services import auth_service, project_service

_SEED_PROJECTS = [
    {"title": "냥이 점프",      "emoji": "🐱", "description": "냥이와 함께 장애물을 피하며 달려가요!", "tags": ["게임", "냥이"], "likes": 234, "views": 1200},
    {"title": "바다 탐험",      "emoji": "🌊", "description": "깊은 바다 속을 탐험해봐요!",            "tags": ["탐험"],        "likes": 189, "views":  876},
    {"title": "별 수집하기",    "emoji": "🌟", "description": "하늘의 별을 모두 모아봐요!",            "tags": ["별", "수집"],  "likes": 312, "views": 2100},
    {"title": "나비 미로",      "emoji": "🦋", "description": "미로를 탈출하는 나비를 도와주세요.",     "tags": ["미로"],        "likes": 156, "views":  654},
    {"title": "토끼 달리기",    "emoji": "🐰", "description": "빠른 토끼를 조종해봐요!",               "tags": ["달리기"],      "likes": 201, "views":  920},
    {"title": "무지개 그림판",  "emoji": "🌈", "description": "무지개 색으로 그림을 그려요!",          "tags": ["그림", "창작"], "likes": 278, "views": 1500},
    {"title": "우주 여행",      "emoji": "🚀", "description": "우주를 누비는 모험을 떠나요!",          "tags": ["우주"],        "likes": 344, "views": 2800},
    {"title": "음악 연주",      "emoji": "🎵", "description": "나만의 음악을 만들어봐요!",             "tags": ["음악"],        "likes": 198, "views":  730},
    {"title": "냥이의 대모험",  "emoji": "🐱", "description": "대모험!",                              "tags": ["게임"],        "likes": 234, "views": 1200},
    {"title": "바다 탐험 2",   "emoji": "🌊", "description": "바다!",                               "tags": ["탐험"],        "likes":  89, "views":  430},
]


def _seed(db) -> None:
    test_user = auth_service.get_user_by_username(db, "test")
    if test_user is None:
        test_user = auth_service.create_user(
            db,
            username="test",
            nickname="테스트유저",
            password="test",
            avatar="🧇",
        )

    from app.models.project import Project
    existing = db.query(Project).filter(Project.user_id == test_user.id).count()
    if existing == 0:
        now = datetime.utcnow()
        for idx, p in enumerate(_SEED_PROJECTS):
            # Spread created_at so "latest" sort is deterministic
            proj = Project(
                user_id=test_user.id,
                title=p["title"],
                emoji=p["emoji"],
                description=p["description"],
                tags=p["tags"],
                likes=p["likes"],
                views=p["views"],
                published=True,
                created_at=now - timedelta(seconds=(len(_SEED_PROJECTS) - idx)),
            )
            db.add(proj)
        db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        _seed(db)
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
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(activity.router, prefix="/activity", tags=["activity"])

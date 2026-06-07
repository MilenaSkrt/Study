from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.session import Base, SessionLocal, engine
from app.routers import auth, modules, progress, quiz, sandbox, tasks, theory, users
from app.seed import seed_database

settings = get_settings()

app = FastAPI(title="Study M API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(modules.router)
app.include_router(tasks.router)
app.include_router(sandbox.router)
app.include_router(progress.router)
app.include_router(quiz.router)
app.include_router(theory.router)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    if settings.auto_seed:
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()


@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.app_name}

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.data.theory import THEORY_SECTIONS
from app.db.session import get_db
from app.dependencies import get_current_user, require_roles
from app.models import User, UserProgress
from app.schemas import ProgressRead, ProgressCompleteRequest, StudentProgressRead

router = APIRouter(prefix="/progress", tags=["progress"])


def build_progress_summary(user: User, total_sections: int) -> dict:
    completed_records = [record for record in user.progress if record.is_completed]
    completed_section_ids = sorted({record.section_id for record in completed_records})
    completed_count = len(completed_section_ids)
    percent = round((completed_count / total_sections) * 100) if total_sections else 0
    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "group_name": user.group.name if user.group else None,
        "total_sections": total_sections,
        "completed_sections": completed_count,
        "percent": percent,
        "completed_section_ids": completed_section_ids,
    }


@router.get("/me")
def get_my_progress(
    total_sections: int = Query(default=len(THEORY_SECTIONS), ge=0),
    current_user: User = Depends(get_current_user),
):
    return build_progress_summary(current_user, total_sections)


@router.post("/me/complete", response_model=ProgressRead)
def complete_my_section(
    payload: ProgressCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("student", "admin")),
):
    progress = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == current_user.id, UserProgress.section_id == payload.section_id)
        .first()
    )

    if not progress:
        progress = UserProgress(user_id=current_user.id, section_id=payload.section_id)
        db.add(progress)

    progress.is_completed = True
    progress.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(progress)
    return progress


@router.get("/students", response_model=list[StudentProgressRead])
def get_students_progress(
    total_sections: int = Query(default=len(THEORY_SECTIONS), ge=0),
    current_user: User = Depends(require_roles("teacher", "admin")),
    db: Session = Depends(get_db),
):
    query = db.query(User).join(User.role).filter_by(name="student").order_by(User.full_name, User.id)

    if current_user.role.name == "teacher" and current_user.group_id:
        query = query.filter(User.group_id == current_user.group_id)

    students = query.all()
    return [build_progress_summary(student, total_sections) for student in students]


@router.get("/{user_id}", response_model=list[ProgressRead])
def get_progress(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    role = current_user.role.name
    if role == "student" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Студент может смотреть только свой прогресс")
    return db.query(UserProgress).filter(UserProgress.user_id == user_id).order_by(UserProgress.section_id).all()

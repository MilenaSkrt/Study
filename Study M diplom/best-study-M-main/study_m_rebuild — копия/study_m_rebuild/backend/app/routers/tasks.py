from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user, require_roles
from app.models import Module, Task, User
from app.schemas import SubmissionCreate, SubmissionGrade, SubmissionRead, TaskCreate, TaskRead, TaskUpdate
from app.models import Submission

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/{module_id}", response_model=list[TaskRead])
def get_tasks_by_module(module_id: int, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not db.query(Module).filter(Module.id == module_id).first():
        raise HTTPException(status_code=404, detail="Модуль не найден")
    return db.query(Task).filter(Task.module_id == module_id).order_by(Task.id).all()


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("teacher", "admin")),
):
    if not db.query(Module).filter(Module.id == payload.module_id).first():
        raise HTTPException(status_code=404, detail="Модуль не найден")
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("teacher", "admin")),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("teacher", "admin")),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    db.delete(task)
    db.commit()
    return None


@router.post("/submit", response_model=SubmissionRead, status_code=status.HTTP_201_CREATED)
def submit_task(
    payload: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("student", "admin")),
):
    if not db.query(Task).filter(Task.id == payload.task_id).first():
        raise HTTPException(status_code=404, detail="Задание не найдено")
    submission = Submission(task_id=payload.task_id, user_id=current_user.id, content=payload.content)
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@router.patch("/submissions/{submission_id}/grade", response_model=SubmissionRead)
def grade_submission(
    submission_id: int,
    payload: SubmissionGrade,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("teacher", "admin")),
):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Решение не найдено")
    submission.grade = payload.grade
    submission.comment = payload.comment
    db.commit()
    db.refresh(submission)
    return submission

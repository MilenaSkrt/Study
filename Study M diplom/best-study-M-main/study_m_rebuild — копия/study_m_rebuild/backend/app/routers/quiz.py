from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import require_roles
from app.models import QuizQuestion, User, UserProgress
from app.schemas import QuizCheckRequest, QuizCheckResponse, QuizQuestionRead

router = APIRouter(prefix="/quiz", tags=["quiz"])


def normalize_answer(value: str) -> str:
    return " ".join(value.strip().lower().replace("ё", "е").split())


@router.get("/{section_id}", response_model=list[QuizQuestionRead])
def get_questions(section_id: str, _: User = Depends(require_roles("student", "admin", "teacher")), db: Session = Depends(get_db)):
    questions = db.query(QuizQuestion).filter(QuizQuestion.section_id == section_id).order_by(QuizQuestion.id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="Вопросы для раздела не найдены")
    return questions


@router.post("/check", response_model=QuizCheckResponse)
def check_quiz(
    payload: QuizCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("student", "admin")),
):
    questions = db.query(QuizQuestion).filter(QuizQuestion.section_id == payload.section_id).order_by(QuizQuestion.id).all()
    if len(questions) != 3:
        raise HTTPException(status_code=404, detail="Для раздела должно быть ровно три вопроса")

    correct_count = sum(
        normalize_answer(answer) == normalize_answer(question.correct_answer)
        for answer, question in zip(payload.answers, questions)
    )

    if correct_count == 3:
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
        return QuizCheckResponse(success=True, correct_count=3, total=3, message="Раздел засчитан")

    return QuizCheckResponse(
        success=False,
        correct_count=correct_count,
        total=3,
        message="Есть неверные ответы. Повторите материал и попробуйте ещё раз.",
    )

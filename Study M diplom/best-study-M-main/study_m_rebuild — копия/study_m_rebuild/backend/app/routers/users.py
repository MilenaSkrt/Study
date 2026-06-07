from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import get_db
from app.dependencies import get_current_user, require_roles
from app.models import Group, Role, User
from app.schemas import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "teacher")),
):
    query = db.query(User).order_by(User.id)
    if current_user.role.name == "teacher" and current_user.group_id:
        query = query.filter(User.group_id == current_user.group_id)
    return query.all()


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email уже существует")

    role_id = payload.role_id
    if role_id is None:
        role = db.query(Role).filter(Role.name == "student").first()
        role_id = role.id if role else None
    if role_id is None or not db.query(Role).filter(Role.id == role_id).first():
        raise HTTPException(status_code=404, detail="Роль не найдена")
    if payload.group_id and not db.query(Group).filter(Group.id == payload.group_id).first():
        raise HTTPException(status_code=404, detail="Группа не найдена")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role_id=role_id,
        group_id=payload.group_id,
        status=payload.status,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    update_data = payload.model_dump(exclude_unset=True)
    if "email" in update_data:
        duplicated = db.query(User).filter(User.email == update_data["email"], User.id != user_id).first()
        if duplicated:
            raise HTTPException(status_code=400, detail="Email уже существует")
    if "password" in update_data:
        user.password_hash = hash_password(update_data.pop("password"))
    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin")),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Нельзя удалить текущего пользователя")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    db.delete(user)
    db.commit()
    return None

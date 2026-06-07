from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user, require_roles
from app.models import Module, User
from app.schemas import ModuleCreate, ModuleRead, ModuleUpdate

router = APIRouter(prefix="/modules", tags=["modules"])


@router.get("", response_model=list[ModuleRead])
def get_modules(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Module).order_by(Module.sort_order, Module.id).all()


@router.post("", response_model=ModuleRead, status_code=status.HTTP_201_CREATED)
def create_module(
    payload: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("teacher", "admin")),
):
    module = Module(
        title=payload.title,
        description=payload.description,
        sort_order=payload.sort_order,
        teacher_id=current_user.id,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.put("/{module_id}", response_model=ModuleRead)
def update_module(
    module_id: int,
    payload: ModuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("teacher", "admin")),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Модуль не найден")
    if current_user.role.name != "admin" and module.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Можно редактировать только свои модули")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(module, key, value)
    db.commit()
    db.refresh(module)
    return module


@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("teacher", "admin")),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Модуль не найден")
    if current_user.role.name != "admin" and module.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Можно удалять только свои модули")
    db.delete(module)
    db.commit()
    return None

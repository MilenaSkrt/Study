from fastapi import APIRouter, Depends, HTTPException

from app.data.theory import THEORY_SECTIONS, get_theory_section
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/theory", tags=["theory"])


@router.get("")
def list_theory_sections(_: User = Depends(get_current_user)):
    return THEORY_SECTIONS


@router.get("/{section_id}")
def read_theory_section(section_id: str, _: User = Depends(get_current_user)):
    section = get_theory_section(section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Раздел теории не найден")
    return section

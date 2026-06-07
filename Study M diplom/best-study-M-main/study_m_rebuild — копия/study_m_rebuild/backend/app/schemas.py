from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RoleRead(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class GroupRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    role_id: Optional[int] = None
    group_id: Optional[int] = None
    status: str = "active"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    group_id: Optional[int] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=128)
    role_id: Optional[int] = None
    group_id: Optional[int] = None
    status: Optional[str] = None


class UserRead(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    status: str
    role: RoleRead
    group: Optional[GroupRead] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class ModuleCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    sort_order: int = 0


class ModuleUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    sort_order: Optional[int] = None


class ModuleRead(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    teacher_id: int
    sort_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str = Field(..., min_length=5)
    starter_code: Optional[str] = None
    max_score: int = 100
    module_id: int


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    starter_code: Optional[str] = None
    max_score: Optional[int] = None
    module_id: Optional[int] = None


class TaskRead(BaseModel):
    id: int
    title: str
    description: str
    starter_code: Optional[str] = None
    max_score: int
    module_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SubmissionCreate(BaseModel):
    task_id: int
    content: str = Field(..., min_length=1)


class SubmissionGrade(BaseModel):
    grade: int = Field(..., ge=0, le=100)
    comment: Optional[str] = None


class SubmissionRead(BaseModel):
    id: int
    task_id: int
    user_id: int
    content: str
    grade: Optional[int] = None
    comment: Optional[str] = None
    submitted_at: datetime

    model_config = {"from_attributes": True}


class ProgressRead(BaseModel):
    id: int
    user_id: int
    section_id: str
    is_completed: bool
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}




class ProgressCompleteRequest(BaseModel):
    section_id: str = Field(..., min_length=1, max_length=50)


class StudentProgressRead(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr
    group_name: Optional[str] = None
    total_sections: int
    completed_sections: int
    percent: int
    completed_section_ids: list[str]


class QuizQuestionRead(BaseModel):
    id: int
    section_id: str
    question_text: str

    model_config = {"from_attributes": True}


class QuizCheckRequest(BaseModel):
    section_id: str
    answers: list[str] = Field(..., min_length=3, max_length=3)


class QuizCheckResponse(BaseModel):
    success: bool
    correct_count: int
    total: int
    message: str


class CodeExecutionRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=5000)
    stdin: Optional[str] = ""
    timeout: int = Field(5, ge=1, le=5)


class ExecutionResult(BaseModel):
    success: bool
    output: str
    error: Optional[str] = None
    execution_time: float

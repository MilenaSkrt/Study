from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.data.theory import THEORY_SECTIONS
from app.models import Group, Module, QuizQuestion, Role, Task, User


DEFAULT_TASKS = [
    {
        "module_title": "Численное решение задач математики",
        "title": "Решение задачи Коши методом Рунге — Кутты",
        "description": "Реализуйте метод Рунге — Кутты 4-го порядка для уравнения y' = y, y(0)=1 и найдите y(1) при шаге h=0.1.",
        "starter_code": """import math

def f(x, y):
    return y

# допишите реализацию RK4
print('result')
""",
    },
    {
        "module_title": "Математические модели в механике",
        "title": "Моделирование попадания пули в тарелку",
        "description": "Подберите начальную скорость и угол выстрела, при которых траектория тела проходит через заданную точку цели.",
        "starter_code": """import math

g = 9.81
v0 = 30
alpha = math.radians(45)
t = 1.0
x = v0 * math.cos(alpha) * t
y = v0 * math.sin(alpha) * t - g * t * t / 2
print(round(x, 2), round(y, 2))
""",
    },
    {
        "module_title": "Математические модели в механике",
        "title": "Шарик — корзина — стена",
        "description": "Смоделируйте движение шарика с отражением от стены и проверьте попадание в корзину.",
        "starter_code": """# Упростите модель отражения: угол падения равен углу отражения
angle_fall = 35
angle_reflect = angle_fall
print('angle_reflect =', angle_reflect)
""",
    },
    {
        "module_title": "Задачи поиска параметров",
        "title": "Метод Нелдера — Мида с ограничениями",
        "description": "Реализуйте поиск минимума функции двух переменных с учётом ограничений области допустимых решений.",
        "starter_code": """def f(x, y):
    return (x - 1) ** 2 + (y + 2) ** 2

best = None
for i in range(-50, 51):
    for j in range(-50, 51):
        x = i / 10
        y = j / 10
        if x + y <= 2:
            value = f(x, y)
            if best is None or value < best[0]:
                best = (value, x, y)
print(best)
""",
    },
]

DEFAULT_QUIZ = {
    "1.1": [
        ("Что задаётся вместе с дифференциальным уравнением в задаче Коши?", "начальное условие"),
        ("Как называется правая часть в записи dy/dx = f(x,y)?", "функция f"),
        ("Какой символ обычно обозначает шаг интегрирования?", "h"),
    ],
    "1.2": [
        ("Какой порядок точности имеет классический метод Рунге — Кутты?", "четвертый"),
        ("Сколько коэффициентов k вычисляется на одном шаге RK4?", "4"),
        ("Что происходит с погрешностью при уменьшении шага?", "уменьшается"),
    ],
    "2.1": [
        ("Какое ускорение используется в модели движения тела под углом?", "ускорение свободного падения"),
        ("Какая функция используется для горизонтальной компоненты скорости?", "cos"),
        ("Какая функция используется для вертикальной компоненты скорости?", "sin"),
    ],
    "3.1": [
        ("Для чего применяется метод золотого сечения?", "поиск минимума"),
        ("Как называется число, используемое для деления интервала?", "золотое сечение"),
        ("Когда алгоритм останавливается?", "когда интервал меньше точности"),
    ],
}


def get_or_create_role(db: Session, name: str) -> Role:
    role = db.query(Role).filter(Role.name == name).first()
    if role:
        return role
    role = Role(name=name)
    db.add(role)
    db.flush()
    return role


def seed_database(db: Session) -> None:
    admin_role = get_or_create_role(db, "admin")
    teacher_role = get_or_create_role(db, "teacher")
    student_role = get_or_create_role(db, "student")

    group = db.query(Group).filter(Group.name == "ПМ-22").first()
    if not group:
        group = Group(name="ПМ-22", description="Учебная группа направления Прикладная механика")
        db.add(group)
        db.flush()

    users = [
        ("Администратор Study M", "admin@study.com", admin_role),
        ("Преподаватель Иванов", "teacher@study.com", teacher_role),
        ("Студент Петров", "student@study.com", student_role),
    ]
    for full_name, email, role in users:
        if not db.query(User).filter(User.email == email).first():
            db.add(
                User(
                    full_name=full_name,
                    email=email,
                    password_hash=hash_password("123456"),
                    role_id=role.id,
                    group_id=group.id,
                    status="active",
                )
            )
    db.flush()

    teacher = db.query(User).filter(User.email == "teacher@study.com").first()
    existing_modules = {module.title: module for module in db.query(Module).all()}
    for order, section in enumerate(THEORY_SECTIONS, start=1):
        title = section["module_title"]
        if title not in existing_modules:
            module = Module(title=title, description=section["summary"], teacher_id=teacher.id, sort_order=order)
            db.add(module)
            db.flush()
            existing_modules[title] = module

    for task_data in DEFAULT_TASKS:
        if not db.query(Task).filter(Task.title == task_data["title"]).first():
            module = existing_modules[task_data["module_title"]]
            db.add(
                Task(
                    title=task_data["title"],
                    description=task_data["description"],
                    starter_code=task_data["starter_code"],
                    max_score=100,
                    module_id=module.id,
                )
            )

    for section_id, questions in DEFAULT_QUIZ.items():
        exists_count = db.query(QuizQuestion).filter(QuizQuestion.section_id == section_id).count()
        if exists_count == 0:
            for question_text, correct_answer in questions:
                db.add(QuizQuestion(section_id=section_id, question_text=question_text, correct_answer=correct_answer))

    db.commit()

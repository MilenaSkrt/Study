# Study M — интерактивная система обучения с онлайн-компилятором Python

 FastAPI + SQLAlchemy + PostgreSQL на сервере, React + React Router + Axios + Vite на клиенте, JWT-аутентификация, роли пользователей, учебные модули, задания, контрольные вопросы, прогресс и sandbox для выполнения Python-кода.

## Структура

```text
study_m_rebuild/
├── backend/                 # FastAPI REST API
│   ├── app/
│   │   ├── core/            # настройки и безопасность
│   │   ├── db/              # подключение к БД
│   │   ├── data/            # теоретический контент
│   │   ├── routers/         # REST-роутеры
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── dependencies.py
│   │   └── seed.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # React/Vite SPA
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

## Быстрый запуск через Docker

```bash
cp .env.example .env
docker compose up --build
```

Адреса после запуска:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

## Тестовые пользователи

Пароль у всех тестовых пользователей: `123456`.

| Роль | Email |
|---|---|
| Администратор | admin@study.com |
| Преподаватель | teacher@study.com |
| Студент | student@study.com |

## Основные эндпоинты

| Метод | Endpoint | Назначение |
|---|---|---|
| POST | `/auth/register` | регистрация |
| POST | `/auth/login` | вход и получение JWT |
| GET | `/users` | список пользователей, администратор |
| POST | `/users` | создание пользователя, администратор |
| PUT | `/users/{id}` | редактирование пользователя, администратор |
| DELETE | `/users/{id}` | удаление пользователя, администратор |
| GET | `/modules` | список модулей |
| POST | `/modules` | создание модуля, преподаватель/администратор |
| GET | `/tasks/{module_id}` | задания модуля |
| POST | `/sandbox/run` | выполнение Python-кода |
| GET | `/sandbox/templates` | шаблоны кода |
| GET | `/progress/{user_id}` | прогресс пользователя |
| POST | `/quiz/check` | проверка контрольных вопросов |

## Что уже реализовано

- JWT-аутентификация и хранение пароля через bcrypt.
- Роли: `admin`, `teacher`, `student`.
- PostgreSQL-модели: users, roles, groups, modules, tasks, submissions, user_progress, quiz_questions.
- REST API на FastAPI с CORS для React.
- Sandbox: ограничение длины кода, фильтрация опасных паттернов, whitelist импортов, safe builtins, перехват `print`, подмена `input`, timeout.
- React SPA: вход, регистрация, личный кабинет с progress bar, теория, контрольные вопросы, задания, онлайн-компилятор, панели преподавателя и администратора.
- Docker-контейнеризация backend, frontend и PostgreSQL.

## Локальный запуск без Docker

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

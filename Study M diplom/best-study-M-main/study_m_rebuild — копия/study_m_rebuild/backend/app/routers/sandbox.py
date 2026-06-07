import ast
import io
import sys
import threading
import time
import traceback
from types import MappingProxyType
from typing import Optional

from fastapi import APIRouter, Depends

from app.dependencies import require_roles
from app.models import User
from app.schemas import CodeExecutionRequest, ExecutionResult

router = APIRouter(prefix="/sandbox", tags=["sandbox"])

ALLOWED_MODULES = {"math", "random", "datetime", "collections", "itertools", "functools", "string"}
DANGEROUS_PATTERNS = [
    "__import__",
    "eval(",
    "exec(",
    "compile(",
    "open(",
    "globals(",
    "locals(",
    "vars(",
    "dir(",
    "getattr(",
    "setattr(",
    "delattr(",
    "input.__",
    "__class__",
    "__bases__",
    "__subclasses__",
    "__mro__",
    "__globals__",
    "__code__",
    "__closure__",
    "import os",
    "import subprocess",
    "import socket",
    "import pathlib",
    "import shutil",
    "import sys",
    "import importlib",
    "requests",
    "system(",
    "popen(",
    "fork(",
    "kill(",
]


def validate_code(code: str) -> Optional[str]:
    code_lower = code.lower()
    for pattern in DANGEROUS_PATTERNS:
        if pattern in code_lower:
            return f"🛡️ Безопасность: код содержит запрещённый паттерн '{pattern}'"

    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        return f"Синтаксическая ошибка: {exc}"

    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            for alias in node.names:
                root_name = alias.name.split(".")[0]
                if root_name not in ALLOWED_MODULES:
                    return f"🛡️ Импорт модуля '{root_name}' запрещён"
        if isinstance(node, ast.Attribute) and node.attr.startswith("__"):
            return f"🛡️ Доступ к магическому атрибуту '{node.attr}' запрещён"
        if isinstance(node, ast.Name) and node.id.startswith("__"):
            return f"🛡️ Доступ к служебному имени '{node.id}' запрещён"
    return None


def execute_code(code: str, stdin: str, timeout: int) -> dict:
    result = {"success": False, "output": "", "error": None}

    def runner():
        old_stdout = sys.stdout
        old_stderr = sys.stderr
        stdout_capture = io.StringIO()
        stderr_capture = io.StringIO()
        try:
            sys.stdout = stdout_capture
            sys.stderr = stderr_capture

            allowed_modules = {name: __import__(name) for name in ALLOWED_MODULES}

            def safe_import(name, globals=None, locals=None, fromlist=(), level=0):
                root_name = name.split(".")[0]
                if root_name in allowed_modules:
                    return allowed_modules[root_name]
                raise ImportError(f"Модуль '{name}' не разрешён в песочнице")

            input_lines = iter((stdin or "").splitlines())

            def safe_input(prompt: str = "") -> str:
                if prompt:
                    print(prompt, end="")
                return next(input_lines, "")

            safe_builtins = MappingProxyType(
                {
                    "print": print,
                    "input": safe_input,
                    "range": range,
                    "len": len,
                    "str": str,
                    "int": int,
                    "float": float,
                    "bool": bool,
                    "list": list,
                    "dict": dict,
                    "tuple": tuple,
                    "set": set,
                    "abs": abs,
                    "max": max,
                    "min": min,
                    "sum": sum,
                    "round": round,
                    "pow": pow,
                    "enumerate": enumerate,
                    "zip": zip,
                    "map": map,
                    "filter": filter,
                    "sorted": sorted,
                    "any": any,
                    "all": all,
                    "Exception": Exception,
                    "ValueError": ValueError,
                    "TypeError": TypeError,
                    "ZeroDivisionError": ZeroDivisionError,
                    "__import__": safe_import,
                }
            )

            safe_globals = {"__builtins__": safe_builtins, "__name__": "__sandbox__"}
            safe_globals.update(allowed_modules)

            exec(compile(code, "<sandbox>", "exec"), safe_globals, {})
            output = stdout_capture.getvalue()
            errors = stderr_capture.getvalue()
            result["success"] = True
            result["output"] = output + errors
        except Exception:
            result["error"] = "\n".join(traceback.format_exc().splitlines()[-8:])
        finally:
            sys.stdout = old_stdout
            sys.stderr = old_stderr

    thread = threading.Thread(target=runner, daemon=True)
    thread.start()
    thread.join(timeout=timeout)

    if thread.is_alive():
        result["success"] = False
        result["output"] = ""
        result["error"] = f"Превышен таймаут выполнения ({timeout} секунд)"
    return result


@router.post("/run", response_model=ExecutionResult)
def run_python_code(
    payload: CodeExecutionRequest,
    _: User = Depends(require_roles("student", "admin", "teacher")),
):
    validation_error = validate_code(payload.code)
    if validation_error:
        return ExecutionResult(success=False, output="", error=validation_error, execution_time=0.0)

    start = time.perf_counter()
    result = execute_code(payload.code, payload.stdin or "", payload.timeout)
    elapsed = round(time.perf_counter() - start, 3)

    if result["success"]:
        output = result["output"] or "✅ Код выполнен успешно (нет вывода)"
        return ExecutionResult(success=True, output=output, execution_time=elapsed)
    return ExecutionResult(success=False, output="", error=result["error"] or "Неизвестная ошибка", execution_time=elapsed)


@router.get("/templates")
def get_templates(_: User = Depends(require_roles("student", "admin", "teacher"))):
    return {
        "templates": {
            "golden": {
                "name": "Метод золотого сечения",
                "code": """import math

def f(x):
    return (x - 2) ** 2 + 1

def golden_section_search(a, b, eps=0.001):
    phi = (1 + math.sqrt(5)) / 2
    x1 = b - (b - a) / phi
    x2 = a + (b - a) / phi
    while abs(b - a) > eps:
        if f(x1) >= f(x2):
            a = x1
            x1 = x2
            x2 = a + (b - a) / phi
        else:
            b = x2
            x2 = x1
            x1 = b - (b - a) / phi
    return (a + b) / 2

xmin = golden_section_search(-5, 5)
print('x_min =', round(xmin, 4))
print('f_min =', round(f(xmin), 4))
""",
            },
            "gradient": {
                "name": "Градиентный спуск",
                "code": """def f(x):
    return (x - 3) ** 2

def grad(x):
    return 2 * (x - 3)

x = 10.0
alpha = 0.1
for i in range(50):
    x = x - alpha * grad(x)

print('x_min =', round(x, 4))
print('f_min =', round(f(x), 4))
""",
            },
            "rk4": {
                "name": "Метод Рунге — Кутты 4-го порядка",
                "code": """import math

def f(x, y):
    return y

x = 0.0
y = 1.0
h = 0.1
while x < 1.0:
    k1 = f(x, y)
    k2 = f(x + h / 2, y + h * k1 / 2)
    k3 = f(x + h / 2, y + h * k2 / 2)
    k4 = f(x + h, y + h * k3)
    y = y + h * (k1 + 2 * k2 + 2 * k3 + k4) / 6
    x = x + h

print('y(1) ≈', round(y, 6))
print('точное e =', round(math.e, 6))
""",
            },
        }
    }

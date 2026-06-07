import { useState } from 'react';
import api from '../api/client.js';

const templates = [
  {
    id: 'golden-section',
    title: 'Метод золотого сечения',
    description: 'Поиск минимума функции одной переменной на заданном интервале.',
    task:
      'Измените функцию f(x), границы интервала a и b, затем запустите код и сравните найденный минимум.',
    code: `import math

def f(x):
    return (x - 2) ** 2 + 1

a = -5
b = 5
eps = 0.0001

phi = (1 + math.sqrt(5)) / 2

x1 = b - (b - a) / phi
x2 = a + (b - a) / phi

while abs(b - a) > eps:
    if f(x1) < f(x2):
        b = x2
    else:
        a = x1

    x1 = b - (b - a) / phi
    x2 = a + (b - a) / phi

x_min = (a + b) / 2

print("Минимум функции найден в точке:", round(x_min, 6))
print("Значение функции:", round(f(x_min), 6))`,
  },
  {
    id: 'newton',
    title: 'Метод Ньютона',
    description: 'Итерационный метод поиска корня уравнения f(x)=0.',
    task:
      'Попробуйте изменить начальное приближение x и функцию f(x). Следите, как меняется количество итераций.',
    code: `def f(x):
    return x**2 - 2

def df(x):
    return 2 * x

x = 1.0
eps = 0.000001
max_iter = 30

for i in range(max_iter):
    x_new = x - f(x) / df(x)

    print("Итерация", i + 1, "x =", round(x_new, 8))

    if abs(x_new - x) < eps:
        break

    x = x_new

print("Найденный корень:", round(x, 8))
print("Проверка f(x):", round(f(x), 8))`,
  },
  {
    id: 'gradient-descent',
    title: 'Градиентный спуск',
    description: 'Поиск минимума функции с использованием производной.',
    task:
      'Измените скорость обучения learning_rate и начальную точку x. Посмотрите, когда метод сходится быстрее.',
    code: `def f(x):
    return (x - 3) ** 2 + 2

def grad_f(x):
    return 2 * (x - 3)

x = -4.0
learning_rate = 0.1
steps = 40

for i in range(steps):
    gradient = grad_f(x)
    x = x - learning_rate * gradient

    if i % 5 == 0:
        print("Шаг", i, "x =", round(x, 6), "f(x) =", round(f(x), 6))

print("Минимум найден около x =", round(x, 6))
print("Значение функции:", round(f(x), 6))`,
  },
];

export default function Compiler() {
  const [activeTemplate, setActiveTemplate] = useState(templates[0]);
  const [code, setCode] = useState(templates[0].code);
  const [stdin, setStdin] = useState('');
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  function selectTemplate(template) {
    setActiveTemplate(template);
    setCode(template.code);
    setResult(null);
  }

  async function runCode() {
    setRunning(true);
    setResult(null);

    try {
      const { data } = await api.post('/sandbox/run', {
        code,
        stdin,
        timeout: 5,
      });

      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        error: err.response?.data?.detail || 'Ошибка выполнения',
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="page try-page">
      <section className="try-header">
        <p className="eyebrow">Попробуй сам</p>
        <h1>Практический запуск Python-кода</h1>
        <p>
          Выберите шаблон численного метода, измените параметры или напишите собственный код.
          После запуска результат появится в области вывода.
        </p>
      </section>

      <section className="try-layout">
        <aside className="try-sidebar">
          {templates.map((template) => (
            <button
              key={template.id}
              className={template.id === activeTemplate.id ? 'try-template active' : 'try-template'}
              onClick={() => selectTemplate(template)}
            >
              <strong>{template.title}</strong>
              <span>{template.description}</span>
            </button>
          ))}
        </aside>

        <section className="try-workspace">
          <div className="try-task-card">
            <h2>{activeTemplate.title}</h2>
            <p>{activeTemplate.task}</p>
          </div>

          <label className="editor-label">Код Python</label>
          <textarea
            className="code-editor try-editor"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            spellCheck="false"
          />

          <label className="editor-label">Входные данные stdin</label>
          <textarea
            className="stdin-editor"
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            placeholder="Опционально: строки для input()"
          />

          <div className="compiler-actions">
            <button className="btn" onClick={runCode} disabled={running}>
              {running ? 'Выполняется...' : 'Запустить код'}
            </button>
            <button className="btn ghost" onClick={() => setResult(null)}>
              Очистить вывод
            </button>
          </div>

          <div className="output-panel">
            <strong>Вывод программы</strong>
            <pre>
              {result
                ? result.success
                  ? result.output || 'Код выполнен без вывода.'
                  : result.error
                : 'Результат появится здесь...'}
            </pre>

            {result?.execution_time !== undefined && (
              <span>Время выполнения: {result.execution_time} с</span>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
import { useState } from 'react';
import api from '../api/client.js';
import LearningVisualization from '../components/LearningVisualization.jsx';
import { learningCases } from '../data/learningContent.js';

export default function Tasks() {
  const [activeId, setActiveId] = useState(learningCases[0].id);
  const [code, setCode] = useState(learningCases[0].fullCode);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const activeCase = learningCases.find((item) => item.id === activeId);

  function selectCase(item) {
    setActiveId(item.id);
    setCode(item.fullCode);
    setOutput('');
  }

  async function runCode() {
    setLoading(true);
    setOutput('');

    try {
      const { data } = await api.post('/sandbox/run', {
        code,
        stdin: '',
        timeout: 5,
      });

      if (data.success) {
        setOutput(data.output || 'Код выполнен без вывода.');
      } else {
        setOutput(data.error || 'Ошибка выполнения.');
      }
    } catch (error) {
      setOutput(error.response?.data?.detail || 'Не удалось выполнить код.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page learning-page">
      <section className="learning-header">
        <p className="eyebrow">Обучение</p>
        <h1>Пошаговое решение математических задач</h1>
        <p>
          Здесь представлены учебные задачи с постановкой, формулами, объяснением решения,
          фрагментами Python-кода и возможностью запустить полную программу.
        </p>
      </section>

      <section className="learning-layout">
        <aside className="learning-sidebar">
          {learningCases.map((item) => (
            <button
              key={item.id}
              className={item.id === activeId ? 'learning-tab active' : 'learning-tab'}
              onClick={() => selectCase(item)}
            >
              {item.title}
            </button>
          ))}
        </aside>

        <article className="learning-card">
          <h2>{activeCase.title}</h2>

          <div className="learning-block">
            <h3>Постановка задачи</h3>
            <p>{activeCase.statement}</p>
          </div>

          <div className="learning-block">
            <h3>Цель работы</h3>
            <p>{activeCase.goal}</p>
          </div>

          <div className="learning-block">
            <h3>Математическая модель</h3>
            <div className="formula-list">
              {activeCase.formulas.map((formula) => (
                <div className="formula-chip" key={formula}>{formula}</div>
              ))}
            </div>
          </div>

          {activeCase.visualization && (
            <div className="learning-block">
              <h3>Визуализация модели</h3>
              <LearningVisualization visualization={activeCase.visualization} />
            </div>
          )}

          <div className="learning-block">
            <h3>Решение по шагам</h3>
            <div className="learning-steps">
              {activeCase.steps.map((step) => (
                <section className="learning-step" key={step.title}>
                  <h4>{step.title}</h4>
                  <p>{step.text}</p>
                  <pre className="code-block">
                    <code>{step.code.trim()}</code>
                  </pre>
                </section>
              ))}
            </div>
          </div>

          <div className="learning-block">
            <h3>Полный код решения</h3>
            <p>
              Код можно изменить вручную: поменять параметры, добавить вычисления,
              удалить строки или написать собственный вариант решения.
            </p>

            <textarea
              className="code-editor"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />

            <button className="btn run-btn" onClick={runCode} disabled={loading}>
              {loading ? 'Выполняется...' : 'Запустить код'}
            </button>

            <pre className="code-output">
              {output || 'Результат выполнения появится здесь.'}
            </pre>
          </div>
        </article>
      </section>
    </main>
  );
}